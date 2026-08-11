/**
 * Procesos: masonry vertical con scroll natural.
 * Imagenes a tamano real, columnas apiladas hacia abajo.
 */
(function () {
    const grid = document.getElementById('procesosGrid');
    const source = document.getElementById('procesos-source');

    if (!grid || !source) return;

    const allItems = Array.from(source.querySelectorAll('.item-imagen'));

    function getColumnCount() {
        if (window.innerWidth < 600) return 1;
        if (window.innerWidth < 900) return 2;
        if (window.innerWidth < 1200) return 3;
        return 4;
    }

    function waitForImage(img) {
        const src = img.getAttribute('src');
        if (!src) return Promise.resolve({ w: 400, h: 300 });
        return new Promise((resolve) => {
            const probe = new Image();
            probe.onload = () => resolve({ w: probe.naturalWidth, h: probe.naturalHeight });
            probe.onerror = () => resolve({ w: 400, h: 300 });
            probe.src = src;
        });
    }

    function getMaxImageWidth() {
        const cols = getColumnCount();
        const gap = 12 * (cols - 1);
        const padding = 20;
        return (window.innerWidth - padding - gap) / cols;
    }

    function getDisplayHeight(dims) {
        const maxW = getMaxImageWidth();
        if (!dims.w) return 300;
        return (dims.h / dims.w) * maxW;
    }

    function getVisibleItems(filter) {
        return allItems.filter((item) => {
            if (filter === 'todos') return true;
            return item.getAttribute('data-categoria') === filter;
        });
    }

    function buildGrid(items, dimensions) {
        const container = document.createElement('div');
        container.className = 'procesos-masonry-grid';

        const colCount = getColumnCount();
        const columns = Array.from({ length: colCount }, () => ({
            el: document.createElement('div'),
            height: 0,
        }));

        columns.forEach((col) => col.el.className = 'masonry-col');

        items.forEach((item, index) => {
            const clone = item.cloneNode(true);
            const displayH = getDisplayHeight(dimensions[index]);

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

    async function renderGallery(filter) {
        const items = getVisibleItems(filter);
        grid.innerHTML = '';

        if (items.length === 0) {
            const empty = document.createElement('p');
            empty.className = 'procesos-vacio';
            empty.textContent = 'No hay imagenes en esta categoria.';
            grid.appendChild(empty);
            return;
        }

        const dimensions = await Promise.all(
            items.map((item) => waitForImage(item.querySelector('img')))
        );

        grid.appendChild(buildGrid(items, dimensions));
    }

    function applyFilterFromUrl() {
        const filtro = new URLSearchParams(window.location.search).get('filtro');
        if (!filtro) return false;

        const boton = document.querySelector(`.etiqueta-filtro[data-filtro="${filtro}"]`);
        if (!boton) return false;

        botonesFiltro.forEach((btn) => btn.classList.remove('activa'));
        boton.classList.add('activa');
        renderGallery(filtro);
        return true;
    }

    const botonesFiltro = document.querySelectorAll('.etiqueta-filtro');
    botonesFiltro.forEach((boton) => {
        boton.addEventListener('click', () => {
            botonesFiltro.forEach((btn) => btn.classList.remove('activa'));
            boton.classList.add('activa');
            renderGallery(boton.getAttribute('data-filtro'));
        });
    });

    if (!applyFilterFromUrl()) {
        renderGallery('todos');
    }

    // Sticky filters offset - keep filters docked under the sticky title height.
    const tituloProcesos = document.querySelector('.procesos-layout .cabecera-interna h1');

    function syncFiltrosStickyTop() {
        if (!tituloProcesos) return;
        const headerAlto =
            parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-alto')) || 70;
        document.documentElement.style.setProperty(
            '--procesos-filtros-top',
            `${headerAlto + tituloProcesos.offsetHeight}px`
        );
    }

    syncFiltrosStickyTop();

    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            syncFiltrosStickyTop();
            const activo = document.querySelector('.etiqueta-filtro.activa');
            renderGallery(activo ? activo.getAttribute('data-filtro') : 'todos');
        }, 250);
    });
})();
