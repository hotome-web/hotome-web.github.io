"use strict";

$(function() {

    // ==============================
    // ▼ フォーム送信処理
    // ==============================

    $("#contactForm").on("submit", function(e) {

        // ★ 通常のform送信を止める（JSで制御するため）
        e.preventDefault();

        const $form = $(this);
        const $button = $form.find("button");

        // ★ 二重送信防止
        $button.prop("disabled", true).text("送信中…");

        // ★ フォーム内容をシリアライズ（name属性ベースで送信）
        const formData = $form.serialize();

        // ==============================
        // ▼ Ajax送信（Formspree）
        // ==============================

        $.ajax({
            url: $form.attr("action"), // ← HTML側のactionを使う（ハードコードしない）
            method: "POST",
            data: formData,
            dataType: "json",

            success: function() {

                // ★ 送信成功時
                window.location.href = "/hotome/contact/thanks.html";

            },

            error: function() {

                // ★ 送信失敗時はボタンを戻す
                $button.prop("disabled", false).text("送信する");

                window.location.href = "/hotome/contact/error.html";
            }
        });

    });

});


/* 記述確認・挙動確認OKです！（2026.2.23-22:49） */

/* 本番では"/contact/thanks.html"、"/contact/error.html" にする必要があると思うので注意！*/
