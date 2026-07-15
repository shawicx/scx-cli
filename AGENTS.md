# AGENTS.md

此文件供在此代码库中操作的 AI 编码助手使用。

## 构建/代码检查/测试命令

- `pnpm run build` 或 `bun run build` - 使用 tsup 打包项目到 dist/ 目录
- `pnpm run dev` - 开发模式运行 CLI (使用 tsx)
- `pnpm run lint` - 运行 ESLint 和 stylelint 检查
- `pnpm run lint:fix` - 自动修复 ESLint 和 Prettier 问题
- `pnpm run format` - 使用 Prettier 格式化所有代码
- `pnpm run prepublish` - 发布前构建
- `pnpm run publish` - 使用 standard-version 生成 CHANGELOG 并发布
- `pnpm run release` - 完整发布流程（构建 + 发布 + 推送标签）

**注意**: 此项目目前没有测试文件，无需运行测试命令。

## 代码风格指南

### 文件格式

- **缩进**: 2 空格（由 .editorconfig 配置）
- **引号**: 单引号
- **行尾**: LF（Unix 风格）
- **最大行宽**: 100 字符
- **编码**: UTF-8
- **文件末尾**: 必须有换行符
- **尾部空格**: 必须修剪

### 导入顺序（使用 simple-import-sort）

1. 第三方包（以 @ 或字母开头）
2. 相对路径（以 . 开头）
3. 类型导入（如果有）

```typescript
// ✅ 正确
import { Command } from 'commander';
import { consola } from 'consola';

import { GitLogOptions } from '~/types/git-logs';
import { generateRandomString } from '~/utils/function';
```

**重要**: 使用 `~/` 别名代替相对路径导入（`~/` 映射到 `./src/*`）

### 类型规范

- 使用 TypeScript 严格模式
- 函数必须有明确的返回类型或使用类型推断
- 使用 `interface` 定义对象类型，使用 `type` 定义联合类型
- 导出类型用于跨文件共享

```typescript
// ✅ 正确
export interface GitLogOptions {
  author?: string;
  grep?: string;
  since?: string;
}

export async function executeGitLog(currentDir: string, options: GitLogOptions) {
  // ...
}
```

### 命名规范

- **文件名**: kebab-case（如 `git-logs.ts`）或小驼峰（如 `type.ts`）
- **函数/变量**: camelCase（如 `generateRandomString`）
- **常量/枚举**: PascalCase 或 UPPER_SNAKE_CASE（如 `CsvType`, `FolderRegex`）
- **接口**: PascalCase（如 `GitLogOptions`）
- **类型**: PascalCase（如 `CsvType`）

### 注释规范

- 使用 JSDoc 格式注释函数
- 使用 `@description` 描述函数功能
- 注释使用中文

```typescript
/**
 * @description 将 CSV 数据转换为 JSON 对象
 * @param data CSV 数据
 * @returns 解析后的 JSON 对象
 */
const csvToJSON = async (data: string) => {
  // ...
};
```

### 错误处理

- 使用 `consola` 进行日志记录
- 对于致命错误，使用 `process.exit(1)` 退出
- 在命令行工具中捕获所有错误并提供友好的错误消息

```typescript
try {
  await commandCsv(fileName, conversionType);
  s.stop('转换成功！');
} catch (error) {
  s.stop('转换失败');
  consola.error('执行转换时发生错误:', error);
  process.exit(1);
}
```

### CLI 命令规范

- 使用 Commander.js 创建命令
- 为命令提供 `description` 描述
- 使用 `@clack/prompts` 创建交互式提示
- 优先考虑交互式体验

```typescript
export const csvCommand = new Command('csv')
  .description('CSV/Excel 与 JSON 互转工具')
  .argument('[file]', '文件路径')
  .option('-i, --interactive', '使用交互式模式')
  .action(async (fileName, options) => {
    // ...
  });
```

### Git 提交信息规范

使用 Conventional Commits 规范（通过 commitlint-config-ali）：

- `feat` - 新功能
- `fix` - 修复 Bug
- `docs` - 文档更新
- `style` - 代码格式调整
- `refactor` - 重构
- `test` - 测试相关
- `chore` - 构建/工具链配置
- `revert` - 回退提交

示例: `feat: 添加 Excel 转 CSV 功能`

### ESLint/Prettier 配置

- ESLint 扩展: `ali/typescript/react`
- Prettier 配置: `prettier-config-ali`
- 自动导入排序: `simple-import-sort`
- Pre-commit hooks: 通过 Husky + lint-staged 自动运行

### 其他注意事项

1. 使用 `tsup` 进行打包，配置在 `tsup.config.ts`
2. TypeScript 配置继承自 `@shawbox/ts-config/base.json`
3. 项目使用 pnpm 作为包管理器
4. 支持的输出格式: CJS（CommonJS）
5. dist/ 目录是构建输出，不应手动修改
