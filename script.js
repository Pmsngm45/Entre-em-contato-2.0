/* =====================================================
   ENTRE NÓS — SISTEMA PRINCIPAL (versão aprimorada)
   Funciona 100% no Live Server, sem PHP.
===================================================== */

"use strict";

/* =====================================================
   CONFIGURAÇÃO
===================================================== */

const CONTATO_CONFIG = {
    // 1) Crie a chave grátis em https://web3forms.com (use pmsantosneto@gmail.com)
    // 2) Cole a chave no lugar de COLE_SUA_CHAVE_AQUI
    // Sem chave, o botão "Enviar" abre o aplicativo de e-mail do visitante.
    web3formsKey: "324a0c3d-64dc-4030-9f06-f30a26e56261",
    emailDestino: "pmsantosneto@gmail.com",
    assunto: "Contato pelo site Entre Nós"
};

const INDICADORES = ["Comunicação", "Respeito", "Confiança", "Liberdade", "Segurança"];

const CANAIS_APOIO = [
    "Ligue 180 - Central de Atendimento à Mulher (gratuito, 24 h)",
    "Disque 100 - Direitos Humanos, inclusive crianças e adolescentes",
    "190 - Polícia Militar (perigo imediato)",
    "188 - CVV, apoio emocional gratuito 24 h (cvv.org.br)"
];

/* =====================================================
   ATALHOS E ELEMENTOS
===================================================== */

const $ = (id) => document.getElementById(id);

const perguntas = document.querySelectorAll(".pergunta");
const totalPerguntas = perguntas.length;

const header = $("header");
const quiz = $("quiz");
const btnProximo = $("btnProximo");
const btnAnterior = $("btnAnterior");
const btnComecar = $("btnComecar");
const btnSaibaMais = $("btnSaibaMais");
const btnRefazer = $("btnRefazer");
const btnPDF = $("btnPDF");

const progresso = $("progresso");
const barraProgresso = document.querySelector(".barra-progresso");
const porcentagem = $("porcentagem");
const contador = $("contador");
const avisoQuiz = $("avisoQuiz");

const questionario = $("questionario");
const analise = $("analise");
const resultado = $("resultado");
const mensagemResultado = $("mensagemResultado");
const orientacoes = $("orientacoes");
const seletorGrafico = $("tipoGrafico");

const modalAcolhimento = $("modalAcolhimento");
const opcoesApoio = $("opcoesApoio");
const opcoesDenuncia = $("opcoesDenuncia");

const formulario = $("formContato");

let perguntaAtual = 0;
let graficoAtual = null;
let tipoGrafico = "barra";
let focoAnterior = null;
let timerAnalise = null;

const reduzirMovimento =
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* =====================================================
   UTILITÁRIOS
===================================================== */

function rolarPara(elemento) {

    if (!elemento) return;

    elemento.scrollIntoView({
        behavior: reduzirMovimento ? "auto" : "smooth",
        block: "start"
    });

}

function nivelIndicador(valor) {

    if (valor >= 70) return { chave: "bom", rotulo: "Bom" };
    if (valor >= 50) return { chave: "atencao", rotulo: "Atenção" };

    return { chave: "alerta", rotulo: "Merece atenção" };

}

function coletarRespostas() {

    const respostas = [];

    for (let i = 1; i <= totalPerguntas; i++) {

        const marcada = document.querySelector(`input[name="q${i}"]:checked`);
        const valor = marcada ? Number(marcada.value) : 0;

        respostas.push(Number.isFinite(valor) ? valor : 0);

    }

    return respostas;

}

function calcularPontos(respostas) {
    return respostas.reduce((total, valor) => total + valor, 0);
}

function calcularIndicador(a, b) {

    const pontos = (a || 0) + (b || 0);
    const valor = 100 - (pontos / 8) * 100;

    return Math.max(0, Math.min(100, Math.round(valor)));

}

function obterIndicadores(respostas) {

    return [0, 2, 4, 6, 8].map((i) =>
        calcularIndicador(respostas[i], respostas[i + 1])
    );

}

/* =====================================================
   CABEÇALHO, MENU ATIVO E ANIMAÇÕES DE ENTRADA
===================================================== */

function configurarNavegacao() {

    // Sombra do cabeçalho ao rolar
    const atualizarHeader = () => {
        header?.classList.toggle("rolado", window.scrollY > 10);
    };

    atualizarHeader();
    window.addEventListener("scroll", atualizarHeader, { passive: true });

    // Link ativo conforme a seção visível
    const links = document.querySelectorAll("nav a[href^='#']");
    const secoes = [...links]
        .map((link) => document.querySelector(link.getAttribute("href")))
        .filter(Boolean);

    if ("IntersectionObserver" in window && secoes.length) {

        const observador = new IntersectionObserver((entradas) => {

            entradas.forEach((entrada) => {

                if (!entrada.isIntersecting) return;

                links.forEach((link) => {
                    const ativo = link.getAttribute("href") === "#" + entrada.target.id;
                    link.classList.toggle("ativo", ativo);
                    if (ativo) link.setAttribute("aria-current", "true");
                    else link.removeAttribute("aria-current");
                });

            });

        }, { rootMargin: "-45% 0px -50% 0px" });

        secoes.forEach((secao) => observador.observe(secao));

    }

    // Aparecer suavemente ao rolar
    const alvos = document.querySelectorAll(".sobre .container, .card, .contato .container");

    if ("IntersectionObserver" in window && !reduzirMovimento) {

        const revelador = new IntersectionObserver((entradas, obs) => {

            entradas.forEach((entrada) => {
                if (entrada.isIntersecting) {
                    entrada.target.classList.add("visivel");
                    obs.unobserve(entrada.target);
                }
            });

        }, { threshold: 0.15 });

        alvos.forEach((el) => {
            el.classList.add("revelar");
            revelador.observe(el);
        });

    }

}

btnComecar?.addEventListener("click", () => rolarPara(questionario));
btnSaibaMais?.addEventListener("click", () => rolarPara($("sobre")));

/* =====================================================
   QUESTIONÁRIO
===================================================== */

function mostrarAviso(texto) {

    if (!avisoQuiz) return;

    avisoQuiz.textContent = texto;
    avisoQuiz.classList.toggle("visivel", Boolean(texto));

}

function mostrarPergunta() {

    if (!totalPerguntas) return;

    perguntas.forEach((pergunta, indice) => {
        pergunta.classList.toggle("ativa", indice === perguntaAtual);
    });

    const valor = ((perguntaAtual + 1) / totalPerguntas) * 100;

    if (contador) contador.textContent = `Pergunta ${perguntaAtual + 1} de ${totalPerguntas}`;
    if (progresso) progresso.style.width = `${valor}%`;
    if (porcentagem) porcentagem.textContent = `${Math.round(valor)}%`;
    barraProgresso?.setAttribute("aria-valuenow", String(Math.round(valor)));

    if (btnAnterior) btnAnterior.disabled = perguntaAtual === 0;

    if (btnProximo) {

        btnProximo.innerHTML =
            perguntaAtual === totalPerguntas - 1
                ? 'Ver resultado <i class="fa-solid fa-chart-pie"></i>'
                : 'Próxima <i class="fa-solid fa-arrow-right"></i>';

    }

    mostrarAviso("");

}

function respostaSelecionada() {

    return Boolean(
        perguntas[perguntaAtual]?.querySelector("input[type='radio']:checked")
    );

}

btnProximo?.addEventListener("click", () => {

    if (!respostaSelecionada()) {
        mostrarAviso("Escolha uma das opções para continuar.");
        return;
    }

    if (perguntaAtual < totalPerguntas - 1) {
        perguntaAtual++;
        mostrarPergunta();
    } else {
        finalizarQuiz();
    }

});

btnAnterior?.addEventListener("click", () => {

    if (perguntaAtual <= 0) return;

    perguntaAtual--;
    mostrarPergunta();

});

quiz?.addEventListener("change", () => mostrarAviso(""));

// Enter avança para a próxima pergunta (em vez de enviar o formulário)
quiz?.addEventListener("keydown", (evento) => {

    if (evento.key === "Enter") {
        evento.preventDefault();
        btnProximo?.click();
    }

});

/* =====================================================
   ANÁLISE E RESULTADO
===================================================== */

function finalizarQuiz() {

    const respostas = coletarRespostas();
    const pontos = calcularPontos(respostas);

    if (questionario) questionario.style.display = "none";

    if (analise) {

        analise.style.display = "block";
        rolarPara(analise);

        // Etapas aparecem uma a uma
        const etapas = analise.querySelectorAll(".etapa");
        etapas.forEach((etapa) => etapa.classList.remove("concluida"));

        etapas.forEach((etapa, i) => {
            setTimeout(() => etapa.classList.add("concluida"), 350 * (i + 1));
        });

    }

    clearTimeout(timerAnalise);

    timerAnalise = setTimeout(() => {

        if (analise) analise.style.display = "none";

        mostrarResultado(respostas, pontos);

    }, 1800);

}

function textoResultado(pontos) {

    if (pontos <= 12) {
        return `
            <h3>Relação com bons sinais</h3>
            <p>Suas respostas indicam presença de respeito, comunicação e equilíbrio.
            Continue valorizando o diálogo, a confiança e o espaço individual.</p>`;
    }

    if (pontos <= 24) {
        return `
            <h3>Atenção a alguns pontos</h3>
            <p>Algumas respostas mostram situações que podem precisar de reflexão.
            Observar seus sentimentos e manter um diálogo saudável pode ajudar.</p>`;
    }

    return `
        <h3>Situações que merecem atenção</h3>
        <p>Algumas respostas apresentaram sinais que merecem atenção. O questionário
        não consegue determinar sozinho o que está acontecendo.</p>
        <p>Se alguma situação fez você se reconhecer aqui, procure conversar com alguém de confiança.</p>`;

}

function mostrarResultado(respostas, pontos) {

    if (!resultado) return;

    resultado.style.display = "block";

    if (mensagemResultado) mensagemResultado.innerHTML = textoResultado(pontos);

    atualizarOrientacoes(respostas, pontos);
    atualizarIndicadores(respostas);

    if (seletorGrafico) seletorGrafico.value = tipoGrafico;

    gerarGrafico(respostas, tipoGrafico);

    rolarPara(resultado);

    // Leva o foco ao título para leitores de tela
    setTimeout(() => $("tituloResultado")?.focus({ preventScroll: true }), 400);

    verificarNecessidadeDeAcolhimento(respostas, pontos);

}

function atualizarIndicadores(respostas) {

    const valores = obterIndicadores(respostas);

    const ids = [
        ["valorComunicacao", "grafico1"],
        ["valorRespeito", "grafico2"],
        ["valorConfianca", "grafico3"],
        ["valorLiberdade", "grafico4"],
        ["valorSeguranca", "grafico5"]
    ];

    ids.forEach(([idTexto, idBarra], i) => {

        const texto = $(idTexto);
        const barra = $(idBarra);
        const nivel = nivelIndicador(valores[i]);

        if (texto) texto.textContent = `${valores[i]}%`;

        texto?.closest(".item-grafico")?.setAttribute("data-nivel", nivel.chave);

        if (barra) {

            barra.style.width = "0%";

            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    barra.style.width = `${valores[i]}%`;
                });
            });

        }

    });

}

function atualizarOrientacoes(respostas, pontos) {

    if (!orientacoes) return;

    const valores = obterIndicadores(respostas);
    const baixos = INDICADORES.filter((_, i) => valores[i] < 50);

    if (pontos <= 12) {

        orientacoes.innerHTML = `
            <strong>Reflexão</strong>
            <p>As respostas apresentaram bons indicadores gerais. Continue valorizando
            respeito, diálogo, confiança e liberdade.</p>`;

        return;

    }

    if (baixos.length) {

        orientacoes.innerHTML = `
            <strong>Pontos que merecem atenção</strong>
            <p>Alguns indicadores apresentaram resultados mais baixos:
            <strong>${baixos.join(", ")}</strong>.</p>
            <p>Este resultado é apenas uma ferramenta de reflexão e não substitui
            uma avaliação profissional.</p>`;

        return;

    }

    orientacoes.innerHTML = `
        <strong>Reflexão</strong>
        <p>Algumas respostas indicam pontos que podem ser observados com mais cuidado.
        Conversar com alguém de confiança pode ajudar.</p>`;

}

/* =====================================================
   GRÁFICO (barras ou radar, escolhidos no seletor)
===================================================== */

function gerarGrafico(respostas, tipo) {

    const canvas = $("graficoResultado");

    if (!canvas) return;

    if (typeof Chart === "undefined") {
        console.error("Chart.js não foi carregado.");
        return;
    }

    graficoAtual?.destroy();
    graficoAtual = null;

    Chart.defaults.font.family = "Poppins, sans-serif";

    const valores = obterIndicadores(respostas);
    const formatarPercentual = (v) => v + "%";

    const tooltip = {
        callbacks: { label: (contexto) => ` Indicador: ${contexto.raw}%` }
    };

    if (tipo === "radar") {

        graficoAtual = new Chart(canvas, {
            type: "radar",
            data: {
                labels: INDICADORES,
                datasets: [{
                    label: "Indicadores",
                    data: valores,
                    backgroundColor: "rgba(109,53,168,0.20)",
                    borderColor: "#6d35a8",
                    borderWidth: 3,
                    pointBackgroundColor: "#ff4081",
                    pointBorderColor: "#ffffff",
                    pointRadius: 5
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    r: {
                        beginAtZero: true,
                        min: 0,
                        max: 100,
                        ticks: { stepSize: 20, callback: formatarPercentual },
                        pointLabels: { font: { size: 13, weight: "600" } }
                    }
                },
                plugins: { legend: { display: false }, tooltip }
            }
        });

        return;

    }

    graficoAtual = new Chart(canvas, {
        type: "bar",
        data: {
            labels: INDICADORES,
            datasets: [{
                label: "Indicador",
                data: valores,
                backgroundColor: ["#6d35a8", "#7d45b5", "#8e55c2", "#ff4081", "#ff70a3"],
                borderRadius: 10,
                borderSkipped: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    min: 0,
                    max: 100,
                    ticks: { callback: formatarPercentual }
                }
            },
            plugins: { legend: { display: false }, tooltip }
        }
    });

}

seletorGrafico?.addEventListener("change", () => {

    tipoGrafico = seletorGrafico.value === "radar" ? "radar" : "barra";

    gerarGrafico(coletarRespostas(), tipoGrafico);

});

/* =====================================================
   ACOLHIMENTO (MODAL)
===================================================== */

function verificarNecessidadeDeAcolhimento(respostas, pontos) {

    // Importante: o sistema não diagnostica abuso. Apenas identifica
    // respostas que justificam uma mensagem de acolhimento.
    const baixos = obterIndicadores(respostas).filter((v) => v < 50).length;

    if (pontos >= 25 || baixos >= 2) {
        setTimeout(abrirAcolhimento, 700);
    }

}

function elementosFocaveis() {

    if (!modalAcolhimento) return [];

    return [...modalAcolhimento.querySelectorAll(
        "button, a[href], [tabindex]:not([tabindex='-1'])"
    )].filter((el) => !el.disabled && el.offsetParent !== null);

}

function abrirAcolhimento() {

    if (!modalAcolhimento) return;

    focoAnterior = document.activeElement;

    modalAcolhimento.classList.add("ativo");
    document.body.style.overflow = "hidden";

    setTimeout(() => $("fecharAcolhimento")?.focus(), 150);

}

function fecharModal() {

    if (!modalAcolhimento) return;

    modalAcolhimento.classList.remove("ativo");
    document.body.style.overflow = "";

    focoAnterior?.focus?.();
    focoAnterior = null;

}

function alternarPainel(painel, outro, botao, outroBotao) {

    outro?.classList.remove("ativo");
    outroBotao?.setAttribute("aria-expanded", "false");

    const aberto = painel?.classList.toggle("ativo");

    botao?.setAttribute("aria-expanded", String(Boolean(aberto)));

}

$("fecharAcolhimento")?.addEventListener("click", fecharModal);
$("btnAgoraNao")?.addEventListener("click", fecharModal);

$("btnApoio")?.addEventListener("click", () =>
    alternarPainel(opcoesApoio, opcoesDenuncia, $("btnApoio"), $("btnDenuncia"))
);

$("btnDenuncia")?.addEventListener("click", () =>
    alternarPainel(opcoesDenuncia, opcoesApoio, $("btnDenuncia"), $("btnApoio"))
);

modalAcolhimento?.addEventListener("click", (evento) => {
    if (evento.target === modalAcolhimento) fecharModal();
});

document.addEventListener("keydown", (evento) => {

    if (!modalAcolhimento?.classList.contains("ativo")) return;

    if (evento.key === "Escape") {
        fecharModal();
        return;
    }

    // Mantém o foco do teclado dentro do modal
    if (evento.key === "Tab") {

        const itens = elementosFocaveis();

        if (!itens.length) return;

        const primeiro = itens[0];
        const ultimo = itens[itens.length - 1];

        if (evento.shiftKey && document.activeElement === primeiro) {
            evento.preventDefault();
            ultimo.focus();
        } else if (!evento.shiftKey && document.activeElement === ultimo) {
            evento.preventDefault();
            primeiro.focus();
        }

    }

});

/* =====================================================
   REFAZER (sem recarregar a página)
===================================================== */

function reiniciarQuiz() {

    clearTimeout(timerAnalise);

    quiz?.reset();
    perguntaAtual = 0;
    tipoGrafico = "barra";

    graficoAtual?.destroy();
    graficoAtual = null;

    fecharModal();

    if (resultado) resultado.style.display = "none";
    if (analise) analise.style.display = "none";
    if (questionario) questionario.style.display = "";

    ["grafico1", "grafico2", "grafico3", "grafico4", "grafico5"].forEach((id) => {
        const barra = $(id);
        if (barra) barra.style.width = "0%";
    });

    mostrarPergunta();
    rolarPara(questionario);

}

btnRefazer?.addEventListener("click", reiniciarQuiz);

/* =====================================================
   FORMULÁRIO DE CONTATO (sem PHP)
===================================================== */

function configurarContato() {

    if (!formulario) return;

    const botao = formulario.querySelector('button[type="submit"]');
    const status = $("statusContato");

    const mostrarStatus = (texto, tipo = "") => {

        if (!status) return;

        status.textContent = texto;
        status.classList.remove("sucesso", "erro");
        if (tipo) status.classList.add(tipo);

    };

    formulario.addEventListener("input", () => mostrarStatus(""));

    formulario.addEventListener("submit", async (evento) => {

        evento.preventDefault();

        const dados = Object.fromEntries(new FormData(formulario).entries());

        // Campo-armadilha preenchido por robôs
        if (dados.botcheck) return;

        const nome = (dados.nome || "").trim();
        const email = (dados.email || "").trim();
        const mensagem = (dados.mensagem || "").trim();

        if (nome.length < 2) {
            mostrarStatus("Informe seu nome.", "erro");
            formulario.nome.focus();
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            mostrarStatus("Informe um e-mail válido.", "erro");
            formulario.email.focus();
            return;
        }

        if (mensagem.length < 10) {
            mostrarStatus("A mensagem precisa ter pelo menos 10 caracteres.", "erro");
            formulario.mensagem.focus();
            return;
        }

        const temChave =
            CONTATO_CONFIG.web3formsKey &&
            CONTATO_CONFIG.web3formsKey !== "COLE_SUA_CHAVE_AQUI";

        // Sem chave: abre o aplicativo de e-mail com tudo preenchido
        if (!temChave) {

            const corpo = `Nome: ${nome}\nE-mail: ${email}\n\nMensagem:\n${mensagem}`;

            window.location.href =
                `mailto:${CONTATO_CONFIG.emailDestino}` +
                `?subject=${encodeURIComponent(CONTATO_CONFIG.assunto)}` +
                `&body=${encodeURIComponent(corpo)}`;

            mostrarStatus("Abrindo seu aplicativo de e-mail para finalizar o envio...", "sucesso");

            return;

        }

        if (botao) {
            botao.disabled = true;
            botao.textContent = "Enviando...";
        }

        mostrarStatus("Enviando sua mensagem...");

        try {

            const resposta = await fetch("https://api.web3forms.com/submit", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify({
                    access_key: CONTATO_CONFIG.web3formsKey,
                    subject: CONTATO_CONFIG.assunto,
                    from_name: "Entre Nós",
                    name: nome,
                    email: email,
                    message: mensagem
                })
            });

            const retorno = await resposta.json();

            if (!resposta.ok || !retorno.success) {
                throw new Error(retorno.message || "Falha no envio.");
            }

            mostrarStatus("Mensagem enviada com sucesso. Obrigado pelo contato!", "sucesso");
            formulario.reset();

        } catch (erro) {

            console.error("Erro no formulário de contato:", erro);

            mostrarStatus(
                "Não foi possível enviar agora. Verifique sua conexão e tente novamente.",
                "erro"
            );

        } finally {

            if (botao) {
                botao.disabled = false;
                botao.textContent = "Enviar";
            }

        }

    });

}

/* =====================================================
   EXPORTAR RESULTADO EM PDF
===================================================== */

function garantirJsPDF() {

    if (window.jspdf?.jsPDF) return Promise.resolve();

    return new Promise((resolve, reject) => {

        const script = document.createElement("script");

        script.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.2/jspdf.umd.min.js";

        script.onload = () =>
            window.jspdf?.jsPDF ? resolve() : reject(new Error("jsPDF indisponível."));

        script.onerror = () => reject(new Error("Falha ao carregar jsPDF."));

        document.head.appendChild(script);

    });

}

// Remove emojis e símbolos que a fonte padrão do PDF não desenha
function limparTextoPDF(valor) {

    return String(valor || "")
        .replace(/[\u2013\u2014]/g, "-")
        .replace(/[\u2018\u2019]/g, "'")
        .replace(/[\u201C\u201D]/g, '"')
        .replace(/[\u{1F000}-\u{1FFFF}\u2600-\u27BF\uFE0F]/gu, "")
        .replace(/[ \t]+/g, " ")
        .replace(/\n\s*\n+/g, "\n")
        .trim();

}

async function baixarPDF() {

    await garantirJsPDF();

    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({ unit: "mm", format: "a4" });

    const M = 18;
    const W = 174;
    const LIMITE = 272;
    let y = 0;

    const novaPaginaSe = (altura) => {
        if (y + altura > LIMITE) {
            pdf.addPage();
            y = 20;
        }
    };

    const escrever = (texto, tamanho = 11, negrito = false, cor = [65, 55, 72]) => {

        pdf.setFont("helvetica", negrito ? "bold" : "normal");
        pdf.setFontSize(tamanho);
        pdf.setTextColor(cor[0], cor[1], cor[2]);

        const alturaLinha = tamanho * 0.3528 * 1.4;

        pdf.splitTextToSize(limparTextoPDF(texto), W).forEach((linha) => {
            novaPaginaSe(alturaLinha);
            pdf.text(linha, M, y + tamanho * 0.3528);
            y += alturaLinha;
        });

        y += 3;

    };

    const titulo = (texto) => escrever(texto, 14, true, [72, 33, 111]);

    // Cabeçalho
    pdf.setFillColor(72, 33, 111);
    pdf.rect(0, 0, 210, 30, "F");
    pdf.setTextColor(255, 255, 255);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(20);
    pdf.text("ENTRE NÓS", M, 14);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    pdf.text("Relatório educativo - resultado do questionário", M, 22);

    y = 40;

    escrever("Gerado em: " + new Date().toLocaleString("pt-BR"), 9, false, [110, 100, 115]);

    // Análise
    titulo("ANÁLISE");
    escrever(mensagemResultado?.innerText || "Resultado do questionário");

    // Indicadores
    const valores = obterIndicadores(coletarRespostas());

    novaPaginaSe(14 + INDICADORES.length * 11);
    titulo("INDICADORES DA RELAÇÃO");

    INDICADORES.forEach((nome, i) => {

        novaPaginaSe(11);

        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(11);
        pdf.setTextColor(65, 55, 72);
        pdf.text(nome, M, y + 3);
        pdf.text(`${valores[i]}%  (${nivelIndicador(valores[i]).rotulo})`, M + W, y + 3, { align: "right" });

        pdf.setFillColor(232, 224, 241);
        pdf.roundedRect(M, y + 5, W, 3, 1.5, 1.5, "F");

        if (valores[i] > 0) {
            pdf.setFillColor(109, 53, 168);
            pdf.roundedRect(M, y + 5, Math.max(3, (W * valores[i]) / 100), 3, 1.5, 1.5, "F");
        }

        y += 11;

    });

    y += 3;

    // Gráfico (com fundo branco e proporção correta)
    const canvas = $("graficoResultado");

    if (canvas && canvas.width > 0 && canvas.height > 0) {

        const temp = document.createElement("canvas");
        temp.width = canvas.width;
        temp.height = canvas.height;

        const ctx = temp.getContext("2d");
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, temp.width, temp.height);
        ctx.drawImage(canvas, 0, 0);

        const proporcao = temp.height / temp.width;
        let larg = W;
        let alt = larg * proporcao;

        if (alt > 100) {
            alt = 100;
            larg = alt / proporcao;
        }

        novaPaginaSe(alt + 14);
        titulo("GRÁFICO DOS INDICADORES");

        pdf.addImage(temp.toDataURL("image/jpeg", 0.95), "JPEG", M + (W - larg) / 2, y, larg, alt);

        y += alt + 6;

    }

    // Orientações
    if (orientacoes?.innerText.trim()) {
        titulo("ORIENTAÇÕES");
        escrever(orientacoes.innerText);
    }

    // Canais de apoio
    novaPaginaSe(14 + CANAIS_APOIO.length * 7);
    titulo("CANAIS DE APOIO");
    CANAIS_APOIO.forEach((canal) => escrever("- " + canal, 10));

    // Rodapé em todas as páginas
    const total = pdf.getNumberOfPages();

    for (let p = 1; p <= total; p++) {

        pdf.setPage(p);
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(8);
        pdf.setTextColor(110, 100, 115);
        pdf.text("Documento informativo e educativo. Não representa diagnóstico ou avaliação profissional.", M, 285);
        pdf.text(`Página ${p} de ${total}`, M + W, 285, { align: "right" });

    }

    pdf.save("entre-nos-resultado.pdf");

}

btnPDF?.addEventListener("click", async () => {

    const original = btnPDF.innerHTML;

    btnPDF.disabled = true;
    btnPDF.textContent = "Gerando PDF...";

    try {

        await baixarPDF();

    } catch (erro) {

        console.error("Erro ao gerar PDF:", erro);

        alert("Não foi possível gerar o PDF. Verifique sua conexão com a internet (a biblioteca jsPDF é carregada online) e tente novamente.");

    } finally {

        btnPDF.disabled = false;
        btnPDF.innerHTML = original;

    }

});

/* =====================================================
   INICIALIZAÇÃO
===================================================== */

document.addEventListener("DOMContentLoaded", () => {

    mostrarPergunta();
    configurarNavegacao();
    configurarContato();

});
