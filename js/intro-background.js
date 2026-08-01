/**
 * Fondo aleatorio en #intro: imagenes horizontales de las series.
 */
(function () {
    const BACKGROUNDS = [
        'ruedas de energia/liquen.webp',
        'ruedas de energia/Energy wheels.webp',
        'ruedas de energia/Hanged memories.webp',
        'ruedas de energia/Infinito.webp',
        'ruedas de energia/Mercado.webp',
        'ruedas de energia/Migration.webp',
        'videopoetry/portada videopoetry.webp',
        'mixed faces/Annunciation Details.webp',
        'mixed faces/Buttler make the house bigger.webp',
        'mixed faces/Gamers.webp',
        'mixed faces/Holy Mother and Lamb.webp',
        'mixed faces/Pleasure.webp',
        'mixed faces/Point of view.webp',
        'mixed faces/Selfportrait.webp',
        'mixed faces/Workers.webp',
        'mixed faces/they_could_be_gardeners-.webp',
        'mixed faces/this lake was created on a slide that had a lake on it but didn\'t look like one I could swim in.webp',
        'still a moment/cada_pixel.webp',
        'still a moment/drop1.webp',
        'still a moment/emotional 2.webp',
        'still a moment/formato_infinito_resized.webp',
        'still a moment/portada.webp',
        'still a moment/ultima_resized.webp',
        'typemachine/move. stop. move. move. don\'t stop.webp',
        'typemachine/spectrum of root life.webp',
    ];

    function srcUrl(path) {
        return path
            .split('/')
            .map((part, i) => (i === 0 ? part : encodeURIComponent(part)))
            .join('/');
    }

    const intro = document.getElementById('intro');
    if (!intro || !BACKGROUNDS.length) return;

    const pick = BACKGROUNDS[Math.floor(Math.random() * BACKGROUNDS.length)];
    const url = srcUrl(pick);
    const img = new Image();

    img.onload = function () {
        intro.style.backgroundImage = `url("${url}")`;
        intro.classList.add('intro-con-imagen');
    };

    img.onerror = function () {
        intro.style.backgroundImage = `url("${srcUrl('ruedas de energia/liquen.webp')}")`;
        intro.classList.add('intro-con-imagen');
    };

    img.src = url;
})();
