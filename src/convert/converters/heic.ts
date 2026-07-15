import heicConvert from 'heic-convert';
import { readFile, writeFile } from 'node:fs/promises';

/**
 * @description 将 HEIC 文件转换为 PNG
 * @param inputPath 输入文件路径
 * @param outputPath 输出文件路径
 */
export async function convertHeicToPng(inputPath: string, outputPath: string): Promise<void> {
  const inputBuffer = await readFile(inputPath);
  // PNG 为无损格式，quality 仅对 JPEG 生效
  const outputBuffer = await heicConvert({
    buffer: inputBuffer,
    format: 'PNG',
    quality: 1,
  });
  await writeFile(outputPath, outputBuffer);
}
