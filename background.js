// 监听扩展的安装事件
chrome.runtime.onInstalled.addListener(() => {
  console.log("扩展已安装！");
});

// 监听书签的创建事件
chrome.bookmarks.onCreated.addListener((id, bookmark) => {
  console.log("新书签创建：", bookmark);
});
