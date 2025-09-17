// @ts-ignore 忽略这个错误
import { build } from 'bun';
import { consola } from 'consola';
import { statSync, readdirSync } from 'fs';
import { join } from 'path';

async function buildScript() {
  const result = await build({
    entrypoints: ["src/index.ts"],
    outdir: "dist",
    format: "esm",
    target: "bun",
    minify: true,
    sourcemap: false,
    // external: ["fsevents"],
  });

  if (!result.success) {
    consola.error("❌ Build failed:");
    for (const log of result.logs) {
      consola.error(log.message);
    }
    process.exit(1);
  }

  // 计算并显示总大小
  try {
    const files = getAllFiles("dist");
    let totalSize = 0;

    for (const file of files) {
      try {
        const stats = statSync(file);
        if (stats.isFile()) {
          consola.info(`${file}: ${formatFileSize(stats.size)}`);
          totalSize += stats.size;
        }
      } catch (error) {
        consola.error(`Could not get size for file: ${file}`);
      }
    }

    consola.success(`Build success! Total size: ${formatFileSize(totalSize)}`);
  } catch (error) {
    consola.error(error);
  }
}

function getAllFiles(dirPath: string, arrayOfFiles: string[] = []): string[] {
  const files = readdirSync(dirPath);

  files.forEach((file) => {
    const filePath = join(dirPath, file);
    if (statSync(filePath).isDirectory()) {
      arrayOfFiles = getAllFiles(filePath, arrayOfFiles);
    } else {
      arrayOfFiles.push(filePath);
    }
  });

  return arrayOfFiles;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

buildScript()
