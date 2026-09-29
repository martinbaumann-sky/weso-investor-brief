from pathlib import Path
import re,json,hashlib,shutil,posixpath
root=Path('C:/Users/ninch/OneDrive/Escritorio/C\u00f3digos Hackers/Weso/03-admin-hub')
dest=Path('demo/insurer-portal'); src=dest/'src'
stubs={'hooks/useCorporateClient':['useCorporateClients'], 'hooks/useCorporateDashboard':['useCorporateOrders','useCorporateRatings','useCorporateClaims','useCorporateCoverage','useCorporateAI'], 'hooks/useInsuranceCommunications':['useInsuranceCommunications'], 'hooks/useInsurancePortal':['useInsuranceOrderDetail'], 'hooks/useCorporatePlans':['useCorporatePlans'], 'hooks/useOrderStatusHistory':['useOrderStatusHistory'], 'hooks/useCountryReference':['useCountryReference'], 'hooks/useMapboxToken':['useMapboxToken'], 'contexts/AuthContext':['useAuth']}
queue=['pages/admin/CorporateDashboard.tsx','components/layout/InsuranceSidebar.tsx']; visited=set(); manifest=[]; externals=set()
# This source is only imported by the admin branch, which is disabled in the insurer portal.
skip={'components/layout/AppHeader.tsx'}
while queue:
 rel=queue.pop()
 if rel in visited: continue
 visited.add(rel); inp=root/'src'/rel
 if rel in skip:
  out=src/rel;out.parent.mkdir(parents=True,exist_ok=True);out.write_text('export default function AppHeader(){return null;}');continue
 if not inp.exists(): raise Exception(rel)
 text=inp.read_text(encoding='utf-8');out=src/rel;out.parent.mkdir(parents=True,exist_ok=True);out.write_text(text,encoding='utf-8');manifest.append({'path':'src/'+rel,'sha256':hashlib.sha256(inp.read_bytes()).hexdigest()})
 for imp in re.findall(r'''(?:from\s*|import\s*)["']([^"']+)["']''',text):
  if imp.startswith('@/'): base=imp[2:]
  elif imp.startswith('.'): base=posixpath.normpath((Path(rel).parent/imp).as_posix())
  else:
   externals.add('/'.join(imp.split('/')[:2]) if imp.startswith('@') else imp.split('/')[0]);continue
  if base in stubs:
   target=src/(base+'.ts');target.parent.mkdir(parents=True,exist_ok=True);target.write_text('export { '+','.join(stubs[base])+' } from "@/fixtures";');continue
  candidates=[base,base+'.tsx',base+'.ts',base+'.css',base+'/index.tsx',base+'/index.ts']
  found=next((p for p in candidates if (root/'src'/p).is_file()),None)
  if found: queue.append(found)
  else: raise Exception(base)
for rel in ['index.css','i18n/locales/es.json','i18n/locales/en.json']:
 target=src/rel;target.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(root/'src'/rel,target)
for rel in ['tailwind.config.ts'] : shutil.copyfile(root/rel,dest/rel)
(dest/'public').mkdir(exist_ok=True);shutil.copyfile(root/'public/weso-logo.png',dest/'public/weso-logo.png')
(dest/'source-manifest.json').write_text(json.dumps({'repository': '03-admin-hub', 'commit': __import__('subprocess').check_output(['git','-C',str(root),'rev-parse','HEAD'],text=True).strip(),'files':manifest,'adapters':'Only data hooks use fixtures. CorporateDashboard, ExecutiveSummary, InsuranceAnalytics, DashboardGrid, detail dialog and InsuranceSidebar are copied without changes. AppHeader is an unused admin import.'},indent=2))
original=json.loads((root/'package.json').read_text())
deps={k:v for k,v in original['dependencies'].items() if k in externals or k in ['react','react-dom','react-router-dom','i18next','react-i18next','tailwindcss-animate']}
deps['maplibre-gl']=json.loads((dest/'package.json').read_text())['dependencies']['maplibre-gl']
package={'name':'weso-insurer-portal-demo','private':True,'type':'module','scripts':{'build':'vite build'},'dependencies':deps,'devDependencies':{'vite':'^5.4.19','tailwindcss':'^3.4.17','autoprefixer':'^10.4.21','postcss':'^8.5.6'}}
(dest/'package.json').write_text(json.dumps(package,indent=2))
print('Copied',len(manifest),'original files; dependencies:',list(deps))
