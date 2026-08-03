/**
 * Colapsa descripciones al salir del inicio del scroll; las restaura al volver.
 *
 * Uso:
 *   data-collapse-scroll="horizontal|vertical|window"  (en el contenedor que scrollea)
 *   data-collapse-host                                 (elemento que recibe .descripcion-colapsada)
 *   data-collapse-panel                                (bloque de descripcion a ocultar)
 */
(function () {
    const THRESHOLD = 48;

    function bindOne(scroller) {
        const mode = scroller.getAttribute("data-collapse-scroll") || "horizontal";
        const host =
            document.querySelector("[data-collapse-host]") ||
            scroller.closest("[data-collapse-host]") ||
            document.body;

        function offset() {
            if (mode === "window") return window.scrollY || document.documentElement.scrollTop || 0;
            if (mode === "vertical") return scroller.scrollTop || 0;
            return scroller.scrollLeft || 0;
        }

        function update() {
            host.classList.toggle("descripcion-colapsada", offset() > THRESHOLD);
        }

        if (mode === "window") {
            window.addEventListener("scroll", update, { passive: true });
        } else {
            scroller.addEventListener("scroll", update, { passive: true });
        }

        update();
    }

    function init() {
        document.querySelectorAll("[data-collapse-scroll]").forEach(bindOne);
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
