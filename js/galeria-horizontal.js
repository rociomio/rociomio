/**
 * Galerias horizontales: un giro de rueda = un slide.
 * Soporta slides de ancho fijo (TypeMachine, Ruedas) y variable (Videopoetry).
 */
(function () {
    const GALLERY_SELECTOR = '.galeria-obras, .galeria-horizontal';
    const THRESHOLD = 25;
    const wheelAccum = new WeakMap();

    function findGallery(x, y) {
        for (const galeria of document.querySelectorAll(GALLERY_SELECTOR)) {
            const r = galeria.getBoundingClientRect();
            if (y >= r.top && y <= r.bottom && x >= r.left && x <= r.right) {
                return galeria;
            }
        }
        return null;
    }

    function normalizeDelta(e) {
        let dy = e.deltaY;
        let dx = e.deltaX;

        if (e.deltaMode === 1) {
            dy *= 40;
            dx *= 40;
        } else if (e.deltaMode === 2) {
            dy *= window.innerHeight;
            dx *= window.innerWidth;
        }

        if (Math.abs(dy) >= Math.abs(dx) && dy !== 0) return dy;
        if (dx !== 0) return dx;
        return 0;
    }

    function getSlides(galeria) {
        return Array.from(galeria.children);
    }

    function padLeft(galeria) {
        return parseFloat(getComputedStyle(galeria).paddingLeft) || 0;
    }

    function slideTarget(galeria, slide) {
        return slide.offsetLeft - padLeft(galeria);
    }

    function isFixedGallery(galeria) {
        return galeria.classList.contains('galeria-obras');
    }

    function fixedStep(galeria, slides) {
        return galeria.clientWidth || slides[0].offsetWidth || 1;
    }

    /** Slide con mayor area visible (fiable con anchos variables). */
    function currentIndex(galeria, slides) {
        if (!slides.length) return 0;

        if (isFixedGallery(galeria)) {
            const step = fixedStep(galeria, slides);
            return Math.max(0, Math.min(slides.length - 1, Math.round(galeria.scrollLeft / step)));
        }

        const viewLeft = galeria.scrollLeft;
        const viewRight = viewLeft + galeria.clientWidth;

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

    function maxScroll(galeria) {
        return Math.max(0, galeria.scrollWidth - galeria.clientWidth);
    }

    function resolveIndex(galeria, slides, index, direction) {
        let i = Math.max(0, Math.min(slides.length - 1, index));
        const scroll = galeria.scrollLeft;

        if (direction > 0) {
            while (i < slides.length - 1 && slideTarget(galeria, slides[i]) <= scroll + 2) {
                i++;
            }
        } else if (direction < 0) {
            while (i > 0 && slideTarget(galeria, slides[i]) >= scroll - 2) {
                i--;
            }
        }

        return i;
    }

    function goToIndex(galeria, index, slides, direction) {
        if (!slides.length) return;

        const i = Math.max(0, Math.min(slides.length - 1, index));
        const max = maxScroll(galeria);
        let target = 0;

        if (isFixedGallery(galeria)) {
            const step = fixedStep(galeria, slides);
            target = i * step;
        } else {
            const resolved = resolveIndex(galeria, slides, i, direction);
            target = slideTarget(galeria, slides[resolved]);
        }

        galeria.style.scrollSnapType = 'none';
        galeria.scrollLeft = Math.max(0, Math.min(max, target));
    }

    document.addEventListener(
        'wheel',
        (e) => {
            const galeria = findGallery(e.clientX, e.clientY);
            if (!galeria) return;

            const delta = normalizeDelta(e);
            if (!delta) return;

            const slides = getSlides(galeria);
            if (slides.length <= 1) return;

            let acc = (wheelAccum.get(galeria) || 0) + delta;

            if (Math.abs(acc) < THRESHOLD) {
                wheelAccum.set(galeria, acc);
                e.preventDefault();
                return;
            }

            wheelAccum.set(galeria, 0);

            const idx = currentIndex(galeria, slides);
            const dir = delta > 0 ? 1 : -1;
            const next = idx + dir;

            if (next < 0 || next >= slides.length) {
                if (next < 0 && isFixedGallery(galeria)) {
                    goToIndex(galeria, 0, slides, dir);
                }
                e.preventDefault();
                return;
            }

            goToIndex(galeria, next, slides, dir);
            e.preventDefault();
            e.stopPropagation();
        },
        { passive: false, capture: true }
    );

    function resetFixedGalleries() {
        document.querySelectorAll('.galeria-obras').forEach((galeria) => {
            galeria.scrollLeft = 0;
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', resetFixedGalleries);
    } else {
        resetFixedGalleries();
    }
})();
