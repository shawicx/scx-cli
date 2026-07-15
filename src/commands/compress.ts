import { intro, outro, select, spinner, text } from '@clack/prompts';
import { Command } from 'commander';
import { consola } from 'consola';

import { compressImage } from '~/compress';
import { QualityLevel } from '~/compress/type';
import { detectFormat } from '~/convert';

export const compressCommand = new Command('compress')
  .description('图片压缩工具（支持 JPEG/PNG/WebP）')
  .argument('[file]', '图片文件路径')
  .option('-q, --quality <number>', '压缩质量 1-100（JPEG/WebP）', '80')
  .action(async (fileName, options) => {
    // 无文件路径 → 交互模式
    if (!fileName) {
      await interactiveMode();
      return;
    }

    // 有文件路径 → 用 -q 指定的质量直接压缩
    const quality = parseInt(options.quality, 10);
    if (isNaN(quality) || quality < 1 || quality > 100) {
      consola.error('质量必须在 1-100 之间');
      process.exit(1);
    }
    await runConversion(fileName as string, quality);
  });

/**
 * @description 交互式模式
 */
async function interactiveMode() {
  intro('🖼️ 图片压缩');

  // 1. 输入图片路径
  const input = await text({
    message: '请输入图片路径',
    placeholder: './photo.jpg',
    validate: (value: string) => {
      if (!value) return '图片路径不能为空';
      return undefined;
    },
  });

  if (typeof input === 'symbol') {
    consola.info('操作已取消');
    process.exit(0);
  }

  const filePath = input as string;

  // 2. 检测格式
  let format = detectFormat(filePath);
  if (format === 'jpg') format = 'jpeg';
  const supported = ['jpeg', 'png', 'webp'];
  if (!supported.includes(format)) {
    consola.error(`不支持的格式: ${format || '未知'}，当前支持: ${supported.join(', ')}`);
    process.exit(1);
  }

  // 3. 选择质量等级
  const selected = await select({
    message: '选择压缩质量',
    options: [
      { value: QualityLevel.High.value, label: QualityLevel.High.label },
      { value: QualityLevel.Medium.value, label: QualityLevel.Medium.label },
      { value: QualityLevel.Low.value, label: QualityLevel.Low.label },
    ],
  });

  if (typeof selected === 'symbol') {
    consola.info('操作已取消');
    process.exit(0);
  }

  // 4. 执行压缩
  await runConversion(filePath, selected as number);

  outro('✨ 压缩完成！');
}

/**
 * @description 执行压缩并打印结果
 * @param filePath 文件路径
 * @param quality 压缩质量
 */
async function runConversion(filePath: string, quality: number) {
  consola.info(`文件: ${filePath}`);
  consola.info(`压缩质量: ${quality}\n`);

  const s = spinner();
  s.start('正在压缩...');

  try {
    const { outputPath } = await compressImage(filePath, quality);
    s.stop('压缩成功！');
    consola.success(`输出文件: ${outputPath}`);
  } catch (error) {
    s.stop('压缩失败');
    consola.error('执行压缩时发生错误:', error);
    process.exit(1);
  }
}
