import { defineConfig } from 'tsup';

import type { Options } from 'tsup';

export default defineConfig((options: Options) => ({
  entry: ['src/index.ts', 'src/types.ts'],
  format: ['cjs'],
  dts: true,
  clean: true,
  minify: true,
  // onSuccess: async () => {
  //   const start = Date.now();
  //   await fs.copy('src/templates', 'dist/templates');
  //   console.log(
  //     chalk.hex('#7c5cad')('TEMPLATES'),
  //     'copied in',
  //     chalk.green(`${Date.now() - start}ms`),
  //   );
  // },
  ...options,
}));
