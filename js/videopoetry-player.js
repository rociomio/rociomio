/**
 * Videopoetry gallery - poster + play; video src loads only on user play.
 */
(function () {
    const items = window.VIDEOPOETRY_ITEMS;
    const gallery = document.getElementById("galeriaHorizontal");
    if (!items || !gallery || typeof window.videopoetryArtifactUrl !== "function") return;

    let activeVideo = null;

    // Unload helpers - free bandwidth when switching or stopping a clip.
    function unloadVideo(video) {
        if (!video) return;
        video.pause();
        video.removeAttribute("src");
        video.load();
        video.controls = false;
    }

    function resetItem(item) {
        item.classList.remove("is-playing", "is-loading");
        const video = item.querySelector(".item-video");
        const playBtn = item.querySelector(".btn-play");
        unloadVideo(video);
        if (playBtn) playBtn.hidden = false;
    }

    function stopOthers(exceptItem) {
        gallery.querySelectorAll(".item-media.is-playing, .item-media.is-loading").forEach((item) => {
            if (item !== exceptItem) resetItem(item);
        });
        if (activeVideo && (!exceptItem || !exceptItem.contains(activeVideo))) {
            activeVideo = null;
        }
    }

    // Play handlers - attach src on first play only.
    function playItem(item) {
        const video = item.querySelector(".item-video");
        const playBtn = item.querySelector(".btn-play");
        const src = item.getAttribute("data-video");
        if (!video || !src) return;

        stopOthers(item);
        item.classList.add("is-loading");
        if (playBtn) playBtn.hidden = true;

        if (video.getAttribute("src") !== src) {
            video.src = src;
        }
        video.controls = true;
        activeVideo = video;

        const onReady = () => {
            item.classList.remove("is-loading");
            item.classList.add("is-playing");
        };

        video.addEventListener("loadeddata", onReady, { once: true });
        video.addEventListener(
            "error",
            () => {
                item.classList.remove("is-loading");
                if (playBtn) playBtn.hidden = false;
                window.open(item.getAttribute("data-objkt") || src, "_blank", "noopener");
            },
            { once: true }
        );

        const playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
            playPromise.catch(() => {
                item.classList.remove("is-loading");
                if (playBtn) playBtn.hidden = false;
            });
        }
    }

    // Item factory - poster image, empty video, play button, objkt link.
    function createItem(entry, index) {
        const article = document.createElement("article");
        article.className = "item-media";
        article.setAttribute("data-video", window.videopoetryArtifactUrl(entry.artifact));
        article.setAttribute("data-objkt", entry.url);

        const stage = document.createElement("div");
        stage.className = "item-stage";

        const poster = document.createElement("img");
        poster.className = "item-poster";
        poster.src = entry.thumb;
        poster.alt = entry.name;
        poster.decoding = "async";
        poster.loading = index < 2 ? "eager" : "lazy";

        const video = document.createElement("video");
        video.className = "item-video";
        video.setAttribute("playsinline", "");
        video.setAttribute("preload", "none");
        video.setAttribute("poster", entry.thumb);
        video.controls = false;

        const playBtn = document.createElement("button");
        playBtn.type = "button";
        playBtn.className = "btn-play";
        playBtn.setAttribute("data-i18n-aria", "playVideo");
        playBtn.setAttribute("aria-label", "Reproducir video");
        playBtn.innerHTML = '<span class="btn-play-icon" aria-hidden="true"></span>';

        playBtn.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            playItem(article);
        });

        stage.addEventListener("click", (e) => {
            if (article.classList.contains("is-playing")) return;
            if (e.target.closest("a")) return;
            playItem(article);
        });

        video.addEventListener("ended", () => {
            article.classList.remove("is-playing");
            if (playBtn) playBtn.hidden = false;
        });

        stage.appendChild(poster);
        stage.appendChild(video);
        stage.appendChild(playBtn);

        const caption = document.createElement("span");
        caption.className = "item-caption";
        caption.textContent = entry.name;

        const objkt = document.createElement("a");
        objkt.className = "item-objkt-hint";
        objkt.href = entry.url;
        objkt.target = "_blank";
        objkt.rel = "noopener";
        objkt.setAttribute("data-i18n", "verEnObjkt");
        objkt.textContent = "ver en objkt →";

        article.appendChild(stage);
        article.appendChild(caption);
        article.appendChild(objkt);
        return article;
    }

    gallery.innerHTML = "";
    items.forEach((entry, index) => {
        gallery.appendChild(createItem(entry, index));
    });
})();
