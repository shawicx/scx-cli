import { confirm, intro, multiselect, outro, select, spinner, text } from '@clack/prompts';
import { execSync } from 'child_process';
import { Command } from 'commander';
import { consola } from 'consola';
import * as fs from 'fs';
import * as path from 'path';

import type { GitLogOptions } from '~/types/git-logs';

export const gitLogsCommand = new Command('git-logs')
  .description('获取Git提交记录，支持按作者或提交名称查询')
  .argument('[directory]', '要查询的目录路径，默认为当前目录')
  .option('-i, --interactive', '使用交互式模式')
  .option('-o, --output <path>', '输出文件路径 (支持 .txt, .md, .json, .csv 格式)')
  .option('-f, --format <format>', '输出格式 (txt|md|json|csv)', 'txt')
  .option('--author <pattern>', '按作者邮箱或名称过滤')
  .option('--grep <pattern>', '按提交消息过滤')
  .option('--since <date>', '起始日期 (例如: 2024-01-01)')
  .option('--until <date>', '结束日期 (例如: 2024-12-31)')
  .action(async (directory, options) => {
    const currentDir = directory ? path.resolve(directory) : process.cwd();

    // 检查是否是 git 仓库
    const gitDir = path.join(currentDir, '.git');
    if (!fs.existsSync(gitDir)) {
      consola.error('当前目录不是一个 Git 仓库');
      return;
    }

    const finalOptions: GitLogOptions = {
      format: options.format || 'txt',
      output: options.output,
    };

    // 如果是交互式模式或者没有提供任何过滤选项
    if (
      options.interactive ||
      (!options.author && !options.grep && !options.since && !options.until)
    ) {
      await interactiveMode(currentDir, finalOptions);
    } else {
      // 使用命令行参数
      if (options.author) finalOptions.author = options.author;
      if (options.grep) finalOptions.grep = options.grep;
      if (options.since) finalOptions.since = options.since;
      if (options.until) finalOptions.until = options.until;
      await executeGitLog(currentDir, finalOptions);
    }
  });

/**
 * @description 交互式模式
 */
async function interactiveMode(currentDir: string, options: GitLogOptions) {
  intro('📋 Git 提交记录查询');

  consola.info(`当前目录: ${currentDir}\n`);

  // 选择查询方式
  const filterType = await select({
    message: '选择查询方式',
    options: [
      { value: 'all', label: '查询所有提交记录' },
      { value: 'author', label: '按作者查询' },
      { value: 'grep', label: '按提交消息查询' },
      { value: 'date', label: '按日期范围查询' },
      { value: 'multi', label: '组合查询（多个条件）' },
    ],
  });

  if (typeof filterType === 'symbol') {
    consola.info('操作已取消');
    process.exit(0);
  }

  // 创建 options 的副本以避免修改参数
  const updatedOptions = { ...options };

  // 根据选择的类型收集过滤条件
  await collectFilters(filterType as string, updatedOptions);

  // 选择输出格式
  const format = await select({
    message: '选择输出格式',
    options: [
      { value: 'txt', label: 'TXT (纯文本)' },
      { value: 'md', label: 'Markdown (表格)' },
      { value: 'json', label: 'JSON (结构化数据)' },
      { value: 'csv', label: 'CSV (Excel 兼容)' },
    ],
    initialValue: 'txt',
  });

  if (typeof format === 'symbol') {
    consola.info('操作已取消');
    process.exit(0);
  }

  updatedOptions.format = format as string;

  // 是否自定义输出文件名
  const customOutput = await confirm({
    message: '是否自定义输出文件名？',
    initialValue: false,
  });

  if (typeof customOutput === 'symbol') {
    consola.info('操作已取消');
    process.exit(0);
  }

  if (customOutput) {
    const outputPath = await text({
      message: '请输入输出文件路径',
      placeholder: 'my-commits.txt',
      validate: (value: string) => {
        if (!value) return '文件名不能为空';
        return undefined;
      },
    });

    if (typeof outputPath === 'symbol') {
      consola.info('操作已取消');
      process.exit(0);
    }

    updatedOptions.output = outputPath as string;
  }

  // 执行查询
  await executeGitLog(currentDir, updatedOptions);

  outro('✨ 完成！');
}

/**
 * @description 收集过滤条件
 */
async function collectFilters(filterType: string, options: GitLogOptions) {
  const updatedOptions = { ...options };

  switch (filterType) {
    case 'author': {
      const author = await text({
        message: '请输入作者邮箱或名称',
        placeholder: 'example@email.com 或 作者名称',
        validate: (value: string) => {
          if (!value) return '作者信息不能为空';
          return undefined;
        },
      });

      if (typeof author === 'symbol') {
        consola.info('操作已取消');
        process.exit(0);
      }

      updatedOptions.author = author as string;
      Object.assign(options, updatedOptions);
      break;
    }

    case 'grep': {
      const grep = await text({
        message: '请输入提交消息关键字',
        placeholder: 'feat, fix, refactor 等',
        validate: (value: string) => {
          if (!value) return '提交消息不能为空';
          return undefined;
        },
      });

      if (typeof grep === 'symbol') {
        consola.info('操作已取消');
        process.exit(0);
      }

      updatedOptions.grep = grep as string;
      Object.assign(options, updatedOptions);
      break;
    }

    case 'date': {
      const since = await text({
        message: '请输入起始日期（可选，回车跳过）',
        placeholder: '2024-01-01',
      });

      if (typeof since === 'symbol') {
        consola.info('操作已取消');
        process.exit(0);
      }

      if (since) updatedOptions.since = since as string;

      const until = await text({
        message: '请输入结束日期（可选，回车跳过）',
        placeholder: '2024-12-31',
      });

      if (typeof until === 'symbol') {
        consola.info('操作已取消');
        process.exit(0);
      }

      if (until) updatedOptions.until = until as string;

      if (!updatedOptions.since && !updatedOptions.until) {
        consola.warn('未设置日期范围，将查询所有记录');
      }

      Object.assign(options, updatedOptions);
      break;
    }

    case 'multi': {
      // 多选过滤条件
      const selectedFilters = await multiselect({
        message: '选择要应用的过滤条件',
        options: [
          { value: 'author', label: '按作者过滤' },
          { value: 'grep', label: '按提交消息过滤' },
          { value: 'since', label: '设置起始日期' },
          { value: 'until', label: '设置结束日期' },
        ],
        required: false,
      });

      if (typeof selectedFilters === 'symbol') {
        consola.info('操作已取消');
        process.exit(0);
      }

      const filters = selectedFilters as string[];

      // 顺序处理选中的过滤条件（避免并发问题）
      if (filters.includes('author')) {
        const author = await text({
          message: '请输入作者邮箱或名称',
          placeholder: 'example@email.com 或 作者名称',
          validate: (value: string) => {
            if (!value) return '作者信息不能为空';
            return undefined;
          },
        });

        if (typeof author === 'symbol') {
          consola.info('操作已取消');
          process.exit(0);
        }

        updatedOptions.author = author as string;
      }

      if (filters.includes('grep')) {
        const grep = await text({
          message: '请输入提交消息关键字',
          placeholder: 'feat, fix, refactor 等',
          validate: (value: string) => {
            if (!value) return '提交消息不能为空';
            return undefined;
          },
        });

        if (typeof grep === 'symbol') {
          consola.info('操作已取消');
          process.exit(0);
        }

        updatedOptions.grep = grep as string;
      }

      if (filters.includes('since')) {
        const since = await text({
          message: '请输入起始日期',
          placeholder: '2024-01-01',
          validate: (value: string) => {
            if (!value) return '日期不能为空';
            return undefined;
          },
        });

        if (typeof since === 'symbol') {
          consola.info('操作已取消');
          process.exit(0);
        }

        updatedOptions.since = since as string;
      }

      if (filters.includes('until')) {
        const until = await text({
          message: '请输入结束日期',
          placeholder: '2024-12-31',
          validate: (value: string) => {
            if (!value) return '日期不能为空';
            return undefined;
          },
        });

        if (typeof until === 'symbol') {
          consola.info('操作已取消');
          process.exit(0);
        }

        updatedOptions.until = until as string;
      }

      Object.assign(options, updatedOptions);
      break;
    }

    case 'all':
    default:
      // 不需要任何过滤条件
      break;
  }
}

/**
 * @description 执行 Git log 查询
 */
async function executeGitLog(currentDir: string, options: GitLogOptions) {
  try {
    // 构建 git log 命令
    let gitCommand = 'git log';

    // 添加过滤条件
    if (options.author) {
      gitCommand += ` --author="${options.author}"`;
      consola.info(`按作者过滤: ${options.author}`);
    }

    if (options.grep) {
      gitCommand += ` --grep="${options.grep}"`;
      consola.info(`按提交消息过滤: ${options.grep}`);
    }

    if (options.since) {
      gitCommand += ` --since="${options.since}"`;
      consola.info(`起始日期: ${options.since}`);
    }

    if (options.until) {
      gitCommand += ` --until="${options.until}"`;
      consola.info(`结束日期: ${options.until}`);
    }

    // 格式化输出
    const logFormat = '%h | %ad | %an <%ae> | %s';
    const dateFormat = '%Y-%m-%d %H:%M:%S';
    gitCommand += ` --pretty=format:"${logFormat}" --date=format:"${dateFormat}"`;

    consola.info('\n正在查询 Git 提交记录...');

    const s = spinner();
    s.start('查询中...');

    // 执行 git log 命令
    const output = execSync(gitCommand, {
      cwd: currentDir,
      encoding: 'utf-8',
    });

    const commits = output
      .trim()
      .split('\n')
      .filter((line) => line.trim());

    s.stop(`找到 ${commits.length} 条提交记录`);

    if (commits.length === 0) {
      consola.warn('未找到匹配的提交记录');
      return;
    }

    // 显示前几条记录
    const previewCount = Math.min(5, commits.length);
    consola.info(`\n前 ${previewCount} 条记录:`);
    commits.slice(0, previewCount).forEach((commit) => {
      consola.log(commit);
    });

    if (commits.length > previewCount) {
      consola.info(`... 还有 ${commits.length - previewCount} 条记录`);
    }

    // 确定输出文件路径
    let outputPath = options.output;
    if (!outputPath) {
      const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const ext = options.format || 'txt';
      outputPath = path.join(currentDir, `my-commits-${timestamp}.${ext}`);
    } else {
      // 如果用户提供了相对路径，转换为绝对路径
      outputPath = path.isAbsolute(outputPath) ? outputPath : path.join(currentDir, outputPath);
    }

    // 根据格式写入文件
    const outputFormat = options.format || path.extname(outputPath).slice(1) || 'txt';
    writeCommitsToFile(commits, outputPath, outputFormat);

    consola.success(`\n提交记录已写入文件: ${path.relative(currentDir, outputPath)}`);
  } catch (error) {
    consola.error('查询 Git 提交记录时出错:', error);
  }
}

/**
 * @description 根据指定格式写入提交记录到文件
 */
function writeCommitsToFile(commits: string[], outputPath: string, outputFormat: string): void {
  let content = '';

  switch (outputFormat.toLowerCase()) {
    case 'json': {
      const jsonData = commits.map((line) => {
        const parts = line.split(' | ');
        if (parts.length >= 4) {
          const [hash, date, author, ...messageParts] = parts;
          return {
            hash,
            date,
            author,
            message: messageParts.join(' | ').trim(),
          };
        }
        return { raw: line };
      });
      content = JSON.stringify(jsonData, null, 2);
      break;
    }

    case 'md': {
      content = '# Git 提交记录\n\n';
      content += '| Hash | 日期 | 作者 | 提交消息 |\n';
      content += '|------|------|------|----------|\n';
      commits.forEach((commit) => {
        const parts = commit.split(' | ');
        if (parts.length >= 4) {
          const [hash, date, author, ...messageParts] = parts;
          const message = messageParts.join(' | ').trim();
          content += `| ${hash} | ${date} | ${author} | ${message} |\n`;
        }
      });
      break;
    }

    case 'csv': {
      content = 'Hash,Date,Author,Message\n';
      commits.forEach((commit) => {
        const parts = commit.split(' | ');
        if (parts.length >= 4) {
          const [hash, date, author, ...messageParts] = parts;
          const message = messageParts.join(' | ').trim().replace(/"/g, '""');
          content += `${hash},${date},"${author}","${message}"\n`;
        }
      });
      break;
    }

    case 'txt':
    default: {
      content = commits.join('\n');
      break;
    }
  }

  fs.writeFileSync(outputPath, content, 'utf-8');
}
