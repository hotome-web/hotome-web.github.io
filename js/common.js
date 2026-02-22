"use strict";

$(function () {

    /* ---------------------------------
        ★ 環境ごとのルートパス設定
        ローカルでは localhost や LAN IP を基準
        GitHub Pages / 本番ではリポジトリ名を付与
        独自ドメインでもそのまま動く
    --------------------------------- */

    const repoName = "/hotome"; // GitHub Pages の場合のリポジトリ名
    const isLocal = location.hostname === "localhost" || location.hostname.startsWith("192.168.");
    const isGitHub = location.hostname.endsWith("github.io");

    // ローカル → "" / GitHub → "/hotome" / 独自ドメイン → ""
    const basePath = isLocal ? "" : (isGitHub ? repoName : "");

    /* ---------------------------------
        header / footer 読み込み
    --------------------------------- */

    $("#header").load(basePath + "/parts/header.html", function () {

        // ロゴリンク補正
        $(".logo a").attr("href", basePath + "/");

        /* ---------------------------------
            ★ ナビリンクに basePath を付与
        --------------------------------- */

        $(".g-nav a").each(function () {
            let href = $(this).attr("href");

            // http・https・# は除外
            if (/^(https?:|#)/.test(href)) return;

            // 先頭が / のときだけ basePath を付与
            if (href.startsWith("/")) {
                $(this).attr("href", basePath + href);
            }
        });

        /* ---------------------------------
            カレントページ判定
        --------------------------------- */

        const currentPath = location.pathname.replace(basePath, "");
        const segments = currentPath.split("/").filter(Boolean);
        const currentDir = segments.length === 0 ? "home" : segments[0];

        $(".g-nav a").each(function () {

            const href = $(this).attr("href");
            const linkPath = href.replace(basePath, "");
            const linkDir = linkPath === "/" ? "home" : linkPath.split("/").filter(Boolean)[0];

            if (currentDir === linkDir) {
                $(this).addClass("current");
            }

        });

        /* ---------------------------------
            ハンバーガーメニュー
            ※header読み込み後でないと動かない
        --------------------------------- */

        $(".hamburger-menu").on("click", function () {
            $(".hamburger-inner").toggleClass("active");
            $(".g-nav").toggleClass("panelactive");

            if ($("body").css("overflow") === "hidden") {
                $("body").css({ height: "", overflow: "" });
            } else {
                $("body").css({ height: "100%", overflow: "hidden" });
            }
        });

    });

    /* ---------------------------------
        ★ ページトップボタン（アレンジ版）
    --------------------------------- */

    const $pageTop = $(".page-top");

    // 初期非表示
    $pageTop.css({ opacity: 0, bottom: "-60px" }).show();

    // トップへ戻るクリック
    $pageTop.off("click").on("click", function () {
        $("html, body").animate({ scrollTop: 0 }, 450, "swing");
        return false;
    });

    // スクロール時の表示・フッター回避
    function updatePageTop() {
        const scrollTop = $(window).scrollTop();
        const windowHeight = $(window).height();

        // フッターがまだ読み込まれていなければスキップ
        const $footer = $("#footer");
        if ($footer.length === 0 || $footer.offset() === undefined) return;

        const footerTop = $footer.offset().top;
        const pageBottom = scrollTop + windowHeight;

        // 1画面分スクロールしたら出現（1.0にすると完全に1画面分。画面高さが900pxなら0.1は90pxということ）
        if (scrollTop >= windowHeight * 0.2) {
            $(".page-top").removeClass("DownMove").addClass("UpMove");
        } else if ($(".page-top").hasClass("UpMove")) {
            $(".page-top").removeClass("UpMove").addClass("DownMove");
        }

        // フッター被り防止
        let bottomValue;

        // 画面幅によって通常bottomを変更
        if ($(window).width() >= 992) {
            bottomValue = 30; // PC
        } else {
            bottomValue = 20; // スマホ
        }

        // フッターに被った場合の調整
        if (pageBottom > footerTop) {
            bottomValue += pageBottom - footerTop;
        }

        // 最終的に適用
        $pageTop.css({ bottom: bottomValue + "px" });
    }

    // スクロール・リサイズで呼び出し
    $(window).on("scroll resize", updatePageTop);

    // フッター読み込み後に初回計算
    $("#footer").load(basePath + "/parts/footer.html", function () {
        updatePageTop();
    });

    // ページ読み込み時にも更新
    $(window).on("load", updatePageTop);

    /* ---------------------------------
        ★ 戻るボタン対策（bfcache対応）
    --------------------------------- */
    window.addEventListener("pageshow", function () {

        // メニューを強制的に閉じる
        $(".hamburger-inner").removeClass("active");
        $(".g-nav").removeClass("panelactive");

        // body固定解除
        $("body").css({ height: "", overflow: "" });

    });

});
