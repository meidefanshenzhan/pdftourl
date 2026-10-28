# Advertising Calculator 上线验收

中文 https://kjamz.com/zh/acos-calculator/ · 英文 https://kjamz.com/en/acos-calculator/

站点版本v1.4.0，Cloudflare版本8e0f9ba8-d66f-48bf-8c4f-896a5b0d12ba。功能提交96e1fcc4402a3cb62fc7d70c4a2d7dda91105244，分支kjamz-workbench。

## 实现
手填售价、商品成本、头程、配送、平台佣金（百分比/固定金额）、其他费用、广告CVR；选填当前CPC与目标利润。以每广告订单一件、全部金额同币种、只扣输入成本为口径。币种切换仅显示单位，不换汇。

结果包括广告前贡献利润/利润率、保本ACOS/CPC/ROAS、当前CPC对应CPA/ACOS/ROAS及每单利润、目标利润对应ACOS/CPC上限。示例售价30、成本18、CVR10%、CPC0.6、目标利润6 => 保本ACOS40%、CPC1.2、ROAS2.5、广告后利润6、目标CPC0.6。

处理零CVR、零CPC、负贡献利润、零贡献、目标无法达到、缺失与无效输入。用比例相关的浮点容差处理小数舍入，最终数值检查拒绝无限结果；未定义指标显示“—”，不捏造可行预算。

复制、CSV/TXT结果导出；输入在浏览器计算，不上传/存储，无新API或登录。KJAMZ统一UI、18页共享SEO/语言链接/站点地图/CSP、首页入口及真实发布日志。

## 对标与来源
- AmzToolBox CPC&ACOS&利润测算 https://www.amztoolbox.top/functionality/cpc-compass ：含手动盈亏与复杂自动费用配置；广告竞价工具另有出价场景。
- AMZ123成本利润计算器 https://www.amz123.com/tools-chengbenlirun ：商品类目与成本利润方向。未复制费率表或规则。
- Amazon Ads官方定义 https://advertising.amazon.com/library/guides/acos-advertising-cost-of-sales
- Amazon Ads官方CPA/盈亏公式 https://advertising.amazon.com/library/guides/ads-math

## 验证
构建、49项自动测试、本地GEO18页通过。独立审查发现小数保本误判与极端数值溢出，新增先失败的回归测试，修复后9项核心测试与全部49项通过，审查复核确认。

正式浏览器时间2026-10-29 00:15:32北京时间，中英文标准样例、佣金模式、目标边界、零CVR/CPC、亏损、缺失/无效输入、币种、实际导出、390/768/1440布局、无输入上传通过。本地全站联系页/页脚/更新标记及PDF语言切换回归通过，未发送表单留言。

主域18页HTML/CSP一致性独立验证保存为main-host-live.json。完整 node scripts/check-geo.mjs --live 已执行：主域页面、robots、sitemap与旧去重301通过，末尾旧workers.dev别名超时，完整命令未通过。无第三方扫描评分或排名承诺。

证据 .local/acos-release/：ui-local.json、ui-live.json、main-host-live.json、geo-live.log、deploy.log、deployments-before.json、checkpoints与中英文桌面/手机截图。

## 回滚
运行ID acos-2026-10-29；发布会话52956，线上GEO25563、主域14975。回滚命令 wrangler rollback 89c2fc37-b612-453d-8249-0de29dae7970。原public/scripts/package/seo-hashes备份在证据目录。原GitHub头c8ce3928017c1c518e4033f44a6306408504fe7c。中断恢复先核对当前线上版本与checkpoint，避免重复发布，不重置历史。
