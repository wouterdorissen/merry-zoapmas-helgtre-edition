import { cp, mkdir, rm } from 'node:fs/promises';

await rm('dist', { recursive: true, force: true });
await mkdir('dist');
for (const file of ['index.html', 'styles.css', 'app.js', 'manifest.webmanifest']) {
  await cp(file, `dist/${file}`);
}
console.log('Built static app in dist');
