/*
 * @Author: shawicx d35f3153@proton.me
 * @Date: 2025-03-23 21:35:42
 * @LastEditors: shawicx d35f3153@proton.me
 * @LastEditTime: 2025-03-24 07:29:07
 * @Description:
 */
import signale from 'signale';
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
    signale.success(`build successfully, time: ${Date.now() - start}ms`);
  },
  ...options,
}));
