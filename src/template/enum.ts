/**
 * @description 模板类型
 */
export enum ShawboxTemplateType {
  /**
   * @description React SaaS
   */
  REACT = 'react',
  /**
   * @description React Hook
   */
  REACT_HOOK = 'react-hook',
  /**
   * @description Vue SaaS
   */
  VUE = 'vue',
  /**
   * @description 工具库
   */
  LIBRARY = 'library',
  /**
   * @description 脚手架
   */
  CLI = 'cli',
  /**
   * @description 插件
   */
  PLUGIN = 'plugin',
  /**
   * @description 其他
   */
  OTHER = 'other',
  /**
   * @description Mono repo
   */
  MONOREPO = 'monorepo',
}

export const ShawboxTemplateRepository = new Map([
  [ShawboxTemplateType.REACT, 'https://github.com/shawicx/template-react'],
  [ShawboxTemplateType.REACT_HOOK, 'https://github.com/shawicx/template-react-hook'],
  [ShawboxTemplateType.VUE, 'https://github.com/shawicx/shawboxtemplate-vue'],
  [ShawboxTemplateType.LIBRARY, 'https://github.com/shawicx/template-library'],
  [ShawboxTemplateType.CLI, 'https://github.com/shawicx/shawbox-template-cli'],
]);
