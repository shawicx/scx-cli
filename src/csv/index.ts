/*
 * @Author: shawicx d35f3153@proton.me
 * @Description:
 */
import { consola } from 'consola';
import { CsvError, parse } from 'csv-parse';
import { stringify } from 'csv-stringify/sync';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'path';
import * as XLSX from 'xlsx';

import { CsvType } from '~/csv/type';
import { generateRandomString } from '~/utils/function';

/**
 * @description Read the CSV file and return the data as an array of objects
 * @param fileName 文件名
 * @param type 转换类型
 */
export default async function (fileName: string, type: string) {
  const filePath = path.join(__dirname, fileName);
  consola.debug('filePath: ', filePath);

  // 文件不存在
  if (!existsSync(fileName)) {
    consola.error('文件不存在');
    process.exit(1);
  }

  // 读取文件
  const data = readFileSync(fileName, 'utf8');
  // 转换类型
  switch (type) {
    case CsvType.CsvToJSON:
      // csv 转 json
      consola.debug('csv 转 json');
      await jsonToExcel(data, fileName);
      break;
    case CsvType.JSONToCsv:
      // json 转 csv
      consola.debug('json 转 csv');
      await jsonToCsv(fileName);
      break;
    default:
      consola.error('转换类型错误');
      process.exit(1);
  }
}

/**
 * @description 将 CSV 数据转换为 JSON 对象
 * @param data CSV 数据
 * @returns 解析后的 JSON 对象
 */
const csvToJSON = async (data: string) => {
  consola.debug(data);
  return new Promise((resolve, reject) => {
    parse(
      data,
      {
        columns: true,
        skip_empty_lines: true,
      },
      (err: CsvError | undefined, output: unknown[]) => {
        if (err) {
          consola.error('Error parsing CSV:', err);
          reject(err);
        } else {
          consola.debug('Parsed JSON:', output);
          resolve(output);
        }
      },
    );
  });
};

/**
 * @description 将 xlsx 文件内容转换为 csv 文件
 * @param fileName 文件名
 */
const jsonToCsv = async (fileName: string) => {
  try {
    // 读取 Excel 文件
    const excelData = XLSX.readFile(fileName);
    const sheetName = excelData.SheetNames[0];
    const jsonData = XLSX.utils.sheet_to_json(excelData.Sheets[sheetName]);

    // 将 JSON 数据转换为 CSV 格式
    const csvContent = stringify(jsonData, {
      header: true,
      columns: Object.keys(jsonData[0] as Record<string, any>),
    });

    // 生成输出文件名
    const outputFileName = `output_${generateRandomString()}.csv`;

    // 写入文件
    writeFileSync(outputFileName, csvContent as unknown as string);
    consola.success(`CSV file created: ${outputFileName}`);
  } catch (error) {
    consola.error('Error converting JSON to CSV:', error);
    process.exit(1);
  }
};

/**
 * @description 将 json 数据转换为 excel 文件
 * @param data 数据
 * @param fileName 文件名
 */
const jsonToExcel = async (data: string, fileName: string) => {
  // 将 CSV 数据转换为 JSON 对象
  const jsonData = await csvToJSON(data);

  // 创建工作表和工作簿
  const worksheet = XLSX.utils.json_to_sheet(jsonData as unknown[]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

  // 生成输出文件名
  const excelFileName = fileName.replace('.csv', `_${generateRandomString()}.xlsx`);

  // 写入 Excel 文件
  XLSX.writeFile(workbook, excelFileName);
  consola.info(`Excel file created: ${excelFileName}`);
};
