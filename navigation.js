document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("search");
  const bookmarkList = document.getElementById("bookmark-list");
  const openNavigationButton = document.getElementById("open-navigation");
  const toggleFoldersButton = document.getElementById("toggle-folders");

  let areFoldersVisible = true; // 标志当前文件夹是否可见

  // 先渲染书签列表为空
  bookmarkList.innerHTML = '<li>加载书签...</li>';

  // 渲染书签列表
  function renderBookmarks(bookmarks, parentElement) {
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
      } else {
        // 如果是文件夹，并且文件夹没有标题为 "未命名文件夹"，继续渲染
        if (bookmark.title !== "未命名文件夹") {
          const folderTitle = document.createElement("div");
          folderTitle.textContent = bookmark.title || "未命名文件夹";
          folderTitle.classList.add("folder-title");

          // 创建一个容器ul，保存文件夹内部书签
          const ul = document.createElement("ul");
          renderBookmarks(bookmark.children, ul);

          // 默认显示文件夹内容
          ul.classList.add("folder-content");

          // 监听点击事件，切换文件夹的展开与收起
          folderTitle.addEventListener("click", () => {
            ul.classList.toggle("folder-collapsed"); // 切换文件夹显示状态
          });

          li.appendChild(folderTitle);
          li.appendChild(ul); // 把文件夹内容添加到文件夹元素下
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

  // 切换所有文件夹的显示状态
  toggleFoldersButton.addEventListener("click", () => {
    areFoldersVisible = !areFoldersVisible;

    // 查找所有文件夹内容的ul元素
    const allFolderContents = document.querySelectorAll(".folder-content");

    allFolderContents.forEach((ul) => {
      if (areFoldersVisible) {
        ul.classList.remove("folder-collapsed"); // 展开文件夹
      } else {
        ul.classList.add("folder-collapsed"); // 收起文件夹
      }
    });
  });
});
