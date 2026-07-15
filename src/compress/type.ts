/**
 * @description 质量等级（交互式选择用）
 */
export const QualityLevel = {
  High: { label: '高质量 (90)', value: 90 },
  Medium: { label: '中等质量 (75)', value: 75 },
  Low: { label: '低质量 (60)', value: 60 },
} as const;

/**
 * @description 压缩结果
 */
export interface CompressResult {
  /** 输出文件路径 */
  outputPath: string;
  /** 原始体积（字节） */
  originalSize: number;
  /** 压缩后体积（字节） */
  compressedSize: number;
}
