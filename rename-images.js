const fs = require('fs/promises');
const path = require('path');

const TARGET_DIR = path.join(process.cwd(), 'public', 'coloring-pages');
const PAGE_COUNT = 40;
const IMAGE_EXTENSIONS = new Set([
  '.png',
  '.jpg',
  '.jpeg',
  '.webp',
  '.gif',
  '.bmp',
  '.avif',
]);

function naturalCompare(a, b) {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
}

async function collectImageFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await collectImageFiles(fullPath)));
      continue;
    }

    if (!entry.isFile()) {
      continue;
    }

    const ext = path.extname(entry.name).toLowerCase();
    if (!IMAGE_EXTENSIONS.has(ext)) {
      continue;
    }

    files.push({
      name: entry.name,
      ext,
      fullPath,
      relativePath: path.relative(TARGET_DIR, fullPath),
    });
  }

  return files;
}

async function main() {
  let targetStat;
  try {
    targetStat = await fs.stat(TARGET_DIR);
  } catch {
    throw new Error(`Missing directory: ${TARGET_DIR}`);
  }

  if (!targetStat.isDirectory()) {
    throw new Error(
      `Expected a directory at "${TARGET_DIR}", but found something else. ` +
        'Fix/extract the coloring-pages folder first, then run the script.'
    );
  }

  const imageFiles = await collectImageFiles(TARGET_DIR);
  imageFiles.sort((a, b) => naturalCompare(a.relativePath, b.relativePath));

  if (imageFiles.length !== PAGE_COUNT) {
    throw new Error(
      `Expected exactly ${PAGE_COUNT} image files in ${TARGET_DIR}, found ${imageFiles.length}. ` +
        'Please confirm the folder contents before renaming.'
    );
  }

  const staged = [];

  // Stage into temporary names first to avoid collisions (e.g. 10.png -> 1.png).
  for (let i = 0; i < imageFiles.length; i += 1) {
    const src = imageFiles[i];
    const tempPath = path.join(
      TARGET_DIR,
      `.__tmp_coloring_rename_${String(i + 1).padStart(2, '0')}${src.ext || '.tmp'}`
    );

    await fs.rename(src.fullPath, tempPath);
    staged.push({ tempPath, finalPath: path.join(TARGET_DIR, `${i + 1}.png`) });
  }

  for (const { tempPath, finalPath } of staged) {
    await fs.rename(tempPath, finalPath);
  }

  console.log(`Successfully renamed ${PAGE_COUNT} image files to 1.png ... ${PAGE_COUNT}.png`);
  console.log(`Folder: ${TARGET_DIR}`);
}

main().catch((error) => {
  console.error(`Rename failed: ${error.message}`);
  process.exit(1);
});
