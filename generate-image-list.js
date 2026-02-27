import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT_DIR = process.cwd();
const PUBLIC_DIR = path.join(ROOT_DIR, 'public');
const TARGET_DIR = path.join(PUBLIC_DIR, 'coloring-pages');
const OUTPUT_JSON = path.join(ROOT_DIR, 'src', 'coloringPagesList.json');
const IMAGE_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.webp']);

function toWebPath(filePath) {
  const relFromPublic = path.relative(PUBLIC_DIR, filePath).split(path.sep).join('/');
  return `/${relFromPublic}`;
}

function naturalCompare(a, b) {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
}

async function walkImages(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await walkImages(fullPath)));
      continue;
    }

    if (!entry.isFile()) continue;

    const ext = path.extname(entry.name).toLowerCase();
    if (!IMAGE_EXTENSIONS.has(ext)) continue;

    files.push(fullPath);
  }

  return files;
}

async function main() {
  let stat;
  try {
    stat = await fs.stat(TARGET_DIR);
  } catch {
    throw new Error(`Missing folder: ${TARGET_DIR}`);
  }

  if (!stat.isDirectory()) {
    throw new Error(
      `Expected "${TARGET_DIR}" to be a directory. It is not a folder right now. ` +
        'Fix that first, then run this script again.'
    );
  }

  const imageFiles = await walkImages(TARGET_DIR);
  imageFiles.sort((a, b) => naturalCompare(toWebPath(a), toWebPath(b)));

  const webPaths = imageFiles.map(toWebPath);

  await fs.writeFile(OUTPUT_JSON, `${JSON.stringify(webPaths, null, 2)}\n`, 'utf8');

  console.log(`Scanned ${webPaths.length} image file(s).`);
  console.log(`Wrote: ${OUTPUT_JSON}`);
  if (webPaths.length > 0) {
    console.log(`First: ${webPaths[0]}`);
    console.log(`Last:  ${webPaths[webPaths.length - 1]}`);
  }
}

main().catch((error) => {
  console.error(`generate-image-list failed: ${error.message}`);
  process.exit(1);
});
