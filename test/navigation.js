document.addEventListener("DOMContentLoaded", () => {
  const folderList = document.getElementById("folder-list");
  const bookmarkDisplay = document.getElementById("bookmark-display");
  const searchInput = document.getElementById("search");
  const divider = document.getElementById("divider");
  let allBookmarks = [];

  // 处理文件夹的展开/收起，左侧不收缩
  function renderFolders(bookmarks, parentElement) {
    bookmarks.forEach((bookmark) => {
      if (bookmark.children) {
        const folderElement = document.createElement("div");
        folderElement.classList.add("folder");
        folderElement.textContent = bookmark.title || "未命名文件夹";

        const sublist = document.createElement("ul");
        renderFolders(bookmark.children, sublist);

        folderElement.appendChild(sublist);
        parentElement.appendChild(folderElement);

        folderElement.addEventListener("click", (event) => {
          event.stopPropagation();
          // 展示对应文件夹内的书签
          displayBookmarks(bookmark.children);
        });
      } else {
        const item = document.createElement("div");
        item.classList.add("bookmark-item");

        const link = document.createElement("a");
        link.href = bookmark.url;
        link.target = "_blank";
        link.textContent = bookmark.title;

        item.appendChild(link);
        parentElement.appendChild(item);
      }
    });
  }

  // 展示右侧书签
  function displayBookmarks(bookmarks) {
    bookmarkDisplay.innerHTML = ""; // 清空当前内容

    bookmarks.forEach((bookmark) => {
      if (bookmark.url) {
        const item = document.createElement("div");
        item.classList.add("bookmark-item");

        // 上部分：加粗显示标题
        const title = document.createElement("div");
        title.classList.add("bookmark-title");
        title.textContent = bookmark.title;

        // 下部分：显示网址，并加上地球标志
        const urlContainer = document.createElement("div");
        urlContainer.classList.add("bookmark-url");

        const earthIcon = document.createElement("span");
        earthIcon.textContent = "🌍";  // 地球符号
        earthIcon.classList.add("earth-icon");

        const url = document.createElement("a");
        url.href = bookmark.url;
        url.target = "_blank";
        url.textContent = bookmark.url;

        urlContainer.appendChild(earthIcon);
        urlContainer.appendChild(url);

        item.appendChild(title);
        item.appendChild(urlContainer);
        bookmarkDisplay.appendChild(item);
      }
    });
  }

  // 搜索书签
  function searchBookmarks(query, bookmarks) {
    return bookmarks.filter((bookmark) => {
      if (bookmark.url && (bookmark.title.toLowerCase().includes(query.toLowerCase()) || bookmark.url.toLowerCase().includes(query.toLowerCase()))) {
        return true;
      } else if (bookmark.children) {
        const children = searchBookmarks(query, bookmark.children);
        return children.length > 0;
      }
      return false;
    });
  }

  // 获取书签数据
  chrome.bookmarks.getTree((bookmarks) => {
    allBookmarks = bookmarks;
    renderFolders(bookmarks, folderList);

    // 搜索框监听
    searchInput.addEventListener("input", (event) => {
      const query = event.target.value.trim();
      const filtered = searchBookmarks(query, allBookmarks);
      folderList.innerHTML = "";  // 清空文件夹列表
      renderFolders(filtered, folderList);
    });
  });

  // 分割线拖动调整左侧宽度
  let isResizing = false;

  divider.addEventListener("mousedown", (e) => {
    isResizing = true;
    document.body.style.cursor = "ew-resize";
  });

  document.addEventListener("mousemove", (e) => {
    if (isResizing) {
      const newWidth = e.clientX;
      const minWidth = 200; // 最小宽度
      const maxWidth = 500; // 最大宽度
      if (newWidth > minWidth && newWidth < maxWidth) {
        folderList.style.width = `${newWidth}px`;
      }
    }
  });

  document.addEventListener("mouseup", () => {
    isResizing = false;
    document.body.style.cursor = "default";
  });
});
