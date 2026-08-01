/**
 * BosqueGracias: masonry en columna derecha + filtros todas / ohde.
 */
(function () {
    const grid = document.getElementById('bosqueGrid');
    const source = document.getElementById('bosque-source');
    const ohdeIntro = document.getElementById('bosqueOhdeIntro');
    const galleryCol = document.querySelector('.bosque-columna-galeria');

    if (!grid || !source) return;

    const allItems = () => Array.from(source.querySelectorAll('.item-imagen'));

    function t(obj) {
        return window.BosqueI18n ? BosqueI18n.t(obj) : obj.es;
    }

    function getColumnCount(fixedCols) {
        if (fixedCols) return fixedCols;
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

    function getVisibleItems(filter) {
        return allItems().filter((item) => {
            if (filter === 'todos') return true;
            return item.getAttribute('data-estacion') === filter;
        });
    }

    function buildGrid(items, dimensions, fixedCols) {
        const colCount = getColumnCount(fixedCols);
        const container = document.createElement('div');
        container.className = 'procesos-masonry-grid';
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

    function emptyMessage(filter) {
        const en = window.BosqueI18n && BosqueI18n.lang === 'en';
        if (filter === 'ohde') return en ? 'No images for this collaboration yet.' : 'Aun no hay imagenes de esta colaboracion.';
        return en ? 'No images yet.' : 'Aun no hay imagenes.';
    }

    let renderToken = 0;

    function buildCollabStack(items) {
        const track = document.createElement('div');
        track.className = 'bosque-collab-stack';

        items.forEach((item, index) => {
            const slide = document.createElement('article');
            slide.className = 'bosque-collab-slide';

            const img = item.querySelector('img');
            const title = item.querySelector('.info-hover h3');
            if (img) {
                const image = img.cloneNode(true);
                slide.appendChild(image);
            }
            if (title) {
                const caption = document.createElement('p');
                caption.className = 'bosque-collab-caption';
                caption.textContent = title.textContent;
                slide.appendChild(caption);
            }

            const counter = document.createElement('p');
            counter.className = 'bosque-collab-indice';
            counter.textContent = `${String(index + 1).padStart(2, '0')} / ${String(items.length).padStart(2, '0')}`;
            slide.appendChild(counter);

            track.appendChild(slide);
        });

        return track;
    }

    async function appendZone(parent, sourceId, titleObj, token, layout) {
        const zoneSource = document.getElementById(sourceId);
        if (!zoneSource) return false;

        const items = Array.from(zoneSource.querySelectorAll('.item-imagen'));
        if (!items.length) return false;

        const section = document.createElement('section');
        section.className = 'bosque-ohde-zona';
        if (layout === 'fullscreen') section.classList.add('bosque-ohde-collab');

        const heading = document.createElement('h3');
        heading.className = 'bosque-zona-titulo';
        heading.textContent = t(titleObj);
        section.appendChild(heading);

        if (layout === 'fullscreen') {
            section.appendChild(buildCollabStack(items));
            parent.appendChild(section);
            return true;
        }

        const dimensions = await Promise.all(items.map((item) => waitForMedia(item)));
        if (token !== renderToken) return true;

        section.appendChild(buildGrid(items, dimensions, 2));
        parent.appendChild(section);
        return true;
    }

    async function renderOhdeGallery(token) {
        grid.innerHTML = '';

        const content = window.BOSQUE_CONTENT;
        if (!content || !content.ohde) return;

        const hasCollab = await appendZone(grid, 'ohde-source-collab', content.ohde.obrasTitulo, token, 'fullscreen');
        if (token !== renderToken) return;

        const hasProceso = await appendZone(grid, 'ohde-source-proceso', content.ohde.procesoTitulo, token, 'masonry');
        if (token !== renderToken) return;

        if (!hasCollab && !hasProceso) {
            const empty = document.createElement('p');
            empty.className = 'procesos-vacio';
            empty.textContent = emptyMessage('ohde');
            grid.appendChild(empty);
        }
    }

    async function renderGallery(filter) {
        const token = ++renderToken;

        if (ohdeIntro) ohdeIntro.hidden = filter !== 'ohde';

        if (filter === 'ohde') {
            await renderOhdeGallery(token);
            return;
        }

        const items = getVisibleItems(filter);
        grid.innerHTML = '';

        if (items.length === 0) {
            const empty = document.createElement('p');
            empty.className = 'procesos-vacio';
            empty.textContent = emptyMessage(filter);
            grid.appendChild(empty);
            return;
        }

        const dimensions = await Promise.all(items.map((item) => waitForMedia(item)));
        if (token !== renderToken) return;

        const gridEl = buildGrid(items, dimensions);
        gridEl.classList.add('bosque-grid-todas');
        grid.appendChild(gridEl);
    }

    function applyFilterFromUrl() {
        const filtro = new URLSearchParams(window.location.search).get('filtro');
        if (!filtro) return false;

        const boton = document.querySelector(`#filtros .etiqueta-filtro[data-filtro="${filtro}"]`);
        if (!boton) return false;

        botonesFiltro.forEach((btn) => btn.classList.remove('activa'));
        boton.classList.add('activa');
        renderGallery(filtro);
        return true;
    }

    const botonesFiltro = document.querySelectorAll('#filtros .etiqueta-filtro');
    botonesFiltro.forEach((boton) => {
        boton.addEventListener('click', () => {
            botonesFiltro.forEach((btn) => btn.classList.remove('activa'));
            boton.classList.add('activa');
            renderGallery(boton.getAttribute('data-filtro'));
        });
    });

    document.addEventListener('bosque:sources-ready', () => {
        if (!applyFilterFromUrl()) renderGallery('todos');
    });

    document.addEventListener('site:langchange', () => {
        const activo = document.querySelector('#filtros .etiqueta-filtro.activa');
        renderGallery(activo ? activo.getAttribute('data-filtro') : 'todos');
    });

    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            const activo = document.querySelector('#filtros .etiqueta-filtro.activa');
            renderGallery(activo ? activo.getAttribute('data-filtro') : 'todos');
        }, 250);
    });
})();
