/*
 * @Author: shawicx d35f3153@proton.me
 * @Description:
 */
import { consola } from 'consola';
import { defineConfig } from 'tsup';

import type { Options } from 'tsup';

export default defineConfig((options: Options) => ({
  entry: ['src/index.ts', 'src/types.ts'],
  format: ['cjs'],
  dts: true,
  clean: true,
  minify: true,
  onSuccess: async () => {
    const start = Date.now();
    consola.success(`build successfully, time: ${Date.now() - start}ms`);
  },
  ...options,
}));
