/*
 * @Author: shawicx d35f3153@proton.me
 * @Date: 2025-03-23 21:35:42
 * @LastEditors: shawicx d35f3153@proton.me
 * @LastEditTime: 2025-03-23 23:17:08
 * @Description:
 */
import { Command } from 'commander';
import signale from 'signale';

import commandCsv from '~/csv';
import { CsvType } from '~/csv/type';
import commandSwagger from '~/swagger';
import commandTemplate from '~/template';

import cliPkg from '../package.json';

const program = new Command();

program
  .name('@scxfe/cli')
  .description('scxfe cli，效率提升利器')
  .version(cliPkg.version, '-v, --version', '查看当前安装的 cli 版本');

program
  .command('template')
  .description('下载 模版仓库')
  .option('-i, --install', '执行安装命令')
  .action(async () => {
    await commandTemplate();
  });

program
  .command('csv')
  .description('csv 与 json 互转')
  .argument('<string>', 'string to split')
  .option('-t, --to', 'csv 转 json')
  .option('-f, --from', 'json 转 csv')
  .action(async (fileName: string, options) => {
    signale.debug(typeof options?.to, options, 'options');

    if (options.to && options.from) {
      signale.error('不能同时使用 --to 和 --from');
      process.exit(1);
    }
    if (!options.to && !options.from) {
      signale.error('必须选择 --to 或 --from 之一');
      process.exit(1);
    }

    await commandCsv(fileName, options.to ? CsvType.CsvToJSON : CsvType.JSONToCsv);
  });

program
  .command('swagger')
  .description('根据 swagger 文档生成 api 文件以及 interface 文件')
  // 初始化配置文件
  .option('-c, --config', '初始化配置文件')
  // 生成 api 文件
  .option('-a, --api', '生成 api 文件以及 interface 文件')
  .action(async ({ config, api }) => {
    await commandSwagger({ config, api });
  });

program.parse(process.argv);
