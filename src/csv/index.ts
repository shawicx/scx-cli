/*
 * @Author: shawicx d35f3153@proton.me
 * @Date: 2025-03-23 21:37:54
 * @LastEditors: shawicx d35f3153@proton.me
 * @LastEditTime: 2025-03-24 07:26:06
 * @Description:
 */
import signale from 'signale';
import path from 'path';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { CsvError, parse } from 'csv-parse';
import * as XLSX from 'xlsx';

import { CsvType } from '~/csv/type';
import { generateRandomString } from '~/utils/function';
import { stringify } from 'csv-stringify/sync';

/**
 * @description Read the CSV file and return the data as an array of objects
 * @param fileName 文件名
 * @param type 转换类型
 */
export default async function (fileName: string, type: string) {
  const filePath = path.join(__dirname, fileName);
  signale.debug('filePath: ', filePath);

  // 文件不存在
  if (!existsSync(fileName)) {
    signale.error('文件不存在');
    process.exit(1);
  }

  // 读取文件
  const data = readFileSync(fileName, 'utf8');
  // 转换类型
  switch (type) {
    case CsvType.CsvToJSON:
      // csv 转 json
      signale.debug('csv 转 json');
      const jsonData = await csvToJSON(data);
      await jsonToExcel(jsonData as unknown[], fileName);
      break;
    case CsvType.JSONToCsv:
      // json 转 csv
      signale.debug('json 转 csv');
      const excelData = await XLSX.readFile(fileName);
      const sheetName = excelData.SheetNames[0];
      const excelJson = XLSX.utils.sheet_to_json(excelData.Sheets[sheetName]);
      signale.debug(excelJson,'excelJson')
      await jsonToCsv(JSON.stringify(excelJson));
      break;
    default:
      signale.error('转换类型错误');
      process.exit(1);
  }
}

const csvToJSON = async (data: string) => {
  signale.debug(data);
  return new Promise((resolve, reject) => {
    parse(
      data,
      {
        columns: true,
        skip_empty_lines: true,
      },
      (err: CsvError | undefined, output: unknown[]) => {
        if (err) {
          signale.error('Error parsing CSV:', err);
          reject(err);
        } else {
          signale.debug('Parsed JSON:', output);
          resolve(output);
        }
      },
    );
  });
};

/**
 * @description 将 json 数据转换为 csv 文件
 * @param data json 数据
 */
const jsonToCsv = async (data: string) => {
  try {
    // 解析 JSON 字符串为对象
    const jsonData = JSON.parse(data);

    
    // 将 JSON 数据转换为 CSV 格式
    const csvContent = stringify(jsonData, {
      header: true,
      columns: Object.keys(jsonData[0])
    });

    // 生成输出文件名
    const outputFileName = `output_${generateRandomString()}.csv`;
    
    // 写入文件
    writeFileSync(outputFileName, csvContent　as　unknown as string);
    signale.success(`CSV file created: ${outputFileName}`);
  } catch (error) {
    signale.error('Error converting JSON to CSV:', error);
    process.exit(1);
  }
};

/**
 * @description 将 json 数据转换为 excel 文件
 * @param jsonData json 数据
 * @param fileName 文件名
 */
const jsonToExcel = async (jsonData: unknown[], fileName: string) => {
  const worksheet = XLSX.utils.json_to_sheet(jsonData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
  const excelFileName = fileName.replace('.csv', `_${generateRandomString()}.xlsx`);
  XLSX.writeFile(workbook, excelFileName);
  signale.info(`Excel file created: ${excelFileName}`);
};
