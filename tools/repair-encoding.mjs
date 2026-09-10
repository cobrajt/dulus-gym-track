import fs from 'node:fs';
import cp from 'node:child_process';

const index = cp.execFileSync('git', ['show', 'e570379:index.html'], { encoding: 'utf8' });
let fixed = index.replace(
  '    <link rel="stylesheet" href="workouts.css" />',
  '    <link rel="stylesheet" href="workouts.css" />\n    <link rel="stylesheet" href="experience.css" />'
);
fixed = fixed.replace(
  '    <script src="workouts.js"></script>',
  '    <script src="workouts.js"></script>\n    <script src="experience.js"></script>'
);
fs.writeFileSync('index.html', fixed, 'utf8');

let server = fs.readFileSync('server.js', 'utf8');
server = server.replace("'.css': 'text/css'", "'.css': 'text/css; charset=utf-8'")
  .replace("'.html': 'text/html'", "'.html': 'text/html; charset=utf-8'")
  .replace("'.js': 'application/javascript'", "'.js': 'application/javascript; charset=utf-8'")
  .replace("'.webmanifest': 'application/manifest+json'", "'.webmanifest': 'application/manifest+json; charset=utf-8'");
fs.writeFileSync('server.js', server, 'utf8');

let sw = fs.readFileSync('service-worker.js', 'utf8').replace(/^\uFEFF/, '');
sw = sw.replace(/dulus-gym-track-v\d+/, 'dulus-gym-track-v7');
fs.writeFileSync('service-worker.js', sw, 'utf8');
console.log('Codificación reparada.');