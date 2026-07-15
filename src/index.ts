/**
 * @description: CLI入口文件
 */
import { Command } from 'commander';
import { consola } from 'consola';

import { gitLogsCommand } from '~/commands/git-logs';

import cliPkg from '../package.json';
import { createConvertCommand } from './convert/command';
import { createCsvCommand } from './csv/command';

const program = new Command();

program
  .name('scxfe-cli')
  .description('scxfe cli，效率提升利器')
  .version(cliPkg.version, '-v, --version', '查看当前安装的 cli 版本');

// 添加命令
program.addCommand(createCsvCommand());
program.addCommand(createConvertCommand());
program.addCommand(gitLogsCommand);

// 错误处理
program.exitOverride((err) => {
  if (err.code === 'commander.help' || err.code === 'commander.helpDisplayed') {
    process.exit(0);
  }
  consola.error('CLI execution failed:', err.message);
  process.exit(1);
});

try {
  program.parse();
} catch (error: any) {
  if (error.code === 'commander.help' || error.code === 'commander.helpDisplayed') {
    process.exit(0);
  }
  consola.error('CLI execution failed:', error.message || error);
  process.exit(1);
}
