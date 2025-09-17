import { Command } from 'commander';
import { consola } from 'consola';

import commandTemplate from '~/template';

/**
 * 创建模板命令
 * @returns 模板命令对象
 */
export function createTemplateCommand(): Command {
  const command = new Command('template')
    .description('下载模板仓库')
    .option('-i, --install', '执行安装命令')
    .action(async () => {
      try {
        await commandTemplate();
      } catch (error) {
        consola.error('执行模板下载时发生错误:', error);
        process.exit(1);
      }
    });

  return command;
}
