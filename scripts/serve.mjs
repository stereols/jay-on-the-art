import http from 'node:http';
import fs from 'node:fs/promises';
import {createReadStream} from 'node:fs';
import path from 'node:path';
import {pipeline} from 'node:stream/promises';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const port=Number(process.env.PORT||4173);
const mime={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.jpg':'image/jpeg','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml','.txt':'text/plain; charset=utf-8','.mp4':'video/mp4','.webm':'video/webm'};
const server=http.createServer(async(req,res)=>{
  try{
    if(!['GET','HEAD'].includes(req.method)){
      res.writeHead(405,{'Allow':'GET, HEAD'});res.end();return;
    }
    const url=new URL(req.url,'http://127.0.0.1');
    const relative=decodeURIComponent(url.pathname).replace(/^\/+/, '')||'index.html';
    const resolved=path.resolve(root,relative);
    if(!resolved.startsWith(root+path.sep)||relative.split(/[\\/]/).some(s=>s.startsWith('.')||['node_modules','work','scripts'].includes(s))||!mime[path.extname(resolved)]){
      res.writeHead(404);res.end('Not found');return;
    }
    const info=await fs.stat(resolved);
    if(!info.isFile()){res.writeHead(404);res.end('Not found');return;}
    const headers={'Content-Type':mime[path.extname(resolved)],'Cache-Control':'no-cache','X-Content-Type-Options':'nosniff','Accept-Ranges':'bytes','Content-Length':info.size};
    let status=200,start=0,end=info.size-1;
    // A single byte range enables native video seeking without loading the whole file.
    const range=req.method==='GET'?req.headers.range:undefined;
    if(range){
      const match=/^bytes=(\d*)-(\d*)$/.exec(range);
      if(!match||(!match[1]&&!match[2])){
        res.writeHead(416,{'Content-Range':`bytes */${info.size}`,'Accept-Ranges':'bytes','Content-Length':0});res.end();return;
      }
      if(match[1]){
        start=Number(match[1]);end=match[2]?Number(match[2]):end;
      }else{
        const suffix=Number(match[2]);
        start=Number.isSafeInteger(suffix)&&suffix>0?Math.max(0,info.size-suffix):info.size;
      }
      if(!Number.isSafeInteger(start)||!Number.isSafeInteger(end)||start<0||start>=info.size||end<start){
        res.writeHead(416,{'Content-Range':`bytes */${info.size}`,'Accept-Ranges':'bytes','Content-Length':0});res.end();return;
      }
      end=Math.min(end,info.size-1);status=206;
      headers['Content-Range']=`bytes ${start}-${end}/${info.size}`;
      headers['Content-Length']=end-start+1;
    }
    res.writeHead(status,headers);
    if(req.method==='HEAD'||info.size===0){res.end();return;}
    await pipeline(createReadStream(resolved,{start,end}),res);
  }catch{
    if(res.headersSent){res.destroy();return;}
    res.writeHead(404);res.end('Not found');
  }
});
server.listen(port,'127.0.0.1',()=>console.log(`Jay on Art: http://127.0.0.1:${server.address().port}/`));
