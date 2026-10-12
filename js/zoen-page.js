/**
 * Zoen studio page - render projects + index + reveal motion.
 */
(function () {
    const root = document.getElementById("zoenProjects");
    const indexEl = document.getElementById("zoenIndexList");
    const stillsEl = document.getElementById("zoenStills");
    const stillsPrev = document.getElementById("zoenStillsPrev");
    const stillsNext = document.getElementById("zoenStillsNext");
    const content = () => window.ZOEN_CONTENT || {};

    // Lang helper - SiteI18n when available.
    function lang() {
        return (window.SiteI18n && window.SiteI18n.lang) || "es";
    }

    function t(block) {
        if (!block) return "";
        if (typeof block === "string") return block;
        const l = lang();
        return block[l] || block.es || block.en || "";
    }

    function encodeSrc(path) {
        return path
            .split("/")
            .map((part) => encodeURIComponent(part))
            .join("/");
    }

    function escapeHtml(text) {
        return String(text).replace(/[&<>"']/g, (c) => ({
            "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
        })[c]);
    }

    // Project data helpers - media from manifest (optional custom order), auto codes 01, 02...
    function projectMedia(project) {
        const media = (window.ZOEN_MEDIA || {})[project.carpeta] || [];
        const orden = project.orden || [];
        if (!orden.length) return media;
        const rank = (item) => {
            const i = orden.indexOf(item.label);
            return i === -1 ? orden.length : i;
        };
        return media
            .map((item, i) => ({ item, i }))
            .sort((a, b) => rank(a.item) - rank(b.item) || a.i - b.i)
            .map(({ item }) => item);
    }

    function projectCode(index) {
        return String(index + 1).padStart(2, "0");
    }

    function pad(n) {
        return String(n).padStart(2, "0");
    }

    // Gallery slides - image or video (poster, loads on play).
    function slideMarkup(item, project, index) {
        const alt = escapeHtml(`${t(project.titulo)} ${pad(index + 1)}`);
        if (item.type === "video") {
            return `
                <figure class="zoen-gallery-slide">
                    <video controls playsinline preload="none" poster="${encodeSrc(item.poster)}">
                        <source src="${encodeSrc(item.src)}" type="video/mp4">
                    </video>
                </figure>`;
        }
        return `
            <figure class="zoen-gallery-slide">
                <img src="${encodeSrc(item.src)}" alt="${alt}" loading="lazy" decoding="async">
            </figure>`;
    }

    // Project sheets - header, facts, gallery and copy per folder.
    function renderProjects() {
        if (!root) return;
        const projects = content().projects || [];
        const labels = content().factsLabels || {};
        const galeria = content().galeria || {};
        root.innerHTML = "";

        projects.forEach((project, index) => {
            const code = projectCode(index);
            const media = projectMedia(project);
            const first = media[0];
            const orient = first && first.h > first.w ? "portrait" : "landscape";
            const codeLine = [code, t(project.lugar), project.anio].filter(Boolean).join(" — ");

            const section = document.createElement("section");
            section.className = `zoen-project zoen-project--${orient} zoen-reveal`;
            section.id = project.id;

            section.innerHTML = `
                <span class="zoen-mark zoen-mark--tl" aria-hidden="true"></span>
                <span class="zoen-mark zoen-mark--tr" aria-hidden="true"></span>
                <span class="zoen-mark zoen-mark--bl" aria-hidden="true"></span>
                <span class="zoen-mark zoen-mark--br" aria-hidden="true"></span>

                <div class="zoen-project-head">
                    <p class="zoen-project-code">${escapeHtml(codeLine)}</p>
                    <h2 class="zoen-project-title">${escapeHtml(t(project.titulo))}</h2>
                    <div class="zoen-project-facts">
                        <p><span>${t(labels.rol) || "Rol"}</span>${escapeHtml(t(project.rol))}</p>
                        <p><span>${t(labels.ref) || "Ref"}</span>${escapeHtml(project.ref || "RM × ZC")} / ${code}</p>
                    </div>
                </div>

                <div class="zoen-project-media">
                    <div class="zoen-gallery">
                        <div class="zoen-gallery-track">
                            ${media.map((item, i) => slideMarkup(item, project, i)).join("")}
                        </div>
                        <button type="button" class="zoen-gallery-nav zoen-gallery-nav--prev" aria-label="${t(galeria.prev)}">←</button>
                        <button type="button" class="zoen-gallery-nav zoen-gallery-nav--next" aria-label="${t(galeria.next)}">→</button>
                    </div>
                    <p class="zoen-gallery-counter">
                        <span class="zoen-gallery-count"></span>
                        <span class="zoen-gallery-label"></span>
                    </p>
                </div>

                <div class="zoen-project-body">
                    <p>${escapeHtml(t(project.texto))}</p>
                </div>
            `;

            root.appendChild(section);
            bindGallery(section, project, media);
        });

        observeReveals();
    }

    // Project gallery - arrows, counter, label and pausing hidden videos.
    function bindGallery(section, project, media) {
        const track = section.querySelector(".zoen-gallery-track");
        const prev = section.querySelector(".zoen-gallery-nav--prev");
        const next = section.querySelector(".zoen-gallery-nav--next");
        const countEl = section.querySelector(".zoen-gallery-count");
        const labelEl = section.querySelector(".zoen-gallery-label");
        if (!track) return;

        const total = media.length;

        function current() {
            return Math.round(track.scrollLeft / (track.clientWidth || 1));
        }

        function update() {
            const i = Math.min(total - 1, Math.max(0, current()));
            if (countEl) countEl.textContent = total ? `${pad(i + 1)} / ${pad(total)}` : "";
            if (labelEl) labelEl.textContent = project.showLabels && media[i] ? media[i].label : "";
            if (prev) prev.disabled = i <= 0;
            if (next) next.disabled = i >= total - 1;
            track.querySelectorAll("video").forEach((video) => {
                const slide = video.closest(".zoen-gallery-slide");
                const slideIndex = Array.prototype.indexOf.call(track.children, slide);
                if (slideIndex !== i && !video.paused) video.pause();
            });
        }

        function go(direction) {
            const target = Math.min(total - 1, Math.max(0, current() + direction));
            track.scrollTo({ left: target * track.clientWidth, behavior: "smooth" });
        }

        prev?.addEventListener("click", () => go(-1));
        next?.addEventListener("click", () => go(1));
        track.addEventListener("scroll", update, { passive: true });
        window.addEventListener("resize", update);

        if (total <= 1) {
            prev?.setAttribute("hidden", "");
            next?.setAttribute("hidden", "");
        }
        update();
    }

    // Index strip - jump links to each project code.
    function renderIndex() {
        if (!indexEl) return;
        const projects = content().projects || [];
        indexEl.innerHTML = "";

        projects.forEach((project, index) => {
            const a = document.createElement("a");
            a.href = `#${project.id}`;
            a.textContent = `${projectCode(index)} ${t(project.titulo)}`;
            indexEl.appendChild(a);
        });
    }

    // Tile size cycle - varied mosaic cells (lg / tall / wide / sq).
    const STILL_SIZES = ["lg", "sq", "tall", "wide", "sq", "sq"];

    // Mosaic order - round-robin across projects so every folder shows up early.
    function mosaicItems() {
        const projects = content().projects || [];
        const lists = projects.map((project) =>
            projectMedia(project).map((item) => ({
                project,
                src: item.type === "video" ? item.poster : item.src,
            }))
        );
        const out = [];
        const longest = Math.max(0, ...lists.map((list) => list.length));
        for (let i = 0; i < longest; i += 1) {
            lists.forEach((list) => {
                if (list[i]) out.push(list[i]);
            });
        }
        return out;
    }

    // Hero single image - one fixed still linked to its project, no mosaic arrows.
    function renderHeroImage(hero) {
        const project = (content().projects || []).find((p) => p.id === hero.imagenProyecto);
        stillsEl.classList.add("zoen-hero-stills--single");
        stillsPrev?.setAttribute("hidden", "");
        stillsNext?.setAttribute("hidden", "");

        const link = document.createElement("a");
        link.className = "zoen-hero-still zoen-hero-still--full";
        link.href = project ? `#${project.id}` : "#zoenProjects";
        if (project) link.title = t(project.titulo);

        const img = document.createElement("img");
        img.src = encodeSrc(hero.imagen);
        img.alt = project ? t(project.titulo) : "Zoen Calega";
        img.decoding = "async";
        link.appendChild(img);
        stillsEl.appendChild(link);
    }

    // Hero stills - single image when configured, else mosaic with horizontal scroll.
    function renderStills() {
        if (!stillsEl) return;
        stillsEl.innerHTML = "";

        const hero = content().hero || {};
        if (hero.imagen) {
            renderHeroImage(hero);
            return;
        }

        mosaicItems().forEach((item, index) => {
            const size = STILL_SIZES[index % STILL_SIZES.length];
            const link = document.createElement("a");
            link.className = `zoen-hero-still zoen-hero-still--${size}`;
            link.href = `#${item.project.id}`;
            link.title = t(item.project.titulo);

            const img = document.createElement("img");
            img.src = encodeSrc(item.src);
            img.alt = t(item.project.titulo);
            img.loading = index < 6 ? "eager" : "lazy";
            img.decoding = "async";
            link.appendChild(img);
            stillsEl.appendChild(link);
        });
    }

    // Stills nav state - enable/disable arrow buttons.
    function updateStillsNav() {
        if (!stillsEl) return;
        const max = Math.max(0, stillsEl.scrollWidth - stillsEl.clientWidth);
        const left = stillsEl.scrollLeft;
        if (stillsPrev) stillsPrev.disabled = left <= 2;
        if (stillsNext) stillsNext.disabled = left >= max - 2 || max <= 0;
    }

    // Step mosaic by roughly one viewport of tiles.
    function stepStills(direction) {
        if (!stillsEl) return;
        const step = Math.max(stillsEl.clientWidth * 0.72, 160);
        stillsEl.scrollBy({ left: direction * step, behavior: "smooth" });
    }

    // Wheel + buttons over stills - horizontal browse of project snapshot.
    function bindStillsWheel() {
        if (!stillsEl || stillsEl.dataset.wheelBound) return;
        stillsEl.dataset.wheelBound = "1";

        stillsEl.addEventListener(
            "wheel",
            (event) => {
                if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
                if (stillsEl.scrollWidth <= stillsEl.clientWidth + 1) return;
                event.preventDefault();
                stillsEl.scrollLeft += event.deltaY;
            },
            { passive: false }
        );

        stillsEl.addEventListener("scroll", updateStillsNav, { passive: true });
        window.addEventListener("resize", updateStillsNav);
        stillsPrev?.addEventListener("click", () => stepStills(-1));
        stillsNext?.addEventListener("click", () => stepStills(1));
        updateStillsNav();
        requestAnimationFrame(updateStillsNav);
    }

    // Hero metadata blocks - production sheet fields.
    function renderMeta() {
        const metaRoot = document.getElementById("zoenMeta");
        if (!metaRoot) return;
        const blocks = content().metaBlocks || [];
        metaRoot.innerHTML = blocks
            .map((block) => {
                const value = t(block.value).replace(/\n/g, "<br>");
                return `
            <div class="zoen-meta-block">
                <dt>${t(block.label)}</dt>
                <dd>${value}</dd>
            </div>`;
            })
            .join("");
    }

    // Footer credits - linked names (external ones in a new tab) plus role.
    function renderCreditos() {
        const el = document.getElementById("zoenCreditos");
        if (!el) return;
        const creditos = (content().footer || {}).creditos || [];
        el.innerHTML = creditos
            .map((c) => {
                const target = c.externo ? ' target="_blank" rel="noopener"' : "";
                return `<a href="${escapeHtml(c.url)}"${target}>${escapeHtml(c.nombre)}</a> · ${escapeHtml(t(c.rol))}`;
            })
            .join("<br>");
    }

    // Resolve dotted path including array indexes - e.g. hero.titulo.
    function resolvePath(path) {
        return path.split(".").reduce((node, part) => {
            if (node == null) return null;
            return node[part];
        }, content());
    }

    // Reveal on scroll - 2-3 intentional motions.
    function observeReveals() {
        const nodes = document.querySelectorAll(".zoen-reveal");
        if (!nodes.length) return;

        const io = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;
                    entry.target.classList.add("is-in");
                    io.unobserve(entry.target);
                });
            },
            { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
        );

        nodes.forEach((node) => io.observe(node));
    }

    function refreshI18nSurface() {
        renderMeta();
        renderStills();
        bindStillsWheel();
        updateStillsNav();
        renderIndex();
        renderProjects();
        renderCreditos();

        const meta = content().meta;
        if (meta && meta.title) document.title = t(meta.title);

        document.querySelectorAll("[data-zoen]").forEach((el) => {
            const node = resolvePath(el.getAttribute("data-zoen"));
            if (node == null) return;
            const value = t(node);
            if (el.hasAttribute("data-zoen-html")) {
                el.innerHTML = value.replace(/\n/g, "<br>");
            } else {
                el.textContent = value;
            }
        });
    }

    document.addEventListener("site:langchange", refreshI18nSurface);

    function init() {
        refreshI18nSurface();
        document.querySelector(".zoen-hero")?.classList.add("zoen-reveal", "is-in");
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
