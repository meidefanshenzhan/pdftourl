// main.js
// 适合初中生理解的详细注释

// =====================
// 多语言文本配置
// =====================
const LANGS = {
    en: {
        title: 'File to URL',
        uploadTitle: 'Upload your files',
        dropText: 'Drag & drop files here or click to select',
        selectFiles: 'Select Files',
        uploading: 'Uploading...',
        uploadHistory: 'Upload History',
        copy: 'Copy',
        copied: 'Copied!',
        delete: 'Delete',
        expired: 'Expired',
        expiresIn: 'Expires in',
        days: 'days',
        hours: 'hours',
        minutes: 'minutes',
        seconds: 'seconds',
        error: 'Upload failed, please try again.',
        noHistory: 'No upload history yet.',
        lineLabel: 'Line:'
    },
    zh: {
        title: '文件转链接',
        uploadTitle: '上传你的文件',
        dropText: '拖拽文件到此或点击选择',
        selectFiles: '选择文件',
        uploading: '正在上传...',
        uploadHistory: '上传历史',
        copy: '复制',
        copied: '已复制!',
        delete: '删除',
        expired: '已过期',
        expiresIn: '剩余',
        days: '天',
        hours: '小时',
        minutes: '分钟',
        seconds: '秒',
        error: '上传失败，请重试。',
        noHistory: '暂无上传历史。',
        lineLabel: '线路：'
    }
};
let currentLang = 'en';

// =====================
// 线路切换配置
// =====================
const LINES = [
    {
        id: 1,
        name: { en: 'Line 1', zh: '线路1' },
        service: 'filebin',
        upload: uploadToFilebin
    },
    {
        id: 2,
        name: { en: 'Line 2', zh: '线路2' },
        service: 'transfersh',
        upload: uploadToTransferSh
    },
    {
        id: 3,
        name: { en: 'Line 3', zh: '线路3' },
        service: 'fileio',
        upload: uploadToFileio
    }
];
let currentLine = 0; // 默认线路1

// =====================
// DOM 元素获取
// =====================
const siteTitle = document.getElementById('site-title');
const uploadTitle = document.getElementById('upload-title');
const dropText = document.getElementById('drop-text');
const selectFilesBtn = document.getElementById('select-files');
const fileInput = document.getElementById('file-input');
const dropArea = document.getElementById('drop-area');
const uploadProgress = document.getElementById('upload-progress');
const errorMessage = document.getElementById('error-message');
const historyList = document.getElementById('history-list');
const historyTitle = document.getElementById('history-title');
const langEnBtn = document.getElementById('lang-en');
const langZhBtn = document.getElementById('lang-zh');

// 获取线路按钮
const lineBtns = [
    document.getElementById('line-1'),
    document.getElementById('line-2'),
    document.getElementById('line-3')
];
const lineLabel = document.getElementById('line-label');

// =====================
// 历史记录本地存储结构
// =====================
// 每条记录: { filename, url, uploadTime, expireTime, line }
function getHistory() {
    return JSON.parse(localStorage.getItem('uploadHistory') || '[]');
}
function setHistory(arr) {
    localStorage.setItem('uploadHistory', JSON.stringify(arr));
}

// =====================
// 语言切换逻辑
// =====================
function setLang(lang) {
    currentLang = lang;
    // 切换按钮高亮
    langEnBtn.classList.toggle('active', lang === 'en');
    langZhBtn.classList.toggle('active', lang === 'zh');
    // 替换所有文本
    siteTitle.textContent = LANGS[lang].title;
    uploadTitle.textContent = LANGS[lang].uploadTitle;
    dropText.textContent = LANGS[lang].dropText;
    selectFilesBtn.textContent = LANGS[lang].selectFiles;
    historyTitle.textContent = LANGS[lang].uploadHistory;
    renderLineLabel();
    renderHistory();
}
langEnBtn.onclick = () => setLang('en');
langZhBtn.onclick = () => setLang('zh');

// 线路切换逻辑
lineBtns.forEach((btn, idx) => {
    btn.onclick = () => {
        currentLine = idx;
        lineBtns.forEach((b, i) => b.classList.toggle('active', i === idx));
        renderLineLabel();
    };
});
function renderLineLabel() {
    lineLabel.textContent = LANGS[currentLang].lineLabel;
    lineBtns.forEach((btn, idx) => {
        btn.textContent = LINES[idx].name[currentLang];
    });
}

// =====================
// 文件选择与拖拽上传
// =====================
selectFilesBtn.onclick = () => fileInput.click();
dropArea.onclick = (e) => {
    // 避免点击按钮时重复触发
    if (e.target === selectFilesBtn) return;
    fileInput.click();
};
fileInput.onchange = (e) => {
    if (fileInput.files.length) handleFiles(fileInput.files);
};
// 拖拽事件
['dragenter', 'dragover'].forEach(evt => {
    dropArea.addEventListener(evt, e => {
        e.preventDefault();
        dropArea.style.borderColor = '#0071e3';
    });
});
['dragleave', 'drop'].forEach(evt => {
    dropArea.addEventListener(evt, e => {
        e.preventDefault();
        dropArea.style.borderColor = '#cfd8dc';
    });
});
dropArea.addEventListener('drop', e => {
    if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files);
});

// =====================
// 处理文件上传
// =====================
function handleFiles(fileList) {
    errorMessage.textContent = '';
    const files = Array.from(fileList);
    if (!files.length) return;
    uploadProgress.style.display = 'block';
    uploadProgress.innerHTML = '';
    files.forEach((file, idx) => {
        const bar = document.createElement('div');
        bar.className = 'upload-progress-bar';
        bar.style.width = '0%';
        uploadProgress.appendChild(bar);
        // 根据当前线路调用不同上传函数
        LINES[currentLine].upload(file, bar, idx, files.length);
    });
}

// =====================
// 各线路上传实现
// =====================
// 线路1：filebin.net
function uploadToFilebin(file, bar, idx, total) {
    const formData = new FormData();
    formData.append('file', file);
    bar.style.width = '0%';
    const xhr = new XMLHttpRequest();
    xhr.open('POST', 'https://filebin.net/', true);
    xhr.upload.onprogress = function(e) {
        if (e.lengthComputable) {
            const percent = Math.round((e.loaded / e.total) * 100);
            bar.style.width = percent + '%';
        }
    };
    xhr.onload = function() {
        bar.style.width = '100%';
        if (xhr.status === 200) {
            try {
                const binId = xhr.responseURL.split('/').pop();
                const url = `https://filebin.net/${binId}/${encodeURIComponent(file.name)}`;
                saveHistory(file.name, url, 1);
                renderHistory();
            } catch {
                errorMessage.textContent = LANGS[currentLang].error;
            }
        } else {
            errorMessage.textContent = LANGS[currentLang].error;
        }
        if (idx === total - 1) {
            setTimeout(() => { uploadProgress.style.display = 'none'; uploadProgress.innerHTML = ''; }, 800);
        }
    };
    xhr.onerror = function() {
        errorMessage.textContent = LANGS[currentLang].error;
        if (idx === total - 1) {
            setTimeout(() => { uploadProgress.style.display = 'none'; uploadProgress.innerHTML = ''; }, 800);
        }
    };
    xhr.send(formData);
}
// 线路2：transfer.sh
function uploadToTransferSh(file, bar, idx, total) {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', `https://transfer.sh/${encodeURIComponent(file.name)}`, true);
    xhr.upload.onprogress = function(e) {
        if (e.lengthComputable) {
            const percent = Math.round((e.loaded / e.total) * 100);
            bar.style.width = percent + '%';
        }
    };
    xhr.onload = function() {
        bar.style.width = '100%';
        if (xhr.status === 200) {
            const url = xhr.responseText.trim();
            saveHistory(file.name, url, 2);
            renderHistory();
        } else {
            errorMessage.textContent = LANGS[currentLang].error;
        }
        if (idx === total - 1) {
            setTimeout(() => { uploadProgress.style.display = 'none'; uploadProgress.innerHTML = ''; }, 800);
        }
    };
    xhr.onerror = function() {
        errorMessage.textContent = LANGS[currentLang].error;
        if (idx === total - 1) {
            setTimeout(() => { uploadProgress.style.display = 'none'; uploadProgress.innerHTML = ''; }, 800);
        }
    };
    xhr.send(file);
}
// 线路3：file.io
function uploadToFileio(file, bar, idx, total) {
    const formData = new FormData();
    formData.append('file', file);
    bar.style.width = '0%';
    const xhr = new XMLHttpRequest();
    xhr.open('POST', 'https://file.io/?expires=7d', true);
    xhr.upload.onprogress = function(e) {
        if (e.lengthComputable) {
            const percent = Math.round((e.loaded / e.total) * 100);
            bar.style.width = percent + '%';
        }
    };
    xhr.onload = function() {
        bar.style.width = '100%';
        if (xhr.status === 200) {
            try {
                const res = JSON.parse(xhr.responseText);
                if (res.success && res.link) {
                    saveHistory(file.name, res.link, 3);
                    renderHistory();
                } else {
                    errorMessage.textContent = LANGS[currentLang].error;
                }
            } catch {
                errorMessage.textContent = LANGS[currentLang].error;
            }
        } else {
            errorMessage.textContent = LANGS[currentLang].error;
        }
        if (idx === total - 1) {
            setTimeout(() => { uploadProgress.style.display = 'none'; uploadProgress.innerHTML = ''; }, 800);
        }
    };
    xhr.onerror = function() {
        errorMessage.textContent = LANGS[currentLang].error;
        if (idx === total - 1) {
            setTimeout(() => { uploadProgress.style.display = 'none'; uploadProgress.innerHTML = ''; }, 800);
        }
    };
    xhr.send(formData);
}

// =====================
// 保存和渲染历史记录
// =====================
function saveHistory(filename, url, line) {
    const now = Date.now();
    const expire = now + 7 * 24 * 60 * 60 * 1000; // 7天后过期
    const arr = getHistory();
    arr.unshift({ filename, url, uploadTime: now, expireTime: expire, line });
    setHistory(arr);
}

function renderHistory() {
    const arr = getHistory();
    // 自动刷新过期状态，移除已过期项
    const now = Date.now();
    let changed = false;
    for (let i = arr.length - 1; i >= 0; i--) {
        if (arr[i].expireTime < now) {
            arr.splice(i, 1);
            changed = true;
        }
    }
    if (changed) setHistory(arr);
    // 渲染
    historyList.innerHTML = '';
    if (!arr.length) {
        const li = document.createElement('li');
        li.textContent = LANGS[currentLang].noHistory;
        li.style.color = '#888';
        historyList.appendChild(li);
        return;
    }
    arr.forEach((item, idx) => {
        const li = document.createElement('li');
        li.className = 'history-item';
        // 文件名
        const name = document.createElement('span');
        name.className = 'history-filename';
        name.textContent = item.filename;
        li.appendChild(name);
        // 链接
        const url = document.createElement('a');
        url.className = 'history-url';
        url.href = item.url;
        url.target = '_blank';
        url.rel = 'noopener';
        url.textContent = item.url;
        li.appendChild(url);
        // 线路名
        const lineTag = document.createElement('span');
        lineTag.className = 'history-line';
        lineTag.textContent = LINES[(item.line || 1) - 1].name[currentLang];
        lineTag.style.marginLeft = '8px';
        lineTag.style.fontSize = '0.95rem';
        lineTag.style.color = '#0071e3';
        li.appendChild(lineTag);
        // 剩余时间
        const expire = document.createElement('span');
        expire.className = 'history-expire';
        const left = item.expireTime - Date.now();
        if (left > 0) {
            expire.textContent = `${LANGS[currentLang].expiresIn} ${formatLeft(left)}`;
        } else {
            expire.textContent = LANGS[currentLang].expired;
        }
        li.appendChild(expire);
        // 操作按钮
        const actions = document.createElement('div');
        actions.className = 'history-actions';
        // 复制按钮
        const copyBtn = document.createElement('button');
        copyBtn.className = 'copy-btn';
        copyBtn.textContent = LANGS[currentLang].copy;
        copyBtn.onclick = () => {
            navigator.clipboard.writeText(item.url).then(() => {
                copyBtn.textContent = LANGS[currentLang].copied;
                setTimeout(() => { copyBtn.textContent = LANGS[currentLang].copy; }, 1200);
            });
        };
        actions.appendChild(copyBtn);
        // 删除按钮
        const delBtn = document.createElement('button');
        delBtn.className = 'delete-btn';
        delBtn.textContent = LANGS[currentLang].delete;
        delBtn.onclick = () => {
            arr.splice(idx, 1);
            setHistory(arr);
            renderHistory();
        };
        actions.appendChild(delBtn);
        li.appendChild(actions);
        historyList.appendChild(li);
    });
}

// 格式化剩余时间
function formatLeft(ms) {
    let s = Math.floor(ms / 1000);
    const d = Math.floor(s / 86400); s %= 86400;
    const h = Math.floor(s / 3600); s %= 3600;
    const m = Math.floor(s / 60); s %= 60;
    let str = '';
    if (d) str += d + LANGS[currentLang].days + ' ';
    if (h) str += h + LANGS[currentLang].hours + ' ';
    if (m) str += m + LANGS[currentLang].minutes + ' ';
    if (s && !d) str += s + LANGS[currentLang].seconds;
    return str.trim();
}

// =====================
// 定时自动刷新过期状态
// =====================
setInterval(renderHistory, 60 * 1000); // 每分钟刷新一次
window.onload = () => {
    setLang(currentLang);
    renderHistory();
}; 