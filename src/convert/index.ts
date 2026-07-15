import { consola } from 'consola';
import { existsSync } from 'node:fs';
import path from 'node:path';

import { getConverter, getSupportedFormats, isSupported } from '~/convert/registry';
import { generateRandomString } from '~/utils/function';

/**
 * @description 检测文件源格式（基于扩展名）
 * @param filePath 文件路径
 * @returns 源格式（小写，不含点），无扩展名返回空字符串
 */
export function detectFormat(filePath: string): string {
  return path.extname(filePath).slice(1).toLowerCase();
}

/**
 * @description 计算输出文件路径：替换扩展名，同名冲突追加随机串
 * @param inputPath 输入文件路径
 * @param targetFormat 目标格式（小写）
 * @returns 输出文件路径
 */
export function getOutputPath(inputPath: string, targetFormat: string): string {
  const dir = path.dirname(inputPath);
  const baseName = path.basename(inputPath, path.extname(inputPath));
  const candidate = path.join(dir, `${baseName}.${targetFormat}`);

  // 同名冲突 → 追加随机串
  if (existsSync(candidate)) {
    return path.join(dir, `${baseName}_${generateRandomString()}.${targetFormat}`);
  }

  return candidate;
}

/**
 * @description 执行文件转换
 * @param inputPath 输入文件路径
 * @param targetFormat 目标格式（小写，如 'png'）
 * @returns 输出文件路径
 */
export async function convertFile(inputPath: string, targetFormat: string): Promise<string> {
  // 1. 校验文件存在
  if (!existsSync(inputPath)) {
    consola.error(`文件不存在: ${inputPath}`);
    process.exit(1);
  }

  // 2. 检测源格式
  const fromFormat = detectFormat(inputPath);

  // 3. 校验源格式受支持
  if (!isSupported(fromFormat)) {
    consola.error(
      `不支持的格式: ${fromFormat || '未知'}，当前支持: ${getSupportedFormats().join(', ')}`,
    );
    process.exit(1);
  }

  // 4. 校验 from→to 转换器存在
  const converter = getConverter(fromFormat, targetFormat);
  if (!converter) {
    consola.error(`不支持从 ${fromFormat} 转换到 ${targetFormat}`);
    process.exit(1);
  }

  // 5. 计算输出路径
  const outputPath = getOutputPath(inputPath, targetFormat);

  // 6. 执行转换
  await converter.convert(inputPath, outputPath);

  return outputPath;
}
