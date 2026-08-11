/**
 * Colaboraciones: lista de artistas + relato a la izquierda + galeria a la derecha.
 */
(function () {
    const listaEl = document.getElementById("collabsLista");
    const relatoEl = document.getElementById("collabsRelato");
    const galeriaEl = document.getElementById("collabsGaleria");
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

    // Lista de artistas - botones en columna izquierda.
    function renderLista() {
        listaEl.innerHTML = "";
        artists.forEach((artist) => {
            const btn = document.createElement("button");
            btn.type = "button";
            btn.className = "collab-artista-link";
            btn.textContent = artist.nombre;
            btn.setAttribute("data-artist", artist.id);
            if (artist.id === currentId) btn.classList.add("activa");
            btn.addEventListener("click", () => selectArtist(artist.id));
            listaEl.appendChild(btn);
        });
    }

    // Cabecera del artista - nombre y rol en columna izquierda.
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

    // Galeria - obras del artista (imagen/video/youtube) o mensaje vacio.
    function renderGaleria(artist) {
        galeriaEl.innerHTML = "";
        const obras = artist.obras || [];

        if (!obras.length) {
            const empty = document.createElement("div");
            empty.className = "item-obra collab-vacio";
            empty.innerHTML = `<span class="caption-obra" data-i18n-vacio>${t(content().vacio)}</span>`;
            galeriaEl.appendChild(empty);
            return;
        }

        obras.forEach((obra) => {
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
                img.src = obra.src;
                img.alt = obra.alt || artist.nombre;
                img.loading = "lazy";
                img.decoding = "async";
                article.appendChild(img);
            }

            const caption = document.createElement("span");
            caption.className = "caption-obra";
            caption.textContent = obra.alt || artist.nombre;

            article.appendChild(caption);
            galeriaEl.appendChild(article);
        });

        galeriaEl.scrollLeft = 0;
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

    document.addEventListener("site:langchange", () => {
        if (!currentId) return;
        const artist = findArtist(currentId);
        renderCabeza(artist);
        renderRelato(artist);
        if (!(artist.obras || []).length) renderGaleria(artist);
    });

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initFromUrl);
    } else {
        initFromUrl();
    }
})();
