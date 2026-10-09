# Billy Bob Games：每 28 天 SEO 复盘

这套流程只比较完整的 28 天数据，不会自动修改 Title、H1、Description 或正文。

## 下次复盘日期

当前基线日期是 2026-10-08，下一次复盘日期是 **2026-11-05**。GitHub Actions 会在到期日创建一个复盘 Issue，以后每 28 天创建一次。

## 需要导出的数据

### 1. 搜索表现

在 Google Search Console 中：

1. 选择 `billybobgames.org`。
2. 打开“效果 / 搜索结果”。
3. 日期选择“最近 28 天”。
4. 添加查询条件，选择“完全匹配”，输入 `billybobgames`。
5. 点击“导出”，选择 CSV。

导出目录应包含查询、国家、设备和图表 CSV。不要修改文件名，中文和英文界面导出的文件都支持。

### 2. 新增收录页面（可选但建议）

从“网页索引”导出已收录 URL，保存成 CSV；第一列应为 URL。运行命令时使用：

```bash
--indexed-pages "/路径/已收录页面.csv" --indexed-count 123
```

如果 Search Console 只提供数量而没有 URL，也可以只传 `--indexed-count`。这时报告只能比较数量，不能列出具体新增页面。

### 3. 新增外链域名（可选但建议）

从“链接 / 外部链接 / 链接次数最多的网站”导出 CSV，第一列应为域名。运行命令时使用：

```bash
--link-domains "/路径/外链网站.csv"
```

## 生成报告

只导入搜索表现：

```bash
pnpm seo:review -- --current "/路径/Search Console 导出目录"
```

导入完整数据：

```bash
pnpm seo:review -- \
  --current "/路径/Search Console 导出目录" \
  --indexed-pages "/路径/已收录页面.csv" \
  --indexed-count 123 \
  --link-domains "/路径/外链网站.csv"
```

脚本会在本机生成：

- `data/seo-review/snapshots/YYYY-MM-DD.json`：本期标准化快照。
- `reports/seo-review/YYYY-MM-DD.md`：与上一个周期的对比报告。

这两个目录不会提交到 GitHub，避免公开 Search Console 数据。请保留本机目录；下一个周期需要上一期快照才能计算变化。

## 如何判断是否需要修改

- 单日从第 2 名掉到第 3 名：不修改。
- 一个 28 天周期排名轻微下降，但点击或展示增长：先观察，不急着修改。
- 连续两个完整周期下降，并且点击、展示和 CTR 同时恶化：再检查搜索意图、页面内容和竞争页面。
- 国家或设备差异明显：先修对应地区或设备体验，不要直接改全站标题。
- 新页面没有展示：先检查内链、Sitemap、可玩性和索引状态。

脚本只记录证据并生成报告，最终修改仍由人工决定。
