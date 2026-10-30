import { FlowLibrary, validToken, clone } from './library.js';
import './styles.css';

const root = document.querySelector('#app');
const base = import.meta.env.BASE_URL;
const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY;
const library = url && key ? new FlowLibrary(url, key) : null;
let frame, activeProject = null, activeScheme = null;
let frameReady = false, libraryStarted = false, busy = false, savesInFlight = 0;
let projects = [], schemes = [], versions = [];
let pendingSave = null, failedSave = false, saveTimer = null, saveChain = Promise.resolve(), dialogAction = null;
const text = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
function emptyGraph() {
  return {
    graph: { splines: 'ortho', nodesep: '0.5', ranksep: '0.6' },
    nodeDefaults: { fontname: 'Arial', fontsize: '10', shape: 'box', style: 'filled,rounded', fillcolor: '#F3F4F6', color: '#9CA3AF', width: '2.6', fixedsize: 'true' },
    edgeDefaults: { fontname: 'Arial', fontsize: '9', color: '#4B5563' },
    clusters: [{ id: 'cluster_flujo_principal', label: 'Flujo principal', x: 70, y: 40, attrs: { label: 'Flujo principal', style: 'filled,dashed', color: '#8B79C6', fillcolor: '#F0ECFA' } }],
    nodes: [], edges: [],
  };
}
function incomingToken() { return new URLSearchParams(location.hash.slice(1)).get('project'); }
function projectUrl(token) { const link = new URL(location.href); link.pathname = base; link.search = ''; link.hash = new URLSearchParams({ project: token }).toString(); return link.href; }
function selectProjectUrl(token) { history.replaceState(null, '', token ? projectUrl(token) : (base)); }
function isGraph(graph) { return graph && Array.isArray(graph.nodes) && Array.isArray(graph.edges) && Array.isArray(graph.clusters) && graph.graph && graph.nodeDefaults && graph.edgeDefaults; }
function renderWorkspace() {
  root.innerHTML = `<main class="workspace">
    <header class="topbar">
      <a class="brand" href="${base}" aria-label="Weso Flow, inicio"><img src="${base}editor/weso-logo.png" alt=""><span><b>WESO</b><small>OPERATIONS</small></span></a>
      <div class="doc-heading"><p class="eyebrow">PROYECTO · <span id="activeProjectName">Cargando…</span></p><h1 id="activeName">Cargando biblioteca…</h1></div>
      <button class="save-state" id="saveState" type="button" title="Reintentar guardado pendiente"><i></i><span>Conectando</span></button>
      <button class="button icon-button" id="shareProject" type="button" disabled>Compartir enlace</button><button class="button icon-button" id="exportProject" type="button" disabled>Respaldo</button>
    </header>
    <nav class="library-bar" aria-label="Proyectos y flujos">
      <div class="library-group project-group">
        <label class="bar-label" for="projectSelect">Proyecto</label>
        <select id="projectSelect" disabled><option>Cargando proyectos…</option></select>
      </div>
      <button class="button" id="importProject" type="button">Importar respaldo</button><input id="importFile" class="sr-only" type="file" accept=".json,application/json" tabindex="-1" aria-label="Archivo de respaldo"><button class="button" id="newProject" type="button">＋ Proyecto</button>
      <button class="button project-manage" id="renameProject" type="button" disabled>Renombrar proyecto</button>
      <button class="button danger-text project-manage" id="deleteProject" type="button" disabled>Eliminar proyecto</button>
      <span class="divider"></span>
      <div class="library-group flow-group">
        <label class="bar-label" for="schemeSelect">Flujo</label>
        <select id="schemeSelect" disabled><option>Cargando flujos…</option></select>
      </div>
      <button class="button" id="newScheme" type="button">＋ Nuevo flujo</button>
      <button class="button" id="duplicateScheme" type="button" disabled>Duplicar</button>
      <button class="button" id="renameScheme" type="button" disabled>Renombrar</button>
      <button class="button danger-text" id="deleteScheme" type="button" disabled>Eliminar</button>
      <span class="divider"></span>
      <label class="sr-only" for="versionSelect">Versión</label>
      <select id="versionSelect" disabled><option>Sin versiones</option></select>
      <button class="button" id="saveVersion" type="button" disabled>Guardar versión</button>
      <button class="button" id="restoreVersion" type="button" disabled>Restaurar</button>
    </nav>
    <section class="editor-frame" aria-label="Editor visual">
      <iframe id="editor" title="Editor visual de diagramas Weso Flow" src="${base}editor/index.html?embedded=1"></iframe>
      <div class="loading-overlay" id="loading" aria-busy="true">
        <div class="spinner" aria-hidden="true"></div>
        <h2 id="overlayTitle" hidden></h2>
        <span id="overlayMessage">Abriendo tus proyectos de Flow…</span>
        <div class="welcome-actions" id="welcomeActions" hidden>
          <button class="button primary" id="welcomeCreate" type="button">Crear mi primer proyecto</button>
          <button class="button" id="welcomeImport" type="button">Importar respaldo</button>
        </div>
        <button class="button" id="retryOpen" type="button" hidden>Reintentar</button>
      </div>
    </section>
    <footer class="workspace-footer"><span>Guardado en línea · Quien tenga el enlace puede editar este proyecto.</span><span id="userEmail"></span></footer>
    <dialog id="nameDialog" class="dialog"><form id="nameForm" method="dialog">
      <p class="eyebrow" id="dialogEyebrow">BIBLIOTECA WESO FLOW</p><h2 id="dialogTitle">Nuevo flujo</h2>
      <label for="schemeName" id="dialogLabel">Nombre</label><input id="schemeName" maxlength="120" required>
      <div class="dialog-actions"><button class="button" type="button" id="cancelDialog">Cancelar</button><button class="button primary" type="submit" id="confirmDialog">Guardar</button></div>
    </form></dialog>
    <div class="toast" id="toast" role="status" aria-live="polite"></div>
  </main>`;

  root.querySelector('#importProject').addEventListener('click', () => root.querySelector('#importFile').click());
  root.querySelector('#importFile').addEventListener('change', (event) => void importProject(event.target));
  root.querySelector('#welcomeCreate').addEventListener('click', () => openNameDialog('newProject'));
  root.querySelector('#welcomeImport').addEventListener('click', () => root.querySelector('#importFile').click());
  root.querySelector('#retryOpen').addEventListener('click', () => { libraryStarted = false; void initializeLibrary(); });
  frame = root.querySelector('#editor');
  root.querySelector('#userEmail').textContent = 'Sin cuenta · Acceso independiente del Hub';
  root.querySelector('#shareProject').addEventListener('click', () => void shareProject());
  root.querySelector('#exportProject').addEventListener('click', exportProject);
  frame.addEventListener('load', () => {
    frameReady = false;
    frame.contentWindow?.postMessage({ type: 'WESO_FLOW_PING' }, window.location.origin);
  });
  root.querySelector('#projectSelect').addEventListener('change', (event) => void switchProject(event.currentTarget.value));
  root.querySelector('#schemeSelect').addEventListener('change', (event) => void loadScheme(event.currentTarget.value));
  root.querySelector('#newProject').addEventListener('click', () => openNameDialog('newProject'));
  root.querySelector('#renameProject').addEventListener('click', () => openNameDialog('renameProject'));
  root.querySelector('#deleteProject').addEventListener('click', () => void deleteProject());
  root.querySelector('#versionSelect').addEventListener('change', updateControls);
  root.querySelector('#newScheme').addEventListener('click', () => openNameDialog('new'));
  root.querySelector('#duplicateScheme').addEventListener('click', () => openNameDialog('duplicate'));
  root.querySelector('#renameScheme').addEventListener('click', () => openNameDialog('rename'));
  root.querySelector('#saveVersion').addEventListener('click', () => openNameDialog('version'));
  root.querySelector('#deleteScheme').addEventListener('click', () => void deleteScheme());
  root.querySelector('#restoreVersion').addEventListener('click', () => void restoreVersion());
  root.querySelector('#cancelDialog').addEventListener('click', () => root.querySelector('#nameDialog').close());
  root.querySelector('#nameForm').addEventListener('submit', (event) => {
    event.preventDefault();
    void submitNameDialog();
  });

}

function setSaveState(label, state = '') {
  const el = root.querySelector('#saveState');
  if (el) { el.className = `save-state ${state}`; el.querySelector('span').textContent = label; }
}
function setLoading(loading, message = 'Abriendo proyecto…', mode = 'loading') {
  const el = root.querySelector('#loading');
  if (!el) return;
  el.classList.toggle('hidden', !loading);
  el.setAttribute('aria-busy', String(loading && mode === 'loading'));
  el.querySelector('.spinner').hidden = mode !== 'loading';
  el.querySelector('#overlayMessage').textContent = message;
  const title = el.querySelector('#overlayTitle');
  title.hidden = mode === 'loading';
  title.textContent = mode === 'empty' ? 'Tu próximo proceso empieza aquí' : 'No se pudo abrir el proyecto';
  root.querySelector('#welcomeActions').hidden = mode !== 'empty';
  root.querySelector('#retryOpen').hidden = mode !== 'error' || !library;
}
function toast(message) {
  const el = root.querySelector('#toast'); if (!el) return;
  el.textContent = message; el.classList.add('visible'); clearTimeout(toast.timer);
  toast.timer = setTimeout(() => el.classList.remove('visible'), 6500);
}
function sendToEditor(message) { frame?.contentWindow?.postMessage(message, location.origin); }
function syncProject() {
  projects = [...library.projects.values()].map((p) => ({ ...p, name: p.document.name }));
  if (activeProject) {
    activeProject = projects.find((p) => p.id === activeProject.id) ?? null;
    schemes = activeProject?.document.schemes ?? [];
    versions = (activeProject?.document.versions ?? []).filter((v) => v.scheme_id === activeScheme?.id).sort((a,b) => b.version_number - a.version_number);
  }
  renderControls();
}
function renderControls() {
  const projectSelect = root.querySelector('#projectSelect'); if (!projectSelect) return;
  projectSelect.innerHTML = projects.length ? projects.map((p) => `<option value="${text(p.id)}">${text(p.name)}</option>`).join('') : '<option value="">Crea tu primer proyecto</option>';
  projectSelect.disabled = busy || projects.length < 2;
  if (activeProject) projectSelect.value = activeProject.id;
  const schemeSelect = root.querySelector('#schemeSelect');
  schemeSelect.innerHTML = schemes.length ? schemes.map((s) => `<option value="${text(s.id)}">${text(s.name)}</option>`).join('') : '<option value="">Sin flujos</option>';
  schemeSelect.disabled = busy || schemes.length < 2;
  if (activeScheme) schemeSelect.value = activeScheme.id;
  const versionSelect = root.querySelector('#versionSelect'), selectedVersion = versionSelect.value;
  versionSelect.innerHTML = versions.length ? versions.map((v) => `<option value="${text(v.id)}">v${v.version_number} · ${text(v.label)}</option>`).join('') : '<option value="">Sin versiones</option>';
  versionSelect.disabled = busy || !versions.length;
  if (versions.some((v) => v.id === selectedVersion)) versionSelect.value = selectedVersion;
  root.querySelector('#activeProjectName').textContent = activeProject?.name ?? 'Weso Flow';
  root.querySelector('#activeName').textContent = activeScheme?.name ?? 'Diseña y comparte tus procesos';
  for (const id of ['renameProject', 'deleteProject', 'shareProject', 'exportProject', 'newScheme']) root.querySelector(`#${id}`).disabled = busy || !activeProject;
  for (const id of ['renameScheme', 'duplicateScheme', 'saveVersion']) root.querySelector(`#${id}`).disabled = busy || !activeScheme;
  root.querySelector('#deleteScheme').disabled = busy || schemes.length <= 1;
  for (const id of ['newProject', 'importProject', 'welcomeCreate', 'welcomeImport']) root.querySelector(`#${id}`).disabled = busy || !library || !frameReady;
  frame.style.pointerEvents = busy ? 'none' : '';
  updateControls();
}
function updateControls() { root.querySelector('#restoreVersion').disabled = busy || !versions.some((v) => v.id === root.querySelector('#versionSelect').value); }
function showScheme(id) {
  const scheme = activeProject?.document.schemes.find((s) => s.id === id);
  if (!scheme) throw new Error('No se encontró el flujo.');
  activeScheme = clone(scheme); syncProject();
  sendToEditor({ type: 'WESO_FLOW_LOAD', projectName: activeProject.name, schemeId: scheme.id, name: scheme.name, graph: scheme.graph });
  setLoading(false); setSaveState('Guardado en línea');
}
async function loadScheme(id) {
  await runAction(async () => { await flushPendingSave(); showScheme(id); });
}
async function switchProject(id) {
  await runAction(async () => {
    await flushPendingSave();
    const known = library.projects.get(id); if (!known) return;
    const project = await library.open(known.token);
    activeProject = { ...project, name: project.document.name }; activeScheme = null;
    selectProjectUrl(project.token); showScheme(project.document.schemes[0].id);
  });
}
async function initializeLibrary() {
  if (!frameReady || libraryStarted) return; libraryStarted = true;
  setLoading(true);
  if (!library) {
    setLoading(true, 'La conexión de Flow aún no está configurada. Configura su URL y clave pública de Supabase para activar el guardado en línea.', 'error');
    setSaveState('Sin configurar', 'error'); renderControls(); return;
  }
  try {
    const token = incomingToken();
    if (token && !validToken(token)) throw new Error('El enlace de proyecto no es válido.');
    await library.list(token); syncProject();
    const project = projects.find((p) => p.token === token) ?? projects[0];
    if (project) {
      activeProject = project; selectProjectUrl(project.token); showScheme(project.document.schemes[0].id);
    } else {
      setLoading(true, 'Crea un proyecto para dibujar tus procesos y compartirlos por enlace, sin cuentas ni contraseñas.', 'empty');
      setSaveState('Listo para crear');
    }
  } catch (error) {
    setLoading(true, error.message, 'error'); setSaveState('No se pudo abrir', 'error');
    // Keep the invalid URL visible; never silently replace it with a different project.
    renderControls();
  }
}
function handleBridgeMessage(event) {
  if (event.origin !== location.origin || event.source !== frame?.contentWindow || !event.data) return;
  const message = event.data;
  if (message.type === 'WESO_FLOW_READY') {
    frameReady = true;
    if (libraryStarted && activeScheme) showScheme(activeScheme.id);
    else void initializeLibrary();
  } else if (message.type === 'WESO_FLOW_SAVE' && isGraph(message.graph) && activeScheme?.id === message.schemeId) {
    activeScheme.graph = clone(message.graph);
    pendingSave = { ...message, projectId: activeProject.id };
    setSaveState('Guardando…', 'saving'); clearTimeout(saveTimer);
    saveTimer = setTimeout(() => void flushPendingSave().catch(() => {}), 350);
  }
}
function flushPendingSave() {
  clearTimeout(saveTimer);
  if (!pendingSave) return saveChain;
  const job = pendingSave; pendingSave = null; savesInFlight++;
  saveChain = saveChain.catch(() => {}).then(async () => {
    try {
      await library.change(job.projectId, (d) => {
        const scheme = d.schemes.find((s) => s.id === job.schemeId);
        if (!scheme) throw new Error('El flujo fue eliminado.');
        scheme.graph = clone(job.graph); scheme.updated_at = new Date().toISOString();
      });
      failedSave = false;
      sendToEditor({ type: 'WESO_FLOW_SAVE_ACK', requestId: job.requestId, ok: true });
      syncProject();
      if (!pendingSave) setSaveState('Guardado en línea');
    } catch (error) {
      failedSave = true;
      // Retain the newest unsaved edit for retry. Never report success on failure.
      pendingSave ??= job;
      sendToEditor({ type: 'WESO_FLOW_SAVE_ACK', requestId: job.requestId, ok: false });
      setSaveState('Sin guardar · reintentar', 'error'); toast(error.message); throw error;
    } finally { savesInFlight--; }
  });
  return saveChain;
}
async function runAction(action) {
  if (busy) return; busy = true; renderControls();
  try { await action(); } catch (error) { toast(error.message || 'No se pudo completar la acción.'); }
  finally { busy = false; renderControls(); }
}
function openNameDialog(mode) {
  if (busy || (!activeScheme && !['newProject'].includes(mode))) return;
  dialogAction = mode;
  const titles = { newProject: 'Crear proyecto', renameProject: 'Renombrar proyecto', new: 'Crear flujo', duplicate: 'Duplicar flujo', rename: 'Renombrar flujo', version: 'Guardar versión' };
  root.querySelector('#dialogTitle').textContent = titles[mode];
  root.querySelector('#dialogLabel').textContent = mode.includes('Project') ? 'Nombre del proyecto' : mode === 'version' ? 'Nombre de la versión' : 'Nombre del flujo';
  root.querySelector('#schemeName').value = mode === 'renameProject' ? activeProject.name : mode === 'rename' ? activeScheme.name : mode === 'duplicate' ? `${activeScheme.name} · copia` : '';
  root.querySelector('#nameDialog').showModal(); root.querySelector('#schemeName').focus();
}
async function submitNameDialog() {
  const name = root.querySelector('#schemeName').value.trim(), mode = dialogAction;
  if (!name || !mode) return;
  const confirm = root.querySelector('#confirmDialog'); confirm.disabled = true;
  await runAction(async () => {
    await flushPendingSave();
    let nextId = activeScheme?.id;
    if (mode === 'newProject') {
      const project = await library.create(name, emptyGraph());
      activeProject = { ...project, name }; selectProjectUrl(project.token); nextId = project.document.schemes[0].id;
    } else {
      await library.change(activeProject.id, (d) => {
        if (mode === 'renameProject') d.name = name;
        else if (mode === 'new' || mode === 'duplicate') {
          nextId = crypto.randomUUID();
          d.schemes.push({ id: nextId, name, graph: mode === 'duplicate' ? clone(activeScheme.graph) : emptyGraph(), updated_at: new Date().toISOString() });
        } else if (mode === 'rename') d.schemes.find((s) => s.id === activeScheme.id).name = name;
        else if (mode === 'version') {
          const last = Math.max(0, ...d.versions.filter((v) => v.scheme_id === activeScheme.id).map((v) => v.version_number));
          d.versions.push({ id: crypto.randomUUID(), scheme_id: activeScheme.id, label: name, version_number: last + 1, graph: clone(activeScheme.graph), created_at: new Date().toISOString() });
        }
      });
    }
    syncProject(); showScheme(nextId); root.querySelector('#nameDialog').close(); dialogAction = null; toast('Cambios guardados en línea.');
  });
  confirm.disabled = false;
}
async function deleteScheme() {
  if (!activeScheme || schemes.length <= 1 || !window.confirm(`¿Eliminar el flujo «${activeScheme.name}» y sus versiones para todas las personas con el enlace?`)) return;
  await runAction(async () => {
    await flushPendingSave(); const id = activeScheme.id;
    await library.change(activeProject.id, (d) => { d.schemes = d.schemes.filter((s) => s.id !== id); d.versions = d.versions.filter((v) => v.scheme_id !== id); });
    syncProject(); showScheme(schemes[0].id); toast('Flujo eliminado.');
  });
}
async function deleteProject() {
  if (!activeProject || !window.confirm(`¿Eliminar el proyecto «${activeProject.name}» y todos sus flujos? El enlace dejará de funcionar para todos.`)) return;
  await runAction(async () => {
    await flushPendingSave(); await library.remove(activeProject.id);
    activeProject = null; activeScheme = null; schemes = []; versions = []; syncProject();
    selectProjectUrl(null);
    if (projects.length) {
      activeProject = projects[0]; selectProjectUrl(activeProject.token); showScheme(activeProject.document.schemes[0].id);
    } else { setLoading(true, 'Proyecto eliminado. Puedes crear uno nuevo cuando quieras.', 'empty'); setSaveState('Listo para crear'); }
  });
}
async function restoreVersion() {
  const version = versions.find((v) => v.id === root.querySelector('#versionSelect').value);
  if (!version || !window.confirm(`¿Restaurar la versión ${version.version_number} para todas las personas con el enlace?`)) return;
  await runAction(async () => {
    await flushPendingSave();
    await library.change(activeProject.id, (d) => { d.schemes.find((s) => s.id === activeScheme.id).graph = clone(version.graph); });
    syncProject(); showScheme(activeScheme.id); toast('Versión restaurada.');
  });
}
async function shareProject() {
  if (!activeProject) return;
  try { await navigator.clipboard.writeText(projectUrl(activeProject.token)); toast('Enlace copiado. Quien lo reciba podrá editar este proyecto, sin acceso al Hub.'); }
  catch { window.prompt('Copia este enlace. Permite editar este proyecto:', projectUrl(activeProject.token)); }
}
function exportProject() {
  if (!activeProject) return;
  const snapshot = clone(activeProject.document);
  if (activeScheme) snapshot.schemes = snapshot.schemes.map((s) => s.id === activeScheme.id ? clone(activeScheme) : s);
  const blob = new Blob([JSON.stringify({ format: 'weso-flow-project-v1', document: snapshot }, null, 2)], { type: 'application/json' });
  const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = 'weso-flow-respaldo.json'; link.click();
  setTimeout(() => URL.revokeObjectURL(link.href), 1000);
}
window.addEventListener('message', handleBridgeMessage);
window.addEventListener('beforeunload', (event) => {
  if (pendingSave || failedSave || savesInFlight) { event.preventDefault(); event.returnValue = ''; }
});
window.addEventListener('online', () => { if (pendingSave) void flushPendingSave().catch(() => {}); });
window.addEventListener('hashchange', async () => {
  if (pendingSave || failedSave || busy) { toast('Guarda o descarga tus cambios antes de abrir otro enlace.'); if (activeProject) selectProjectUrl(activeProject.token); return; }
  activeProject = null; activeScheme = null; schemes = []; versions = []; libraryStarted = false;
  renderControls(); await initializeLibrary();
});
renderWorkspace();
renderControls();
root.querySelector('#saveState').addEventListener('click', () => { if (pendingSave) void flushPendingSave().catch(() => {}); });


async function importProject(input) {
  const file = input.files[0]; input.value = ''; if (!file) return;
  await runAction(async () => {
    if (file.size > 2097152) throw new Error('El respaldo supera el límite de 2 MB.');
    const backup = JSON.parse(await file.text());
    if (backup.format !== 'weso-flow-project-v1' || !backup.document?.schemes?.length || !Array.isArray(backup.document.versions)) throw new Error('El archivo no es un respaldo válido de Flow.');
    await flushPendingSave();
    const project = await library.createDocument(backup.document);
    activeProject = { ...project, name: project.document.name }; selectProjectUrl(project.token);
    syncProject(); showScheme(project.document.schemes[0].id); toast('Respaldo importado como un nuevo proyecto con su propio enlace.');
  });
}
// Refresh shared edits only while idle. A pending or failed local save is never replaced.
setInterval(async () => {
  if (!activeProject || busy || pendingSave || failedSave || savesInFlight || document.hidden) return;
  const id = activeProject.id, revision = activeProject.revision, schemeId = activeScheme?.id;
  try {
    const saved = await library.rpc('open', { p_token: activeProject.token });
    if (busy || pendingSave || failedSave || savesInFlight || activeProject?.id !== id || activeProject.revision !== revision || saved.revision === revision) return;
    library.projects.set(id, { ...saved, token: activeProject.token }); syncProject();
    showScheme(schemes.some((s) => s.id === schemeId) ? schemeId : schemes[0].id);
    toast('Proyecto actualizado con los cambios compartidos.');
  } catch { /* Edits still surface persistence errors; transient read failures are retried. */ }
}, 8000);
