/*
 * @Author: shawicx d35f3153@proton.me
 * @Date: 2025-03-23 21:35:42
 * @LastEditors: shawicx d35f3153@proton.me
 * @LastEditTime: 2025-03-23 23:06:22
 * @Description:
 */
import { log } from '@clack/prompts';
import { spawn } from 'child_process';

export const generateRandomString = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters.charAt(randomIndex);
  }
  return result;
};

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
