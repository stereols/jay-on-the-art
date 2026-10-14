import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

export async function optimizePageImages(root) {
  const htmlPath=path.join(root,'index.html');
  const original=await fs.readFile(htmlPath,'utf8');
  let html=original.replace(/<picture class="responsive-media"><source[^>]*>(<img\b[^>]*>)<\/picture>/gi,'$1');
  const imageTag=/<img\b[^>]*\bsrc="([^"]+\.(?:png|jpe?g|webp))"[^>]*>/gi;
  const sources=[...html.matchAll(imageTag)];
  const images=new Map();
  for(const match of sources){
    const url=match[1];
    if(!images.has(url))images.set(url,await sharp(path.join(root,url)).metadata());
  }
  const variants=new Map();
  for(const [url,metadata] of images){
    const file=path.join(root,url),isWebp=path.extname(file).toLowerCase()==='.webp';
    const widths=[480,960,1440,metadata.width].filter((width,index,array)=>width<=metadata.width&&array.indexOf(width)===index).sort((a,b)=>a-b);
    const generated=isWebp?widths.filter(width=>width<metadata.width):widths;
    for(const width of generated){
      const output=path.join(path.dirname(file),path.basename(file,path.extname(file))+'-'+width+'.webp');
      const sourceStat=await fs.stat(file),outputStat=await fs.stat(output).catch(()=>null);
      if(outputStat&&outputStat.mtimeMs>=sourceStat.mtimeMs&&outputStat.size>0)continue;
      await sharp(file).resize({width,withoutEnlargement:true}).webp({quality:92,effort:6,smartSubsample:true,alphaQuality:100}).toFile(output);
    }
    variants.set(url,{widths,isWebp});
  }
  html=html.replace(imageTag,(tag,url,offset)=>{
    const before=html.slice(0,offset),context=before.slice(-1800);
    const targets=['tile-image','career-project-visual','project-image','career-art'];
    let chosen='',position=-1;
    for(const name of targets){const at=context.lastIndexOf('class="'+name+'"');if(at>position){chosen=name;position=at;}}
    const sizes=chosen==='tile-image'?'(max-width: 760px) 92vw, 25vw':chosen==='career-project-visual'?'(max-width: 760px) 92vw, 54vw':chosen==='project-image'?'(max-width: 760px) 90vw, 74vw':chosen==='career-art'?'(max-width: 760px) 92vw, 44vw':'(max-width: 760px) 92vw, 50vw';
    const {widths,isWebp}=variants.get(url),stem=path.posix.basename(url,path.posix.extname(url)),directory=path.posix.dirname(url);
    const srcset=widths.map(width=>{
      const candidate=isWebp&&width===widths[widths.length-1]?url:path.posix.join(directory,stem+'-'+width+'.webp');
      return candidate+' '+width+'w';
    }).join(', ');
    return '<picture class="responsive-media"><source type="image/webp" sizes="'+sizes+'" srcset="'+srcset+'">'+tag+'</picture>';
  });
  if(html!==original)await fs.writeFile(htmlPath,html);
  console.log('Prepared '+images.size+' responsive page images at their source resolution with high-quality WebP variants.');
}
