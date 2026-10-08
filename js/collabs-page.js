/**
 * Colaboraciones: artistas en parrafo + relato + galeria con rueda y flechas.
 */
(function () {
    const listaEl = document.getElementById("collabsLista");
    const relatoEl = document.getElementById("collabsRelato");
    const galeriaEl = document.getElementById("collabsGaleria");
    const btnPrev = document.getElementById("collabsPrev");
    const btnNext = document.getElementById("collabsNext");
    const artists = window.COLLABS_ARTISTS || [];

    if (!listaEl || !relatoEl || !galeriaEl || !artists.length) return;

    let currentId = null;

    // Textos i18n - lee ES/EN segun SiteI18n o fallback es.
    function lang() {
        return (window.SiteI18n && window.SiteI18n.lang) || "es";
    }

    function t(block) {
        if (!block) return "";
        if (typeof block === "string") return block;
        const l = lang();
        return block[l] || block.es || block.en || "";
    }

    function content() {
        return window.COLLABS_CONTENT || {};
    }

    function findArtist(id) {
        return artists.find((a) => a.id === id) || artists[0];
    }

    function encodeSrc(path) {
        return path
            .split("/")
            .map((part) => encodeURIComponent(part))
            .join("/");
    }

    // Lista de artistas - parrafo inline para ocupar menos lugar.
    function renderLista() {
        listaEl.innerHTML = "";
        listaEl.className = "collab-lista collab-lista--parrafo";

        artists.forEach((artist, index) => {
            if (index > 0) {
                const sep = document.createElement("span");
                sep.className = "collab-sep";
                sep.textContent = " · ";
                listaEl.appendChild(sep);
            }

            const btn = document.createElement("button");
            btn.type = "button";
            btn.className = "collab-artista-inline";
            btn.textContent = artist.nombre;
            btn.setAttribute("data-artist", artist.id);
            if (artist.id === currentId) btn.classList.add("activa");
            btn.addEventListener("click", () => selectArtist(artist.id));
            listaEl.appendChild(btn);
        });
    }

    // Cabecera del artista - nombre y rol.
    function renderCabeza(artist) {
        const headEl = document.getElementById("collabsArtistaHead");
        if (!headEl) return;
        headEl.innerHTML = `
            <h2 class="collab-artista-nombre">${artist.nombre}</h2>
            <p class="collab-artista-rol">${t(artist.rol)}</p>
        `;
    }

    // Relato - texto e Instagram del artista activo.
    function renderRelato(artist) {
        const paragraphs = t(artist.texto)
            .split(/\n\n+/)
            .map((p) => p.trim())
            .filter(Boolean);

        const ig = artist.instagram
            ? `<a href="${artist.instagram.url}" target="_blank" rel="noopener" class="link-objkt">${t(content().verEnIg)} ${artist.instagram.etiqueta}</a>`
            : "";

        relatoEl.innerHTML = `
            ${paragraphs.map((p) => `<p>${p}</p>`).join("")}
            ${ig}
        `;
    }

    // Progressive image load - only nearby slides get a real src.
    function bindProgressiveImages() {
        const imgs = galeriaEl.querySelectorAll("img[data-src]");
        if (!imgs.length) return;

        const io = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;
                    const img = entry.target;
                    const src = img.getAttribute("data-src");
                    if (src && img.getAttribute("src") !== src) {
                        img.src = src;
                        img.removeAttribute("data-src");
                    }
                    io.unobserve(img);
                });
            },
            { root: galeriaEl, rootMargin: "0px 40% 0px 40%", threshold: 0.01 }
        );

        imgs.forEach((img, i) => {
            if (i === 0) {
                const src = img.getAttribute("data-src");
                if (src) {
                    img.src = src;
                    img.removeAttribute("data-src");
                }
            } else {
                io.observe(img);
            }
        });
    }

    // Galeria - obras del artista o mensaje vacio.
    function renderGaleria(artist) {
        galeriaEl.innerHTML = "";
        const obras = artist.obras || [];

        if (!obras.length) {
            const empty = document.createElement("div");
            empty.className = "item-obra collab-vacio";
            empty.innerHTML = `<span class="caption-obra">${t(content().vacio)}</span>`;
            galeriaEl.appendChild(empty);
            updateNavButtons();
            return;
        }

        obras.forEach((obra, index) => {
            const article = document.createElement("article");
            article.className = "item-obra";

            if (obra.type === "youtube") {
                const iframe = document.createElement("iframe");
                iframe.className = "item-youtube";
                iframe.src = `https://www.youtube.com/embed/${obra.src}?rel=0`;
                iframe.title = obra.alt || artist.nombre;
                iframe.loading = "lazy";
                iframe.allow =
                    "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
                iframe.allowFullscreen = true;
                iframe.referrerPolicy = "strict-origin-when-cross-origin";
                article.appendChild(iframe);
            } else {
                const img = document.createElement("img");
                img.alt = obra.alt || artist.nombre;
                img.decoding = "async";
                img.setAttribute("data-src", encodeSrc(obra.src));
                if (index === 0) {
                    img.loading = "eager";
                    img.fetchPriority = "high";
                } else {
                    img.loading = "lazy";
                }
                article.appendChild(img);
            }

            const caption = document.createElement("span");
            caption.className = "caption-obra";
            caption.textContent = obra.alt || artist.nombre;
            article.appendChild(caption);
            galeriaEl.appendChild(article);
        });

        galeriaEl.scrollLeft = 0;
        bindProgressiveImages();
        updateNavButtons();
    }

    // Prefetch neighbor slide before/after current for fluid browsing.
    function prefetchAround(index) {
        const slides = Array.from(galeriaEl.children);
        [index, index + 1, index - 1].forEach((i) => {
            const slide = slides[i];
            if (!slide) return;
            const img = slide.querySelector("img[data-src]");
            if (!img) return;
            const src = img.getAttribute("data-src");
            if (!src) return;
            img.src = src;
            img.removeAttribute("data-src");
        });
    }

    // Navegacion por flechas - un slide por clic.
    function stepGaleria(direction) {
        const slides = Array.from(galeriaEl.children);
        if (slides.length <= 1) return;

        const step = galeriaEl.clientWidth || slides[0].offsetWidth || 1;
        const index = Math.round(galeriaEl.scrollLeft / step);
        const next = Math.max(0, Math.min(slides.length - 1, index + direction));
        prefetchAround(next);
        galeriaEl.scrollTo({ left: next * step, behavior: "smooth" });
    }

    function updateNavButtons() {
        const slides = galeriaEl.children.length;
        const step = galeriaEl.clientWidth || 1;
        const index = Math.round(galeriaEl.scrollLeft / step);
        const max = Math.max(0, slides - 1);

        if (btnPrev) btnPrev.disabled = slides <= 1 || index <= 0;
        if (btnNext) btnNext.disabled = slides <= 1 || index >= max;
    }

    function selectArtist(id) {
        const artist = findArtist(id);
        if (!artist) return;
        currentId = artist.id;
        renderLista();
        renderCabeza(artist);
        renderRelato(artist);
        renderGaleria(artist);

        const url = new URL(window.location.href);
        url.searchParams.set("artista", artist.id);
        history.replaceState(null, "", url);
    }

    function initFromUrl() {
        const param = new URLSearchParams(window.location.search).get("artista");
        const match = artists.find((a) => a.id === param);
        selectArtist(match ? match.id : artists[0].id);
    }

    btnPrev?.addEventListener("click", () => stepGaleria(-1));
    btnNext?.addEventListener("click", () => stepGaleria(1));
    galeriaEl.addEventListener("scroll", updateNavButtons, { passive: true });
    window.addEventListener("resize", updateNavButtons);

    document.addEventListener("site:langchange", () => {
        if (!currentId) return;
        const artist = findArtist(currentId);
        renderCabeza(artist);
        renderRelato(artist);
        if (!(artist.obras || []).length) renderGaleria(artist);
        if (btnPrev) btnPrev.setAttribute("aria-label", t(content().prev));
        if (btnNext) btnNext.setAttribute("aria-label", t(content().next));
    });

    if (btnPrev) btnPrev.setAttribute("aria-label", t(content().prev));
    if (btnNext) btnNext.setAttribute("aria-label", t(content().next));

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initFromUrl);
    } else {
        initFromUrl();
    }
})();
