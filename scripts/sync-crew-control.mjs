// Copies the original Crew Control interface into NOVA Crew without changing its code.
// Usage: node scripts/sync-crew-control.mjs integrations/crew-control/v11.2.46
// Only paths are rewritten and the NOVA bridge (back button, Crew Head day, hidden office-only tools) is injected.
import fs from 'node:fs';import path from 'node:path';
const source=process.argv[2]||'integrations/crew-control/v11.2.46',target='public/crew-control';
fs.mkdirSync(target,{recursive:true});
for(const file of ['pause-return.js','pause-return.css','service-tools.js','service-tools.css','icon.svg'])fs.copyFileSync(path.join(source,file),path.join(target,file));
let html=fs.readFileSync(path.join(source,'index.html'),'utf8');
const version=(html.match(/Crew Control (v[\d.]+)/)||[])[1]||'';
const replace=(from,to)=>{if(!html.includes(from))throw new Error('Not found in Crew Control HTML: '+from);html=html.split(from).join(to);};
replace('src="/pause-return.js"','src="/crew-control/pause-return.js"');
replace('href="/pause-return.css"','href="/crew-control/pause-return.css"');
replace('href="/service-tools.css?v=9"','href="/crew-control/service-tools.css?v=9"');
replace('href="/ICON.PNG"','href="/crew-control/icon.svg"');
replace('href="/manifest.webmanifest"','href="data:,"');
replace("navigator.serviceWorker.register('/sw.js')","Promise.resolve()");
html=html.replace(/<script src="\/service-tools\.js[^"]*"/g,m=>m.replace('/service-tools.js','/crew-control/service-tools.js'));
html=html.replace(/<title>[^<]*<\/title>/,`<title>Crew Control ${version} · NOVA Crew</title>`);
html=html.replace('</head>','<link rel="stylesheet" href="/crew-control/nova-bridge.css?v=1">\n</head>');
html=html.replace(/<\/body>(?![\s\S]*<\/body>)/,'<script src="/crew-control/nova-bridge.js?v=1"></script>\n</body>');
fs.writeFileSync(path.join(target,'index.html'),html);
console.log('Crew Control',version,'→',target);
