import { Command } from 'commander';

import commandSwagger from '~/swagger';
import commandTemplate from '~/template';

import cliPkg from '../package.json';

const program = new Command();

program
  .name('@shawbox/cli')
  .description('Shawbox cli，效率提升利器')
  .version(cliPkg.version, '-v, --version', '查看当前安装的 cli 版本');

program
  .command('template')
  .description('下载 模版仓库')
  .option('-i, --install', '执行安装命令')
  .action(async () => {
    await commandTemplate();
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
