/**
 * i18n compartido: toggle ES/EN (site-lang en localStorage).
 */
(function () {
    const STORAGE_KEY = 'site-lang';

    function detectLang() {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved === 'es' || saved === 'en') return saved;
        const legacy = localStorage.getItem('landing-lang') || localStorage.getItem('bosquegracias-lang');
        if (legacy === 'es' || legacy === 'en') return legacy;
        const nav = (navigator.language || 'es').toLowerCase();
        return nav.startsWith('en') ? 'en' : 'es';
    }

    let currentLang = detectLang();

    function content() {
        return window.PAGE_I18N_CONTENT || window.LANDING_CONTENT || window.PROCESOS_CONTENT || window.SERIES_UI || null;
    }

    function get(obj, path) {
        return path.split('.').reduce((acc, key) => {
            if (acc === null || acc === undefined) return null;
            if (Array.isArray(acc) && /^\d+$/.test(key)) return acc[Number(key)];
            return acc[key];
        }, obj);
    }

    function t(obj) {
        if (!obj) return '';
        if (typeof obj === 'string') return obj;
        return obj[currentLang] || obj.es || obj.en || '';
    }

    function updateCarpetaLabels() {
        const block = get(content(), 'carpeta');
        if (!block) return;
        const label = t(block);
        document.querySelectorAll('[data-carpeta-tag]').forEach((el) => {
            const tag = el.getAttribute('data-carpeta-tag');
            el.textContent = `${label}: ${tag}`;
        });
    }

    function renderAll() {
        const data = content();
        if (!data) return;

        document.querySelectorAll('[data-i18n]').forEach((el) => {
            const key = el.getAttribute('data-i18n');
            const block = get(data, key);
            const text = t(block);
            if (text) el.textContent = text;
        });

        document.querySelectorAll('[data-i18n-html]').forEach((el) => {
            const key = el.getAttribute('data-i18n-html');
            const block = get(data, key);
            const text = t(block);
            if (text) el.innerHTML = text;
        });

        document.querySelectorAll('[data-i18n-alt]').forEach((el) => {
            const key = el.getAttribute('data-i18n-alt');
            const block = get(data, key);
            const text = t(block);
            if (text) el.setAttribute('alt', text);
        });

        document.querySelectorAll('[data-i18n-aria]').forEach((el) => {
            const key = el.getAttribute('data-i18n-aria');
            const block = get(data, key);
            const text = t(block);
            if (text) el.setAttribute('aria-label', text);
        });

        document.querySelectorAll('[data-i18n-block]').forEach((el) => {
            const key = el.getAttribute('data-i18n-block');
            const langs = key.split('|').map((s) => s.trim());
            el.hidden = !langs.includes(currentLang);
        });

        if (data.meta) {
            document.title = t(data.meta.title);
            const desc = document.querySelector('meta[name="description"]');
            if (desc && data.meta.description) desc.setAttribute('content', t(data.meta.description));
        }

        updateCarpetaLabels();
        document.dispatchEvent(new CustomEvent('site:langchange', { detail: { lang: currentLang } }));
    }

    function updateToggleButtons() {
        document.querySelectorAll('[data-lang-btn]').forEach((btn) => {
            const active = btn.getAttribute('data-lang-btn') === currentLang;
            btn.classList.toggle('activa', active);
            btn.setAttribute('aria-pressed', active ? 'true' : 'false');
        });
    }

    function setLang(lang) {
        currentLang = lang;
        localStorage.setItem(STORAGE_KEY, lang);
        document.documentElement.lang = lang;
        renderAll();
        updateToggleButtons();
    }

    function initToggle() {
        document.querySelectorAll('[data-lang-btn]').forEach((btn) => {
            btn.addEventListener('click', () => setLang(btn.getAttribute('data-lang-btn')));
        });
        document.documentElement.lang = currentLang;
        renderAll();
        updateToggleButtons();
    }

    window.SiteI18n = {
        get lang() { return currentLang; },
        t,
        setLang,
        renderAll,
    };

    window.BosqueI18n = window.SiteI18n;

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initToggle);
    } else {
        initToggle();
    }
})();
