import { intro, outro, select, spinner, text } from '@clack/prompts';
import { Command } from 'commander';
import { consola } from 'consola';

import commandCsv from '~/csv';
import { CsvType } from '~/csv/type';

export const csvCommand = new Command('csv')
  .description('CSV/Excel 与 JSON 互转工具')
  .argument('[file]', '文件路径')
  .option('-i, --interactive', '使用交互式模式')
  .option('-t, --to', 'CSV 转 JSON/Excel')
  .option('-f, --from', 'Excel 转 CSV')
  .action(async (fileName, options) => {
    const finalOptions = {
      to: options.to,
      from: options.from,
    };

    // 如果是交互式模式或者没有提供文件路径
    if (options.interactive || !fileName) {
      await interactiveMode();
    } else {
      // 使用命令行参数
      await executeConversion(fileName as string, finalOptions);
    }
  });

/**
 * @description 交互式模式
 */
async function interactiveMode() {
  intro('📊 CSV/Excel 转换工具');

  // 选择转换类型
  const conversionType = await select({
    message: '选择转换类型',
    options: [
      { value: 'to', label: 'CSV 转 JSON/Excel' },
      { value: 'from', label: 'Excel 转 CSV' },
    ],
  });

  if (typeof conversionType === 'symbol') {
    consola.info('操作已取消');
    process.exit(0);
  }

  // 输入文件路径
  const filePath = await text({
    message: '请输入文件路径',
    placeholder: './data.csv 或 ./data.xlsx',
    validate: (value: string) => {
      if (!value) return '文件路径不能为空';
      return undefined;
    },
  });

  if (typeof filePath === 'symbol') {
    consola.info('操作已取消');
    process.exit(0);
  }

  // 根据转换类型设置选项
  const finalOptions = {
    to: conversionType === 'to',
    from: conversionType === 'from',
  };

  // 执行转换
  await executeConversion(filePath as string, finalOptions);

  outro('✨ 转换完成！');
}

/**
 * @description 执行文件转换
 */
async function executeConversion(fileName: string, options: { to?: boolean; from?: boolean }) {
  consola.debug('options:', options);

  // 检查参数互斥性
  if (options.to && options.from) {
    consola.error('不能同时使用 --to 和 --from');
    process.exit(1);
  }

  // 检查参数必填性
  if (!options.to && !options.from) {
    consola.error('必须选择转换类型');
    process.exit(1);
  }

  const conversionType = options.to ? CsvType.CsvToJSON : CsvType.JSONToCsv;
  const conversionLabel = options.to ? 'CSV 转 JSON/Excel' : 'Excel 转 CSV';

  consola.info(`\n转换类型: ${conversionLabel}`);
  consola.info(`文件路径: ${fileName}\n`);

  // 显示加载动画
  const s = spinner();
  s.start('正在转换...');

  try {
    await commandCsv(fileName, conversionType);
    s.stop('转换成功！');
  } catch (error) {
    s.stop('转换失败');
    consola.error('执行转换时发生错误:', error);
    process.exit(1);
  }
}
