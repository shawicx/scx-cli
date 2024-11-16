import { log } from '@clack/prompts';
import { spawn } from 'child_process';

/**
 * @description 运行命令
 * @param projectPath 项目路径
 * @param command 命令
 */
export async function runCommand(projectPath: string, command: string) {
  log.info(`运行命令: ${projectPath}`);
  await new Promise<void>((resolve, reject) => {
    const child = spawn(command, {
      cwd: projectPath,
      shell: true,
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject();
      }
    });
  });
}
