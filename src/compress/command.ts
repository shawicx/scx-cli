/**
 * 创建图片压缩命令
 * @returns compress 命令对象
 */
import { compressCommand } from '~/commands/compress';

export function createCompressCommand() {
  return compressCommand;
}
