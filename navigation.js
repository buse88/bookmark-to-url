document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.getElementById("search");
    const bookmarkList = document.getElementById("bookmark-list");
    const openNavigationButton = document.getElementById("open-navigation");

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

    // 检查是否具有书签权限
    if (chrome.bookmarks) {
        chrome.bookmarks.getTree((bookmarks) => {
            renderBookmarks(bookmarks, bookmarkList);

            // 监听搜索输入
            searchInput.addEventListener("input", (event) => {
                const query = event.target.value;
                const filtered = searchBookmarks(query, bookmarks);
                renderBookmarks(filtered, bookmarkList);
            });
        });
    } else {
        console.error("缺少书签权限，请在 manifest.json 中声明 'bookmarks' 权限。");
    }

    // 打开导航页面
    openNavigationButton.addEventListener("click", () => {
        chrome.tabs.create({ url: chrome.runtime.getURL("navigation.html") });
    });
});
