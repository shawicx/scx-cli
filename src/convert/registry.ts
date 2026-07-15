import { convertHeicToPng } from '~/convert/converters/heic';
import type { Converter } from '~/convert/type';

/**
 * @description 已注册的转换器列表
 * 新增格式转换时，在此数组追加一项即可，无需改动其它文件
 */
const converters: Converter[] = [{ from: 'heic', to: 'png', convert: convertHeicToPng }];

/**
 * @description 判断源格式是否被支持
 * @param from 源格式（小写）
 * @returns 是否支持
 */
export function isSupported(from: string): boolean {
  return converters.some((c) => c.from === from);
}

/**
 * @description 获取指定源格式支持的所有目标格式
 * @param from 源格式（小写）
 * @returns 目标格式数组
 */
export function getTargetFormats(from: string): string[] {
  return converters.filter((c) => c.from === from).map((c) => c.to);
}

/**
 * @description 获取指定 from→to 的转换器
 * @param from 源格式（小写）
 * @param to 目标格式（小写）
 * @returns 转换器，不存在则 undefined
 */
export function getConverter(from: string, to: string): Converter | undefined {
  return converters.find((c) => c.from === from && c.to === to);
}

/**
 * @description 获取所有已注册的源格式
 * @returns 源格式数组（去重）
 */
export function getSupportedFormats(): string[] {
  return [...new Set(converters.map((c) => c.from))];
}
