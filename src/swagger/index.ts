import { log } from '@clack/prompts';
import fs from 'fs';

/**
 * @description 初始化配置文件
 */
export async function initConfig() {
  log.info('初始化配置文件');
}

/**
 * @description 根据 swagger 文档生成 api 文件以及 interface 文件
 * @param config 是否初始化配置文件
 * @param api 是否生成 api 文件以及 interface 文件
 */
export default async function commandSwagger({ config, api }: { config: boolean; api: boolean }) {
  if (config) {
    await initConfig();
    return;
  }

  if (api) {
    // 检查是否存在配置文件
    if (!fs.existsSync('./swagger.json')) {
      log.error('请先初始化配置文件');
      return;
    }
    // 读取配置文件
    const _config = JSON.parse(fs.readFileSync('./swagger.json', 'utf8'));
    // 检查是否存在 swagger url
    if (!fs.existsSync(_config.swaggerUrl)) {
      log.error('请先初始化配置文件');
      process.exit(1);
    }

    // 生成 api 文件以及 interface 文件
    log.info('生成 api 文件以及 interface 文件');
  }
}
