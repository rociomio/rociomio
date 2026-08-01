/**
 * Videopoetry: carga solo el video visible (+ vecino) para no saturar red/movil.
 */
(function () {
    const gallery = document.getElementById('galeriaHorizontal');
    if (!gallery) return;

    const slides = Array.from(gallery.querySelectorAll('.item-media'));
    const videos = slides.map((s) => s.querySelector('video')).filter(Boolean);
    if (!videos.length) return;

    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    const prefetchRadius = isMobile ? 0 : 1;

    videos.forEach((video) => {
        const url = video.getAttribute('src');
        if (url) {
            video.dataset.src = url;
            video.removeAttribute('src');
        }
        video.preload = 'none';
        video.autoplay = false;
        video.muted = true;
        video.playsInline = true;
    });

    function padLeft() {
        return parseFloat(getComputedStyle(gallery).paddingLeft) || 0;
    }

    function currentIndex() {
        const viewLeft = gallery.scrollLeft;
        const viewRight = viewLeft + gallery.clientWidth;
        let index = 0;
        let maxVisible = -1;

        slides.forEach((slide, i) => {
            const left = slide.offsetLeft;
            const right = left + slide.offsetWidth;
            const visible = Math.min(right, viewRight) - Math.max(left, viewLeft);
            if (visible > maxVisible) {
                maxVisible = visible;
                index = i;
            }
        });

        return index;
    }

    function loadVideo(video) {
        if (!video || video.dataset.loaded) return;
        const url = video.dataset.src;
        if (!url) return;
        video.closest('.item-media')?.classList.add('is-loading');
        video.src = url;
        video.dataset.loaded = '1';
        video.addEventListener(
            'canplay',
            () => {
                video.closest('.item-media')?.classList.remove('is-loading');
                video.closest('.item-media')?.classList.add('is-ready');
            },
            { once: true }
        );
    }

    function unloadVideo(video) {
        if (!video || !video.dataset.loaded) return;
        video.pause();
        video.removeAttribute('src');
        video.load();
        delete video.dataset.loaded;
        const slide = video.closest('.item-media');
        slide?.classList.remove('is-loading', 'is-ready');
    }

    function playVideo(video) {
        if (!video) return;
        loadVideo(video);
        const attempt = video.play();
        if (attempt && typeof attempt.catch === 'function') {
            attempt.catch(() => {});
        }
    }

    function updateVideos() {
        const idx = currentIndex();

        videos.forEach((video, i) => {
            const dist = Math.abs(i - idx);
            if (i === idx) {
                playVideo(video);
            } else if (dist <= prefetchRadius) {
                loadVideo(video);
                video.pause();
            } else {
                unloadVideo(video);
            }
        });
    }

    let scrollTimer;
    gallery.addEventListener(
        'scroll',
        () => {
            clearTimeout(scrollTimer);
            scrollTimer = setTimeout(updateVideos, 80);
        },
        { passive: true }
    );

    window.addEventListener(
        'resize',
        () => {
            clearTimeout(scrollTimer);
            scrollTimer = setTimeout(updateVideos, 120);
        },
        { passive: true }
    );

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', updateVideos);
    } else {
        updateVideos();
    }
})();
