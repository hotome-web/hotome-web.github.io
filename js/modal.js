"use strict";

$(function() {

    let currentIndex = 0;
    let currentList = [];

    /* ---------------------------------
        日付フォーマット変換用
        2026-01-13 → 2026.01.13
    --------------------------------- */
    function formatDate(dateString) {

        if (!dateString) return '';

        const date = new Date(dateString);

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');

        return `${year}.${month}.${day}`;
    }

    /* ---------------------------------
        背景スクロール固定用
    --------------------------------- */
    let scrollPosition = 0;

    function lockBackgroundScroll() {
        scrollPosition = $(window).scrollTop();
        $('body').css({
            position: 'fixed',
            top: -scrollPosition + 'px',
            width: '100%'
        });
    }

    function unlockBackgroundScroll() {
        $('body').css({
            position: '',
            top: '',
            width: ''
        });
        $(window).scrollTop(scrollPosition);
    }

    /* ---------------------------------
        URL操作用
    --------------------------------- */

    function pushModalState(id) {
        history.pushState(
            { modal: true, id: id },
            "",
            `?id=${id}`
        );
    }

    // ★ next / prev 用（履歴を増やさない）
    function replaceModalState(id) {
        history.replaceState(
            { modal: true, id: id },
            "",
            `?id=${id}`
        );
    }

    function removeModalState() {
        history.pushState(
            {},
            "",
            window.location.pathname
        );
    }

    /* ---------------------------------
        モーダル表示
    --------------------------------- */

    $(document).on('click', '.gallery-item', function() {

        currentList = window.galleryData || [];
        currentIndex = $('.gallery-item').index(this);

        const item = currentList[currentIndex];

        showImage();
        $('#modal').addClass('show');
        lockBackgroundScroll();

        pushModalState(item.id);
    });

    function goNext() {
        if (currentList.length === 0) return;

        currentIndex = (currentIndex + 1) % currentList.length;
        showImage();

        // ★ 履歴を増やさずURLだけ更新
        replaceModalState(currentList[currentIndex].id);
    }

    function goPrev() {
        if (currentList.length === 0) return;

        currentIndex = (currentIndex - 1 + currentList.length) % currentList.length;
        showImage();

        // ★ 履歴を増やさずURLだけ更新
        replaceModalState(currentList[currentIndex].id);
    }

    $('.modal-next').on('click', function(e) {
        e.stopPropagation();
        goNext();
    });

    $('.modal-prev').on('click', function(e) {
        e.stopPropagation();
        goPrev();
    });

    $('.modal-close, .modal-overlay').on('click', function(e) {
        e.stopPropagation();
        closeModal();
    });

    function closeModal() {
        $('#modal').removeClass('show');
        unlockBackgroundScroll();
        removeModalState();
    }

    /* ---------------------------------
        戻るボタン対応
    --------------------------------- */

    window.addEventListener('popstate', function() {

        const params = new URLSearchParams(window.location.search);
        const id = params.get('id');

        if (!id) {
            $('#modal').removeClass('show');
            unlockBackgroundScroll();
        } else {
            openModalById(id);
        }
    });

    function openModalById(id) {

        currentList = window.galleryData || [];
        const index = currentList.findIndex(item => String(item.id) === String(id));

        if (index === -1) return;

        currentIndex = index;

        showImage();
        $('#modal').addClass('show');
        lockBackgroundScroll();
    }

    /* ---------------------------------
        ページ読み込み時にidがあれば開く
    --------------------------------- */

    $(window).on('load', function() {

        const params = new URLSearchParams(window.location.search);
        const id = params.get('id');

        if (id && window.galleryData && window.galleryData.length) {
            openModalById(id);
        }
    });

    /* ---------------------------------
        画像表示・サイズ調整
    --------------------------------- */
    function showImage() {

        if (currentList.length === 0) return;

        const item = currentList[currentIndex];

        const $modalImage = $('.modal-image');
        const $modalTitle = $('.modal-caption-title');
        const $modalDate = $('.modal-caption-date');

        $modalImage.off('load').attr('src', item.src);
        $modalTitle.text(item.title || '');
        $modalDate.text(formatDate(item.date));

        $modalImage.on('load', function() {
            adjustImageSize();
        });

        $(window).off('resize.modal').on('resize.modal', function() {
            adjustImageSize();
        });

        // ★ 前後画像プリロード（SPラグ対策）
        preloadAdjacentImages();

        function adjustImageSize() {

            const windowHeight = $(window).height();
            const windowWidth = $(window).width();

            const captionHeight =
                $modalTitle.outerHeight(true) + $modalDate.outerHeight(true);

            let extraMargin;

            if (windowWidth >= 768) {
                extraMargin = 60;
            } else if (windowHeight >= 540) {
                extraMargin = 150;
            } else {
                extraMargin = 40;
            }

            const maxImageHeight = windowHeight - captionHeight - extraMargin;
            const maxImageWidth = windowWidth * 0.80;

            $modalImage.css({
                'max-width': maxImageWidth + 'px',
                'max-height': maxImageHeight + 'px',
                'width': 'auto',
                'height': 'auto'
            });
        }
    }

    /* ---------------------------------
        前後画像プリロード
    --------------------------------- */
    function preloadAdjacentImages() {

        if (currentList.length <= 1) return;

        const nextIndex = (currentIndex + 1) % currentList.length;
        const prevIndex = (currentIndex - 1 + currentList.length) % currentList.length;

        const nextImg = new Image();
        nextImg.src = currentList[nextIndex].src;

        const prevImg = new Image();
        prevImg.src = currentList[prevIndex].src;
    }

    /* ---------------------------------
        スワイプ対応（スマホ）
    --------------------------------- */

    let startX = 0;
    let currentX = 0;
    let isSwiping = false;
    const swipeThreshold = 80;

    $(document).on('touchstart', '.modal-image', function(e) {
        if (!$('#modal').hasClass('show')) return;

        startX = e.originalEvent.touches[0].clientX;
        currentX = startX;
        isSwiping = true;

        $(this).css('transition', 'none');
    });

    $(document).on('touchmove', '.modal-image', function(e) {
        if (!isSwiping) return;

        currentX = e.originalEvent.touches[0].clientX;
        const diffX = currentX - startX;

        if (Math.abs(diffX) < 10) return;

        $(this).css({
            transform: `translateX(${diffX}px)`,
            opacity: 1 - Math.abs(diffX) / 500
        });
    });

    $(document).on('touchend', '.modal-image', function() {
        if (!isSwiping) return;
        isSwiping = false;

        const diffX = currentX - startX;
        const $img = $(this);

        $img.css('transition', 'transform 0.3s ease, opacity 0.3s ease');

        if (Math.abs(diffX) > swipeThreshold) {
            if (diffX < 0) {
                goNext();
            } else {
                goPrev();
            }
        }

        $img.css({
            transform: 'translateX(0)',
            opacity: 1
        });
    });

    /* ---------------------------------
        キーボード操作（PC）
    --------------------------------- */

    $(document)
        .off('keydown.modal')
        .on('keydown.modal', function(e) {

            if (!$('#modal').hasClass('show')) return;
            if (currentList.length === 0) return;

            if (e.key === 'ArrowRight') goNext();
            if (e.key === 'ArrowLeft') goPrev();
            if (e.key === 'Escape') closeModal();
        });

});


/* 記述確認・挙動確認OKです！（2026.2.23-16:38） */
