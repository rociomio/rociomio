/**
 * Zoen quote form - sends the request by email through FormSubmit (no backend).
 */
(function () {
    // Endpoint config - FormSubmit AJAX inbox for quote requests.
    const ENDPOINT = "https://formsubmit.co/ajax/bosquegracias@gmail.com";

    // Form nodes - form, status line and submit button.
    const form = document.getElementById("zoenQuoteForm");
    if (!form) return;
    const statusEl = document.getElementById("zoenQuoteStatus");
    const sendBtn = form.querySelector(".zoen-quote-send");

    // Copy helpers - quote texts in the active site language.
    function copy(key) {
        const block = ((window.ZOEN_CONTENT || {}).presupuesto || {})[key];
        if (!block) return "";
        if (typeof block === "string") return block;
        const lang = (window.SiteI18n && window.SiteI18n.lang) || "es";
        return block[lang] || block.es || "";
    }

    function setStatus(text, state) {
        statusEl.textContent = text;
        statusEl.dataset.state = state || "";
    }

    // Submit handler - validate, post JSON, report result and reset on success.
    async function onSubmit(event) {
        event.preventDefault();
        if (form.elements._honey.value) return;
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        sendBtn.disabled = true;
        sendBtn.textContent = copy("enviando");
        setStatus("", "");

        const payload = {
            nombre: form.elements.nombre.value.trim(),
            email: form.elements.email.value.trim(),
            mensaje: form.elements.mensaje.value.trim(),
            _subject: copy("asunto"),
            _template: "table",
            _captcha: "false",
        };

        try {
            const res = await fetch(ENDPOINT, {
                method: "POST",
                headers: { "Content-Type": "application/json", Accept: "application/json" },
                body: JSON.stringify(payload),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok || String(data.success) !== "true") throw new Error(data.message || res.status);
            form.reset();
            setStatus(copy("ok"), "ok");
        } catch (err) {
            setStatus(copy("error"), "error");
        } finally {
            sendBtn.disabled = false;
            sendBtn.textContent = copy("enviar");
        }
    }

    form.addEventListener("submit", onSubmit);
})();
