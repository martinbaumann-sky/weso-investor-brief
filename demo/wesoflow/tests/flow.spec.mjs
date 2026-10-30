import { readFile } from 'node:fs/promises';
import { test, expect } from '@playwright/test';
async function nameAction(page, button, name) {
  if (!(await page.locator(button).isVisible())) await page.locator('#libraryPanel summary').click();
  await page.locator(button).click();
  await page.locator('#schemeName').fill(name);
  await page.locator('#nameForm button[type=submit]').click();
  await expect(page.locator('#nameDialog')).not.toBeVisible();
}
async function addNode(page, label) {
  const editor = page.frameLocator('#editor');
  await editor.locator('#addNodeTool').click();
  await editor.locator('#newNodeLabel').fill(label);
  const saved = page.waitForResponse((response) => response.url().endsWith('/rpc/flow_link_save') && response.status() === 200);
  await editor.locator('#confirmAdd').click();
  await saved;
  await expect(page.locator('#saveState')).toHaveText('Guardado en línea');
  await expect(editor.locator('.node-text').filter({ hasText: label })).toHaveCount(1);
}
async function createProject(page, name) {
  await page.goto('./');
  await expect(page.locator('#newProject')).toBeEnabled();
  await nameAction(page, '#newProject', name);
  await expect(page).toHaveURL(/#project=[a-f0-9]{64}$/);
  await expect(page.locator('#loading')).not.toBeVisible();
}
test('Anonymous editing, shared links, autosave, versions, PDF and project isolation', async ({ page, browser }) => {
  const errors = []; page.on('pageerror', (e) => errors.push(e.message));
  const requests = []; page.on('request', (r) => requests.push(r.url()));
  await createProject(page, 'Proyecto público');
  await expect(page.locator('input[type=password]')).toHaveCount(0);
  const url = page.url();
  await addNode(page, 'Solicitud recibida');
  await nameAction(page, '#saveVersion', 'Primera versión');
  await addNode(page, 'Trabajo terminado');
  await page.reload();
  const editor = page.frameLocator('#editor');
  await expect(editor.locator('.node-text').filter({ hasText: 'Trabajo terminado' })).toHaveCount(1);
  const secondContext = await browser.newContext();
  const second = await secondContext.newPage();
  await second.goto(url);
  await expect(second.frameLocator('#editor').locator('.node-text').filter({ hasText: 'Trabajo terminado' })).toHaveCount(1);
  await addNode(second, 'Edición compartida');
  // The first tab has an older revision: it must not overwrite the second person's edit.
  await editor.locator('#addNodeTool').click();
  await editor.locator('#newNodeLabel').fill('Cambio simultáneo');
  await editor.locator('#confirmAdd').click();
  await expect(page.locator('#saveState')).toHaveText('Sin guardar · reintentar');
  const backup = page.waitForEvent('download'); await page.locator('#exportProject').click();
  expect((await backup).suggestedFilename()).toBe('weso-flow-respaldo.json');
  // Decline the reload guard only after the backup exists.
  page.once('dialog', (d) => d.accept()); await page.reload();
  await expect(editor.locator('.node-text').filter({ hasText: 'Edición compartida' })).toHaveCount(1);
  await expect(editor.locator('.node-text').filter({ hasText: 'Cambio simultáneo' })).toHaveCount(0);
  page.once('dialog', (d) => d.accept()); await page.locator('#restoreVersion').click();
  await expect(editor.locator('.node-text')).toHaveCount(1);
  await nameAction(page, '#duplicateScheme', 'Copia del flujo');
  await expect(page.locator('#schemeSelect option')).toHaveCount(2);
  await nameAction(page, '#renameProject', 'Proyecto renombrado');
  await expect(page.locator('#activeProjectName')).toHaveText('Proyecto renombrado');
  const pdf = page.waitForEvent('download'); await editor.locator('#exportPdfTop').click();
  expect((await pdf).suggestedFilename()).toBe('weso-flow-diagramas.pdf');
  await page.screenshot({ path: 'test-results/flow-desktop.png', fullPage: true });
  const thirdContext = await browser.newContext(); const third = await thirdContext.newPage();
  await createProject(third, 'Otro proyecto');
  await expect(third.frameLocator('#editor').locator('.node-text')).toHaveCount(0);
  expect(third.url()).not.toBe(url);
  await second.reload();
  await expect(second.locator('#activeProjectName')).toHaveText('Proyecto renombrado');
  expect(requests.filter((u) => /\/auth\/|user_roles|weso_flow_schemes|weso_flow_projects/.test(u))).toEqual([]);
  expect(errors).toEqual([]);
  await secondContext.close(); await thirdContext.close();
});
test('Invalid link never opens an unrelated recent project; deletion revokes the shared link', async ({ page, browser }) => {
  await createProject(page, 'Eliminar'); const url = page.url();
  const other = await browser.newContext(); const viewer = await other.newPage();
  await viewer.goto(url); await expect(viewer.locator('#loading')).not.toBeVisible();
  page.once('dialog', (d) => d.accept()); await page.locator('#deleteProject').click();
  await expect(page.locator('#loading')).toContainText('Proyecto eliminado');
  await viewer.reload(); await expect(viewer.locator('#loading')).toContainText('no existe');
  await page.goto('./#project=invalid'); await expect(page.locator('#loading')).toContainText('no es válido');
  await expect(page.locator('#loading .spinner')).not.toBeVisible();
  await expect(page.locator('#retryOpen')).toBeVisible();
  await expect(page.locator('#schemeSelect')).toHaveText('Sin flujos');
  await other.close();
});
test('Mobile creation, node editing and persistence', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await createProject(page, 'Proyecto móvil');
  await addNode(page, 'Paso móvil');
  await page.reload();
  await expect(page.frameLocator('#editor').locator('.node-text').filter({ hasText: 'Paso móvil' })).toHaveCount(1);
  await page.screenshot({ path: 'test-results/flow-mobile.png', fullPage: true });
});

test('Backup imports retain graphs under a new link; failed saves retry without losing edits', async ({ page }) => {
  await createProject(page, 'Respaldo original'); const originalUrl = page.url();
  await addNode(page, 'Conservar este paso');
  const download = page.waitForEvent('download'); await page.locator('#exportProject').click();
  const file = await (await download).path();
  await page.locator('#importFile').setInputFiles(file);
  await expect(page).not.toHaveURL(originalUrl);
  await expect(page.frameLocator('#editor').locator('.node-text')).toHaveCount(1);
  let fail = true;
  await page.route('**/rpc/flow_link_save', (route) => fail ? route.abort('internetdisconnected') : route.continue());
  const editor = page.frameLocator('#editor');
  await editor.locator('#addNodeTool').click(); await editor.locator('#newNodeLabel').fill('Guardado recuperado'); await editor.locator('#confirmAdd').click();
  await expect(page.locator('#saveState')).toHaveText('Sin guardar · reintentar');
  fail = false; await page.locator('#saveState').click();
  await expect(page.locator('#saveState')).toHaveText('Guardado en línea');
  await page.reload(); await expect(editor.locator('.node-text')).toHaveCount(2);
});

test('First visit offers a visible start action without an endless loading spinner', async ({ page }) => {
  await page.goto('./');
  await expect(page.locator('#saveState')).toHaveText('Listo para crear');
  await expect(page.locator('#loading .spinner')).not.toBeVisible();
  await page.locator('#welcomeCreate').click();
  await page.locator('#schemeName').fill('Primer proyecto desde bienvenida');
  await page.locator('#nameForm button[type=submit]').click();
  await expect(page.locator('#loading')).not.toBeVisible();
  await addNode(page, 'Primer paso');
});


test('Recovered Weso editor exposes its library, historical example, sections, SVG and DOT exports', async ({ page }) => {
  await page.goto('./');
  await expect(page.locator('#welcomeExample')).toBeEnabled();
  await nameAction(page, '#welcomeExample', 'Mapa recuperado · ejemplo');
  await expect(page.locator('#loading')).not.toBeVisible();
  const editor = page.frameLocator('#editor');
  await expect(editor.locator('body')).toHaveClass(/embedded/);
  await expect(editor.locator('.topbar > .brand')).not.toBeVisible();
  await expect(editor.locator('#clusterTabs .flow-tab')).toHaveCount(3);
  await expect(page.locator('#saveVersion')).toBeVisible();
  await expect(page.locator('#newScheme')).toBeVisible();
  expect(await page.locator('.library-bar').evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true);
  expect(await page.locator('#shareProject').evaluate(el => getComputedStyle(el).backgroundColor)).toBe('rgb(109, 52, 244)');
  await editor.locator('.all-tab').click();
  expect(await editor.locator('.node-group').count()).toBeGreaterThan(30);
  await editor.locator('#showCodeBtn').click();
  const dotDownload = page.waitForEvent('download'); await editor.locator('#downloadCode').click();
  const dot = await dotDownload;
  expect(await readFile(await dot.path(), 'utf8')).toContain('cluster_proveedores');
  const svgDownload = page.waitForEvent('download'); await editor.locator('#downloadSvg').click();
  const svg = await svgDownload;
  expect(await readFile(await svg.path(), 'utf8')).toContain('<svg');
  await editor.locator('#closeInspector').click();
  await editor.locator('#addFlowTab').click(); await editor.locator('#newSectionLabel').fill('Control de calidad'); await editor.locator('#confirmSection').click();
  await expect(editor.locator('#clusterTabs .flow-tab')).toHaveCount(4);
  await addNode(page, 'Confirmar cierre');
  await page.screenshot({ path: 'test-results/flow-restored-desktop.png', fullPage: true });
  await page.reload();
  await expect(editor.locator('#clusterTabs .flow-tab')).toHaveCount(4);
});
