import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
for(const page of ['index.html','resume.html']){
  const pagePath=path.join(root,page);
  let index=0;
  const html=fs.readFileSync(pagePath,'utf8').replace(/<svg\b[^>]*class="brand-logo [^"]*"[\s\S]*?<\/svg>/g, old=>{
    const classes=old.match(/class="([^"]+)"/)[1];
    const layout=classes.includes('logo-stacked')?'stacked':'horizontal';
    let svg=fs.readFileSync(path.join(root,`assets/brand/jay-on-art-${layout}-rounded-currentcolor.svg`),'utf8').replace(/[ \t]+$/gm,'').trim();
    const prefix=`${page.replace('.html','')}-wordmark-${index++}-`;
    const ids=[...svg.matchAll(/\bid="([^"]+)"/g)].map(match=>match[1]);
    for(const id of ids){
      svg=svg.replaceAll(`id="${id}"`,`id="${prefix}${id}"`);
      svg=svg.replaceAll(`url(#${id})`,`url(#${prefix}${id})`);
      svg=svg.replaceAll(`href="#${id}"`,`href="#${prefix}${id}"`);
    }
    svg=svg.replace(/aria-labelledby="([^"]+)"/g,(_,value)=>`aria-labelledby="${value.split(/\s+/).map(id=>prefix+id).join(' ')}"`);
    return svg.replace('<svg ',`<svg class="${classes}" aria-hidden="true" focusable="false" `);
  });
  if(!index)throw new Error(`No wordmarks found in ${page}`);
  fs.writeFileSync(pagePath,html);
  console.log(`${page}: synchronized ${index} wordmarks from canonical SVG artwork.`);
}
