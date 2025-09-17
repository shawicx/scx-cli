# scx-fe

### 安装依赖

```bash
pnpm global add @scxfe/cli
```

## CSV 和 JSON 互转功能

### 1. 将 CSV 转换为 JSON

使用以下命令将指定的 CSV 文件转换为 JSON 格式：

```bash
scxfe-cli csv <csv文件路径> -t
```

示例：

```bash
scx-fe csv data.csv -t
```

执行后，工具会将 CSV 数据转换为 Excel 文件并保存到指定的文件名。<hr></hr>

### 注意事项

- 确保输入的文件路径正确且文件格式符合要求。
- 输出文件会自动生成，文件名中会包含随机字符串以避免覆盖

9b0Abbc7e039
