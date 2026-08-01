/**
 * Carrusel de series en index - flechas izq/der.
 * La rueda del mouse sigue bajando a la seccion de abajo (sin bloqueo horizontal).
 */
(function () {
    const slider = document.getElementById('seriesSlider');
    const btnPrev = document.getElementById('seriesPrev');
    const btnNext = document.getElementById('seriesNext');

    if (!slider || !btnPrev || !btnNext) return;

    function getSlideStep() {
        const slide = slider.querySelector('.slide-proyecto');
        return slide ? slide.offsetWidth : slider.clientWidth * 0.5;
    }

    function scrollSlides(direction) {
        slider.scrollBy({
            left: direction * getSlideStep(),
            behavior: 'smooth',
        });
    }

    function updateButtons() {
        const maxScroll = slider.scrollWidth - slider.clientWidth;
        btnPrev.disabled = slider.scrollLeft <= 4;
        btnNext.disabled = slider.scrollLeft >= maxScroll - 4;
    }

    btnPrev.addEventListener('click', () => scrollSlides(-1));
    btnNext.addEventListener('click', () => scrollSlides(1));

    slider.addEventListener('scroll', updateButtons, { passive: true });
    window.addEventListener('resize', updateButtons);

    updateButtons();
})();
