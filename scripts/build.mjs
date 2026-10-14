import {build} from 'esbuild';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {optimizePageImages} from './optimize-images.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
await build({entryPoints:[path.join(root,'cosmos.js')],outfile:path.join(root,'cosmos.bundle.js'),bundle:true,minify:true,format:'esm',target:'es2022',legalComments:'eof'});
await optimizePageImages(root);
console.log('Built local WebGL module and responsive high-quality image variants. Original artwork files retained.');
