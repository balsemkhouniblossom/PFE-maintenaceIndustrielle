/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');
function read(p){ return JSON.parse(fs.readFileSync(p,'utf8')); }
const base = path.join(__dirname,'..');
const messagesDir = path.join(base,'messages');
const en = read(path.join(messagesDir,'en.json'));
const arPath = path.join(messagesDir,'ar.json');
const ar = read(arPath);
const missingPath = path.join(base,'i18n-missing.json');
if(!fs.existsSync(missingPath)){ console.error('Missing i18n-missing.json'); process.exit(1); }
const missing = read(missingPath);

function deepGet(obj, path){
  const parts = path.split('.');
  let cur = obj;
  for(const p of parts){ if(cur==null) return undefined; cur = cur[p]; }
  return cur;
}
function deepSet(obj, path, value){
  const parts = path.split('.');
  let cur = obj;
  for(let i=0;i<parts.length-1;i++){ const p = parts[i]; if(!cur[p] || typeof cur[p] !== 'object') cur[p]={}; cur = cur[p]; }
  cur[parts[parts.length-1]] = value;
}

let added=0;
for(const ns in missing){
  const keys = missing[ns];
  keys.forEach(k=>{
    // source path
    const sourcePath = ns + '.' + k;
    const val = deepGet(en, sourcePath);
    if(val !== undefined){
      // only set if not present already
      if(deepGet(ar, sourcePath) === undefined){
        deepSet(ar, sourcePath, val);
        added++;
      }
    } else {
      // fallback: set key string
      if(deepGet(ar, sourcePath) === undefined){
        deepSet(ar, sourcePath, k);
        added++;
      }
    }
  });
}
fs.writeFileSync(arPath, JSON.stringify(ar, null, 2), 'utf8');
console.log('Patched ar.json, added', added, 'entries.');
