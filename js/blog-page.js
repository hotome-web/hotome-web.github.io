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

});
