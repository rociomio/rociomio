/**
 * Renderiza galeria Videopoetry desde js/videopoetry-data.js
 */
(function () {
    const gallery = document.getElementById("galeriaHorizontal");
    const items = window.VIDEOPOETRY_ITEMS;
    if (!gallery || !items || !items.length) return;

    const frag = document.createDocumentFragment();

    items.forEach((item) => {
        const link = document.createElement("a");
        link.className = "item-media item-objkt";
        link.href = item.url;
        link.target = "_blank";
        link.rel = "noopener";
        link.setAttribute("aria-label", `${item.name} — ver en objkt`);

        const img = document.createElement("img");
        img.referrerPolicy = "no-referrer";
        img.src = item.thumb;
        img.alt = item.name;
        img.loading = "lazy";
        img.decoding = "async";

        const caption = document.createElement("span");
        caption.className = "item-caption";
        caption.textContent = item.name;

        const hint = document.createElement("span");
        hint.className = "item-objkt-hint";
        hint.setAttribute("data-i18n", "verEnObjkt");
        hint.textContent = "ver en objkt →";

        link.appendChild(img);
        link.appendChild(caption);
        link.appendChild(hint);
        frag.appendChild(link);
    });

    gallery.appendChild(frag);

    if (window.SiteI18n) {
        window.SiteI18n.renderAll();
    }
})();
