"use strict";

$(function () {

    $('.share-link').on('click', function () {

        const $btn = $(this);
        const originalLabel = $btn.attr('aria-label'); // 元のaria-labelを保存
        const url = location.href; // 現在のURLを取得

        const TOOLTIP_TRANSITION = 200; // ← CSSのtransition時間と合わせる（ms）
        const TOOLTIP_SHOW_TIME = 2500; // ← ツールチップを表示しておく時間（ms）

        /* ---------------------------------
            ツールチップ表示処理
            （コピー成功・失敗どちらでも使う）
        --------------------------------- */
        function showTooltip(text) {

            // ① 文言変更
            $btn.attr('aria-label', text);

            // ② 表示（.is-active でCSS制御）
            $btn.addClass('is-active');

            // ③ 一定時間後に引っ込める
            setTimeout(function () {

                $btn.removeClass('is-active');
                $btn.blur(); // フォーカス解除（キーボード操作対策）

                // ④ transition完了後に元の文言に戻す
                setTimeout(function () {
                    $btn.attr('aria-label', originalLabel);
                }, TOOLTIP_TRANSITION);

            }, TOOLTIP_SHOW_TIME);
        }

        /* ---------------------------------
            Clipboard API 対応チェック
            ※ https（セキュアコンテキスト）でのみ動作
        --------------------------------- */
        if (navigator.clipboard && window.isSecureContext) {

            navigator.clipboard.writeText(url)

            // ▼ コピー成功
            .then(function () {
                showTooltip('リンクをコピーしました');
            })

            // ▼ コピー失敗
            .catch(function () {
                showTooltip('コピーに失敗しました');
            });

        } else {

            // ▼ http環境や非対応ブラウザ用
            showTooltip('この環境ではコピーできません');

        }

    });


    /* =========================
        記事内画像モーダル
    ========================= */

    let lastFocusedElement = null; // 元のフォーカス保存用

    $('.text-body img').on('click', function () {

        lastFocusedElement = this; // 開く前の要素を保存

        const src = $(this).attr('src');
        const alt = $(this).attr('alt');

        $('.img-modal-content').attr('src', src);
        $('.img-modal-content').attr('alt', alt);

        $('.img-modal')
        .addClass('is-active')
        .attr('aria-hidden', 'false');

        $('body').css('overflow', 'hidden'); // 背景スクロール防止

    });

    // 閉じる（背景クリック）
    $('.img-modal-overlay').on('click', closeModal);

    // ×ボタンで閉じる
    $('.modal-close').on('click', closeModal);

    // ESCキーで閉じる
    $(document).on('keydown', function (e) {
        if (e.key === "Escape") {
            closeModal();
        }
    });

    function closeModal() {

        // フォーカスを一旦外す（ariaエラー対策）
        if (document.activeElement) {
            document.activeElement.blur();
        }

        $('.img-modal')
        .removeClass('is-active')
        .attr('aria-hidden', 'true');

        $('body').css('overflow', '');

        // 元の画像へフォーカスを戻す
        if (lastFocusedElement) {
            $(lastFocusedElement).focus();
            lastFocusedElement = null;
        }
    }

});


/* 記述確認・挙動確認OKです！（2026.2.23-22:01） */
