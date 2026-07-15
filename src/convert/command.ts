/**
 * 创建文件转换命令
 * @returns convert 命令对象
 */
import { convertCommand } from '~/commands/convert';

export function createConvertCommand() {
  return convertCommand;
}
