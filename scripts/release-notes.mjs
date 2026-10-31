// Add actual shipped changes here, newest first. Dates are publication dates.
export const releaseNotes=[{
 date:'2026-10-31',version:'1.8.0',id:'2026-10-31-keyword-coverage',
 zh:{title:'Listing 关键词覆盖检查上线',items:[{text:'对照目标词表检查标题、五点、详情和后台搜索词，支持短语／同字段全部词匹配、遗漏词筛选、高亮预览及 CSV / TXT 导出。',path:'keyword-coverage-checker/'}]},
 en:{title:'Listing Keyword Coverage Checker launched',items:[{text:'Check target keywords against title, bullets, description and backend terms, with phrase or same-field all-word matching, missing-keyword filters, highlights and CSV / TXT exports.',path:'keyword-coverage-checker/'}]}
},{
 date:'2026-10-31',version:'1.7.0',id:'2026-10-31-image-compressor',
 zh:{title:'批量图片压缩上线',items:[{text:'本地批量处理 JPG、PNG、WebP，调节画质与最长边，预览处理前后体积，支持单张下载与 ZIP 打包。',path:'image-compressor/'}]},
 en:{title:'Image Compressor launched',items:[{text:'Batch process JPG, PNG and WebP locally, adjust quality and maximum dimensions, compare file sizes and download individually or as a ZIP.',path:'image-compressor/'}]}
},{
 date:'2026-10-31',version:'1.6.0',id:'2026-10-31-keyword-filter',
 zh:{title:'关键词过滤工具上线',items:[{text:'删除指定词与短语，或按关键词保留、排除整行；支持大小写、整词及任意词／全部词匹配，提供 TXT / CSV 导出。',path:'remove-words-from-text/'}]},
 en:{title:'Keyword Filter launched',items:[{text:'Remove specific words and phrases, or keep and exclude matching lines, with case, whole-word and any/all options plus TXT / CSV exports.',path:'remove-words-from-text/'}]}
},{
 date:'2026-10-31',version:'1.5.3',id:'2026-10-31-subtitle-ai-budget',
 zh:{title:'字幕处理加入预算暂停保护',items:[{text:'识别和翻译先预留处理额度，额度不足时暂停新任务，密令也不能绕过；已有字幕的编辑和视频导出保持可用。',path:'auto-subtitles/'}]},
 en:{title:'Subtitle processing budget protection',items:[{text:'Transcription and translation reserve processing capacity before each call. New jobs pause when capacity is insufficient, including access-code users; existing subtitle editing and video exports remain available.',path:'auto-subtitles/'}]}
},{
 date:'2026-10-31',version:'1.5.2',id:'2026-10-31-subtitle-access-code',
 zh:{title:'字幕工具支持密令解锁',items:[{text:'新增密令入口，可解锁 1 小时继续生成字幕；全站处理额度保护保留，更多使用需求可直接联系留言。',path:'auto-subtitles/'}]},
 en:{title:'Subtitle access codes added',items:[{text:'Unlock subtitle generation for one hour with an access code. Shared processing limits remain, with a contact link for additional usage requests.',path:'auto-subtitles/'}]}
},{
 date:'2026-10-31',version:'1.5.1',id:'2026-10-31-subtitled-video-export',
 zh:{title:'支持导出带字幕的视频',items:[{text:'可将编辑后的原文、译文或双语字幕合成进 MP4，保留视频画面和声音；纯音频支持生成纯色背景的字幕视频，提供进度和取消。',path:'auto-subtitles/'}]},
 en:{title:'Export videos with burned-in subtitles',items:[{text:'Render edited original, translated or bilingual captions into MP4 locally, keeping video frames and audio. Audio-only inputs get a solid background, with progress and cancellation.',path:'auto-subtitles/'}]}
},{
 date:'2026-10-31',version:'1.5.0',id:'2026-10-31-auto-subtitles',
 zh:{title:'自动字幕工具上线',items:[{text:'短视频自动识别带时间轴的字幕，可编辑文字与时间、翻译为所选语言，预览并导出原文、译文或双语 SRT / VTT。',path:'auto-subtitles/'}]},
 en:{title:'Auto Subtitles launched',items:[{text:'Generate timed subtitles for short videos, edit text and timings, translate to a selected language, preview and export original, translated or bilingual SRT / VTT.',path:'auto-subtitles/'}]}
},{
 date:'2026-10-29',version:'1.4.0',id:'2026-10-29-advertising-calculator',
 zh:{title:'广告盈亏计算器上线',items:[{text:'输入售价、单件费用与转化率，测算盈亏平衡 ACOS、CPC 上限和广告后利润，支持目标利润与导出。',path:'acos-calculator/'}]},
 en:{title:'Advertising Calculator launched',items:[{text:'Calculate break-even ACOS, CPC limits and profit after ads from unit costs and conversion rate, with profit targets and exports.',path:'acos-calculator/'}]}
},{
 date:'2026-10-28',version:'1.3.1',id:'2026-10-28-tool-bookmarks',
 zh:{title:'新增工具收藏',items:[{text:'页脚新增第三方工具收藏入口，方便随时打开常用外部工具。',path:'bookmarks/'}]},
 en:{title:'Tool bookmarks added',items:[{text:'A quiet footer link opens a collection of useful third-party tools.',path:'bookmarks/'}]}
},{
 date:'2026-10-28',version:'1.3.0',id:'2026-10-28-word-merge',
 zh:{title:'Word Merge 关键词组合上线',items:[{text:'批量组合两组或三组词表，支持顺序、连接符、前后缀、去重与 TXT / CSV 导出。',path:'word-merge/'}]},
 en:{title:'Word Merge launched',items:[{text:'Combine two or three word lists with order options, separators, affixes, deduplication and TXT / CSV exports.',path:'word-merge/'}]}
},{
 date:'2026-10-26',version:'1.2.2',id:'2026-10-26-quiet-updates',
 zh:{title:'轻量更新提示',items:[{text:'更新日志旁新增“有更新”标记；查看后自动标记已读，方便发现新工具与改进。',path:'changelog/'}]},
 en:{title:'Quiet update indicator',items:[{text:'A small New badge beside Changelog highlights updates and clears when you read them.',path:'changelog/'}]}
},{
 date:'2026-10-25',version:'1.2.1',id:'2026-10-25-site-update',
 zh:{title:'站点体验更新',items:[
  {text:'联系页统一为 KJAMZ，方便反馈各项工具的问题与建议。',path:'contact/'},
  {text:'新增更新日志，记录已上线的工具与体验改进。'}]},
 en:{title:'Site experience update',items:[
  {text:'A unified KJAMZ contact page for questions and suggestions about every tool.',path:'contact/'},
  {text:'A new changelog keeps track of shipped tools and improvements.'}]}
},{
 date:'2026-10-25',version:'1.2.0',id:'2026-10-25-text-dedupe',
 zh:{title:'文本去重上线',items:[
  {text:'按整行或单词删除重复项，支持大小写选项与 TXT / CSV 导出。',path:'remove-duplicates/'}]},
 en:{title:'Text Dedupe launched',items:[
  {text:'Remove duplicate lines or words, with case options and TXT / CSV exports.',path:'remove-duplicates/'}]}
},{
 date:'2026-10-25',version:'1.1.0',id:'2026-10-25-word-counter',
 zh:{title:'词频统计上线',items:[
  {text:'词频统计：实时查看字数、字符与完整词频，支持连续短语、筛选和导出。',path:'word-counter/'}]},
 en:{title:'Word Counter launched',items:[
  {text:'Word Counter: live word and character counts, complete keyword frequency, phrase filters and exports.',path:'word-counter/'}]}
},{
 date:'2026-10-21',version:'1.0.0',id:'2026-10-21-pdf-to-link',
 zh:{title:'PDF 转链接上线',items:[
  {text:'上传 PDF，生成可直接下载的文件链接，适用于卖家文档提交与日常分享。',path:'pdf-to-link/'},
  {text:'支持复制链接、查看访问状态与管理本浏览器生成的文件。'}]},
 en:{title:'PDF to Link launched',items:[
  {text:'Upload a PDF and generate a direct download link for seller documents and everyday sharing.',path:'pdf-to-link/'},
  {text:'Copy links, check access status and manage files created in this browser.'}]}
}];
