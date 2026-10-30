const INITIAL_DOT = "digraph G {\n    // Configuración general del diseño estructural\n    splines=ortho;\n    nodesep=0.5;\n    ranksep=0.6;\n    node [fontname=\"Arial\", fontsize=10, shape=box, style=\"filled,rounded\", fillcolor=\"#F3F4F6\", color=\"#9CA3AF\", width=2.6, fixedsize=true];\n    edge [fontname=\"Arial\", fontsize=9, color=\"#4B5563\"];\n\n    // ==========================================\n    // SUBGRÁFICO 1: BÚSQUEDA Y REGISTRO DE PROVEEDORES\n    // ==========================================\n    subgraph cluster_proveedores {\n        label = \"FLUJO DE PROVEEDORES (Registro y Validación)\";\n        fontname=\"Arial-Bold\"; fontsize=12; labelloc=t;\n        style=\"filled,dashed\"; color=\"#3B82F6\"; fillcolor=\"#EFF6FF\";\n\n        p_inicio [label=\"Búsqueda de Proveedores\\n(Por Categoría y Servicios)\\n[Día 1]\", shape=ellipse, fillcolor=\"#DBEAFE\"];\n        p_invitacion [label=\"Envío de 1° Correo\\nde Invitación\"];\n        p_recordatorio1 [label=\"1° Recordatorio\\n[Día 3]\"];\n        p_recordatorio2 [label=\"2° Recordatorio\\n[Día 8]\"];\n        p_recordatorio3 [label=\"Último Recordatorio\\n[Día 14]\"];\n        \n        p_registro [label=\"Proveedor inicia Registro\\n(Paso 1 al 7:\\nDatos, Cat, Cuenta Pago)\"];\n        p_valida_datos [label=\"¿WesoPros Valida\\nDatos de Inscripción?\", shape=diamond, fillcolor=\"#FEF3C7\", fixedsize=false];\n        p_solicita_correc [label=\"Se solicita corrección\\nde campos\"];\n        p_ready [label=\"Proveedor queda READY\\npara operar\", fillcolor=\"#D1FAE5\"];\n\n        // Conexiones de Proveedores\n        p_inicio -> p_invitacion;\n        p_invitacion -> p_recordatorio1 -> p_recordatorio2 -> p_recordatorio3;\n        p_invitacion -> p_registro [label=\"Se registra\"];\n        p_recordatorio1 -> p_registro [label=\"Se registra\"];\n        p_recordatorio2 -> p_registro [label=\"Se registra\"];\n        p_recordatorio3 -> p_registro [label=\"Se registra\"];\n        \n        p_registro -> p_valida_datos;\n        p_valida_datos -> p_ready [label=\"Sí\"];\n        p_valida_datos -> p_solicita_correc [label=\"No\"];\n        p_solicita_correc -> p_registro [label=\"Corrige datos\"];\n    }\n\n    // ==========================================\n    // SUBGRÁFICO 2: OPERACIÓN Y GESTIÓN MULTICANAL DE ALERTAS\n    // ==========================================\n    subgraph cluster_operaciones {\n        label = \"FLUJO DE OPERACIONES (Gestión Multicanal de Alertas)\";\n        fontname=\"Arial-Bold\"; fontsize=12; labelloc=t;\n        style=\"filled,dashed\"; color=\"#10B981\"; fillcolor=\"#E6F4EA\";\n\n        o_solicitud [label=\"Cliente solicita Servicio\\n(Categoría, Fecha y Hora)\", shape=ellipse, fillcolor=\"#D1FAE5\"];\n        \n        // Bloque Multicanal\n        o_canales [label=\"ENVÍO DE ALERTA SIMULTÁNEA:\\n• Notificación AppWesoPros\\n• Mensaje de WhatsApp\\n• Correo Electrónico\", fillcolor=\"#A7F3D0\", color=\"#059669\"];\n        \n        o_alerta_zona [label=\"Alerta a Pros dentro\\nde la zona asignada\\n(Espera 5 min)\"];\n        o_toma_servicio [label=\"¿Algún Pros acepta\\nel servicio?\", shape=diamond, fillcolor=\"#FEF3C7\", fixedsize=false];\n        \n        o_amplia_zona [label=\"Alerta a Pros dentro de\\nuna zona más amplia\\n(Espera 10 min)\"];\n        o_toma_servicio_2 [label=\"¿Acepta servicio?\", shape=diamond, fillcolor=\"#FEF3C7\", fixedsize=false];\n        \n        o_toda_ciudad [label=\"Alerta a toda la\\nzona o ciudad\"];\n        o_toma_servicio_3 [label=\"¿Acepta servicio?\", shape=diamond, fillcolor=\"#FEF3C7\", fixedsize=false];\n        \n        o_no_disponible [label=\"Servicio pasa a estado:\\nNO DISPONIBLE\\n(Pasaron 25 min sin éxito)\", fillcolor=\"#FEE2E2\"];\n        o_asignado [label=\"Pros Asignado\\n(Bloqueo de servicio)\"];\n\n        // Conexiones de Operaciones\n        o_solicitud -> o_canales;\n        o_canales -> o_alerta_zona;\n        o_alerta_zona -> o_toma_servicio;\n        o_toma_servicio -> o_asignado [label=\"Sí\"];\n        o_toma_servicio -> o_amplia_zona [label=\"No\"];\n        \n        o_amplia_zona -> o_toma_servicio_2;\n        o_toma_servicio_2 -> o_asignado [label=\"Sí\"];\n        o_toma_servicio_2 -> o_toda_ciudad [label=\"No\"];\n        \n        o_toda_ciudad -> o_toma_servicio_3;\n        o_toma_servicio_3 -> o_asignado [label=\"Sí\"];\n        o_toma_servicio_3 -> o_no_disponible [label=\"No\"];\n    }\n\n    // ==========================================\n    // SUBGRÁFICO 3: EJECUCIÓN DEL SERVICIO Y REGLAS DE CANCELACIÓN\n    // ==========================================\n    subgraph cluster_ejecucion {\n        label = \"FLUJO DE EJECUCIÓN (Ciclo del Servicio y Reglas Financieras)\";\n        fontname=\"Arial-Bold\"; fontsize=12; labelloc=t;\n        style=\"filled,dashed\"; color=\"#F59E0B\"; fillcolor=\"#FEF3C7\";\n\n        e_alerta_24 [label=\"App envía alerta al Pros\\n24 hrs antes\"];\n        e_alerta_4 [label=\"App envía alerta al Pros\\n4 hrs antes\"];\n        e_en_camino [label=\"Pros marca\\n'VOY EN CAMINO' en App\"];\n        \n        // Nodo de decisión/control de cancelación por parte del cliente\n        e_evalua_cancelacion [label=\"¿El cliente suspende\\no cancela el servicio?\", shape=diamond, fillcolor=\"#FDE68A\", fixedsize=false];\n        \n        // Desglose de políticas de cobro por cancelación\n        cancela_antes [label=\"Suspensión ANTES del inicio:\\n• Sin cobro al cliente\\n• Pros no recibe pago\", fillcolor=\"#F9FAFB\"];\n        cancela_mitad [label=\"Suspensión en MITAD de ruta:\\n• Se cobra 35% del valor\\n• Pros no recibe pago\", fillcolor=\"#FEE2E2\", color=\"#EF4444\"];\n        cancela_destino [label=\"Suspensión PASADA la mitad o en destino:\\n• Se cobra 50% del valor\\n• Pros no recibe pago\", fillcolor=\"#FEE2E2\", color=\"#EF4444\"];\n\n        e_llega [label=\"Pros llega a destino\\ny marca 'INICIA SERVICIO'\"];\n        e_fotos [label=\"Captura foto ANTES\\ny sugerencia de DURANTE\"];\n        e_ejecuta [label=\"Pros ejecuta trabajo\\ny marca 'COMPLETAR'\"];\n        e_fotos_despues [label=\"Captura foto DESPUÉS\\ny resumen de trabajo\"];\n        e_cierre [label=\"Envío de Factura/Invoice\\n(Flujo estándar exitoso)\"];\n        \n        e_pago [label=\"Inicio Proceso de Pago /\\nSatisfacción (Agente IA)\", shape=doublecircle, fillcolor=\"#D1FAE5\", width=2.2];\n\n        // Conexiones de Ejecución y Alertas previas\n        e_alerta_24 -> e_alerta_4 -> e_en_camino;\n        e_en_camino -> e_evalua_cancelacion;\n        \n        // Ramas de la decisión de cancelación\n        e_evalua_cancelacion -> e_llega [label=\"No (Continúa)\"];\n        e_evalua_cancelacion -> cancela_antes [label=\"Antes del inicio\"];\n        e_evalua_cancelacion -> cancela_mitad [label=\"En mitad de ruta\"];\n        e_evalua_cancelacion -> cancela_destino [label=\"Pasada mitad / Llegada\"];\n        \n        // Cierre de flujos de cancelación hacia el fin del proceso de atención\n        cancela_antes -> e_pago [style=dotted];\n        cancela_mitad -> e_pago [style=dotted];\n        cancela_destino -> e_pago [style=dotted];\n\n        // Continuación del flujo regular sin cancelación\n        e_llega -> e_fotos -> e_ejecuta -> e_fotos_despues -> e_cierre -> e_pago;\n    }\n\n    // Interconexiones globales lógicas entre flujos independientes\n    p_ready -> o_solicitud [style=dotted, label=\"Pros listos en el sistema\"];\n    o_asignado -> e_alerta_24 [label=\"Asignación exitosa\"];\n}";

const SVG_NS = 'http://www.w3.org/2000/svg';
const STORAGE_KEY = 'weso-flow-editor-state-v1';
const EMBEDDED = new URLSearchParams(window.location.search).get('embedded') === '1' && window.parent !== window;
const CLUSTER_OFFSETS = {cluster_proveedores: 70, cluster_operaciones: 1570, cluster_ejecucion: 3070};
const POSITIONS = {
  p_inicio:[150,150],p_invitacion:[440,150],p_recordatorio1:[730,150],p_recordatorio2:[1020,150],p_recordatorio3:[1310,150],p_registro:[730,420],p_valida_datos:[730,660],p_ready:[1040,660],p_solicita_correc:[420,940],
  o_solicitud:[150,150],o_canales:[460,150],o_alerta_zona:[770,150],o_toma_servicio:[770,410],o_asignado:[1110,410],o_amplia_zona:[770,660],o_toma_servicio_2:[770,910],o_toda_ciudad:[770,1160],o_toma_servicio_3:[770,1410],o_no_disponible:[1120,1410],
  e_alerta_24:[150,150],e_alerta_4:[450,150],e_en_camino:[750,150],e_evalua_cancelacion:[1050,150],cancela_antes:[150,410],cancela_mitad:[450,410],cancela_destino:[750,410],e_llega:[1050,410],e_fotos:[1050,640],e_ejecuta:[1050,870],e_fotos_despues:[1050,1100],e_cierre:[1050,1330],e_pago:[750,1570]
};
const CLUSTER_COLORS = {cluster_proveedores:'#3B82F6',cluster_operaciones:'#10B981',cluster_ejecucion:'#F59E0B'};

function unquoteDot(value){
  if(!(value.startsWith('"')&&value.endsWith('"'))) return value;
  const s=value.slice(1,-1); let out='';
  for(let i=0;i<s.length;i++){if(s[i]==='\\'&&i+1<s.length){const n=s[++i];out+=n==='n'?'\n':n==='r'?'\r':n==='t'?'\t':n;}else out+=s[i];}
  return out;
}
function parseAttrs(text){
  const out={}, re=/([A-Za-z_][\w]*)\s*=\s*("(?:\\.|[^"\\])*"|[^,\s]+)/g; let m;
  while((m=re.exec(text))) out[m[1]]=unquoteDot(m[2]);
  return out;
}
function splitDotStatements(text){let parts=[],start=0,quoted=false,escaped=false;for(let i=0;i<text.length;i++){const ch=text[i];if(escaped){escaped=false;continue;}if(ch==='\\'&&quoted){escaped=true;continue;}if(ch==='"'){quoted=!quoted;continue;}if(ch===';'&&!quoted){parts.push(text.slice(start,i).trim());start=i+1;}}if(text.slice(start).trim())parts.push(text.slice(start).trim());return parts;}
function closingBracket(text,start){let quoted=false,escaped=false;for(let i=start+1;i<text.length;i++){const ch=text[i];if(escaped){escaped=false;continue;}if(ch==='\\'&&quoted){escaped=true;continue;}if(ch==='"'){quoted=!quoted;continue;}if(ch===']'&&!quoted)return i;}return-1;}
function parseDot(dot){
  const model={graph:{splines:'ortho',nodesep:'0.5',ranksep:'0.6'},nodeDefaults:{},edgeDefaults:{},clusters:[],nodes:[],edges:[]};
  let currentCluster=null;
  for(const rawLine of dot.split(/\r?\n/)){
    const line=rawLine.trim(); if(!line||line.startsWith('//'))continue;
    const sub=line.match(/^subgraph\s+(cluster_[\w-]+)\s*\{/);
    if(sub){currentCluster=sub[1];model.clusters.push({id:currentCluster,label:currentCluster.replace(/^cluster_/,'').replaceAll('_',' '),attrs:{}});continue;}
    if(line==='}'){currentCluster=null;continue;}
    if(/^node\s*\[/.test(line)){const open=line.indexOf('['),close=closingBracket(line,open);model.nodeDefaults=parseAttrs(line.slice(open+1,close));continue;}
    if(/^edge\s*\[/.test(line)){const open=line.indexOf('['),close=closingBracket(line,open);model.edgeDefaults=parseAttrs(line.slice(open+1,close));continue;}
    if(line.startsWith('digraph')||line==='{'||line==='};')continue;
    if(line.includes('->')){
      const body=line.replace(/;\s*$/,'');const bracket=body.indexOf('[');const chain=(bracket<0?body:body.slice(0,bracket)).split('->').map(s=>s.trim());
      const attrs={...model.edgeDefaults,...(bracket<0?{}:parseAttrs(body.slice(bracket+1,body.lastIndexOf(']'))))};
      for(let i=0;i<chain.length-1;i++)model.edges.push({from:chain[i],to:chain[i+1],attrs:{...attrs}});
      continue;
    }
    const open=line.indexOf('[');
    if(open>0&&/^([A-Za-z_][\w]*)\s*$/.test(line.slice(0,open))){const id=line.slice(0,open).trim(),close=closingBracket(line,open);if(close>open){const attrs={...model.nodeDefaults,...parseAttrs(line.slice(open+1,close))};const pos=POSITIONS[id]||[200+model.nodes.length*25,200];const cluster=currentCluster||'cluster_proveedores';model.nodes.push({id,cluster,label:attrs.label||id,attrs,x:pos[0]+(CLUSTER_OFFSETS[cluster]||0),y:pos[1]});continue;}}
    for(const statement of splitDotStatements(line)){const assignment=statement.match(/^([A-Za-z_][\w]*)\s*=\s*(.+)$/);if(!assignment)continue;const key=assignment[1],value=unquoteDot(assignment[2]);if(currentCluster){const c=model.clusters.find(x=>x.id===currentCluster);if(c)c.attrs[key]=value;if(key==='label'&&c)c.label=value;}else model.graph[key]=value;}
  }
  return model;
}
function escDot(value){return '"'+String(value??'').replace(/\\/g,'\\\\').replace(/"/g,'\\"').replace(/\r?\n/g,'\\n')+'"';}
function dotValue(value){if(typeof value==='number'||value===true||value===false||/^(true|false|[-+]?\d+(?:\.\d+)?)$/.test(String(value)))return String(value);return escDot(value);}
function serializeDot(m){
  const lines=['digraph G {'];
  for(const [k,v] of Object.entries(m.graph))lines.push(`    ${k}=${dotValue(v)};`);
  lines.push(`    node [${Object.entries(m.nodeDefaults).map(([k,v])=>`${k}=${dotValue(v)}`).join(', ')}];`);
  lines.push(`    edge [${Object.entries(m.edgeDefaults).map(([k,v])=>`${k}=${dotValue(v)}`).join(', ')}];`);
  for(const c of m.clusters){lines.push(`\n    subgraph ${c.id} {`);for(const [k,v] of Object.entries(c.attrs))lines.push(`        ${k}=${dotValue(v)};`);
    for(const n of m.nodes.filter(x=>x.cluster===c.id)){const a={...n.attrs,label:n.label};lines.push(`        ${n.id} [${Object.entries(a).map(([k,v])=>`${k}=${dotValue(v)}`).join(', ')}];`);}
    for(const e of m.edges.filter(x=>m.nodes.find(n=>n.id===x.from)?.cluster===c.id&&m.nodes.find(n=>n.id===x.to)?.cluster===c.id)){const attrs=Object.entries(e.attrs);lines.push(`        ${e.from} -> ${e.to}${attrs.length?' ['+attrs.map(([k,v])=>`${k}=${dotValue(v)}`).join(', ')+']':''};`);}
    lines.push('    }');}
  const inner=m.edges.filter(e=>{const a=m.nodes.find(n=>n.id===e.from),b=m.nodes.find(n=>n.id===e.to);return a&&b&&a.cluster!==b.cluster;});
  if(inner.length){lines.push('\n    // Interconexiones entre flujos');for(const e of inner){const attrs=Object.entries(e.attrs);lines.push(`    ${e.from} -> ${e.to}${attrs.length?' ['+attrs.map(([k,v])=>`${k}=${dotValue(v)}`).join(', ')+']':''};`);}}
  lines.push('}');return lines.join('\n');
}
function deepCopy(value){return JSON.parse(JSON.stringify(value));}

let initialModel=parseDot(INITIAL_DOT);
let model=deepCopy(initialModel);
let selected=null;
let activeCluster='cluster_proveedores';
let activeView='cluster_proveedores';
let mode='select';
let connectSource=null;
let camera={x:0,y:0,zoom:.7};
let undoStack=[],redoStack=[],drag=null,clusterDrag=null,pan=null,toastTimer=null;
let savedState=null;
let pendingConfirmation=null;
let bridgeSchemeId=null,bridgeSchemeName='Mapa de operaciones',bridgeProjectName='Operaciones',bridgeRequestId=0,lastSaveAck=0;
if(!EMBEDDED){try{savedState=localStorage.getItem(STORAGE_KEY);if(savedState){const parsed=JSON.parse(savedState);if(validSavedModel(parsed))model=parsed;}}catch{}}
if(!model.clusters.some(c=>c.id===activeCluster))activeCluster=model.clusters[0]?.id||null;
activeView=activeCluster||'all';

const board=document.getElementById('board'),world=document.getElementById('world'),boardWrap=document.getElementById('boardWrap');
const propsPanel=document.getElementById('propertiesPanel'),codePanel=document.getElementById('codePanel');
const dotOutput=document.getElementById('dotOutput'),toast=document.getElementById('toast');
const inspector=document.getElementById('inspector');
function svgEl(tag,attrs={}){const el=document.createElementNS(SVG_NS,tag);for(const [k,v] of Object.entries(attrs))el.setAttribute(k,String(v));return el;}
function attrsValue(attrs,key,fallback){return attrs?.[key]??fallback;}
function nodeShape(n){return attrsValue(n.attrs,'shape','box');}
function colorForCluster(id){return model.clusters.find(c=>c.id===id)?.attrs?.color||CLUSTER_COLORS[id]||'#64748b';}
function nodeDimensions(n){
  const shape=nodeShape(n),maxChars=shape==='diamond'?21:shape==='ellipse'?27:32;
  const lines=[];for(const explicit of String(n.label||'').split('\n')){const words=explicit.split(/\s+/);let line='';for(const word of words){const next=line?line+' '+word:word;if(next.length>maxChars&&line){lines.push(line);line=word;}else line=next;}lines.push(line);}
  const count=Math.max(lines.length,1),longest=Math.max(0,...lines.map(x=>x.length));
  let width=shape==='diamond'?214:shape==='ellipse'?246:shape==='doublecircle'?250:Math.max(224,Math.min(310,longest*7.2+38));
  let height=Math.max(shape==='diamond'?112:shape==='doublecircle'?88:shape==='ellipse'?72:62,count*18+27);
  if(shape==='diamond')height=Math.max(112,count*18+42);
  return {w:width,h:height,lines};
}
function clusterBounds(c){
  const ns=model.nodes.filter(n=>n.cluster===c.id),titleWidth=Math.min(900,String(c.label||'').length*7.2+34);if(!ns.length){const x=Number.isFinite(c.x)?c.x:(CLUSTER_OFFSETS[c.id]??100),y=Number.isFinite(c.y)?c.y:40;return{x:x-70,y,w:Math.max(420,titleWidth),h:330};}
  const dims=ns.map(n=>({n,d:nodeDimensions(n)}));const minX=Math.min(...dims.map(x=>x.n.x-x.d.w/2)),maxX=Math.max(...dims.map(x=>x.n.x+x.d.w/2)),minY=Math.min(...dims.map(x=>x.n.y-x.d.h/2)),maxY=Math.max(...dims.map(x=>x.n.y+x.d.h/2));
  return{x:minX-72,y:minY-78,w:Math.max(maxX-minX+144,titleWidth),h:maxY-minY+145};
}
function extent(){if(!model.clusters.length)return{x:-40,y:-40,w:80,h:80};const boxes=model.clusters.map(clusterBounds),minX=Math.min(...boxes.map(b=>b.x)),minY=Math.min(...boxes.map(b=>b.y)),maxX=Math.max(...boxes.map(b=>b.x+b.w)),maxY=Math.max(...boxes.map(b=>b.y+b.h));return{x:minX-40,y:minY-40,w:maxX-minX+80,h:maxY-minY+80};}
function setCamera(){world.setAttribute('transform',`translate(${camera.x} ${camera.y}) scale(${camera.zoom})`);document.getElementById('zoomLabel').textContent=Math.round(camera.zoom*100)+'%';}
function focusCluster(id,contain=false){
  if(id!=='all'&&!model.clusters.some(c=>c.id===id))return;
  activeView=id;if(id!=='all')activeCluster=id;const r=board.getBoundingClientRect(),pad=80;
  let b;if(id==='all'){b=extent();}else{const c=model.clusters.find(x=>x.id===id);b=clusterBounds(c);}
  const fitZoom=Math.max(.12,Math.min(1.15,(r.width-pad*2)/b.w,(r.height-pad*2)/b.h)),z=innerWidth<=600&&id!=='all'&&!contain?Math.max(fitZoom,.3):fitZoom;camera.zoom=z;camera.x=(r.width-b.w*z)/2-b.x*z;camera.y=(r.height-b.h*z)/2-b.y*z;setCamera();
  renderFlowTabs();updateModeHint();positionInspector();
}
function updateModeHint(){
  const hint=document.getElementById('modeHint');if(!hint)return;
  hint.textContent=mode==='connect'?'Conectar: elige el paso de origen y luego el destino':activeView==='all'?(innerWidth<=600?'Mapa completo · arrastra una sección para moverla':'Mapa completo · arrastra una sección para reubicarla'):innerWidth<=600?'Acerca para leer · arrastra el lienzo para moverte':'Vista de flujo · las conexiones entre flujos están en el mapa completo';
}
function sectionParts(cluster){
  const label=String(cluster.label||'').trim(),match=label.match(/^(FLUJO DE\s+.+?)(?:\s*\((.+)\))?$/i);
  if(!match)return{title:label,subtitle:`${model.nodes.filter(n=>n.cluster===cluster.id).length} pasos`};
  const title=match[1].toLocaleLowerCase('es').replace(/^./,c=>c.toLocaleUpperCase('es'));
  return{title,subtitle:match[2]?match[2].toLocaleLowerCase('es').replace(/^./,c=>c.toLocaleUpperCase('es')):`${model.nodes.filter(n=>n.cluster===cluster.id).length} pasos`};
}
function renderFlowTabs(){
  const list=document.getElementById('clusterTabs');if(!list)return;list.replaceChildren();
  for(const cluster of model.clusters){const parts=sectionParts(cluster),item=document.createElement('div');item.className='flow-item'+(activeView===cluster.id?' active':'');const tab=document.createElement('button');tab.type='button';tab.className='flow-tab';tab.dataset.focus=cluster.id;tab.title=`Ver ${cluster.label}`;tab.setAttribute('aria-current',activeView===cluster.id?'page':'false');const dot=document.createElement('span');dot.className='tab-dot';dot.style.background=colorForCluster(cluster.id);const copy=document.createElement('span');copy.className='flow-tab-copy';const name=document.createElement('strong');name.className='flow-name';name.textContent=parts.title;const description=document.createElement('small');description.className='flow-description';description.textContent=parts.subtitle;copy.append(name,description);tab.append(dot,copy);tab.addEventListener('click',()=>{activeCluster=cluster.id;activeView=cluster.id;selected=null;focusCluster(cluster.id);renderAll();});
    const edit=document.createElement('button');edit.type='button';edit.className='flow-edit-tab';edit.title=`Editar sección ${cluster.label}`;edit.setAttribute('aria-label',`Editar sección ${cluster.label}`);const icon=document.createElement('span');icon.className='material-symbols-rounded';icon.setAttribute('aria-hidden','true');icon.textContent='edit';edit.append(icon);edit.addEventListener('click',()=>selectCluster(cluster.id));item.append(tab,edit);list.append(item);}
  document.querySelector('.all-tab')?.classList.toggle('active',activeView==='all');
  const active=model.clusters.find(c=>c.id===activeView);document.getElementById('activeFlowTitle').textContent=active?sectionParts(active).title:'Todos los flujos';
}
function selectCluster(id){if(!model.clusters.some(c=>c.id===id))return;activeCluster=id;activeView=id;selected={type:'cluster',id};focusCluster(id);setPanel('properties');renderAll();}
function clusterCenter(id){const b=clusterBounds(model.clusters.find(c=>c.id===id));return{x:b.x+b.w/2,y:b.y+b.h/2};}
function wrapSvgText(text){return text;}
function edgeCurve(a,b,da,db){
  const dx=b.x-a.x,dy=b.y-a.y;let sx,sy,ex,ey,c1x,c1y,c2x,c2y;
  if(Math.abs(dx)>Math.abs(dy)){const dir=Math.sign(dx)||1;sx=a.x+dir*da.w/2;sy=a.y;ex=b.x-dir*db.w/2;ey=b.y;const bend=Math.max(50,Math.abs(ex-sx)*.42);c1x=sx+dir*bend;c1y=sy;c2x=ex-dir*bend;c2y=ey;}
  else{const dir=Math.sign(dy)||1;sx=a.x;sy=a.y+dir*da.h/2;ex=b.x;ey=b.y-dir*db.h/2;const bend=Math.max(45,Math.abs(ey-sy)*.42);c1x=sx;c1y=sy+dir*bend;c2x=ex;c2y=ey-dir*bend;}
  return{d:`M ${sx} ${sy} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${ex} ${ey}`,mx:(sx+ex)/2,my:(sy+ey)/2-8};
}
function renderGraph(view=activeView,target=world){
  if(target===world)board.classList.toggle('overview-mode',view==='all');
  target.replaceChildren();
  const visibleClusters=view==='all'?model.clusters:model.clusters.filter(c=>c.id===view),visibleClusterIds=new Set(visibleClusters.map(c=>c.id)),visibleNodes=model.nodes.filter(n=>visibleClusterIds.has(n.cluster));
  for(const c of visibleClusters){const b=clusterBounds(c),g=svgEl('g',{class:'cluster-group'+(selected?.type==='cluster'&&selected.id===c.id?' selected':''),'data-cluster':c.id});const fill=attrsValue(c.attrs,'fillcolor','#f4f7f4'),stroke=attrsValue(c.attrs,'color',colorForCluster(c.id));
    g.append(svgEl('rect',{class:'cluster-bg',x:b.x,y:b.y,width:b.w,height:b.h,rx:18,fill,stroke}));
    const title=svgEl('text',{class:'cluster-title',x:b.x+17,y:b.y+25});title.textContent=c.label;g.append(title);
    g.addEventListener('pointerdown',ev=>{const onTitle=ev.target.classList.contains('cluster-title'),onOverviewBackground=view==='all'&&ev.target.classList.contains('cluster-bg');if(mode!=='select'||ev.button!==0||(!onTitle&&!onOverviewBackground))return;ev.preventDefault();ev.stopPropagation();selected={type:'cluster',id:c.id};activeCluster=c.id;clusterDrag={id:c.id,pointerId:ev.pointerId,last:{x:ev.clientX,y:ev.clientY},moved:false,before:deepCopy(model)};board.setPointerCapture(ev.pointerId);g.classList.add('selected');setPanel('properties');renderInspector();renderFlowTabs();});
    g.addEventListener('click',ev=>ev.stopPropagation());target.append(g);}
  const dimensions=new Map(visibleNodes.map(n=>[n.id,nodeDimensions(n)]));
  model.edges.forEach((e,index)=>{const a=model.nodes.find(n=>n.id===e.from),b=model.nodes.find(n=>n.id===e.to);if(!a||!b||!visibleClusterIds.has(a.cluster)||!visibleClusterIds.has(b.cluster))return;const curve=edgeCurve(a,b,dimensions.get(a.id),dimensions.get(b.id));const g=svgEl('g',{class:'edge-group'+(selected?.type==='edge'&&selected.index===index?' selected':''),'data-edge':index});
    const hit=svgEl('path',{class:'edge-hit',d:curve.d});g.append(hit);const path=svgEl('path',{class:'edge-visible'+(e.attrs.style==='dotted'?' dotted':''),d:curve.d,stroke:attrsValue(e.attrs,'color','#738078')});g.append(path);
    if(e.attrs.label){const x=curve.mx,y=curve.my,w=Math.max(26,e.attrs.label.length*5.8+14);g.append(svgEl('rect',{class:'edge-label-bg',x:x-w/2,y:y-9,width:w,height:17,rx:5}));const label=svgEl('text',{class:'edge-label',x,y:y+3});label.textContent=e.attrs.label;g.append(label);}
    g.addEventListener('click',ev=>{ev.stopPropagation();if(mode==='connect')return;selected={type:'edge',index};setPanel('properties');renderAll();});target.append(g);
  });
  for(const n of visibleNodes){const d=dimensions.get(n.id),g=svgEl('g',{class:'node-group'+(selected?.type==='node'&&selected.id===n.id?' selected':'')+(connectSource===n.id?' connect-source':''),'data-node':n.id,transform:`translate(${n.x} ${n.y})`});
    const fill=attrsValue(n.attrs,'fillcolor','#F3F4F6'),stroke=attrsValue(n.attrs,'color','#9CA3AF'),shape=nodeShape(n),style=String(attrsValue(n.attrs,'style','filled,rounded'));
    let sh;if(shape==='ellipse'||shape==='doublecircle')sh=svgEl('ellipse',{class:'node-shape',cx:0,cy:0,rx:d.w/2,ry:d.h/2,fill,stroke,'stroke-width':1.4});
    else if(shape==='diamond')sh=svgEl('polygon',{class:'node-shape',points:`0,${-d.h/2} ${d.w/2},0 0,${d.h/2} ${-d.w/2},0`,fill,stroke,'stroke-width':1.4});
    else sh=svgEl('rect',{class:'node-shape',x:-d.w/2,y:-d.h/2,width:d.w,height:d.h,rx:style.includes('rounded')?11:2,fill,stroke,'stroke-width':1.4});
    g.append(sh);if(shape==='doublecircle')g.append(svgEl('ellipse',{cx:0,cy:0,rx:d.w/2-5,ry:d.h/2-5,fill:'none',stroke,'stroke-width':1.1}));
    const total=d.lines.length,lineHeight=17,startY=-(total-1)*lineHeight/2+4;const text=svgEl('text',{class:'node-text'});
    d.lines.forEach((line,i)=>{const t=svgEl('tspan',{x:0,y:startY+i*lineHeight});t.textContent=line;text.append(t);});g.append(text);
    g.addEventListener('pointerdown',ev=>{if(mode==='connect'){ev.preventDefault();ev.stopPropagation();connectClick(n.id);return;}ev.preventDefault();ev.stopPropagation();selected={type:'node',id:n.id};drag={id:n.id,pointerId:ev.pointerId,last:{x:ev.clientX,y:ev.clientY},moved:false,before:deepCopy(model)};board.setPointerCapture(ev.pointerId);setPanel('properties');renderAll();});
    g.addEventListener('click',ev=>ev.stopPropagation());g.addEventListener('dblclick',ev=>{ev.stopPropagation();selected={type:'node',id:n.id};renderAll();const field=document.querySelector('#nodeEditor .label-input');field?.focus();});target.append(g);
  }
  if(target===world){setCamera();positionInspector();}
}
function renderInspector(){
  const node=selected?.type==='node'?model.nodes.find(n=>n.id===selected.id):null;const edge=selected?.type==='edge'?model.edges[selected.index]:null;const cluster=selected?.type==='cluster'?model.clusters.find(c=>c.id===selected.id):null;
  inspector.hidden=!selected&&codePanel.hidden;
  document.getElementById('noSelection').hidden=!!node||!!edge||!!cluster;document.getElementById('nodeEditor').hidden=!node;document.getElementById('edgeEditor').hidden=!edge;document.getElementById('clusterEditor').hidden=!cluster;
  document.getElementById('overviewPanel').hidden=!!node||!!edge||!!cluster;document.getElementById('nodeCount').textContent=String(model.nodes.length).padStart(2,'0');document.getElementById('edgeCount').textContent=String(model.edges.length).padStart(2,'0');document.getElementById('clusterCount').textContent=String(model.clusters.length).padStart(2,'0');
  const title=document.getElementById('inspectorTitle');
  if(node){title.textContent='Editar paso';const section=model.clusters.find(c=>c.id===node.cluster);const col=colorForCluster(node.cluster);
    document.getElementById('nodeEditor').innerHTML=`<div class="node-properties"><div class="selected-crumb"><i class="mini-dot" style="background:${col}"></i>${escapeHtml(section?.label||'Paso')}</div><div class="field-group"><label class="field-label" for="nodeLabelInput">TEXTO DEL PASO</label><textarea id="nodeLabelInput" class="field-input label-input" rows="4">${escapeHtml(node.label)}</textarea></div><div class="field-group"><label class="field-label" for="nodeShapeInput">FORMA</label><select id="nodeShapeInput" class="field-input"><option value="box">Rectángulo</option><option value="ellipse">Óvalo · inicio o cierre</option><option value="diamond">Decisión</option><option value="doublecircle">Círculo doble</option></select></div><div class="field-row"><div class="field-group"><label class="field-label">RELLENO</label><div class="color-field"><input id="nodeFillInput" type="color" value="${safeColor(attrsValue(node.attrs,'fillcolor','#F3F4F6'))}"><code>${escapeHtml(attrsValue(node.attrs,'fillcolor','#F3F4F6'))}</code></div></div><div class="field-group"><label class="field-label">BORDE</label><div class="color-field"><input id="nodeStrokeInput" type="color" value="${safeColor(attrsValue(node.attrs,'color','#9CA3AF'))}"><code>${escapeHtml(attrsValue(node.attrs,'color','#9CA3AF'))}</code></div></div></div><div class="field-group"><label class="field-label" for="nodeClusterInput">FLUJO</label><select id="nodeClusterInput" class="field-input">${model.clusters.map(c=>`<option value="${c.id}">${escapeHtml(c.label)}</option>`).join('')}</select></div><p class="muted-note">Arrastra el paso en el lienzo para cambiar su posición.</p><button id="deleteNode" class="danger-button">Eliminar este paso</button></div>`;
    document.getElementById('nodeShapeInput').value=nodeShape(node);document.getElementById('nodeClusterInput').value=node.cluster;
    trackFieldHistory(document.getElementById('nodeLabelInput'));document.getElementById('nodeLabelInput').addEventListener('input',e=>{node.label=e.target.value;node.attrs.label=node.label;updateGraphAndCode(false);});
    document.getElementById('nodeShapeInput').addEventListener('change',e=>{checkpoint();node.attrs.shape=e.target.value;updateGraphAndCode(true);});
     document.getElementById('nodeClusterInput').addEventListener('change',e=>{checkpoint();const target=e.target.value,from=clusterCenter(node.cluster),to=clusterCenter(target);node.x+=to.x-from.x;node.y+=to.y-from.y;node.cluster=target;activeCluster=target;activeView=target;syncDotPosition(node);updateGraphAndCode(true);focusCluster(target);});
    bindColor('nodeFillInput',node,'fillcolor');bindColor('nodeStrokeInput',node,'color');document.getElementById('deleteNode').addEventListener('click',()=>deleteSelected());
  }else if(edge){title.textContent='Editar conexión';const source=model.nodes.find(n=>n.id===edge.from),target=model.nodes.find(n=>n.id===edge.to);document.getElementById('edgeEditor').innerHTML=`<div class="edge-properties"><div class="selected-crumb"><i class="mini-dot" style="background:#83958a"></i>Conexión entre pasos</div><div class="field-group"><label class="field-label">DESDE</label><input class="field-input" readonly value="${escapeHtml(source?.label||edge.from)}"></div><div class="field-group"><label class="field-label">HACIA</label><input class="field-input" readonly value="${escapeHtml(target?.label||edge.to)}"></div><div class="field-group"><label class="field-label" for="edgeLabelInput">TEXTO DE LA CONEXIÓN</label><input id="edgeLabelInput" class="field-input" value="${escapeHtml(edge.attrs.label||'')}" placeholder="Ej. Sí, No, continúa"></div><div class="field-group"><label class="field-label" for="edgeStyleInput">ESTILO</label><select id="edgeStyleInput" class="field-input"><option value="solid">Línea continua</option><option value="dotted">Línea punteada</option></select></div><button id="deleteEdge" class="danger-button">Eliminar esta conexión</button></div>`;
    document.getElementById('edgeStyleInput').value=edge.attrs.style||'solid';trackFieldHistory(document.getElementById('edgeLabelInput'));document.getElementById('edgeLabelInput').addEventListener('input',e=>{edge.attrs.label=e.target.value;updateGraphAndCode(false);});document.getElementById('edgeStyleInput').addEventListener('change',e=>{checkpoint();edge.attrs.style=e.target.value;updateGraphAndCode(true);});document.getElementById('deleteEdge').addEventListener('click',()=>deleteSelected());
  }else if(cluster){title.textContent='Editar sección';const color=attrsValue(cluster.attrs,'color',colorForCluster(cluster.id)),fill=attrsValue(cluster.attrs,'fillcolor','#F4F7F4');
    document.getElementById('clusterEditor').innerHTML=`<div class="cluster-properties"><div class="selected-crumb"><i class="mini-dot" style="background:${safeColor(color)}"></i>Sección del diagrama</div><div class="field-group"><label class="field-label" for="clusterLabelInput">NOMBRE</label><input id="clusterLabelInput" class="field-input" type="text" maxlength="80" value="${escapeHtml(cluster.label)}"></div><div class="field-row"><div class="field-group"><label class="field-label">BORDE</label><div class="color-field"><input id="clusterStrokeInput" type="color" value="${safeColor(color)}"><code>${escapeHtml(color)}</code></div></div><div class="field-group"><label class="field-label">FONDO</label><div class="color-field"><input id="clusterFillInput" type="color" value="${safeColor(fill)}"><code>${escapeHtml(fill)}</code></div></div></div><p class="muted-note">Arrastra el título de la sección para mover todos sus pasos juntos.</p><button id="deleteCluster" class="danger-button">Eliminar sección y sus pasos</button></div>`;
    const label=document.getElementById('clusterLabelInput');trackFieldHistory(label);label.addEventListener('input',e=>{cluster.label=e.target.value;cluster.attrs.label=cluster.label;updateGraphAndCode(false);});bindColor('clusterStrokeInput',cluster,'color');bindColor('clusterFillInput',cluster,'fillcolor');document.getElementById('deleteCluster').addEventListener('click',()=>deleteSelected());
  }else title.textContent=codePanel.hidden?'Tu diagrama':'Código DOT';
  positionInspector();
}
function positionInspector(){
  if(!inspector||inspector.hidden)return;const rect=boardWrap.getBoundingClientRect(),width=inspector.offsetWidth||312,height=Math.min(inspector.scrollHeight||300,rect.height-24);let left=rect.width-width-14,top=14;
  let anchor=null;
  if(selected?.type==='node'){const n=model.nodes.find(x=>x.id===selected.id);if(n){const d=nodeDimensions(n);anchor={x:camera.x+n.x*camera.zoom,y:camera.y+n.y*camera.zoom,w:d.w*camera.zoom};}}
  else if(selected?.type==='cluster'){const c=model.clusters.find(x=>x.id===selected.id);if(c){const b=clusterBounds(c);anchor={x:camera.x+(b.x+b.w/2)*camera.zoom,y:camera.y+(b.y+24)*camera.zoom,w:0};}}
  else if(selected?.type==='edge'){const e=model.edges[selected.index],a=model.nodes.find(n=>n.id===e?.from),b=model.nodes.find(n=>n.id===e?.to);if(a&&b)anchor={x:camera.x+(a.x+b.x)/2*camera.zoom,y:camera.y+(a.y+b.y)/2*camera.zoom,w:0};}
  if(anchor&&innerWidth>700){const right=anchor.x+anchor.w/2+16;left=right+width<=rect.width-12?right:anchor.x-anchor.w/2-width-16;top=anchor.y-height/2;}
  if(innerWidth<=700){left=8;top=rect.height-height-86;}
  left=Math.max(8,Math.min(left,rect.width-width-8));top=Math.max(8,Math.min(top,rect.height-height-8));inspector.style.left=`${left}px`;inspector.style.top=`${top}px`;
}
function bindColor(id,node,key){const input=document.getElementById(id);if(!input)return;trackFieldHistory(input);input.addEventListener('input',e=>{node.attrs[key]=e.target.value.toUpperCase();const code=e.target.parentElement.querySelector('code');if(code)code.textContent=e.target.value.toUpperCase();updateGraphAndCode(false);});}
function trackFieldHistory(input){let before=null;input.addEventListener('focus',()=>{before=deepCopy(model);});input.addEventListener('blur',()=>{if(before&&JSON.stringify(before)!==JSON.stringify(model)){undoStack.push(before);if(undoStack.length>80)undoStack.shift();redoStack=[];syncHistoryButtons();}before=null;});}
function safeColor(v){return /^#[0-9a-f]{6}$/i.test(v)?v:'#F3F4F6';}
function escapeHtml(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function renderCode(){dotOutput.value=serializeDot(model);}
function renderAll(){renderFlowTabs();renderGraph();renderInspector();renderCode();}
function updateGraphAndCode(refreshInspector=true){renderFlowTabs();renderGraph();renderCode();if(refreshInspector)renderInspector();persist();}
function syncDotPosition(node){node.attrs.pos=`${Math.round(node.x)},${Math.round(-node.y)}!`;node.attrs.pin='true';model.graph.layout='neato';}
function persist(){
  if(EMBEDDED){
    if(!bridgeSchemeId)return;
    const requestId=++bridgeRequestId;document.getElementById('savedStatus').textContent='Guardando…';
    window.parent.postMessage({type:'WESO_FLOW_SAVE',schemeId:bridgeSchemeId,requestId,graph:deepCopy(model)},location.origin);return;
  }
  try{localStorage.setItem(STORAGE_KEY,JSON.stringify(model));document.getElementById('savedStatus').textContent='Guardado';}catch{document.getElementById('savedStatus').textContent='Sesión local';}
}
function loadFromWeso(message){
  if(!validSavedModel(message.graph))return;
  model=deepCopy(message.graph);initialModel=deepCopy(message.graph);bridgeSchemeId=message.schemeId;bridgeSchemeName=String(message.name||'Weso Flow');bridgeProjectName=String(message.projectName||'Operaciones');
  selected=null;undoStack=[];redoStack=[];activeCluster=model.clusters[0]?.id||null;activeView=activeCluster||'all';
  const title=document.getElementById('diagramTitle');if(title)title.textContent=bridgeSchemeName;
  document.title=`${bridgeSchemeName} · Weso Flow`;
  renderAll();syncHistoryButtons();document.getElementById('savedStatus').textContent='Guardado';
  requestAnimationFrame(()=>focusCluster(activeCluster||'all'));
}
function onWesoFlowMessage(event){
  if(event.source!==window.parent||event.origin!==location.origin||!event.data||typeof event.data!=='object')return;
  const message=event.data;
  if(message.type==='WESO_FLOW_PING'){
    window.parent.postMessage({type:'WESO_FLOW_READY',graph:deepCopy(initialModel)},location.origin);return;
  }
  if(message.type==='WESO_FLOW_LOAD'){loadFromWeso(message);return;}
  if(message.type==='WESO_FLOW_SAVE_ACK'){
    const requestId=Number(message.requestId)||0;if(requestId<lastSaveAck)return;lastSaveAck=requestId;
    document.getElementById('savedStatus').textContent=message.ok?'Guardado':'Error al guardar';
    if(!message.ok)showToast('No se guardó en línea. Revisa el estado de guardado en la barra superior.');
  }
}
function checkpoint(){undoStack.push(deepCopy(model));if(undoStack.length>80)undoStack.shift();redoStack=[];syncHistoryButtons();}
function syncHistoryButtons(){document.getElementById('undoBtn').style.opacity=undoStack.length?'1':'.48';document.getElementById('redoBtn').style.opacity=redoStack.length?'1':'.48';}
function reconcileActiveFlow(){let changed=false;if(!model.clusters.some(c=>c.id===activeCluster)){activeCluster=model.clusters[0]?.id||null;changed=true;}if(activeView!=='all'&&!model.clusters.some(c=>c.id===activeView)){activeView=activeCluster||'all';changed=true;}return changed;}
function undo(){if(!undoStack.length)return;redoStack.push(deepCopy(model));model=undoStack.pop();selected=null;const changed=reconcileActiveFlow();renderAll();persist();syncHistoryButtons();if(changed&&activeCluster)focusCluster(activeView==='all'?'all':activeCluster);}
function redo(){if(!redoStack.length)return;undoStack.push(deepCopy(model));model=redoStack.pop();selected=null;const changed=reconcileActiveFlow();renderAll();persist();syncHistoryButtons();if(changed&&activeCluster)focusCluster(activeView==='all'?'all':activeCluster);}
function showToast(message){toast.textContent=message;toast.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.classList.remove('show'),2100);}
function requestConfirmation({title,message,confirmLabel='Confirmar',danger=false,onConfirm}){
  const dialog=document.getElementById('confirmDialog'),button=document.getElementById('acceptConfirm');
  document.getElementById('confirmTitle').textContent=title;document.getElementById('confirmMessage').textContent=message;button.textContent=confirmLabel;button.classList.toggle('button-danger',danger);button.classList.toggle('button-dark',!danger);pendingConfirmation=onConfirm;dialog.showModal();
}
function resolveConfirmation(confirmed){
  const dialog=document.getElementById('confirmDialog'),action=pendingConfirmation;pendingConfirmation=null;dialog.close();if(confirmed)action?.();
}
function connectClick(id){if(!connectSource){connectSource=id;renderGraph();showToast('Ahora selecciona el paso de destino');return;}if(connectSource===id){connectSource=null;renderGraph();return;}checkpoint();model.edges.push({from:connectSource,to:id,attrs:{...model.edgeDefaults}});connectSource=null;mode='select';document.body.classList.remove('connect-mode');document.getElementById('connectTool').classList.remove('active');document.getElementById('selectTool').classList.add('active');selected={type:'edge',index:model.edges.length-1};renderAll();persist();showToast('Conexión creada');}
function deleteSelected(){if(!selected)return;const target=deepCopy(selected);
  if(target.type==='cluster'&&model.clusters.length<=1){showToast('Debe quedar al menos una sección');return;}
  if(target.type==='cluster'){const section=model.clusters.find(c=>c.id===target.id);requestConfirmation({title:'Eliminar sección',message:`Se eliminarán «${section?.label||'esta sección'}», sus pasos y sus conexiones.`,confirmLabel:'Eliminar sección',danger:true,onConfirm:()=>removeSelection(target)});return;}
  removeSelection(target);
}
function removeSelection(target){
  if(target.type==='cluster'&&(!model.clusters.some(c=>c.id===target.id)||model.clusters.length<=1))return;
  checkpoint();if(target.type==='node'){const id=target.id;model.nodes=model.nodes.filter(n=>n.id!==id);model.edges=model.edges.filter(e=>e.from!==id&&e.to!==id);showToast('Paso eliminado');}
  else if(target.type==='edge'){model.edges.splice(target.index,1);showToast('Conexión eliminada');}
  else if(target.type==='cluster'){const id=target.id;model.clusters=model.clusters.filter(c=>c.id!==id);const removed=new Set(model.nodes.filter(n=>n.cluster===id).map(n=>n.id));model.nodes=model.nodes.filter(n=>n.cluster!==id);model.edges=model.edges.filter(e=>!removed.has(e.from)&&!removed.has(e.to));activeCluster=model.clusters[0].id;activeView=activeCluster;showToast('Sección y contenido eliminados');}
  selected=null;renderAll();persist();if(activeView!=='all')focusCluster(activeCluster);
}
function sectionIdFor(label){const slug=String(label).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'_').replace(/^_+|_+$/g,'')||'seccion';const base=`cluster_${slug}`;let id=base,i=2;while(model.clusters.some(c=>c.id===id))id=`${base}_${i++}`;return id;}
function addCluster(label,color='#8B79C6',fill='#F0ECFA'){
  label=String(label||'').trim();if(!label)return;checkpoint();const right=model.clusters.length?Math.max(...model.clusters.map(c=>{const b=clusterBounds(c);return b.x+b.w;})):40,id=sectionIdFor(label);
  const cluster={id,label,x:right+160,y:40,attrs:{label,style:'filled,dashed',color,fillcolor:fill}};model.clusters.push(cluster);activeCluster=id;activeView=id;selected={type:'cluster',id};renderAll();persist();focusCluster(id);showToast('Nueva sección creada');
}
function addNode(label,cluster){if(!model.clusters.some(c=>c.id===cluster)){showToast('Primero crea una sección');return;}checkpoint();const nodes=model.nodes.filter(n=>n.cluster===cluster),definition=model.clusters.find(c=>c.id===cluster);const xs=nodes.map(n=>n.x),ys=nodes.map(n=>n.y);const x=xs.length?Math.max(...xs)+285:(definition.x??CLUSTER_OFFSETS[cluster]??70)+140;const y=ys.length?ys.reduce((a,b)=>a+b,0)/ys.length+80:(definition.y??40)+165;let id='nuevo_paso';let i=2;while(model.nodes.some(n=>n.id===id))id='nuevo_paso_'+i++;
  const node={id,cluster,label,attrs:{...model.nodeDefaults,label},x,y};syncDotPosition(node);model.nodes.push(node);selected={type:'node',id};activeCluster=cluster;activeView=cluster;renderAll();persist();focusCluster(cluster);showToast('Paso añadido al flujo');}
function openAddDialog(){const select=document.getElementById('newNodeCluster');select.replaceChildren(...model.clusters.map(c=>{const option=document.createElement('option');option.value=c.id;option.textContent=c.label;return option;}));select.value=activeCluster||model.clusters[0]?.id||'';document.getElementById('newNodeLabel').value='';document.getElementById('addDialog').showModal();setTimeout(()=>document.getElementById('newNodeLabel').focus(),40);}
function openSectionDialog(){document.getElementById('newSectionLabel').value='';document.getElementById('sectionDialog').showModal();setTimeout(()=>document.getElementById('newSectionLabel').focus(),40);}
function validSavedModel(value){return Array.isArray(value?.nodes)&&Array.isArray(value?.edges)&&Array.isArray(value?.clusters)&&value.clusters.length>0&&value.graph&&value.nodeDefaults&&value.edgeDefaults;}
function setMode(next){mode=next;document.body.classList.toggle('connect-mode',mode==='connect');document.getElementById('selectTool').classList.toggle('active',mode==='select');document.getElementById('connectTool').classList.toggle('active',mode==='connect');updateModeHint();connectSource=null;renderGraph();}
function setPanel(name){const isCode=name==='code';propsPanel.hidden=isCode;codePanel.hidden=!isCode;inspector.hidden=!isCode&&!selected;document.getElementById('showCodeBtn').classList.toggle('active',isCode);document.getElementById('showCodeBtn').setAttribute('aria-pressed',String(isCode));document.getElementById('inspectorTitle').textContent=isCode?'Código DOT':selected?.type==='node'?'Editar paso':selected?.type==='edge'?'Editar conexión':selected?.type==='cluster'?'Editar sección':'Tu diagrama';document.querySelectorAll('.inspector-tab').forEach(t=>t.classList.toggle('active',t.dataset.panel===name));positionInspector();}
function downloadFile(name,content,type){const blob=new Blob([content],{type});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);}
function exportDot(){downloadFile('weso-flow.dot',serializeDot(model),'text/vnd.graphviz;charset=utf-8');showToast('Archivo DOT descargado');}
function exportSvg(){const e=extent(),copy=board.cloneNode(true),allWorld=svgEl('g',{id:'world'});renderGraph('all',allWorld);copy.setAttribute('xmlns',SVG_NS);copy.setAttribute('viewBox',`${e.x} ${e.y} ${e.w} ${e.h}`);copy.setAttribute('width',e.w);copy.setAttribute('height',e.h);const style=svgEl('style');style.textContent='.node-text{font:500 13px Arial,sans-serif;fill:#24342e;text-anchor:middle}.cluster-bg{fill-opacity:.67;stroke-dasharray:7 6;stroke-width:1.25}.cluster-title{font:700 12px Arial,sans-serif;fill:#43594d}.edge-visible{fill:none;stroke:#738078;stroke-width:1.45;marker-end:url(#arrow)}.edge-visible.dotted{stroke-dasharray:4 5}.edge-label-bg{fill:#fff;stroke:#e6ebe7;stroke-width:.8}.edge-label{font:500 10px Arial,sans-serif;fill:#536159;text-anchor:middle}';copy.insertBefore(style,copy.firstChild);copy.querySelector('#world').replaceWith(allWorld);copy.querySelectorAll('.selected,.connect-source').forEach(el=>el.classList.remove('selected','connect-source'));const w=copy.querySelector('#world');w.removeAttribute('transform');downloadFile('weso-flow.svg',new XMLSerializer().serializeToString(copy),'image/svg+xml;charset=utf-8');showToast('Archivo SVG descargado');}
function escapeXml(value){return String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));}
function pageCrossNotes(cluster){
  return model.edges.filter(e=>{const a=model.nodes.find(n=>n.id===e.from),b=model.nodes.find(n=>n.id===e.to);return a&&b&&a.cluster!==b.cluster&&(a.cluster===cluster.id||b.cluster===cluster.id);}).map(e=>{
    const a=model.nodes.find(n=>n.id===e.from),b=model.nodes.find(n=>n.id===e.to),label=e.attrs.label||'sin etiqueta';
    return a.cluster===cluster.id?`Conecta con ${model.clusters.find(c=>c.id===b.cluster)?.label||b.cluster.replace(/^cluster_/,'')}: «${label}»`:`Recibe desde ${model.clusters.find(c=>c.id===a.cluster)?.label||a.cluster.replace(/^cluster_/,'')}: «${label}»`;
  });
}
function wrapNote(text,maxChars){const words=String(text).split(/\s+/),lines=[];let line='';for(const word of words){const next=line?`${line} ${word}`:word;if(next.length>maxChars&&line){lines.push(line);line=word;}else line=next;}if(line)lines.push(line);return lines;}
function standaloneFlowSvg(cluster,graphWorld=world){
  const bounds=clusterBounds(cluster),pad=58,header=54,width=bounds.w+pad*2,rawNotes=pageCrossNotes(cluster),notes=rawNotes.length?rawNotes:['Sin interconexiones con otros flujos.'],noteLines=notes.flatMap(note=>wrapNote(note,Math.max(34,Math.floor((width-pad*2)/6.2))));
  const diagramBottom=header+pad+bounds.h,noteTitleY=diagramBottom+32,noteStartY=noteTitleY+22,height=noteStartY+noteLines.length*16+pad+12;
  const group=graphWorld.querySelectorAll('.cluster-group');
  const clusterGroup=Array.from(group).find(g=>g.dataset.cluster===cluster.id)?.cloneNode(true);
  if(!clusterGroup)throw new Error(`No se pudo preparar el flujo ${cluster.label}`);
  const edges=[];
  model.edges.forEach((e,index)=>{const a=model.nodes.find(n=>n.id===e.from),b=model.nodes.find(n=>n.id===e.to);if(!a||!b||a.cluster!==cluster.id||b.cluster!==cluster.id)return;const g=Array.from(graphWorld.querySelectorAll('.edge-group')).find(x=>Number(x.dataset.edge)===index);if(g){const copy=g.cloneNode(true);copy.classList.remove('selected');edges.push(copy);}});
  const nodes=Array.from(graphWorld.querySelectorAll('.node-group')).filter(g=>model.nodes.find(n=>n.id===g.dataset.node)?.cluster===cluster.id).map(g=>{const copy=g.cloneNode(true);copy.classList.remove('selected','connect-source');return copy;});
  const noteMarkup=noteLines.map((line,i)=>`<text x="${pad}" y="${noteStartY+(i*16)}" class="note">${escapeXml(line)}</text>`).join('');
  const svg=svgEl('svg',{xmlns:SVG_NS,width,height,viewBox:`0 0 ${width} ${height}`,'text-rendering':'geometricPrecision','shape-rendering':'geometricPrecision'});
  svg.innerHTML=`<defs><marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#68756e"/></marker></defs><style>
    .cluster-bg{fill-opacity:.67;stroke-dasharray:7 6;stroke-width:1.25}.cluster-title{font:700 12px Arial,sans-serif;letter-spacing:.035em;fill:#43594d}
    .edge-hit{fill:none;stroke:transparent;stroke-width:16}.edge-visible{fill:none;stroke:#738078;stroke-width:1.45;marker-end:url(#arrow)}.edge-visible.dotted{stroke-dasharray:4 5}.edge-label-bg{fill:#fff;stroke:#e6ebe7;stroke-width:.8}.edge-label{font:500 10px Arial,sans-serif;fill:#536159;text-anchor:middle}
    .node-text{font:500 13px Arial,sans-serif;fill:#24342e;text-anchor:middle}.node-subtext{font:10px monospace;fill:#87928b;text-anchor:middle}
    .page-kicker{font:700 10px Arial,sans-serif;letter-spacing:1.5px;fill:#64806d}.page-title{font:700 21px Arial,sans-serif;fill:#17372e}.page-footer{font:700 9px Arial,sans-serif;letter-spacing:1.1px;fill:#819087}.note{font:11px Arial,sans-serif;fill:#526159}
    </style><rect width="100%" height="100%" fill="#fff"/><text x="${pad}" y="${pad-27}" class="page-kicker">WESO FLOW · ${escapeXml(bridgeProjectName.toLocaleUpperCase('es'))}</text><text x="${pad}" y="${pad+1}" class="page-title">${escapeXml(cluster.label)}</text><g transform="translate(${pad-bounds.x} ${header+pad-bounds.y})"></g><text x="${pad}" y="${noteTitleY}" class="page-footer">INTERCONEXIONES</text>${noteMarkup}<text x="${width-pad}" y="${height-pad-4}" text-anchor="end" class="page-footer">WESO</text>`;
  const diagram=svg.querySelector('g');diagram.append(clusterGroup,...edges,...nodes);
  return {svg,width,height};
}
function svgToJpeg(svg,width,height){
  return new Promise((resolve,reject)=>{const source=new XMLSerializer().serializeToString(svg),url=URL.createObjectURL(new Blob([source],{type:'image/svg+xml;charset=utf-8'})),image=new Image();
    image.onload=()=>{URL.revokeObjectURL(url);const scale=Math.min(1,3600/Math.max(width,height)),canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(width*scale));canvas.height=Math.max(1,Math.round(height*scale));const ctx=canvas.getContext('2d',{alpha:false});ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.drawImage(image,0,0,canvas.width,canvas.height);canvas.toBlob(blob=>{if(!blob){reject(new Error('No se pudo generar la imagen PDF'));return;}blob.arrayBuffer().then(buf=>resolve({data:new Uint8Array(buf),width:canvas.width,height:canvas.height}),reject);},'image/jpeg',.96);};
    image.onerror=()=>{URL.revokeObjectURL(url);reject(new Error('No se pudo dibujar un flujo para el PDF'));};image.src=url;
  });
}
function pdfNumber(value){const rounded=Math.round(value*1000)/1000;if(Object.is(rounded,-0)||rounded===0)return'0';return rounded.toFixed(3).replace(/\.?0+$/,'');}
function assemblePdf(images){
  const encoder=new TextEncoder(),objects=[null,null],pageRefs=[];
  images.forEach((img,index)=>{const pageId=3+index*3,contentId=pageId+1,imageId=pageId+2,pageW=img.pageWidth,pageH=img.pageHeight;pageRefs.push(`${pageId} 0 R`);
    objects[pageId]=encoder.encode(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageW} ${pageH}] /Resources << /XObject << /Im0 ${imageId} 0 R >> >> /Contents ${contentId} 0 R >>`);
    const scale=Math.min(pageW/img.width,pageH/img.height),drawW=img.width*scale,drawH=img.height*scale,drawX=(pageW-drawW)/2,drawY=(pageH-drawH)/2;
    const content=encoder.encode(`q\n${pdfNumber(drawW)} 0 0 ${pdfNumber(drawH)} ${pdfNumber(drawX)} ${pdfNumber(drawY)} cm\n/Im0 Do\nQ`);objects[contentId]=concatBytes([encoder.encode(`<< /Length ${content.length} >>\nstream\n`),content,encoder.encode('\nendstream')]);
    objects[imageId]=concatBytes([encoder.encode(`<< /Type /XObject /Subtype /Image /Width ${img.width} /Height ${img.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${img.data.length} >>\nstream\n`),img.data,encoder.encode('\nendstream')]);
  });
  objects[1]=encoder.encode('<< /Type /Catalog /Pages 2 0 R >>');objects[2]=encoder.encode(`<< /Type /Pages /Kids [${pageRefs.join(' ')}] /Count ${images.length} >>`);
  const chunks=[encoder.encode('%PDF-1.4\n%WesoFlow\n')],offsets=[0];let position=chunks[0].length;
  for(let id=1;id<objects.length;id++){offsets[id]=position;const head=encoder.encode(`${id} 0 obj\n`),tail=encoder.encode('\nendobj\n');chunks.push(head,objects[id],tail);position+=head.length+objects[id].length+tail.length;}
  const xrefOffset=position;let xref=`xref\n0 ${objects.length}\n0000000000 65535 f \n`;for(let id=1;id<objects.length;id++)xref+=`${String(offsets[id]).padStart(10,'0')} 00000 n \n`;
  chunks.push(encoder.encode(xref+`trailer\n<< /Size ${objects.length} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`));return new Blob([concatBytes(chunks)],{type:'application/pdf'});
}
function concatBytes(parts){const size=parts.reduce((sum,part)=>sum+part.length,0),result=new Uint8Array(size);let offset=0;for(const part of parts){result.set(part,offset);offset+=part.length;}return result;}
async function exportPdf(){
  const button=document.getElementById('exportPdfTop');button.disabled=true;button.setAttribute('aria-busy','true');
  try{const pages=[],allWorld=svgEl('g');renderGraph('all',allWorld);for(const cluster of model.clusters){const page=standaloneFlowSvg(cluster,allWorld),image=await svgToJpeg(page.svg,page.width,page.height),landscape=page.width>=page.height;pages.push({...image,pageWidth:landscape?1190.55:841.89,pageHeight:landscape?841.89:1190.55});}
    const blob=assemblePdf(pages),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='weso-flow-diagramas.pdf';a.click();setTimeout(()=>URL.revokeObjectURL(url),1500);showToast('PDF de todas las secciones descargado');
  }catch(error){console.error(error);showToast('No se pudo generar el PDF. Inténtalo de nuevo.');}finally{button.disabled=false;button.removeAttribute('aria-busy');}
}
function clientWorld(clientX,clientY){const r=board.getBoundingClientRect();return{x:(clientX-r.left-camera.x)/camera.zoom,y:(clientY-r.top-camera.y)/camera.zoom};}

document.querySelector('.all-tab').addEventListener('click',()=>{selected=null;activeView='all';focusCluster('all');renderAll();});
if(!EMBEDDED)window.addEventListener('storage',ev=>{if(ev.key!==STORAGE_KEY||!ev.newValue)return;try{const next=JSON.parse(ev.newValue);if(!validSavedModel(next))return;model=next;selected=null;undoStack=[];redoStack=[];reconcileActiveFlow();renderAll();syncHistoryButtons();focusCluster(activeView==='all'?'all':activeCluster);showToast('Cambios actualizados desde otra pestaña');}catch{}});
document.getElementById('showCodeBtn').addEventListener('click',()=>setPanel(codePanel.hidden?'code':'properties'));
document.getElementById('closeInspector').addEventListener('click',()=>{selected=null;setPanel('properties');renderAll();});
document.getElementById('selectTool').addEventListener('click',()=>setMode('select'));
document.getElementById('connectTool').addEventListener('click',()=>setMode(mode==='connect'?'select':'connect'));
document.getElementById('addNodeTool').addEventListener('click',openAddDialog);document.getElementById('welcomeAdd').addEventListener('click',openAddDialog);document.getElementById('addFromOverview').addEventListener('click',openAddDialog);
document.getElementById('addFlowTab').addEventListener('click',openSectionDialog);document.getElementById('addClusterFromOverview').addEventListener('click',openSectionDialog);
for(const [buttonId,dialogId] of [['closeAddDialog','addDialog'],['cancelAdd','addDialog'],['closeSectionDialog','sectionDialog'],['cancelSection','sectionDialog']])document.getElementById(buttonId).addEventListener('click',ev=>{ev.preventDefault();document.getElementById(dialogId).close();});
document.getElementById('closeConfirmDialog').addEventListener('click',()=>resolveConfirmation(false));document.getElementById('cancelConfirm').addEventListener('click',()=>resolveConfirmation(false));document.getElementById('acceptConfirm').addEventListener('click',()=>resolveConfirmation(true));document.getElementById('confirmDialog').addEventListener('cancel',()=>{pendingConfirmation=null;});
document.getElementById('confirmAdd').addEventListener('click',ev=>{ev.preventDefault();const label=document.getElementById('newNodeLabel').value.trim();if(!label){document.getElementById('newNodeLabel').focus();return;}addNode(label,document.getElementById('newNodeCluster').value);document.getElementById('addDialog').close();});
document.getElementById('sectionForm').addEventListener('submit',ev=>{ev.preventDefault();const label=document.getElementById('newSectionLabel').value.trim();if(!label){document.getElementById('newSectionLabel').focus();return;}addCluster(label,document.getElementById('newSectionColor').value.toUpperCase(),document.getElementById('newSectionFill').value.toUpperCase());document.getElementById('sectionDialog').close();});
for(const inputId of ['newSectionColor','newSectionFill'])document.getElementById(inputId).addEventListener('input',ev=>{ev.currentTarget.parentElement.querySelector('code').textContent=ev.currentTarget.value.toUpperCase();});
document.getElementById('undoBtn').addEventListener('click',undo);document.getElementById('redoBtn').addEventListener('click',redo);
document.getElementById('fitBtn').addEventListener('click',()=>focusCluster(activeView,true));document.getElementById('zoomIn').addEventListener('click',()=>{camera.zoom=Math.min(1.65,camera.zoom*1.15);setCamera();});document.getElementById('zoomOut').addEventListener('click',()=>{camera.zoom=Math.max(.12,camera.zoom/1.15);setCamera();});
document.getElementById('resetBtn').addEventListener('click',()=>requestConfirmation({title:'Restaurar diagrama original',message:'Se volverá a la versión con la que abriste este flujo. Este cambio también se guardará.',confirmLabel:'Restaurar diagrama',danger:true,onConfirm:()=>{checkpoint();model=deepCopy(initialModel);selected=null;activeCluster=model.clusters[0]?.id||null;activeView=activeCluster||'all';renderAll();persist();focusCluster(activeView);showToast('Diagrama original restaurado');}}));
document.getElementById('exportPdfTop').addEventListener('click',exportPdf);document.getElementById('downloadCode').addEventListener('click',exportDot);document.getElementById('downloadSvg').addEventListener('click',exportSvg);document.getElementById('copyCode').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(serializeDot(model));showToast('Código DOT copiado');}catch{dotOutput.focus();dotOutput.select();document.execCommand('copy');showToast('Código DOT copiado');}});
for(const dialog of [document.getElementById('addDialog'),document.getElementById('sectionDialog')])dialog.addEventListener('click',e=>{if(e.target===e.currentTarget)dialog.close();});document.getElementById('confirmDialog').addEventListener('click',e=>{if(e.target===e.currentTarget)resolveConfirmation(false);});
board.addEventListener('pointermove',ev=>{if(drag&&ev.pointerId===drag.pointerId){const n=model.nodes.find(x=>x.id===drag.id);if(!n)return;const dx=(ev.clientX-drag.last.x)/camera.zoom,dy=(ev.clientY-drag.last.y)/camera.zoom;if(Math.abs(dx)+Math.abs(dy)>1)drag.moved=true;n.x+=dx;n.y+=dy;drag.last={x:ev.clientX,y:ev.clientY};renderGraph();renderCode();persist();}else if(clusterDrag&&ev.pointerId===clusterDrag.pointerId){const section=model.clusters.find(c=>c.id===clusterDrag.id);if(!section)return;const dx=(ev.clientX-clusterDrag.last.x)/camera.zoom,dy=(ev.clientY-clusterDrag.last.y)/camera.zoom;if(Math.abs(dx)+Math.abs(dy)>1)clusterDrag.moved=true;const bounds=clusterBounds(section);for(const n of model.nodes.filter(n=>n.cluster===section.id)){n.x+=dx;n.y+=dy;}section.x=bounds.x+dx+70;section.y=bounds.y+dy;clusterDrag.last={x:ev.clientX,y:ev.clientY};renderFlowTabs();renderGraph();renderCode();persist();}else if(pan&&ev.pointerId===pan.pointerId){camera.x=pan.cameraX+(ev.clientX-pan.clientX);camera.y=pan.cameraY+(ev.clientY-pan.clientY);setCamera();}});
board.addEventListener('pointerup',ev=>{if(drag&&ev.pointerId===drag.pointerId){if(drag.moved){const movedNode=model.nodes.find(n=>n.id===drag.id);if(movedNode)syncDotPosition(movedNode);undoStack.push(drag.before);redoStack=[];syncHistoryButtons();renderCode();}drag=null;persist();}if(clusterDrag&&ev.pointerId===clusterDrag.pointerId){const state=clusterDrag;clusterDrag=null;if(state.moved){for(const n of model.nodes.filter(n=>n.cluster===state.id))syncDotPosition(n);undoStack.push(state.before);if(undoStack.length>80)undoStack.shift();redoStack=[];syncHistoryButtons();renderAll();}persist();}if(pan&&ev.pointerId===pan.pointerId)pan=null;});
board.addEventListener('pointercancel',()=>{if(drag){model=drag.before;drag=null;renderAll();persist();}if(clusterDrag){model=clusterDrag.before;clusterDrag=null;renderAll();persist();}pan=null;});
board.addEventListener('pointerdown',ev=>{if(ev.target.closest('.node-group')||ev.target.closest('.edge-group')||ev.target.closest('.cluster-title'))return;if(mode==='connect'){connectSource=null;renderGraph();return;}selected=null;renderGraph();renderInspector();const r=board.getBoundingClientRect();pan={pointerId:ev.pointerId,clientX:ev.clientX,clientY:ev.clientY,cameraX:camera.x,cameraY:camera.y};board.setPointerCapture(ev.pointerId);});
board.addEventListener('click',ev=>{if(!ev.target.closest('.node-group')&&!ev.target.closest('.edge-group')&&!ev.target.closest('.cluster-group')&&selected){selected=null;renderAll();}});
board.addEventListener('wheel',ev=>{ev.preventDefault();const before=clientWorld(ev.clientX,ev.clientY),factor=ev.deltaY<0?1.08:.92;camera.zoom=Math.max(.12,Math.min(1.8,camera.zoom*factor));const r=board.getBoundingClientRect();camera.x=ev.clientX-r.left-before.x*camera.zoom;camera.y=ev.clientY-r.top-before.y*camera.zoom;setCamera();},{passive:false});
window.addEventListener('keydown',ev=>{if(ev.key==='Escape'&&mode==='connect')setMode('select');if((ev.metaKey||ev.ctrlKey)&&ev.key.toLowerCase()==='z'){ev.preventDefault();if(ev.shiftKey)redo();else undo();}if((ev.metaKey||ev.ctrlKey)&&ev.key.toLowerCase()==='y'){ev.preventDefault();redo();}if((ev.key==='Delete'||ev.key==='Backspace')&&!['TEXTAREA','INPUT','SELECT'].includes(document.activeElement.tagName)){ev.preventDefault();deleteSelected();}});
window.addEventListener('resize',()=>focusCluster(activeView==='all'?'all':activeCluster,true));

renderAll();syncHistoryButtons();requestAnimationFrame(()=>focusCluster(activeCluster));
if(EMBEDDED){
  window.addEventListener('message',onWesoFlowMessage);
  document.getElementById('savedStatus').textContent='Abriendo proyecto…';
  window.parent.postMessage({type:'WESO_FLOW_READY',graph:deepCopy(initialModel)},location.origin);
}
