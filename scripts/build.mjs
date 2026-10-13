import {build} from 'esbuild';
import sharp from 'sharp';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
await build({entryPoints:[path.join(root,'cosmos.js')],outfile:path.join(root,'cosmos.bundle.js'),bundle:true,minify:true,format:'esm',target:'es2022',legalComments:'eof'});
const assets=path.join(root,'assets');
for(const name of await fs.readdir(assets)){
  if(!/\.(png|jpg)$/i.test(name))continue;
  const input=path.join(assets,name),output=input.replace(/\.(png|jpg)$/i,'.webp');
  const sourceStat=await fs.stat(input),outputStat=await fs.stat(output).catch(()=>null);
  if(outputStat&&outputStat.mtimeMs>=sourceStat.mtimeMs)continue;
  await sharp(input).resize({width:name.includes('concept')?1440:1920,withoutEnlargement:true}).webp({quality:88,effort:5}).toFile(output);
}
console.log('Built local WebGL module and optimized images. Original artwork files retained.');
