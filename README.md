# PDF to Link · 卖家文档工具

## 当前使用方式（已取代下文早期站主登录说明）

无需注册或登录。以签名浏览器Cookie识别访客，每个浏览器从首次使用起的一小时内可生成3份文件；并发请求先预留名额，格式检查等发布前失败会退还。超过限额后弹出口令，口令在后端Secret `UPLOAD_CODE` 配置，成功后对当前浏览器解锁一小时。清除Cookie或更换浏览器会改变识别与历史记录。

已取消原站主登录入口、登录接口与站主密码Secret。`SESSION_SECRET`现在用于签名访客标识与短期上传解锁，不是用户登录密码。文件下载始终无需口令。列表、检查与删除按浏览器归属隔离；短口令不会授予访问其他访客文件的权限。

Contact Us页面：`/zh/contact/`、`/en/contact/`，公开邮箱 `153655601@qq.com`。沿用旧版FormSubmit在线表单，POST到新收件地址；首次正式提交会触发新邮箱验证。浏览器验收拦截外部POST，检查目标与字段但没有发送真实邮件，实际投递须在邮箱激活后验证。

上传区已去掉站点、文件语言和文档类型，仅保留折叠的可选“备注／SKU”；历史文件原有元数据不删除。超额口令弹窗提供当前语言Contact Us跳转。前台文案不讲S3，技术文件地址暂仍使用已验证的旧桶直链；新域名方案见`新域名接入说明.md`。

当前验证：11项自动化测试通过；本机真实S3的9项验收通过；真实Chrome验证前三份无登录上传、第四份口令弹窗、解锁后自动续传、移动端和联系邮箱。线上部署已同步，workers.dev在当前网络仍无法完成HTTP验收。

本地私有配置说明：`.local/站主登录信息.txt`内容已改为上传限额说明，旧站主密码不再有效。

中英文静态页面与受保护上传API部署在独立Cloudflare Worker `seller-pdf-links`，D1记录文件元数据。实际PDF写入现有S3桶的 `seller-pdf-v2/` 前缀，不覆盖旧文件。

## 入口

- 中文线上：https://seller-pdf-links.zheciyaojizhuwqw.workers.dev/zh/
- 英文线上：https://seller-pdf-links.zheciyaojizhuwqw.workers.dev/en/
- 本机调试：http://127.0.0.1:8787/zh/ （仅在Wrangler开发进程运行期间可用）
- 站主密码：本机 `.local/站主登录信息.txt`。不要把此目录、`.dev.vars` 或任何实际密钥上传GitHub。线上凭据通过Cloudflare Secret配置。

## 当前验证边界

Cloudflare部署成功、OAuth权限已确认。当前网络对workers.dev解析异常/连接失败，线上HTTP端到端验收未通过。**本机Worker运行时＋真实Amazon S3** 完成7项验收：中英页面、匿名上传拦截、站主登录、伪PDF拒绝、PDF上传与匿名下载字节一致、文件清单持久化。另有9项自动测试通过，桌面/手机视觉检查无页面脚本错误。

尚未验证：真实亚马逊提交、24小时后复测、接近10MB复杂PDF在Cloudflare生产CPU限额内的表现。Worker免费CPU限额可能影响复杂PDF；不要为此擅自升级付费套餐，应先观察实际运行结果。文件10MB是产品上限，不是对任意复杂PDF处理性能的承诺。

## 本机操作

需要Node与Wrangler。

```powershell
npm install
node scripts/build-pages.mjs
npm test
wrangler d1 migrations apply seller-pdf-links-db --local
wrangler dev --local --ip 127.0.0.1 --port 8787
```

本机配置由受忽略的 `.dev.vars` 提供。执行已有 `.local` 脚本可能读取真实服务，先阅读用途；不要运行 `scripts/inspect-existing.mjs` 来创建新的公开配置文件。

## 架构与决策修订

已确认旧桶已有整桶公开GetObject策略，因此首版采用已有S3文件URL，未添加CloudFront、未改变桶权限。为避免无效文件通过公开暂存前缀暴露，文件先经过受保护Worker校验，再发布到S3。上传队列串行，每文件最多10,000,000字节。这个方案相比草案的浏览器直传更适合当前已有资源；大批量和大文件未来可改为独立私有暂存桶直传。

元数据和容量在D1持久化；站主密码登录，12小时HttpOnly会话；上传/删除/清单需鉴权。1GB总容量、暂停上传开关；删除对并发请求使用状态锁，已发布文件没有到期计划。S3响应是PDF及attachment，原文件保持不变。

文件就绪代表技术检查通过，不等于Amazon审核通过。网页域名与S3文件URL独立；域名或网页运行问题不必然使S3链接失效。账户/资源必须持续正常。

## 验证与部署

```powershell
npm test
node scripts/visual-check.mjs
$env:TEST_BASE='http://127.0.0.1:8787'
node scripts/smoke-test.mjs
wrangler deploy
```

`smoke-test`会在指定环境创建一份无敏感信息的测试PDF并保留。记录在 `.local/smoke-results.json`；默认测试线上，指定TEST_BASE才测本机。

秘密配置与站主密码已注入新Worker。再次部署不需要在源码写入秘密。
