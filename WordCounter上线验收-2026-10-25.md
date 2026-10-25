# KJAMZ Word Counter 上线验收

## 访问
- 中文：https://kjamz.com/zh/word-counter/
- English：https://kjamz.com/en/word-counter/
- 主页已增加第二个工具入口，PDF to Link 与词频统计可互相访问。

## 已实现
- 浏览器本地词数、字符（含/不含空白）、UTF-8 字节、句子、段落、行数、唯一词统计。
- 完整词频与 1/2/3 词连续短语；大小写、停用词、自定义排除、最少次数、搜索和前 N 筛选。
- 默认全部结果；100行分页不限制 CSV/TXT 导出。密度分母不随筛选改变。
- 英文可读性、阅读/演讲时间估计、预设及自定义字数目标。
- 草稿保存默认关闭；用户主动开启才写本工具 localStorage。清空不影响 PDF 访客记录。
- 无需登录，无文本分析 API，不上传文本。单次最多 500,000 Unicode 码点，超限不截断、不导出旧结果。
- 原创中英文说明和 FAQ，保持 KJAMZ 暖白深绿风格。

## 验证结果
21 项单元测试通过；独立代码审查未发现阻断问题。实际浏览器验证了145个唯一词、全量分页和CSV/TXT文件内容、筛选一致性、短语边界、目标字数、草稿同意与清空隔离、空/非空输入的语言切换、桌面和390px手机排版。受限 Worker/localStorage/sessionStorage 降级已验证。PDF 旧流程回归通过。

正式网站完整UI验收：PASS。45万字符/10万词样本完成时间约 472 ms（本次检查环境，不作所有设备性能保证）。未检测到文本/API请求；浏览器脚本错误为0。Cloudflare自动注入的统计脚本被现有CSP拦截，单独记录而未放宽安全策略。

## GEO
构建与本地 npm run check:geo 通过。主域名8个公开页面均200，canonical/hreflang/JSON-LD及sitemap验证通过。已运行 node scripts/check-geo.mjs --live：其旧workers.dev别名阶段因执行环境DNS/连接异常失败，未称全项通过；www归一跳转及本地Worker路由验证通过。
扫描原始API时间：2026-10-25T12:48:45.953Z，等级 1/5 Basic Web Presence。未核实浏览器默认All Checks百分比分数，不报告百分比分数；不等于Google SEO评分或排名承诺。没有OAuth、登录或支付建设占位。

## 发布和恢复
Cloudflare版本：8583afd0-e287-46a4-8187-95bcd429ba00。原有S3桶、文件链接、密钥和PDF上传限额未更改。
回滚：wrangler rollback 59977cd3-ab98-4110-90a9-90f38393da38。
证据/备份：.local/word-counter-release-2026-10-25/，包含 checkpoint.json、ui-evidence.json、live-geo.json、after-scan.json、截图、public-before/、scripts-before/。
源码分支：https://github.com/meidefanshenzhan/pdftourl/tree/kjamz-workbench 。
