# Word Merge 上线验收

中文 https://kjamz.com/zh/word-merge/ · 英文 https://kjamz.com/en/word-merge/

站点版本 v1.3.0，生产版本6e1db64a-3619-41e6-8128-1e15f8033b63。GitHub分支kjamz-workbench，功能提交6834aab6e181bae2190f9e2ca04c0f7b697f9727。

## 实际功能
- 两组词表，第三组可选；每行一个词或完整短语。正序/倒序组合，空格/无连接符/横杠/下划线/自定义连接符，前后缀原样添加。
- 默认忽略大小写去重：先对各词表去重，再对最终组合去重，保留首个原始拼写与顺序。
- 实时预估候选数量，显式生成。修改输入或选项后旧结果与导出立即失效。
- 复制、完整TXT/CSV导出；CSV转义及公式起始字符防护。
- 每组上限50,000个UTF-16单位、50,000候选组合、500万输出单位，生成前校验，不静默截断。清理空行和行首尾空格。
- 纯浏览器处理，无输入上传或草稿保存，无新增后端接口/账号/付费。
- KJAMZ统一风格、中英文、卖家示例/用途/说明/FAQ；链接至文本去重和词频统计。没有未实现功能FAQ、搜索量或排名保证。
- 首页卡片、真实更新记录、14页共享sitemap/canonical/双向hreflang/JSON-LD及CSP一致更新。未改变crawler内容使用偏好。

## 验证
- npm run build、npm test（39项）、npm run check:geo（14页）通过。
- 浏览器：两三组、去重、完整短语、反序/连接符/前后缀、旧导出失效、TXT/CSV实际下载、卖家示例、字面HTML安全显示、上限、无输入传输、中英文390/1440布局通过。
- 全站14页品牌、联系表单（未发留言）、更新标记与PDF语言切换回归通过。
- 独立源码审查未发现阻塞项。
- 正式工具验收时间2026-10-28 22:21:23北京时间；主域14页逐字HTML与JSON-LD/CSP一致，www301，时间22:22:55。
- node scripts/check-geo.mjs --live 已执行，主域页面/robots/sitemap/旧去重URL301通过，末尾旧workers.dev别名网络请求超时，完整命令未通过。未使用第三方评分扫描器，不声明评分或排名保证。
- 首次本地浏览器测试因预览服务未运行失败，启动后通过；独立主域检查沿用了旧迁移前路径预期，更新为Word Merge跳转后通过。这些是验收环境/脚本修正。

## 证据与回滚
目录 .local/word-merge-release/：checkpoint.json、deployments-before.json、dev.log、deploy.log、ui-local.json、ui-live.json、main-host-live.json、geo-live.log及中英文桌面/手机截图。

运行 word-merge-2026-10-28；开发会话12511，部署17084，线上工具18221，GEO18022，主域45539。

回滚：wrangler rollback e79dace1-9e32-4d29-a1c3-53eae50cde4a。原public/scripts/package/seo-hashes备份在证据目录。原GitHub头e0444d7aa2e4110040012ed51aa70c6ae73004ff，保留历史。中断后先查当前生产版本与检查点，不盲目再次部署。
