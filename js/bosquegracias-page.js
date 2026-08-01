/**
 * BosqueGracias: texto fijo + fuentes masonry desde residencias/.
 */
(function () {
    if (!window.BosqueI18n || !window.BOSQUE_DATA || !window.BOSQUE_CONTENT) return;

    const source = document.getElementById('bosque-source');
    const ohdeCollabSource = document.getElementById('ohde-source-collab');
    const ohdeProcesoSource = document.getElementById('ohde-source-proceso');
    const ohdeIntro = document.getElementById('bosqueOhdeIntro');
    const textoWrap = document.getElementById('bosqueTexto');
    const cabeceraWrap = document.getElementById('bosqueCabecera');

    const content = window.BOSQUE_CONTENT;
    const ohdeData = window.BOSQUE_OHDE;

    function el(tag, className, text) {
        const node = document.createElement(tag);
        if (className) node.className = className;
        if (text !== undefined) node.textContent = text;
        return node;
    }

    function cleanAlt(alt) {
        return String(alt || '')
            .replace(/_resized/gi, '')
            .replace(/\s+/g, ' ')
            .trim();
    }

    function mediaSrc(path) {
        const i = path.lastIndexOf('/');
        if (i === -1) return encodeURI(path);
        return `${path.slice(0, i + 1)}${encodeURIComponent(path.slice(i + 1))}`;
    }

    function createMediaItem(entry) {
        const article = document.createElement('article');
        article.className = 'item-imagen';
        if (entry.estacion) article.setAttribute('data-estacion', entry.estacion);

        const alt = cleanAlt(entry.alt);
        const src = mediaSrc(entry.src);
        const media =
            entry.type === 'video'
                ? `<video src="${src}" controls playsinline preload="metadata"></video>`
                : `<img src="${src}" alt="${alt}" loading="lazy">`;

        article.innerHTML = `
            ${media}
            <div class="info-hover">
                <h3>${alt}</h3>
            </div>`;
        return article;
    }

    function isImageEntry(entry) {
        return entry && entry.type !== 'video';
    }

    function buildEditionSource(media) {
        source.innerHTML = '';
        media.filter(isImageEntry).forEach((entry) => {
            if (entry.ohde) return;
            source.appendChild(createMediaItem(entry));
        });
    }

    function buildOhdeSource(ohdeCollab, ohdeProceso) {
        ohdeCollabSource.innerHTML = '';
        ohdeProcesoSource.innerHTML = '';

        ohdeCollab.filter(isImageEntry).forEach((entry) => {
            ohdeCollabSource.appendChild(createMediaItem(entry));
        });

        ohdeProceso.filter(isImageEntry).forEach((entry) => {
            ohdeProcesoSource.appendChild(createMediaItem(entry));
        });
    }

    function renderCabecera() {
        if (!cabeceraWrap) return;
        const t = BosqueI18n.t;
        cabeceraWrap.innerHTML = '';

        cabeceraWrap.appendChild(el('p', 'bosque-etiqueta-seccion', t(content.conceptoTitulo)));
        cabeceraWrap.appendChild(el('h1', 'bosque-titulo-principal', t(content.meta.title)));
    }

    function renderTexto() {
        if (!textoWrap) return;
        const t = BosqueI18n.t;
        textoWrap.innerHTML = '';

        content.intro[BosqueI18n.lang].forEach((parrafo) => {
            textoWrap.appendChild(el('p', 'bosque-parrafo', parrafo));
        });

        textoWrap.appendChild(el('h2', 'bosque-seccion-titulo', t(content.modulosTitulo)));

        const modList = el('ul', 'bosque-modulos');
        content.modulos.forEach((mod) => {
            const li = el('li');
            const block = mod[BosqueI18n.lang];
            li.innerHTML = `<strong>${block.titulo}</strong> ${block.texto}`;
            modList.appendChild(li);
        });
        textoWrap.appendChild(modList);

        textoWrap.appendChild(el('h2', 'bosque-seccion-titulo', t(content.glitchTitulo)));

        content.glitch[BosqueI18n.lang].forEach((parrafo) => {
            textoWrap.appendChild(el('p', 'bosque-parrafo', parrafo));
        });
    }

    function renderOhdeIntro() {
        if (!ohdeIntro || !ohdeData) return;
        const t = BosqueI18n.t;
        ohdeIntro.innerHTML = `
            <h2 class="bosque-ohde-nombre">${ohdeData.nombre}</h2>
            <p class="bosque-ohde-rol">${t(ohdeData.rol)}</p>
            <blockquote class="bosque-ohde-cita">"${t(ohdeData.cita_corta)}"</blockquote>
            <div class="bosque-ohde-texto">${t(ohdeData.texto_completo)}</div>
            <a href="${ohdeData.red_social.url}" target="_blank" rel="noopener" class="bosque-ohde-link">${ohdeData.red_social.plataforma} · ${ohdeData.red_social.etiqueta} ↗</a>`;
    }

    function renderMeta() {
        document.title = `${BosqueI18n.t(content.meta.title)} | Rocio Mio`;

        document.querySelectorAll('#filtros .etiqueta-filtro[data-filtro]').forEach((btn) => {
            const key = btn.getAttribute('data-filtro');
            if (content.filtros[key]) btn.textContent = BosqueI18n.t(content.filtros[key]);
        });
    }

    function renderAll() {
        renderMeta();
        renderCabecera();
        renderTexto();
        renderOhdeIntro();
    }

    function init() {
        buildEditionSource(window.BOSQUE_DATA.media);
        buildOhdeSource(
            window.BOSQUE_DATA.ohdeCollab || [],
            window.BOSQUE_DATA.ohdeProceso || []
        );
        renderAll();
        document.dispatchEvent(new CustomEvent('bosque:sources-ready'));
        document.addEventListener('site:langchange', renderAll);
    }

    init();
})();
