import { intro, outro, select, spinner, text } from '@clack/prompts';
import { Command } from 'commander';
import { consola } from 'consola';

import { convertFile, detectFormat } from '~/convert';
import { getSupportedFormats, getTargetFormats, isSupported } from '~/convert/registry';

export const convertCommand = new Command('convert')
  .description('文件格式转换工具（当前支持 HEIC → PNG）')
  .argument('[file]', '文件路径')
  .option('-i, --interactive', '使用交互式模式')
  .option('-f, --format <format>', '目标格式 (如 png)')
  .action(async (fileName, options) => {
    // 无文件路径 或 显式 -i → 完整交互模式
    if (options.interactive || !fileName) {
      await interactiveMode(fileName as string | undefined, options.format);
      return;
    }

    // 有文件路径
    if (options.format) {
      // 有文件路径 + -f → 直接转换（非交互）
      await runConversion(fileName as string, options.format);
    } else {
      // 有文件路径 但无 -f → 检测格式后交互选择目标
      await interactiveMode(fileName as string, undefined);
    }
  });

/**
 * @description 交互式模式
 * @param fileName 已有的文件路径（可能为空，需交互输入）
 * @param targetFormat 已指定的目标格式（可能为空，需交互选择）
 */
async function interactiveMode(fileName: string | undefined, targetFormat: string | undefined) {
  intro('🔄 文件格式转换');

  // 1. 输入文件路径（若未提供）
  let filePath = fileName;
  if (!filePath) {
    const input = await text({
      message: '请输入文件路径',
      placeholder: './photo.heic',
      validate: (value: string) => {
        if (!value) return '文件路径不能为空';
        return undefined;
      },
    });

    if (typeof input === 'symbol') {
      consola.info('操作已取消');
      process.exit(0);
    }

    filePath = input as string;
  }

  // 2. 检测格式
  const fromFormat = detectFormat(filePath);
  if (!isSupported(fromFormat)) {
    consola.error(
      `不支持的格式: ${fromFormat || '未知'}，当前支持: ${getSupportedFormats().join(', ')}`,
    );
    process.exit(1);
  }

  // 3. 选择目标格式（若未通过参数指定）
  let format = targetFormat;
  if (!format) {
    const targetFormats = getTargetFormats(fromFormat);
    const selected = await select({
      message: `检测到格式: ${fromFormat}，选择目标格式`,
      options: targetFormats.map((f) => ({ value: f, label: f.toUpperCase() })),
    });

    if (typeof selected === 'symbol') {
      consola.info('操作已取消');
      process.exit(0);
    }

    format = selected as string;
  }

  // 4. 执行转换
  await runConversion(filePath, format);

  outro('✨ 转换完成！');
}

/**
 * @description 执行转换并打印结果
 * @param filePath 文件路径
 * @param targetFormat 目标格式
 */
async function runConversion(filePath: string, targetFormat: string) {
  consola.info(`文件: ${filePath}`);
  consola.info(`目标格式: ${targetFormat}\n`);

  const s = spinner();
  s.start('正在转换...');

  try {
    const outputPath = await convertFile(filePath, targetFormat.toLowerCase());
    s.stop('转换成功！');
    consola.success(`输出文件: ${outputPath}`);
  } catch (error) {
    s.stop('转换失败');
    consola.error('执行转换时发生错误:', error);
    process.exit(1);
  }
}
