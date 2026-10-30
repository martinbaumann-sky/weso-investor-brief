// Public Flow uses capability links, never a Hub session or authenticated role.
const RECENTS = 'weso-flow-links-v1';
export const validToken = (value) => /^[a-f0-9]{64}$/.test(value ?? '');
export const clone = (value) => structuredClone(value);
export class FlowLibrary {
  constructor(url, key, { request = fetch, storage = localStorage } = {}) {
    this.url = url.replace(/\/$/, ''); this.key = key;
    this.request = (...args) => request(...args); this.storage = storage; this.projects = new Map();
  }
  links() {
    try { return JSON.parse(this.storage.getItem(RECENTS) || '[]').filter(validToken).slice(-50); }
    catch { return []; }
  }
  remember(token) {
    try { this.storage.setItem(RECENTS, JSON.stringify([...new Set([...this.links(), token])].slice(-50))); }
    catch { /* The URL remains a usable backup when browser storage is blocked. */ }
  }
  async rpc(name, args) {
    let response;
    try {
      response = await this.request(`${this.url}/rest/v1/rpc/flow_link_${name}`, {
        method: 'POST', headers: { apikey: this.key, 'Content-Type': 'application/json' },
        body: JSON.stringify(args), signal: AbortSignal.timeout(20000),
        credentials: 'omit', referrerPolicy: 'no-referrer',
      });
    } catch { throw new Error('No hay conexión con el guardado en línea. Tus cambios siguen abiertos; vuelve a intentar.'); }
    const result = await response.json().catch(() => null);
    if (!response.ok) {
      if (['40001', 'PT409'].includes(result?.code)) throw new Error('Otra persona guardó cambios en este proyecto. Descarga un respaldo antes de recargar para recuperar la última versión.');
      if (result?.code === '54000') throw new Error('Alcanzaste el límite de proyectos por hora. Vuelve a intentar más tarde.');
      if (['22023', 'P0001'].includes(result?.code)) throw new Error('El proyecto supera los límites o contiene un diagrama no válido.');
      if (result?.code === 'P0002') throw new Error('El enlace no existe o el proyecto fue eliminado.');
      throw new Error('No se pudo guardar en línea. Comprueba la conexión y la configuración de Flow.');
    }
    return result;
  }
  async open(token) {
    if (!validToken(token)) throw new Error('El enlace de proyecto no es válido.');
    const project = await this.rpc('open', { p_token: token });
    if (!project?.document || !Array.isArray(project.document.schemes) || !Array.isArray(project.document.versions)) throw new Error('El proyecto recibido no es válido.');
    const item = { ...project, token };
    this.projects.set(item.id, item); this.remember(token); return item;
  }
  async list(token) {
    if (token) await this.open(token); // Invalid incoming links must never open a different project.
    const others = this.links().filter((item) => item !== token);
    const results = await Promise.allSettled(others.map((item) => this.open(item)));
    if (!token && others.length && results.every((item) => item.status === 'rejected')) throw results[0].reason;
    return [...this.projects.values()];
  }
  async create(name, graph) {
    return this.createDocument({ name, schemes: [{ id: crypto.randomUUID(), name: 'Mi primer flujo', graph: clone(graph), updated_at: new Date().toISOString() }], versions: [] });
  }
  async createDocument(document) {
    const token = [...crypto.getRandomValues(new Uint8Array(32))].map((b) => b.toString(16).padStart(2, '0')).join('');
    const project = await this.rpc('create', { p_token: token, p_document: document });
    const item = { ...project, token };
    this.projects.set(item.id, item); this.remember(token); return item;
  }
  async change(id, mutate) {
    const project = this.projects.get(id);
    if (!project) throw new Error('Abre el proyecto antes de editarlo.');
    const document = clone(project.document); mutate(document);
    const saved = await this.rpc('save', { p_token: project.token, p_revision: project.revision, p_document: document });
    const item = { ...saved, token: project.token };
    this.projects.set(item.id, item); return item;
  }
  async remove(id) {
    const project = this.projects.get(id);
    await this.rpc('delete', { p_token: project.token, p_revision: project.revision });
    this.projects.delete(id);
    try { this.storage.setItem(RECENTS, JSON.stringify(this.links().filter((token) => token !== project.token))); } catch { /* A deleted link can remain in recents when browser storage is unavailable. */ }
  }
}
