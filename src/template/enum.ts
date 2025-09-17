/*
 * @Author: shawicx d35f3153@proton.me
 * @Description: 枚举
 */

/**
 * @description 模板类型
 */
export const ScxfeTemplateType = {
  /**
   * @description React SaaS
   */
  REACT: 'react',
  /**
   * @description React Hook
   */
  REACT_HOOK: 'react-hook',
  /**
   * @description Vue SaaS
   */
  VUE: 'vue',
  /**
   * @description 工具库
   */
  LIBRARY: 'library',
  /**
   * @description 脚手架
   */
  CLI: 'cli',
  /**
   * @description 插件
   */
  PLUGIN: 'plugin',
  /**
   * @description 其他
   */
  OTHER: 'other',
  /**
   * @description Mono repo
   */
  MONOREPO: 'monorepo',
} as const;

export const ScxfeTemplateRepository = new Map([
  [ScxfeTemplateType.REACT, 'https://github.com/shawicx/template-react'],
  [ScxfeTemplateType.REACT_HOOK, 'https://github.com/shawicx/template-react-hook'],
  [ScxfeTemplateType.VUE, 'https://github.com/shawicx/shawboxtemplate-vue'],
  [ScxfeTemplateType.LIBRARY, 'https://github.com/shawicx/template-library'],
  [ScxfeTemplateType.CLI, 'https://github.com/shawicx/shawbox-template-cli'],
]);
