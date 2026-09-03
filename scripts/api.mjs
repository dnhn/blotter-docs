// Extract the public API of the installed blotter.ts into src/generated/api.json.
// Run with `pnpm api` after bumping the dependency; the JSON is committed so
// builds are deterministic and reviewable.
import { readFile, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { Application } from 'typedoc';

const require = createRequire(import.meta.url);
const { version: libraryVersion } = require('blotter.ts/package.json');

const app = await Application.bootstrapWithPlugins({
  options: 'typedoc.json',
});

const project = await app.convert();
if (!project) {
  console.error('[api] TypeDoc could not convert the entry points');
  process.exit(1);
}

const output = {
  meta: { libraryVersion, generatedAt: new Date().toISOString() },
  project: app.serializer.projectToObject(project, process.cwd()),
};

const target = new URL('../src/generated/api.json', import.meta.url);
await writeFile(target, JSON.stringify(output));

const size = (await readFile(target)).byteLength;
console.log(
  `[api] blotter.ts ${libraryVersion}: ${project.children?.length ?? 0} modules → src/generated/api.json (${Math.round(size / 1024)} kB)`,
);
