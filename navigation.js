document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("search");
  const bookmarkList = document.getElementById("bookmark-list");

  // 确保 bookmarkList 元素存在
  if (!bookmarkList) {
    console.error("Bookmark list container is missing.");
    return; // 如果容器不存在，停止执行后续代码
  }

  // 渲染书签列表
  function renderBookmarks(bookmarks, parentElement) {
    if (!Array.isArray(bookmarks)) {
      console.error("Invalid bookmarks array.");
      return;
    }

    parentElement.innerHTML = ""; // 清空列表

    bookmarks.forEach((bookmark) => {
      const li = document.createElement("li");
      li.classList.add("bookmark-item");

      if (bookmark.url) {
        // 如果是书签，创建链接
        const a = document.createElement("a");
        a.textContent = bookmark.title;
        a.href = bookmark.url;
        a.target = "_blank";
        a.classList.add("bookmark-link");
        li.appendChild(a);
      } else if (bookmark.children) {
        // 如果是文件夹，创建文件夹标题
        const folderTitle = document.createElement("div");
        folderTitle.textContent = bookmark.title || "未命名文件夹";
        folderTitle.classList.add("folder-title");

        // 默认展开所有文件夹
        const ul = document.createElement("ul");
        renderBookmarks(bookmark.children, ul);

        // 监听点击事件，切换文件夹的展开和收起
        folderTitle.addEventListener("click", () => {
          ul.classList.toggle("folder-collapsed");
        });

        li.appendChild(folderTitle);
        li.appendChild(ul);
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
    if (!bookmarks || bookmarks.length === 0) {
      console.error("No bookmarks found.");
      return;
    }
    renderBookmarks(bookmarks, bookmarkList);

    // 监听搜索输入
    searchInput.addEventListener("input", (event) => {
      const query = event.target.value.trim();
      const filtered = searchBookmarks(query, bookmarks);
      renderBookmarks(filtered, bookmarkList);
    });
  });
});
