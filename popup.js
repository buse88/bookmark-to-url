document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("search");
  const bookmarkList = document.getElementById("bookmark-list");
  const openNavigationButton = document.getElementById("open-navigation");

  // 渲染书签列表
  function renderBookmarks(bookmarks, parentElement) {
    parentElement.innerHTML = ""; // 清空列表
    bookmarks.forEach((bookmark) => {
      const li = document.createElement("li");

      if (bookmark.url) {
        const a = document.createElement("a");
        a.textContent = bookmark.title;
        a.href = bookmark.url;
        a.target = "_blank";
        li.appendChild(a);
      } else {
        const folderTitle = document.createElement("span");
        folderTitle.textContent = bookmark.title || "未命名文件夹";
        li.appendChild(folderTitle);

        if (bookmark.children) {
          const ul = document.createElement("ul");
          renderBookmarks(bookmark.children, ul);
          li.appendChild(ul);
        }
      }

      parentElement.appendChild(li);
    });
  }

  // 搜索书签
  function searchBookmarks(query, bookmarks) {
    const filtered = [];
    bookmarks.forEach((bookmark) => {
      if (
        bookmark.url &&
        (bookmark.title.toLowerCase().includes(query.toLowerCase()) ||
          bookmark.url.toLowerCase().includes(query.toLowerCase()))
      ) {
        filtered.push(bookmark);
      } else if (bookmark.children) {
        const children = searchBookmarks(query, bookmark.children);
        if (children.length > 0) {
          filtered.push({
            title: bookmark.title,
            children: children,
          });
        }
      }
    });
    return filtered;
  }

  // 获取所有书签
  chrome.bookmarks.getTree((bookmarks) => {
    renderBookmarks(bookmarks, bookmarkList);

    // 监听搜索输入
    searchInput.addEventListener("input", (event) => {
      const query = event.target.value;
      const filtered = searchBookmarks(query, bookmarks);
      renderBookmarks(filtered, bookmarkList);
    });
  });

  // 打开导航页面
  openNavigationButton.addEventListener("click", () => {
    chrome.tabs.create({ url: chrome.runtime.getURL("navigation.html") });
  });
});
