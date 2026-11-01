-- Report conflicts immediately, without PostgREST serialization retries.
create or replace function public.flow_link_save(p_token text, p_revision integer, p_document jsonb) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare row flow_private.projects;
begin
  if p_token is null or p_token !~ '^[a-f0-9]{64}$' then raise exception 'Invalid link' using errcode = '22023'; end if;
  perform flow_private.validate_document(p_document);
  select * into row from flow_private.projects where token_hash = sha256(convert_to(p_token, 'UTF8')) for update;
  if not found then raise exception 'Project not found' using errcode = 'P0002'; end if;
  if p_revision is distinct from row.revision then raise exception 'Project changed' using errcode = 'PT409'; end if;
  update flow_private.projects set document = p_document, revision = revision + 1, updated_at = now()
    where token_hash = row.token_hash returning * into row;
  return jsonb_build_object('id', row.id, 'document', row.document, 'revision', row.revision, 'updated_at', row.updated_at);
end $$;

create or replace function public.flow_link_delete(p_token text, p_revision integer) returns void
language plpgsql security definer set search_path = '' as $$
declare row flow_private.projects;
begin
  if p_token is null or p_token !~ '^[a-f0-9]{64}$' then raise exception 'Invalid link' using errcode = '22023'; end if;
  select * into row from flow_private.projects where token_hash = sha256(convert_to(p_token, 'UTF8')) for update;
  if not found then raise exception 'Project not found' using errcode = 'P0002'; end if;
  if p_revision is distinct from row.revision then raise exception 'Project changed' using errcode = 'PT409'; end if;
  delete from flow_private.projects where token_hash = row.token_hash;
end $$;

create policy flow_link_deny_direct_access on flow_private.projects as restrictive for all to anon, authenticated using (false) with check (false);
