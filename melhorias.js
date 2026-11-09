/* =====================================================
   ENTRE NÓS — MELHORIAS DO SITE
   1. Modo escuro (lembra a escolha e respeita o sistema)
   2. Saída rápida (botão ou Esc duas vezes) para quem
      precisa sair do site com privacidade
   3. Atalhos 1, 2 e 3 para responder o questionário
===================================================== */

(function () {

    "use strict";

    const html = document.documentElement;
    const $ = (id) => document.getElementById(id);

    /* ---------- 1) MODO ESCURO ---------- */

    let salvo = null;

    try { salvo = localStorage.getItem("entrenos-tema"); } catch (e) { /* sem armazenamento */ }

    let escuro = salvo
        ? salvo === "escuro"
        : window.matchMedia("(prefers-color-scheme: dark)").matches;

    const btnTema = document.createElement("button");
    btnTema.type = "button";
    btnTema.className = "btn-tema";

    function aplicarTema() {

        html.setAttribute("data-tema", escuro ? "escuro" : "claro");

        btnTema.innerHTML = escuro
            ? '<i class="fa-solid fa-sun"></i>'
            : '<i class="fa-solid fa-moon"></i>';

        btnTema.setAttribute("aria-label", escuro ? "Ativar tema claro" : "Ativar tema escuro");

        const meta = document.querySelector('meta[name="theme-color"]');
        if (meta) meta.setAttribute("content", escuro ? "#2a1640" : "#6d35a8");

    }

    btnTema.addEventListener("click", () => {

        escuro = !escuro;
        aplicarTema();

        try { localStorage.setItem("entrenos-tema", escuro ? "escuro" : "claro"); } catch (e) { /* ignora */ }

    });

    aplicarTema();
    $("header")?.appendChild(btnTema);

    /* ---------- 2) SAÍDA RÁPIDA ---------- */

    function sairRapido() {

        try {
            $("quiz")?.reset();
            sessionStorage.clear();
        } catch (e) { /* ignora */ }

        // replace: o site não fica no histórico do botão "voltar"
        window.location.replace("https://www.google.com.br");

    }

    const btnSaida = document.createElement("button");
    btnSaida.type = "button";
    btnSaida.className = "btn-saida-rapida";
    btnSaida.title = "Sair do site agora (ou aperte Esc duas vezes)";
    btnSaida.innerHTML = '<i class="fa-solid fa-person-walking-arrow-right"></i> Saída rápida';
    btnSaida.addEventListener("click", sairRapido);

    document.body.appendChild(btnSaida);

    let ultimoEsc = 0;

    document.addEventListener("keydown", (evento) => {

        if (evento.key !== "Escape") return;

        const agora = Date.now();

        if (agora - ultimoEsc < 700) sairRapido();

        ultimoEsc = agora;

    });

    /* ---------- 3) ATALHOS DO QUESTIONÁRIO ---------- */

    document.addEventListener("keydown", (evento) => {

        if (!/^[1-3]$/.test(evento.key)) return;
        if (evento.ctrlKey || evento.metaKey || evento.altKey) return;

        const alvo = evento.target;

        if (alvo && /^(INPUT|TEXTAREA|SELECT)$/.test(alvo.tagName) && alvo.type !== "radio") return;

        if ($("janelaIA")?.classList.contains("ativa")) return;
        if ($("modalAcolhimento")?.classList.contains("ativo")) return;
        if ($("questionario")?.style.display === "none") return;

        const opcoes = document.querySelectorAll(".pergunta.ativa input[type='radio']");
        const escolhida = opcoes[Number(evento.key) - 1];

        if (!escolhida) return;

        escolhida.checked = true;
        escolhida.dispatchEvent(new Event("change", { bubbles: true }));

    });

})();
