import { consola } from 'consola';
import { existsSync, statSync } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

import type { CompressResult } from '~/compress/type';
import { detectFormat } from '~/convert';
import { generateRandomString } from '~/utils/function';

/** 支持压缩的图片格式 */
const SUPPORTED_FORMATS = ['jpeg', 'png', 'webp'];

/**
 * @description 计算压缩输出路径：追加 _compressed 后缀，同名冲突追加随机串
 * @param inputPath 输入文件路径
 * @returns 输出文件路径
 */
export function getCompressOutputPath(inputPath: string): string {
  const dir = path.dirname(inputPath);
  const ext = path.extname(inputPath);
  const baseName = path.basename(inputPath, ext);
  const candidate = path.join(dir, `${baseName}_compressed${ext}`);

  // 同名冲突 → 追加随机串
  if (existsSync(candidate)) {
    return path.join(dir, `${baseName}_compressed_${generateRandomString()}${ext}`);
  }

  return candidate;
}

/**
 * @description 压缩图片
 * @param inputPath 输入图片路径
 * @param quality 压缩质量 1-100（仅对 jpeg/webp 生效，png 无损）
 * @returns 压缩结果（输出路径 + 体积统计）
 */
export async function compressImage(inputPath: string, quality: number): Promise<CompressResult> {
  // 1. 校验文件存在
  if (!existsSync(inputPath)) {
    consola.error(`文件不存在: ${inputPath}`);
    process.exit(1);
  }

  // 2. 检测格式，jpg 归一为 jpeg
  let format = detectFormat(inputPath);
  if (format === 'jpg') format = 'jpeg';

  // 3. 校验格式受支持
  if (!SUPPORTED_FORMATS.includes(format)) {
    consola.error(`不支持的格式: ${format || '未知'}，当前支持: ${SUPPORTED_FORMATS.join(', ')}`);
    process.exit(1);
  }

  // 4. 计算输出路径
  const outputPath = getCompressOutputPath(inputPath);

  // 5. 读取原始体积
  const originalSize = statSync(inputPath).size;

  // 6. 按格式执行压缩
  if (format === 'jpeg') {
    await sharp(inputPath).jpeg({ quality }).toFile(outputPath);
  } else if (format === 'webp') {
    await sharp(inputPath).webp({ quality }).toFile(outputPath);
  } else {
    // png 无损优化
    await sharp(inputPath).png({ palette: true, compressionLevel: 9 }).toFile(outputPath);
  }

  // 7. 读取压缩后体积
  const compressedSize = statSync(outputPath).size;

  return { outputPath, originalSize, compressedSize };
}
