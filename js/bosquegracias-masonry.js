/**
 * BosqueGracias: masonry vertical en columna derecha.
 */
(function () {
    const grid = document.getElementById('bosqueGrid');
    const source = document.getElementById('bosque-source');
    const galleryCol = document.querySelector('.bosque-columna-galeria');

    if (!grid || !source) return;

    const allItems = () => Array.from(source.querySelectorAll('.item-imagen'));

    function getColumnCount() {
        const w = galleryCol ? galleryCol.clientWidth : window.innerWidth;
        if (w < 600) return 1;
        return 2;
    }

    function getGalleryWidth() {
        return galleryCol ? galleryCol.clientWidth : window.innerWidth;
    }

    function waitForMedia(item) {
        const video = item.querySelector('video');
        if (video) {
            return new Promise((resolve) => {
                const done = () => resolve({
                    w: video.videoWidth || 1280,
                    h: video.videoHeight || 720,
                });
                video.addEventListener('loadedmetadata', done, { once: true });
                video.addEventListener('error', () => resolve({ w: 1280, h: 720 }), { once: true });
                if (video.readyState >= 1) done();
            });
        }

        const img = item.querySelector('img');
        const src = img && img.getAttribute('src');
        if (!src) return Promise.resolve({ w: 400, h: 300 });
        return new Promise((resolve) => {
            const probe = new Image();
            probe.onload = () => resolve({ w: probe.naturalWidth, h: probe.naturalHeight });
            probe.onerror = () => resolve({ w: 400, h: 300 });
            probe.src = src;
        });
    }

    function getMaxImageWidth(colCount) {
        const cols = colCount ?? getColumnCount();
        const gap = 12 * (cols - 1);
        const padding = 20;
        return (getGalleryWidth() - padding - gap) / cols;
    }

    function getDisplayHeight(dims, colCount) {
        const maxW = getMaxImageWidth(colCount);
        if (!dims.w) return 300;
        return (dims.h / dims.w) * maxW;
    }

    function buildGrid(items, dimensions) {
        const colCount = getColumnCount();
        const container = document.createElement('div');
        container.className = 'procesos-masonry-grid bosque-grid-todas';
        if (colCount === 2) container.classList.add('bosque-grid-dos');

        const columns = Array.from({ length: colCount }, () => ({
            el: document.createElement('div'),
            height: 0,
        }));

        columns.forEach((col) => (col.el.className = 'masonry-col'));

        items.forEach((item, index) => {
            const clone = item.cloneNode(true);
            const displayH = getDisplayHeight(dimensions[index], colCount);

            let shortest = 0;
            columns.forEach((col, i) => {
                if (col.height < columns[shortest].height) shortest = i;
            });

            columns[shortest].el.appendChild(clone);
            columns[shortest].height += displayH + 20;
        });

        columns.forEach((col) => {
            if (col.el.children.length > 0) container.appendChild(col.el);
        });

        return container;
    }

    let renderToken = 0;

    async function renderGallery() {
        const token = ++renderToken;
        const items = allItems();
        grid.innerHTML = '';

        if (items.length === 0) {
            const empty = document.createElement('p');
            empty.className = 'procesos-vacio';
            const en = window.BosqueI18n && BosqueI18n.lang === 'en';
            empty.textContent = en ? 'No images yet.' : 'Aun no hay imagenes.';
            grid.appendChild(empty);
            return;
        }

        const dimensions = await Promise.all(items.map((item) => waitForMedia(item)));
        if (token !== renderToken) return;

        grid.appendChild(buildGrid(items, dimensions));
    }

    document.addEventListener('bosque:sources-ready', () => {
        renderGallery();
    });

    document.addEventListener('site:langchange', () => {
        renderGallery();
    });

    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => renderGallery(), 250);
    });
})();
