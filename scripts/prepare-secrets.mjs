import fs from 'node:fs/promises';
import {randomBytes} from 'node:crypto';
const config=JSON.parse(await fs.readFile('.local/aws-config.json','utf8'));
const path='.local/deploy-secrets.json';let existing;
try{existing=JSON.parse(await fs.readFile(path,'utf8'));}catch{}
const secrets=existing||{AWS_ACCESS_KEY_ID:config.AWS_ACCESS_KEY_ID,AWS_SECRET_ACCESS_KEY:config.AWS_SECRET_ACCESS_KEY,UPLOAD_CODE:process.env.UPLOAD_CODE||randomBytes(9).toString('base64url'),SESSION_SECRET:randomBytes(32).toString('hex')};
await fs.writeFile(path,JSON.stringify(secrets),{mode:0o600});
await fs.writeFile('.local/站主登录信息.txt',`上传限额口令：${secrets.UPLOAD_CODE}\n\n仅保存在本机，请勿上传GitHub或公开分享。\nAWS密钥未写入此文件。\n`,{mode:0o600});
const css=await fs.readFile('public/assets/style.css','utf8');await fs.writeFile('public/assets/style.css',css.replace("@import url('');\n",''));
console.log('Prepared backend secrets privately. Owner login details saved locally.');
