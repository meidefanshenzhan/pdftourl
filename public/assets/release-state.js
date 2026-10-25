export const READ_KEY='kjamz.updates.read.v1';
export function unread(storage,release){if(!release)return false;try{return storage.getItem(READ_KEY)!==release;}catch{return false;}}
export function markRead(storage,release){if(!release)return false;try{storage.setItem(READ_KEY,release);return true;}catch{return false;}}
