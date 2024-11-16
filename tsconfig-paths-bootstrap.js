const tsconfigPaths = require('tsconfig-paths');
// 导入 tsconfig.json
const tsconfig = require('./tsconfig.json');

tsconfigPaths.register({
  // 把 tsconfig.json 的 baseUrl 和 paths 配置拿过来
  baseUrl: tsconfig.compilerOptions.baseUrl ?? './',
  paths: tsconfig.compilerOptions.paths,
});
