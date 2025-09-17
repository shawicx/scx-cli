import { Command } from 'commander';
import { consola } from 'consola';

import commandCsv from '~/csv';
import { CsvType } from '~/csv/type';

/**
 * 创建CSV转换命令
 * @returns CSV命令对象
 */
export function createCsvCommand(): Command {
  const command = new Command('csv')
    .description('csv 与 json 互转')
    .argument('<file>', '文件路径')
    .option('-t, --to', 'csv 转 json')
    .option('-f, --from', 'json 转 csv')
    .action(async (fileName: string, options: { to?: boolean; from?: boolean }) => {
      consola.debug('options:', options);

      // 检查参数互斥性
      if (options.to && options.from) {
        consola.error('不能同时使用 --to 和 --from');
        process.exit(1);
      }

      // 检查参数必填性
      if (!options.to && !options.from) {
        consola.error('必须选择 --to 或 --from 之一');
        process.exit(1);
      }

      // 执行转换命令
      try {
        await commandCsv(
          fileName,
          options.to ? CsvType.CsvToJSON : CsvType.JSONToCsv
        );
      } catch (error) {
        consola.error('执行转换时发生错误:', error);
        process.exit(1);
      }
    });

  return command;
}
