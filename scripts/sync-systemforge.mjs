import { copyFileSync, mkdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

// SystemForge's standalone source remains in the sibling project. This explicit
// asset list keeps its hosting configuration and private files out of the hub.
const hub = fileURLToPath(new URL('../', import.meta.url));
const source = resolve(hub, '../systemforge/dist');
const destination = resolve(hub, 'dist/systemforge');
const assets = ['index.html', 'style.css', 'app.js', 'network-data.js', 'network.js', 'network.css'];
for (const asset of assets) readFileSync(resolve(source, asset));
mkdirSync(destination, { recursive: true });
for (const asset of assets) copyFileSync(resolve(source, asset), resolve(destination, asset));
console.log(`Synced ${assets.length} SystemForge public assets into the hub.`);
