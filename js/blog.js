"use strict";

$(function () {

    // ==============================
    // ▼ 戻る対策（bfcache対応）
    // ==============================

    function closeFilterInstant() {
        $filter.removeClass('is-open');
    }

    // ==============================
    // ▼ 戻る・進む時の初期化処理
    // ==============================

    window.addEventListener("pageshow", function (event) {
        if (event.persisted) {
        closeFilterInstant();
        window.scrollTo(0, 0);
        }
    });

    // ==============================
    // ▼ フィルターUI
    // ==============================

    // ドロップダウン開閉
    $('.filter-toggle').on('click', function () {
        $(this).closest('.filter-buttons').toggleClass('is-open');
    });

    // ドロップダウン内クリック
    $(document).on('click', '.filter-year-group .filter-btn', function () {

        const filter = $(this).data('filter');

        // ★ year変更時は page=1 に戻す
        let url = "?";

        if (filter !== "all") {
        url += `year=${filter}&`;
        }

        url += "page=1";

        window.location.href = url;
    });

    // 外側クリックで閉じる
    const $filter = $('.filter-buttons');

    $(document).on('click', function (e) {
        if (!$(e.target).closest($filter).length) {
        $filter.removeClass('is-open');
        }
    });

    // ==============================
    // ▼ 設定
    // ==============================

    const perPage = 9; // 1ページあたり件数

    let currentFiltered = [];
    let currentPageSafe = 1;
    let currentYear = "all";

    function getParams() {
        const params = new URLSearchParams(window.location.search);
        return {
        page: parseInt(params.get("page")) || 1,
        year: params.get("year") || "all"
        };
    }

    function formatDate(dateStr) {
        const d = new Date(dateStr);
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        return `${y}.${m}.${day}`;
    }

    // ==============================
    // ▼ 記事描画
    // ==============================

    function renderPage(data, page) {

        const $blog = $(".blog");
        const $noArticle = $(".no-article");

        $blog.empty();
        $noArticle.hide(); // ← 毎回いったん隠す

        // ★ 記事が0件ならメッセージだけ表示
        if (data.length === 0) {
        $noArticle.show();
        return;
        }

        const start = (page - 1) * perPage;
        const end = start + perPage;
        const items = data.slice(start, end);

        items.forEach(item => {
        $blog.append(`
            <div class="blog-card">
            <a href="${item.url}">
                <div class="card-inner">
                <img src="${item.thumbnail}" class="thumbnail" alt="サムネイル">
                <div class="article-header">
                    <time class="date" datetime="${item.date}">
                    ${formatDate(item.date)}
                    </time>
                    <h3 class="title">${item.title}</h3>
                </div>
                </div>
            </a>
            </div>
        `);
        });
    }

    // ==============================
    // ▼ 年フィルター自動生成（件数つき）
    // ==============================

    function renderYearFilter(data, currentYear) {

    const $group = $(".filter-year-group");
    $group.empty();

    // ★ 年ごとの件数をカウント
    const yearCounts = {};

    data.forEach(item => {
        const year = new Date(item.date).getFullYear();
        yearCounts[year] = (yearCounts[year] || 0) + 1;
    });

    // ★ 年一覧（新しい順）
    const years = Object.keys(yearCounts)
        .map(y => parseInt(y))
        .sort((a, b) => b - a);

    // ★ 「すべての記事」
    $group.append(`
        <button class="filter-btn ${currentYear === "all" ? "active" : ""}" data-filter="all">
        すべての記事（${data.length}）
        </button>
    `);

    // ★ 各年ボタン生成（件数つき）
    years.forEach(year => {
        $group.append(`
        <button class="filter-btn ${currentYear == year ? "active" : ""}" data-filter="${year}">
            ${year}年（${yearCounts[year]}）
        </button>
        `);
    });

    // ==============================
    // ▼ トグルラベル更新
    // ==============================

        const $label = $(".filter-toggle .filter-label");

        if (currentYear === "all") {
        $label.text("すべての記事");
        } else {
        $label.text(`${currentYear}年`);
        }
    }

    // ==============================
    // ▼ ページネーション（中央固定）
    // ==============================

    function renderPagination(totalItems, currentPage, year) {

        const totalPages = Math.ceil(totalItems / perPage);
        const $pagination = $(".pagination-buttons");
        const $info = $(".pagination-info");

        $pagination.empty();

        // ★ 記事が0件なら何も表示しない
        if (totalItems === 0) {
            $info.empty();
            $(".pagination").hide();
        return;
        } else {
            $(".pagination").show();
        }

        const numberSlots = window.innerWidth >= 540 ? 5 : 3;

        $info.text(`全 ${totalPages} ページ中 ${currentPage} ページ目`);

        if (totalPages <= 1) return;

        function createLink(page, label = page, isActive = false, isDisabled = false) {

        let url = "?";
        if (year !== "all") {
            url += `year=${year}&`;
        }
        url += `page=${page}`;

        if (isDisabled) {
            return `<span class="pagination-btn disabled">${label}</span>`;
        }

        const activeClass = isActive ? "active" : "";
        return `<a href="${url}" class="pagination-btn ${activeClass}">${label}</a>`;
        }

        // Prev
        if (currentPage > 1) {
        $pagination.append(createLink(currentPage - 1, '<span class="prev"></span>'));
        } else {
        $pagination.append(createLink(1, '<span class="prev"></span>', false, true));
        }

        let offset = Math.floor(numberSlots / 2);
        let startPage = currentPage - offset;
        let endPage = startPage + numberSlots - 1;

        if (startPage < 1) {
        startPage = 1;
        endPage = Math.min(numberSlots, totalPages);
        }

        if (endPage > totalPages) {
        endPage = totalPages;
        startPage = Math.max(1, totalPages - numberSlots + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
        $pagination.append(createLink(i, i, i === currentPage));
        }

        // Next
        if (currentPage < totalPages) {
        $pagination.append(createLink(currentPage + 1, '<span class="next"></span>'));
        } else {
        $pagination.append(createLink(totalPages, '<span class="next"></span>', false, true));
        }
    }

    // ==============================
    // ▼ データ取得
    // ==============================

    const { page, year } = getParams();
    currentYear = year;

    $.getJSON("/json/blog.json", function(data) {

        data.sort((a, b) => new Date(b.date) - new Date(a.date));

        // ★ 年フィルター自動生成
        renderYearFilter(data, year);

        let filtered = data;

        if (year !== "all") {
        filtered = data.filter(item =>
            new Date(item.date).getFullYear() == year
        );
        }

        const totalPages = Math.ceil(filtered.length / perPage);
        const safePage = page > totalPages ? 1 : page;

        currentFiltered = filtered;
        currentPageSafe = safePage;

        renderPage(filtered, safePage);
        renderPagination(filtered.length, safePage, year);

    });

    // ==============================
    // ▼ リサイズ時再描画
    // ==============================

    $(window).on("resize", function() {
        if (currentFiltered.length > 0) {
        renderPagination(currentFiltered.length, currentPageSafe, currentYear);
        }
    });

});


/* 記述確認・挙動確認OKです！（2026.2.23-17:37） */
