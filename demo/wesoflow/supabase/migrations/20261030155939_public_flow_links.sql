-- Separate capability-based storage: no Hub tables, roles, policies or Auth settings change.
create schema flow_private;
revoke all on schema flow_private from public, anon, authenticated;
create table flow_private.projects (
  token_hash bytea primary key,
  id uuid not null unique default gen_random_uuid(),
  document jsonb not null,
  revision integer not null default 1,
  creator_hash bytea not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index flow_link_creation_rate on flow_private.projects (creator_hash, created_at);
alter table flow_private.projects enable row level security;
revoke all on flow_private.projects from public, anon, authenticated;

create function flow_private.validate_document(d jsonb) returns void
language plpgsql set search_path = '' as $$
declare s jsonb; g jsonb; n jsonb; ids text[]; cluster_ids text[];
begin
  if d is null or jsonb_typeof(d) <> 'object' or octet_length(d::text) > 2097152
    or jsonb_typeof(d->'name') is distinct from 'string' or length(btrim(d->>'name')) not between 1 and 120
    or jsonb_typeof(d->'schemes') is distinct from 'array' or jsonb_typeof(d->'versions') is distinct from 'array' then
    raise exception 'Invalid project' using errcode = '22023';
  end if;
  if jsonb_array_length(d->'schemes') not between 1 and 100 or jsonb_array_length(d->'versions') > 500 then
    raise exception 'Project limit reached' using errcode = '22023';
  end if;
  ids := array(select value->>'id' from jsonb_array_elements(d->'schemes'));
  if cardinality(ids) <> (select count(distinct x) from unnest(ids) x) then raise exception 'Duplicate flows'; end if;
  for s in select value from jsonb_array_elements(d->'schemes') union all select value from jsonb_array_elements(d->'versions') loop
    if jsonb_typeof(s->'id') is distinct from 'string' or length(s->>'id') not between 1 and 100 then raise exception 'Invalid ID'; end if;
    if s ? 'scheme_id' then
      if not (s->>'scheme_id' = any(ids)) or jsonb_typeof(s->'label') is distinct from 'string'
        or jsonb_typeof(s->'version_number') is distinct from 'number' then raise exception 'Invalid version'; end if;
    elsif jsonb_typeof(s->'name') is distinct from 'string' or length(btrim(s->>'name')) not between 1 and 120 then raise exception 'Invalid name';
    end if;
    g := s->'graph';
    if jsonb_typeof(g) is distinct from 'object' or jsonb_typeof(g->'graph') is distinct from 'object'
      or jsonb_typeof(g->'nodeDefaults') is distinct from 'object' or jsonb_typeof(g->'edgeDefaults') is distinct from 'object'
      or jsonb_typeof(g->'nodes') is distinct from 'array' or jsonb_typeof(g->'edges') is distinct from 'array'
      or jsonb_typeof(g->'clusters') is distinct from 'array' then raise exception 'Invalid graph'; end if;
    if jsonb_array_length(g->'nodes') > 5000 or jsonb_array_length(g->'edges') > 10000
      or jsonb_array_length(g->'clusters') not between 1 and 100 then raise exception 'Graph limit reached'; end if;
    cluster_ids := array(select value->>'id' from jsonb_array_elements(g->'clusters'));
    for n in select value from jsonb_array_elements(g->'clusters') union all select value from jsonb_array_elements(g->'nodes') loop
      if jsonb_typeof(n->'id') is distinct from 'string' or jsonb_typeof(n->'label') is distinct from 'string'
        or jsonb_typeof(n->'attrs') is distinct from 'object' or jsonb_typeof(n->'x') is distinct from 'number'
        or jsonb_typeof(n->'y') is distinct from 'number' then raise exception 'Invalid graph element'; end if;
      if n ? 'cluster' and not (n->>'cluster' = any(cluster_ids)) then raise exception 'Invalid cluster'; end if;
    end loop;
    for n in select value from jsonb_array_elements(g->'edges') loop
      if jsonb_typeof(n->'from') is distinct from 'string' or jsonb_typeof(n->'to') is distinct from 'string'
        or jsonb_typeof(n->'attrs') is distinct from 'object' then raise exception 'Invalid edge'; end if;
    end loop;
  end loop;
end $$;
revoke all on function flow_private.validate_document(jsonb) from public, anon, authenticated;

create function public.flow_link_create(p_token text, p_document jsonb) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare row flow_private.projects; fingerprint bytea;
begin
  if p_token is null or p_token !~ '^[a-f0-9]{64}$' then raise exception 'Invalid link' using errcode = '22023'; end if;
  perform flow_private.validate_document(p_document);
  -- Gateway-supplied IP, not identity or roles. No user accounts are created.
  fingerprint := sha256(convert_to(coalesce(nullif(current_setting('request.headers', true), '')::jsonb->>'x-real-ip',
    split_part(nullif(current_setting('request.headers', true), '')::jsonb->>'x-forwarded-for', ',', 1), 'unknown'), 'UTF8'));
  perform pg_advisory_xact_lock(hashtext('flow_link_create'), hashtext(encode(fingerprint, 'hex')));
  if (select count(*) from flow_private.projects where creator_hash = fingerprint and created_at > now() - interval '1 hour') >= 30 then
    raise exception 'Too many projects. Try again later.' using errcode = '54000';
  end if;
  insert into flow_private.projects (token_hash, document, creator_hash)
    values (sha256(convert_to(p_token, 'UTF8')), p_document, fingerprint) returning * into row;
  return jsonb_build_object('id', row.id, 'document', row.document, 'revision', row.revision, 'updated_at', row.updated_at);
end $$;

create function public.flow_link_open(p_token text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare row flow_private.projects;
begin
  if p_token is null or p_token !~ '^[a-f0-9]{64}$' then raise exception 'Invalid link' using errcode = '22023'; end if;
  select * into row from flow_private.projects where token_hash = sha256(convert_to(p_token, 'UTF8'));
  if not found then raise exception 'Project not found' using errcode = 'P0002'; end if;
  return jsonb_build_object('id', row.id, 'document', row.document, 'revision', row.revision, 'updated_at', row.updated_at);
end $$;

create function public.flow_link_save(p_token text, p_revision integer, p_document jsonb) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare row flow_private.projects;
begin
  if p_token is null or p_token !~ '^[a-f0-9]{64}$' then raise exception 'Invalid link' using errcode = '22023'; end if;
  perform flow_private.validate_document(p_document);
  select * into row from flow_private.projects where token_hash = sha256(convert_to(p_token, 'UTF8')) for update;
  if not found then raise exception 'Project not found' using errcode = 'P0002'; end if;
  if p_revision is distinct from row.revision then raise exception 'Project changed' using errcode = '40001'; end if;
  update flow_private.projects set document = p_document, revision = revision + 1, updated_at = now()
    where token_hash = row.token_hash returning * into row;
  return jsonb_build_object('id', row.id, 'document', row.document, 'revision', row.revision, 'updated_at', row.updated_at);
end $$;

create function public.flow_link_delete(p_token text, p_revision integer) returns void
language plpgsql security definer set search_path = '' as $$
declare row flow_private.projects;
begin
  if p_token is null or p_token !~ '^[a-f0-9]{64}$' then raise exception 'Invalid link' using errcode = '22023'; end if;
  select * into row from flow_private.projects where token_hash = sha256(convert_to(p_token, 'UTF8')) for update;
  if not found then raise exception 'Project not found' using errcode = 'P0002'; end if;
  if p_revision is distinct from row.revision then raise exception 'Project changed' using errcode = '40001'; end if;
  delete from flow_private.projects where token_hash = row.token_hash;
end $$;

revoke all on function public.flow_link_create(text, jsonb), public.flow_link_open(text), public.flow_link_save(text, integer, jsonb), public.flow_link_delete(text, integer) from public;
grant execute on function public.flow_link_create(text, jsonb), public.flow_link_open(text), public.flow_link_save(text, integer, jsonb), public.flow_link_delete(text, integer) to anon;
-- These are deliberately public capability endpoints. Possession of a 256-bit link
-- grants access only to its new Flow document, never to legacy private Flow or Hub data.
