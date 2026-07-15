/**
 * @description 文件转换器接口
 */
export interface Converter {
  /** 源格式（小写，如 'heic'） */
  from: string;
  /** 目标格式（小写，如 'png'） */
  to: string;
  /** 执行转换的函数 */
  convert: (inputPath: string, outputPath: string) => Promise<void>;
}
