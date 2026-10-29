/**
 * 單字練習本 — Google Apps Script 網頁應用程式
 * 練習紀錄存在這個專案的「指令碼屬性」裡，手機和電腦共用同一份進度。
 */

function doGet() {
  return HtmlService.createTemplateFromFile('Index')
    .evaluate()
    .setTitle('單字練習本')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1, viewport-fit=cover')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/** 讓 Index.html 載入 Words.html 的單字資料 */
function include(name) {
  return HtmlService.createHtmlOutputFromFile(name).getContent();
}

// 每個屬性值上限約 9KB，所以把資料切成小段存
const CHUNK = 2800;

/** 讀取雲端進度，回傳 JSON 字串；沒有資料時回傳 null */
function loadStore() {
  const props = PropertiesService.getScriptProperties();
  const n = Number(props.getProperty('store_n') || 0);
  if (!n) return null;
  const all = props.getProperties();
  let s = '';
  for (let i = 0; i < n; i++) s += all['store_' + i] || '';
  return s;
}

/** 儲存進度（JSON 字串） */
function saveStore(json) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const props = PropertiesService.getScriptProperties();
    const oldN = Number(props.getProperty('store_n') || 0);
    const parts = {};
    let n = 0;
    for (let i = 0; i < json.length; i += CHUNK) parts['store_' + (n++)] = json.slice(i, i + CHUNK);
    parts['store_n'] = String(n);
    props.setProperties(parts);
    for (let i = n; i < oldN; i++) props.deleteProperty('store_' + i);
    return new Date().toISOString();
  } finally {
    lock.releaseLock();
  }
}
