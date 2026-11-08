/* =====================================================
   ENTRE NÓS — IA 5.0 (módulo de melhorias)
   Carregue DEPOIS do ia.js. Não altera o ia.js:
   ele "embrulha" as funções analisarMensagemLocalIA e
   responderComAtraso, então tudo continua funcionando.

   Novidades:
   1. Detecta texto sem sentido ("asfasfafsa", "dfgh", "qwerty")
   2. Detecta mensagens curtas demais ("a", "da", "xsa")
   3. Corrige erros de digitação (ex.: "ameasa" -> "ameaca")
   4. Detecta risco de vida e mostra o CVV (188) na hora
   5. Botões de resposta rápida (chips) clicáveis
   6. Exercício de respiração guiado dentro do chat
===================================================== */

(function () {

    "use strict";

    if (typeof analisarMensagemLocalIA !== "function" ||
        typeof responderComAtraso !== "function") {
        console.warn("ia-melhorias.js: carregue-o depois do ia.js.");
        return;
    }

    /* ---------- Vocabulário básico ---------- */

    const FUNCAO = new Set(
        "a e o as os um uma uns de do da dos das em no na nos nas por pra para com sem ou que se me te eu tu".split(" ")
    );

    const BASICAS = (
        "sim nao ok oi ola ei eai hey ah eh ne ta to ai ue bom boa bem mal tudo nada algo medo dor paz amor " +
        "ajuda ajudar triste sozinho sozinha cansado cansada briga brigou gritou ciume namoro namorado namorada " +
        "marido esposa amigo amiga mae pai casa sei quero posso pode tenho estou sou foi vai vou tem ter era ser " +
        "tchau valeu obrigado obrigada talvez agora hoje ontem muito pouco mais menos como onde quem quando " +
        "porque pq vc vcs voce ele ela eles elas meu minha seu sua isso esse essa aqui ali la ja nem mas ainda " +
        "sempre nunca depois antes"
    ).split(" ");

    let lex = null;
    let vocab = [];
    let fonte = null;

    function construirLexico() {

        if (lex && fonte === conhecimentoIA) return;

        fonte = conhecimentoIA;
        lex = new Set([...FUNCAO, ...BASICAS]);

        const visitar = (obj) => {

            if (!obj || typeof obj !== "object") return;

            if (Array.isArray(obj.palavras)) {
                obj.palavras.forEach((p) =>
                    normalizarTexto(p).split(/[^a-z]+/).forEach((w) => w && lex.add(w))
                );
            }

            Object.values(obj).forEach((v) => {
                if (v && typeof v === "object" && !Array.isArray(v)) visitar(v);
            });

        };

        visitar(conhecimentoIA);

        vocab = [...lex].filter((w) => w.length >= 5);

    }

    /* ---------- Detector de texto sem sentido ---------- */

    const TECLADO = ["qwertyuiop", "asdfghjkl", "zxcvbnm"].flatMap((l) => [l, [...l].reverse().join("")]);

    function temSequenciaTeclado(t) {
        for (let i = 0; i + 4 <= t.length; i++) {
            const trecho = t.slice(i, i + 4);
            if (TECLADO.some((linha) => linha.includes(trecho))) return true;
        }
        return false;
    }

    // Quantos "sinais de bagunça" a palavra tem
    function sinais(t) {

        const vogais = (t.match(/[aeiou]/g) || []).length;
        let s = 0;

        if (t.length >= 3 && vogais === 0) s++;                       // sem vogais: "dfgh"
        if (/(.)\1{2,}/.test(t)) s++;                                 // letra triplicada: "aaaa"
        if (/[^aeiou]{5,}/.test(t)) s++;                              // muitas consoantes juntas
        if (t.length >= 5 && (vogais / t.length < 0.2 || vogais / t.length > 0.8)) s++;
        if (temSequenciaTeclado(t)) s++;                              // "asdf", "qwer"
        if (t.length >= 6 && new Set(t).size <= t.length * 0.4) s++;  // poucas letras diferentes: "asfasfafsa"
        if (t.length >= 6 && /^(.{2,4})\1+.?$/.test(t)) s++;          // padrão repetido: "abcabc"

        return s;

    }

    function distancia1(a, b) {

        if (Math.abs(a.length - b.length) > 1) return false;

        let i = 0, j = 0, d = 0;

        while (i < a.length && j < b.length) {

            if (a[i] === b[j]) { i++; j++; continue; }

            if (++d > 1) return false;

            if (a.length > b.length) i++;
            else if (a.length < b.length) j++;
            else { i++; j++; }

        }

        return d + (a.length - i) + (b.length - j) <= 1;

    }

    // Corrige erros de digitação de 1 letra usando o vocabulário do JSON
    function corrigir(n) {

        return n.replace(/[a-z]{5,}/g, (w) => {

            if (lex.has(w)) return w;

            for (const v of vocab) {
                if (distancia1(w, v)) return v;
            }

            return w;

        });

    }

    function classificar(n) {

        const t = n.split(/[^a-z]+/).filter(Boolean);

        if (!t.length) return "semsentido";

        if (t.every((x) => /^(k{2,}|(ha|he|hi)+h?|rs+)$/.test(x))) return "riso";

        let ruins = 0;

        t.forEach((x) => {
            if (lex.has(x)) return;
            if (x.length <= 2 || sinais(x) > 0) ruins++;
        });

        if (ruins / t.length >= 0.6) return "semsentido";

        if (t.every((x) => FUNCAO.has(x))) return "incompleto";

        if (t.length === 1 && !lex.has(t[0]) && t[0].length <= 5) return "incompleto";

        return "ok";

    }

    /* ---------- Textos ---------- */

    const R = {

        semsentido: [
            "Hmm, não consegui entender essa mensagem. Pode escrever de outro jeito?",
            "Acho que algo saiu embaralhado por aqui. Tente me contar com outras palavras, sem pressa.",
            "Não consegui ler isso como uma frase. Se preferir, escolha uma opção abaixo ou escreva de novo."
        ],

        incompleto: [
            "Sua mensagem ficou bem curtinha e eu não quero adivinhar o que você quis dizer. Pode me contar um pouco mais?",
            "Quero entender você direito. Consegue completar a frase?",
            "Entendi só um pedacinho. Quer me explicar melhor?"
        ],

        riso: [
            "Que bom ver um pouco de leveza! Quer me contar o que está passando pela sua cabeça?",
            "Fico feliz em ver um sorriso por aí. Sobre o que você gostaria de conversar?"
        ],

        insistente:
            "Parece que está difícil escrever agora, e tudo bem. Você não precisa ter pressa nem explicar tudo. " +
            "Se preferir, escolha uma opção abaixo ou volte quando quiser."

    };

    const MSG_VIDA = [
        "Sinto muito que você esteja com tanta dor. Você não precisa passar por isso sozinho(a), e a sua vida importa. " +
        "Se está pensando em se machucar ou em tirar a própria vida, ligue agora para o CVV no 188 (24 h, gratuito) " +
        "ou para o SAMU 192 / Polícia 190 se houver risco imediato, e, se puder, fique perto de alguém de confiança. " +
        "Estou aqui com você."
    ];

    const RISCO_VIDA = [
        /quero morrer/, /vou me matar/, /\bme matar\b/, /suicid/,
        /nao quero (mais )?viver/, /acabar com (a )?minha vida/,
        /tirar (a )?minha (propria )?vida/, /(vou|quero|pensando em) me (machucar|cortar)/,
        /automutila/
    ];

    const RESPIRAR = /respirar|respiracao|ansios|ansiedade|panico|coracao acelerado|nervos[oa]/;

    const CHIPS_BASE = [
        ["Quero conversar", "Quero conversar"],
        ["Não sei o que fazer", "Não sei o que fazer"],
        ["Respirar um pouco", "@respirar"]
    ];

    /* ---------- Botões de resposta rápida ---------- */

    function removerChips() {
        document.querySelectorAll(".chips-ia").forEach((el) => el.remove());
    }

    function adicionarChips(lista) {

        if (!mensagensIA) return;

        removerChips();

        const caixa = document.createElement("div");
        caixa.className = "chips-ia";

        lista.forEach(([rotulo, valor]) => {

            const botao = document.createElement("button");
            botao.type = "button";
            botao.textContent = rotulo;

            botao.addEventListener("click", () => {

                removerChips();

                if (valor === "@respirar") {
                    mostrarRespiracao();
                    return;
                }

                campoIA.value = valor;
                ajustarTextarea();
                enviarMensagemIA();

            });

            caixa.appendChild(botao);

        });

        mensagensIA.appendChild(caixa);
        rolarMensagens();

    }

    /* ---------- Exercício de respiração ---------- */

    let timerRespiracao = null;

    function pararRespiracao() {
        clearTimeout(timerRespiracao);
        document.querySelectorAll(".cartao-respiracao").forEach((el) => el.remove());
    }

    function mostrarRespiracao() {

        if (!mensagensIA) return;

        pararRespiracao();

        const cartao = document.createElement("div");
        cartao.className = "cartao-respiracao";
        cartao.innerHTML =
            '<div class="resp-bola"></div>' +
            '<strong class="resp-texto">Prepare-se...</strong>' +
            '<button type="button" class="resp-fechar">Encerrar exercício</button>';

        mensagensIA.appendChild(cartao);
        rolarMensagens();

        const bola = cartao.querySelector(".resp-bola");
        const texto = cartao.querySelector(".resp-texto");

        cartao.querySelector(".resp-fechar").addEventListener("click", pararRespiracao);

        const fases = [
            ["Inspire pelo nariz...", 4000],
            ["Segure...", 2000],
            ["Solte devagar pela boca...", 6000]
        ];

        let ciclo = 0, fase = 0;

        const passo = () => {

            if (!cartao.isConnected) return;

            if (ciclo >= 3) {
                texto.textContent = "Muito bem. Como você está se sentindo agora?";
                bola.style.animation = "none";
                return;
            }

            texto.textContent = fases[fase][0];

            timerRespiracao = setTimeout(() => {
                fase++;
                if (fase >= fases.length) { fase = 0; ciclo++; }
                passo();
            }, fases[fase][1]);

        };

        passo();

    }

    /* ---------- Encaixe no ia.js ---------- */

    let invalidas = 0;
    let chipsPendentes = null;

    const analisarOriginal = analisarMensagemLocalIA;
    const responderOriginal = responderComAtraso;

    window.responderComAtraso = function (resposta, depois) {

        const chips = chipsPendentes;
        chipsPendentes = null;

        responderOriginal(resposta, function () {
            if (typeof depois === "function") depois();
            if (chips) adicionarChips(chips);
        });

    };

    window.analisarMensagemLocalIA = function (texto) {

        if (!conhecimentoIA) return analisarOriginal(texto);

        construirLexico();

        const n = normalizarTexto(texto);

        // 1) Risco de vida: prioridade máxima
        if (RISCO_VIDA.some((r) => r.test(n))) {
            invalidas = 0;
            ultimoCartaoEm = -99;
            return responderComAtraso(escolherAleatorio(MSG_VIDA), adicionarCartaoEmergencia);
        }

        // 2) Corrige digitação e classifica
        const corrigido = corrigir(n);
        const tipo = classificar(corrigido);

        if (tipo === "riso") {
            invalidas = 0;
            return responderComAtraso(escolherRespostaDiferente(R.riso));
        }

        if (tipo === "semsentido" || tipo === "incompleto") {
            invalidas++;
            chipsPendentes = CHIPS_BASE;
            return responderComAtraso(
                invalidas >= 3 ? R.insistente : escolherRespostaDiferente(R[tipo])
            );
        }

        invalidas = 0;

        // 3) Pediu para respirar / ansiedade
        if (RESPIRAR.test(corrigido)) {
            return responderComAtraso(
                "Vamos fazer uma pausa juntos. Acompanhe o círculo, no seu ritmo.",
                mostrarRespiracao
            );
        }

        // 4) Sugere respirar após medo, tristeza ou confusão
        const cats = detectarCategorias(corrigido);

        if (!cats.includes("ameaca") &&
            cats.some((c) => ["medo", "tristeza", "confusao"].includes(c))) {
            chipsPendentes = [["Respirar um pouco", "@respirar"]];
        }

        // 5) Segue o fluxo original, já com o texto corrigido
        analisarOriginal(corrigido);

    };

    document.getElementById("formIA")?.addEventListener("submit", removerChips, true);
    document.getElementById("btnReiniciarIA")?.addEventListener("click", () => {
        invalidas = 0;
        chipsPendentes = null;
        pararRespiracao();
    });

    /* ---------- Estilos (injetados, sem mexer no style.css) ---------- */

    const estilo = document.createElement("style");

    estilo.textContent = `
        .chips-ia { display:flex; flex-wrap:wrap; gap:8px; margin:2px 0 12px; }
        .chips-ia button {
            padding:8px 13px; color:#6d35a8; background:#fff; font-size:12px; font-weight:600;
            border:1px solid #e0cdee; border-radius:20px; cursor:pointer; transition:.2s ease;
        }
        .chips-ia button:hover { color:#fff; background:linear-gradient(135deg,#7041b8,#f34f91); border-color:transparent; }

        .cartao-respiracao {
            display:flex; flex-direction:column; align-items:center; gap:14px;
            margin:6px 0 12px; padding:22px 16px; text-align:center;
            background:linear-gradient(135deg,#f5edff,#fff0f7);
            border:1px solid #e4d4ef; border-radius:16px;
        }
        .resp-bola {
            width:70px; height:70px; border-radius:50%;
            background:linear-gradient(135deg,#7041b8,#f34f91);
            box-shadow:0 0 0 10px rgba(112,65,184,.12);
            animation:respirar 12s ease-in-out infinite;
        }
        .resp-texto { color:#45206d; font-size:14px; min-height:20px; }
        .resp-fechar {
            padding:6px 12px; color:#6d35a8; background:#fff; font-size:11px; font-weight:600;
            border:1px solid #e0cdee; border-radius:14px; cursor:pointer;
        }
        @keyframes respirar {
            0%   { transform:scale(1); }
            33%  { transform:scale(1.5); }
            50%  { transform:scale(1.5); }
            100% { transform:scale(1); }
        }
        @media (prefers-reduced-motion: reduce) { .resp-bola { animation:none; } }
    `;

    document.head.appendChild(estilo);

})();
