"use strict";

$(function() {

    let artworks = [];

    // JSON読み込み
    $.getJSON('../json/gallery.json', function(data) {

        // ★ 新しい順に並び替え（date降順）
        artworks = data.sort((a, b) =>
            new Date(b.date) - new Date(a.date)
        );

        // 初期表示
        renderGallery(artworks);
    });


    /* ---------------------------------
        ギャラリー描画関数
    --------------------------------- */
    function renderGallery(data) {

        const $gallery = $('.gallery');
        $gallery.empty();

        // ★ 今表示中の配列をグローバルに保存（modal用）
        window.galleryData = data;

        data.forEach(item => {

            const html = `
                <div class="gallery-item"
                    data-category="${item.category}"
                    data-id="${item.id}">
                    <img src="${item.thumbnail}" alt="${item.title}" loading="lazy" decoding="async">
                </div>
            `;

            $gallery.append(html);
        });
    }


    /* ---------------------------------
        フィルターボタン
    --------------------------------- */
    $('.filter-btn').on('click', function() {

        $('.filter-btn').removeClass('active');
        $(this).addClass('active');

        const filter = $(this).data('filter');

        if (filter === 'all') {

            renderGallery(artworks);

        } else {

            const filtered = artworks.filter(item =>
                item.category === filter
            );

            renderGallery(filtered);
        }

    });

});
