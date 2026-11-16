import http from 'node:http';
import {readFileSync,existsSync} from 'node:fs';
import {resolve,extname,join} from 'node:path';
const base=resolve(import.meta.dirname,'../public');
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.webmanifest':'application/manifest+json'};
const server=http.createServer((req,res)=>{
 const path=new URL(req.url,'http://localhost').pathname;
 const name=path==='/'?'offline-demo.html':decodeURIComponent(path).replace(/^\/+/, '');
 const filepath=resolve(join(base,name));
 if(!filepath.startsWith(base+'/')&&!filepath.startsWith(base+'\\')){res.writeHead(403);res.end();return}
 if(!existsSync(filepath)){res.writeHead(404);res.end('No encontrado');return}
 res.writeHead(200,{'Content-Type':types[extname(filepath)]||'application/octet-stream'});res.end(readFileSync(filepath));
});
server.listen(4173,'127.0.0.1',()=>console.log('Demo offline: http://127.0.0.1:4173 (Internet no requerido)'));
