import { cancel, confirm, group, log, select, spinner, text } from '@clack/prompts';
import fs from 'fs';
import { simpleGit } from 'simple-git';

import { FolderRegex } from '~/utils/constant';
import { DependencyType } from '~/utils/enum';
import { runCommand } from '~/utils/function';

import { ShawboxTemplateRepository, ShawboxTemplateType } from './enum';

/**
 * @description 输入文件夹名称
 */

/**
 * @description 检查目录是否存在，不存在则创建
 * @param folder 目录
 */
export const checkFolder = (folder: string) => {
  // 限制目录名称只能是小写字母、数字、下划线
  if (!FolderRegex.test(folder)) {
    log.error('目录名称只能包含小写字母、数字、下划线');
    process.exit(0);
  }

  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder, { recursive: true });
    log.info(`${folder} 目录已创建`);
  } else {
    log.info(`${folder} 目录已存在`);
  }
};

export default async function () {
  const { folder, install, template, dependencyType } = await group(
    {
      template: () => {
        return select({
          message: '下载哪个模板？',
          options: [
            {
              label: ShawboxTemplateType.REACT_HOOK,
              value: ShawboxTemplateType.REACT_HOOK,
            },
            {
              label: ShawboxTemplateType.CLI,
              value: ShawboxTemplateType.CLI,
            },
          ],
        });
      },
      folder: () =>
        text({
          message: '模板下载到哪个目录？',
          validate: (value) => {
            if (!FolderRegex.test(value)) {
              log.error('目录名称只能包含小写字母、数字、下划线');
              return undefined;
            }
            return value;
          },
        }),
      install: () => confirm({ message: '是否安装依赖？' }),
      // 如果install为true，则使用pnpm安装依赖
      dependencyType: ({ results }) => {
        if (results.install) {
          return select({
            message: '使用哪种依赖管理工具？',
            options: [
              {
                label: DependencyType.PNPM,
                value: DependencyType.PNPM,
              },
              {
                label: DependencyType.YARN,
                value: DependencyType.YARN,
              },
              {
                label: DependencyType.NPM,
                value: DependencyType.NPM,
              },
            ],
          });
        }
        return undefined;
      },
    },
    {
      onCancel: () => {
        cancel('操作已取消');
        process.exit(0);
      },
    },
  );

  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder, { recursive: true });
    log.info(`${folder} 目录已创建`);
  } else {
    log.info(`${folder} 目录已存在`);
  }
  const git = simpleGit();

  log.info(ShawboxTemplateRepository.get(template) ?? '模板不存在');
  await git.clone(ShawboxTemplateRepository.get(template) as string, folder);

  log.info(ShawboxTemplateRepository.get(template) ?? '模板不存在');

  if (install) {
    // 进入目录
    process.chdir(folder);
    const spin = spinner();
    spin.start('下载依赖');
    // 安装依赖
    await runCommand(process.cwd(), `${dependencyType} install`);
    spin.stop('下载完成');
  }
}
