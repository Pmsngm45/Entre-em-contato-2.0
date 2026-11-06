/* =====================================================
ENTRE NÓS — IA DE ACOLHIMENTO 4.0
Sistema local baseado no arquivo ia-conhecimento.json
===================================================== */

let conhecimentoIA = null;
let historicoIA = [];
let categoriasDetectadas = new Set();

let categoriaAtual = null;
let ultimaCategoria = null;

let inicializada = false;
let respondendo = false;
let mensagensUsuario = 0;

let janelaIA;
let mensagensIA;
let campoIA;
let btnEnviarIA;
let btnAbrirIA;
let btnFecharIA;
let btnReiniciarIA;
let indicadorDigitacao;
let formIA;
let sugestoesIA;
let btnAbrirIAApoio;
let focoAnteriorIA = null;
let ultimoCartaoEm = -99;

/* =====================================================
CONFIGURAÇÃO
Deixe vazio para usar apenas a IA local (Live Server).
Se um dia você criar um backend (ex.: Python), coloque aqui a URL
dele, por exemplo "http://localhost:5000/chat".
===================================================== */

const IA_BACKEND_URL = "";

/* =====================================================
CARREGAR CONHECIMENTO
===================================================== */

async function carregarConhecimentoIA() {

try {

    const resposta = await fetch("./ia-conhecimento.json", {
        cache: "no-store"
    });

    if (!resposta.ok) {
        throw new Error("Erro HTTP " + resposta.status);
    }

    conhecimentoIA = await resposta.json();

    if (!conhecimentoIA || typeof conhecimentoIA !== "object") {
        throw new Error("JSON inválido.");
    }

    if (!conhecimentoIA.inicio || typeof conhecimentoIA.inicio !== "object") {
        conhecimentoIA.inicio = {};
    }

    if (!Array.isArray(conhecimentoIA.inicio.alternativas)) {
        conhecimentoIA.inicio.alternativas = [];
    }

    if (!conhecimentoIA.categorias || typeof conhecimentoIA.categorias !== "object") {
        conhecimentoIA.categorias = {};
    }

    if (!conhecimentoIA.respostas || typeof conhecimentoIA.respostas !== "object") {
        conhecimentoIA.respostas = {};
    }

    if (!Array.isArray(conhecimentoIA.respostas.geral)) {
        conhecimentoIA.respostas.geral = [
            "Estou ouvindo você. Quer me contar um pouco mais?",
            "Entendi. Podemos conversar sobre isso com calma.",
            "Pode continuar. Estou acompanhando o que você está contando.",
            "Tudo bem. O que aconteceu depois?",
            "Se quiser, pode explicar um pouco mais sobre essa situação."
        ];
    }

    if (
        !conhecimentoIA.respostas_intencao ||
        typeof conhecimentoIA.respostas_intencao !== "object"
    ) {
        conhecimentoIA.respostas_intencao = {};
    }

    // Adapta o formato do ia-conhecimento.json (categorias na raiz)
    // ao formato que o restante do código espera.
    const nomesCategorias = [
        "controle", "medo", "pressao", "isolamento",
        "humilhacao", "ameaca", "tristeza", "confusao"
    ];

    if (Object.keys(conhecimentoIA.categorias).length === 0) {
        nomesCategorias.forEach(function (nome) {
            const dados = conhecimentoIA[nome];
            if (dados && Array.isArray(dados.palavras)) {
                conhecimentoIA.categorias[nome] = dados;
            }
        });
    }

    if (
        !Array.isArray(conhecimentoIA.respostas.seguranca) &&
        conhecimentoIA.seguranca &&
        Array.isArray(conhecimentoIA.seguranca.respostas)
    ) {
        conhecimentoIA.respostas.seguranca = conhecimentoIA.seguranca.respostas;
    }

    if (
        !Array.isArray(conhecimentoIA.respostas.encerramento) &&
        Array.isArray(conhecimentoIA.encerramento)
    ) {
        conhecimentoIA.respostas.encerramento = conhecimentoIA.encerramento;
    }

    if (
        !Array.isArray(conhecimentoIA.respostas.continuidade) &&
        conhecimentoIA.respostas_gerais &&
        Array.isArray(conhecimentoIA.respostas_gerais.continuidade)
    ) {
        conhecimentoIA.respostas.continuidade = conhecimentoIA.respostas_gerais.continuidade;
    }

    iniciarIA();

    console.log("Entre Nós IA: conhecimento carregado.");

} catch (erro) {

    console.error("Erro ao carregar IA:", erro);

    mostrarErroIA();

}

}

/* =====================================================
INICIALIZAR INTERFACE
===================================================== */

function iniciarIA() {

janelaIA = document.getElementById("janelaIA");
mensagensIA = document.getElementById("mensagensIA");
campoIA = document.getElementById("campoIA");
btnEnviarIA = document.getElementById("btnEnviarIA");
btnAbrirIA = document.getElementById("btnAbrirIA");
btnFecharIA = document.getElementById("btnFecharIA");
btnReiniciarIA = document.getElementById("btnReiniciarIA");
indicadorDigitacao = document.getElementById("indicadorDigitacao");
formIA = document.getElementById("formIA");
sugestoesIA = document.getElementById("sugestoesIA");
btnAbrirIAApoio = document.getElementById("btnAbrirIAApoio");

if (!janelaIA) {
    console.warn("Elemento #janelaIA não encontrado.");
    return;
}

inicializada = true;

configurarEventosIA();

}

/* =====================================================
EVENTOS
===================================================== */

function configurarEventosIA() {

btnAbrirIA?.addEventListener("click", abrirIA);

btnAbrirIAApoio?.addEventListener("click", function () {

    fecharModalAcolhimento();
    abrirIA();

});

btnFecharIA?.addEventListener("click", fecharIA);

btnReiniciarIA?.addEventListener("click", reiniciarIA);

formIA?.addEventListener("submit", function (evento) {

    evento.preventDefault();

    enviarMensagemIA();

});

campoIA?.addEventListener("input", ajustarTextarea);

campoIA?.addEventListener("keydown", function (evento) {

    if (evento.key === "Enter" && !evento.shiftKey) {

        evento.preventDefault();

        enviarMensagemIA();

    }

});

document.querySelectorAll("[data-sugestao]").forEach(function (botao) {

    botao.addEventListener("click", function () {

        if (!campoIA) {
            return;
        }

        campoIA.value = botao.dataset.sugestao || "";

        ajustarTextarea();

        enviarMensagemIA();

    });

});

janelaIA?.addEventListener("click", function (evento) {

    if (evento.target === janelaIA) {
        fecharIA();
    }

});

document.addEventListener("keydown", function (evento) {

    if (!janelaIA || !janelaIA.classList.contains("ativa")) {
        return;
    }

    if (evento.key === "Escape") {

        fecharIA();

        return;

    }

    if (evento.key === "Tab") {

        const itens = Array.from(
            janelaIA.querySelectorAll("button, textarea, a[href]")
        ).filter(function (el) {
            return !el.disabled && el.offsetParent !== null;
        });

        if (itens.length === 0) {
            return;
        }

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

}

/* =====================================================
ABRIR IA
===================================================== */

function abrirIA() {

if (!inicializada) {

    alert("A IA ainda está carregando. Aguarde alguns segundos.");

    return;
}

focoAnteriorIA = document.activeElement;

janelaIA.classList.add("ativa");

janelaIA.setAttribute("aria-hidden", "false");

btnAbrirIA?.classList.add("oculto");

document.body.style.overflow = "hidden";

if (historicoIA.length === 0) {
    iniciarConversa();
}

setTimeout(function () {

    campoIA?.focus();

}, 150);

}

/* =====================================================
FECHAR IA
===================================================== */

function fecharIA() {

if (!janelaIA) {
    return;
}

janelaIA.classList.remove("ativa");

janelaIA.setAttribute("aria-hidden", "true");

btnAbrirIA?.classList.remove("oculto");

document.body.style.overflow = "";

if (focoAnteriorIA && typeof focoAnteriorIA.focus === "function") {
    focoAnteriorIA.focus();
}

focoAnteriorIA = null;

}

/* =====================================================
FECHAR MODAL
===================================================== */

function fecharModalAcolhimento() {

const modal = document.getElementById("modalAcolhimento");

if (!modal) {
    return;
}

modal.classList.remove("ativo");

document.body.style.overflow = "";

}

/* =====================================================
REINICIAR
===================================================== */

function reiniciarIA() {

historicoIA = [];

categoriasDetectadas = new Set();

categoriaAtual = null;
ultimaCategoria = null;

mensagensUsuario = 0;
respondendo = false;
ultimoCartaoEm = -99;

sugestoesIA?.classList.remove("oculto");

if (mensagensIA) {
    mensagensIA.innerHTML = "";
}

iniciarConversa();

}

/* =====================================================
PRIMEIRA MENSAGEM
===================================================== */

function iniciarConversa() {

if (!conhecimentoIA) {
    return;
}

const inicio = conhecimentoIA.inicio || {};

const mensagensConfiguradas = Array.isArray(inicio.mensagens) ? inicio.mensagens : [];
const mensagemPrincipal =
    (typeof inicio.mensagem === "string" && inicio.mensagem.trim())
        ? inicio.mensagem
        : (mensagensConfiguradas[0] || "Olá! Eu sou a IA de acolhimento do Entre Nós. Como posso conversar com você hoje?");

const alternativas = Array.isArray(inicio.alternativas)
    ? inicio.alternativas
    : mensagensConfiguradas.slice(1);

const mensagensInicio = [
    mensagemPrincipal,
    ...alternativas
];

const mensagem = escolherAleatorio(mensagensInicio);

adicionarMensagemIA(mensagem, "ia");

salvarHistorico("ia", mensagem, "inicio");

}

/* =====================================================
ENVIAR MENSAGEM
===================================================== */

function enviarMensagemIA() {

if (respondendo || !campoIA) {
    return;
}

const texto = campoIA.value.trim();

if (!texto) {
    return;
}

adicionarMensagemIA(texto, "usuario");

salvarHistorico("usuario", texto);

mensagensUsuario++;

sugestoesIA?.classList.add("oculto");

campoIA.value = "";

ajustarTextarea();

analisarMensagemIA(texto);

}

/* =====================================================
HISTÓRICO
===================================================== */

function salvarHistorico(autor, texto, categoria = null) {

historicoIA.push({
    autor: autor,
    texto: texto,
    categoria: categoria,
    momento: Date.now()
});

}

/* =====================================================
ADICIONAR MENSAGEM
===================================================== */

function adicionarMensagemIA(texto, tipo) {

if (!mensagensIA) {
    return;
}

const mensagem = document.createElement("div");

mensagem.className = "mensagem-ia " + tipo;

mensagem.textContent = String(texto);

mensagensIA.appendChild(mensagem);

rolarMensagens();

}

/* =====================================================
CARTÃO DE EMERGÊNCIA (canais reais de ajuda)
===================================================== */

function adicionarCartaoEmergencia() {

if (!mensagensIA) {
    return;
}

// Evita repetir o cartão a cada mensagem
if (mensagensUsuario - ultimoCartaoEm < 4) {
    return;
}

ultimoCartaoEm = mensagensUsuario;

const canais = [
    ["190", "Polícia Militar (perigo imediato)", "tel:190"],
    ["180", "Central de Atendimento à Mulher", "tel:180"],
    ["100", "Direitos Humanos (inclui crianças e adolescentes)", "tel:100"],
    ["188", "CVV, apoio emocional 24 h", "tel:188"]
];

const cartao = document.createElement("div");
cartao.className = "cartao-emergencia";

const titulo = document.createElement("strong");
titulo.textContent = "Canais de ajuda (ligação gratuita)";
cartao.appendChild(titulo);

canais.forEach(function (canal) {

    const link = document.createElement("a");
    link.href = canal[2];

    const numero = document.createElement("b");
    numero.textContent = canal[0];

    const descricao = document.createElement("span");
    descricao.textContent = canal[1];

    link.appendChild(numero);
    link.appendChild(descricao);
    cartao.appendChild(link);

});

mensagensIA.appendChild(cartao);

rolarMensagens();

}

/* =====================================================
DIGITANDO
===================================================== */

function mostrarDigitando(ativo) {

indicadorDigitacao?.classList.toggle("ativo", ativo);

}

/* =====================================================
IA GENERATIVA (BACKEND) + FALLBACK LOCAL
A chave da API nunca fica no navegador.
===================================================== */

async function analisarMensagemIA(texto) {
    if (!conhecimentoIA) {
        responderComAtraso("Ainda estou carregando meu conhecimento. Tente novamente em alguns segundos.");
        return;
    }

    const normalizado = normalizarTexto(texto);
    const termosDeRisco = ["ameaca", "me machucar", "violencia", "agressao", "perigo", "com medo", "me bateu"];
    const risco = termosDeRisco.some(t => normalizado.includes(t));

    // Sem backend configurado (ou em situação de risco), usa as regras locais.
    if (risco || !IA_BACKEND_URL) {
        analisarMensagemLocalIA(texto);
        return;
    }

    respondendo = true;
    if (btnEnviarIA) btnEnviarIA.disabled = true;
    mostrarDigitando(true);

    try {
        const historico = historicoIA.slice(0, -1).slice(-12).map(item => ({
            role: item.autor === "usuario" ? "user" : "assistant",
            content: item.texto
        }));

        const resposta = await fetch(IA_BACKEND_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ mensagem: texto, historico })
        });

        const dados = await resposta.json();
        if (!resposta.ok || !dados.resposta) {
            throw new Error(dados.erro || "Serviço de IA indisponível.");
        }

        mostrarDigitando(false);
        adicionarMensagemIA(dados.resposta, "ia");
        salvarHistorico("ia", dados.resposta, "generativa");
    } catch (erro) {
        console.warn("IA generativa indisponível; usando modo local:", erro);
        mostrarDigitando(false);
        // Reaproveita o mecanismo local já existente, sem perder a conversa.
        respondendo = false;
        if (btnEnviarIA) btnEnviarIA.disabled = false;
        analisarMensagemLocalIA(texto);
        return;
    }

    respondendo = false;
    if (btnEnviarIA) btnEnviarIA.disabled = false;
    campoIA?.focus();
    rolarMensagens();
}

/* =====================================================
ANALISAR MENSAGEM
===================================================== */

function analisarMensagemLocalIA(texto) {

if (!conhecimentoIA) {

    responderComAtraso(
        "Ainda estou carregando meu conhecimento. Tente novamente em alguns segundos."
    );

    return;
}

const normalizado = normalizarTexto(texto);

if (!normalizado) {

    responderComAtraso(
        "Pode escrever o que você gostaria de conversar comigo."
    );

    return;
}

if (detectarSaudacao(normalizado)) {

    responderComAtraso(
        gerarRespostaSaudacao(normalizado)
    );

    return;
}

if (detectarDespedida(normalizado)) {

    responderComAtraso(
        escolherResposta("encerramento")
    );

    return;
}

const categorias = detectarCategorias(normalizado);

if (categorias.includes("ameaca")) {

    categoriasDetectadas.add("ameaca");

    categoriaAtual = "ameaca";
    ultimaCategoria = "ameaca";

    responderComAtraso(
        gerarRespostaCategoria("ameaca"),
        adicionarCartaoEmergencia
    );

    return;
}

if (detectarIntencaoSeguranca(normalizado)) {

    responderComAtraso(
        escolherResposta("seguranca"),
        adicionarCartaoEmergencia
    );

    return;
}

const intencao = detectarIntencao(normalizado);

if (intencao) {

    responderComAtraso(
        escolherRespostaIntencao(intencao)
    );

    return;
}

if (categorias.length > 0) {

    categorias.forEach(function (categoria) {

        categoriasDetectadas.add(categoria);

    });

    categoriaAtual =
        escolherCategoriaPrincipal(categorias);

    ultimaCategoria = categoriaAtual;

    responderComAtraso(
        gerarRespostaCategoria(categoriaAtual)
    );

    return;
}

const respostaPergunta =
    responderPerguntaNormal(normalizado);

if (respostaPergunta) {

    responderComAtraso(respostaPergunta);

    return;
}

responderComAtraso(
    gerarRespostaContextual(normalizado)
);

}

/* =====================================================
NORMALIZAR TEXTO
===================================================== */

function normalizarTexto(texto) {

if (typeof texto !== "string") {
    return "";
}

return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();

}

/* =====================================================
SAUDAÇÕES
===================================================== */

function detectarSaudacao(texto) {

const saudacoes = [
    "oi",
    "ola",
    "bom dia",
    "boa tarde",
    "boa noite",
    "e ai",
    "ei",
    "hello",
    "hey"
];

return saudacoes.some(function (saudacao) {

    return (
        texto === saudacao ||
        texto.startsWith(saudacao + " ")
    );

});

}

/* =====================================================
RESPOSTA SAUDAÇÃO
===================================================== */

function gerarRespostaSaudacao() {

const hora = new Date().getHours();

let cumprimento = "Olá";

if (hora >= 5 && hora < 12) {

    cumprimento = "Bom dia";

} else if (hora >= 12 && hora < 18) {

    cumprimento = "Boa tarde";

} else {

    cumprimento = "Boa noite";

}

const respostas = [

    cumprimento +
    "! Que bom conversar com você. Como posso ajudar?",

    cumprimento +
    "! Estou aqui para ouvir você. Sobre o que gostaria de conversar?",

    cumprimento +
    "! Podemos conversar com calma. O que você gostaria de me contar?"

];

return escolherRespostaDiferente(respostas);

}

/* =====================================================
DESPEDIDA
===================================================== */

function detectarDespedida(texto) {

const despedidas = [
    "tchau",
    "ate mais",
    "ate logo",
    "vou embora",
    "preciso ir",
    "encerrar",
    "quero sair da conversa"
];

return despedidas.some(function (termo) {

    return (
        texto === termo ||
        texto.includes(termo)
    );

});

}

/* =====================================================
SEGURANÇA
===================================================== */

function detectarIntencaoSeguranca(texto) {

const termos = [
    "estou em perigo",
    "nao estou segura",
    "nao estou seguro",
    "estou com medo agora",
    "acontecendo agora",
    "estou sozinho",
    "estou sozinha",
    "preciso de ajuda agora",
    "estou sendo ameacado",
    "estao me ameacando"
];

return termos.some(function (termo) {

    return texto.includes(termo);

});

}

/* =====================================================
INTENÇÕES
===================================================== */

function detectarIntencao(texto) {

if (
    texto.includes("o que eu faco") ||
    texto.includes("o que fazer") ||
    texto.includes("o que devo fazer") ||
    texto.includes("como resolver")
) {

    return "o_que_fazer";
}

if (
    texto === "nao sei" ||
    texto.includes("nao sei o que fazer")
) {

    return "nao_sei";
}

if (
    texto.includes("quero conversar") ||
    texto.includes("quero falar")
) {

    return "quero_conversar";
}

if (
    texto === "obrigado" ||
    texto === "obrigada" ||
    texto.includes("muito obrigado") ||
    texto.includes("muito obrigada")
) {

    return "obrigado";
}

return null;

}

/* =====================================================
CATEGORIAS
===================================================== */

function detectarCategorias(texto) {

const encontradas = [];

const categorias =
    conhecimentoIA &&
    conhecimentoIA.categorias &&
    typeof conhecimentoIA.categorias === "object"
        ? conhecimentoIA.categorias
        : {};

Object.entries(categorias).forEach(function ([nome, dados]) {

    if (!dados || typeof dados !== "object") {
        return;
    }

    if (!Array.isArray(dados.palavras)) {
        return;
    }

    const encontrou =
        dados.palavras.some(function (palavra) {

            const termo = normalizarTexto(palavra);

            if (!termo) {
                return false;
            }

            return contemTermo(texto, termo);

        });

    if (encontrou) {
        encontradas.push(nome);
    }

});

return encontradas;

}

/* =====================================================
BUSCA POR PALAVRA INTEIRA
(evita que "mal" seja encontrado dentro de "normal")
===================================================== */

function contemTermo(texto, termo) {

const seguro = termo.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

return new RegExp(
    "(^|[^a-z0-9])" + seguro + "([^a-z0-9]|$)"
).test(texto);

}

/* =====================================================
CATEGORIA PRINCIPAL
===================================================== */

function escolherCategoriaPrincipal(categorias) {

const prioridade = [
    "ameaca",
    "medo",
    "pressao",
    "controle",
    "isolamento",
    "humilhacao",
    "tristeza",
    "confusao"
];

for (const categoria of prioridade) {

    if (categorias.includes(categoria)) {
        return categoria;
    }

}

return categorias[0] || null;

}

/* =====================================================
RESPOSTA POR CATEGORIA
===================================================== */

function gerarRespostaCategoria(categoria) {

const categorias =
    conhecimentoIA?.categorias || {};

const dados = categorias[categoria];

if (!dados) {
    return escolherResposta("geral");
}

if (categoria === "ameaca") {
    return escolherResposta("seguranca");
}

const respostas =
    Array.isArray(dados.perguntas)
        ? dados.perguntas
        : [];

if (respostas.length === 0) {
    return escolherResposta("geral");
}

return escolherRespostaDiferente(respostas);

}

/* =====================================================
PERGUNTAS NORMAIS
===================================================== */

function responderPerguntaNormal(texto) {

if (
    texto.includes("qual seu nome") ||
    texto.includes("como voce se chama") ||
    texto.includes("quem e voce")
) {

    return "Eu sou a Entre Nós IA, uma assistente educativa criada para conversar, ouvir e ajudar você a organizar seus pensamentos.";
}

if (
    texto.includes("o que voce faz") ||
    texto.includes("para que voce serve")
) {

    return "Meu objetivo é oferecer acolhimento e orientação inicial. Posso conversar sobre situações, sentimentos e relacionamentos sem fazer diagnósticos.";
}

if (
    texto.includes("voce e uma ia") ||
    texto.includes("voce e inteligencia artificial")
) {

    return "Sim. Eu sou uma inteligência artificial local do projeto Entre Nós. Meu funcionamento é baseado nas informações e regras definidas no sistema.";
}

if (
    texto.includes("como voce esta") ||
    texto.includes("tudo bem com voce")
) {

    return "Estou funcionando normalmente e pronta para conversar com você. E você, como está hoje?";
}

if (
    texto.includes("voce pode me ajudar")
) {

    return "Posso tentar ajudar. Conte o que está acontecendo ou faça sua pergunta, e vamos conversar passo a passo.";
}

if (texto.endsWith("?")) {

    return "Posso tentar responder. Conte um pouco mais sobre a sua pergunta para que eu possa entender melhor o que você quer saber.";
}

return null;

}

/* =====================================================
CONTEXTO
===================================================== */

function gerarRespostaContextual(texto) {

const ultimoUsuario =
    encontrarUltimaMensagemUsuario();

if (texto.includes("porque")) {

    return "Entendo. Você pode explicar um pouco mais sobre o que aconteceu?";
}

if (texto.includes("como")) {

    return "Podemos pensar nisso passo a passo. Quer me contar um pouco mais?";
}

if (
    texto === "sim" ||
    texto.startsWith("sim ")
) {

    if (ultimaCategoria) {
        return gerarPerguntaContinuidade(ultimaCategoria);
    }

    return "Entendi. Quer continuar contando o que aconteceu?";
}

if (
    texto === "nao" ||
    texto.startsWith("nao ")
) {

    return "Tudo bem. Você não precisa responder nada que não queira. Podemos conversar sobre outra parte da situação.";
}

if (
    ultimoUsuario &&
    mensagensUsuario >= 3
) {

    return escolherResposta("continuidade");
}

return escolherResposta("geral");

}

/* =====================================================
CONTINUIDADE
===================================================== */

function gerarPerguntaContinuidade(categoria) {

const dados =
    conhecimentoIA?.categorias?.[categoria];

if (
    dados &&
    Array.isArray(dados.perguntas)
) {

    return escolherRespostaDiferente(
        dados.perguntas
    );
}

return escolherResposta("continuidade");

}

/* =====================================================
ÚLTIMA MENSAGEM
===================================================== */

function encontrarUltimaMensagemUsuario() {

for (
    let i = historicoIA.length - 1;
    i >= 0;
    i--
) {

    if (historicoIA[i].autor === "usuario") {
        return historicoIA[i];
    }

}

return null;

}

/* =====================================================
ESCOLHER RESPOSTA
===================================================== */

function escolherResposta(categoria) {

const respostas =
    conhecimentoIA?.respostas || {};

const lista =
    respostas[categoria] ||
    respostas.geral;

return escolherRespostaDiferente(lista);

}

/* =====================================================
RESPOSTA DE INTENÇÃO
===================================================== */

function escolherRespostaIntencao(intencao) {

const respostas =
    conhecimentoIA?.respostas_intencao || {};

const lista =
    respostas[intencao];

if (!Array.isArray(lista)) {
    return escolherResposta("geral");
}

return escolherRespostaDiferente(lista);

}

/* =====================================================
EVITAR REPETIÇÃO
===================================================== */

function escolherRespostaDiferente(lista) {

if (
    !Array.isArray(lista) ||
    lista.length === 0
) {

    return "Estou ouvindo você. Quer me contar um pouco mais?";
}

if (lista.length === 1) {
    return lista[0];
}

const ultimas =
    historicoIA
        .filter(function (item) {
            return item.autor === "ia";
        })
        .slice(-5)
        .map(function (item) {
            return item.texto;
        });

const disponiveis =
    lista.filter(function (item) {
        return !ultimas.includes(item);
    });

const pool =
    disponiveis.length > 0
        ? disponiveis
        : lista;

return escolherAleatorio(pool);

}

/* =====================================================
ALEATÓRIO
===================================================== */

function escolherAleatorio(lista) {

if (
    !Array.isArray(lista) ||
    lista.length === 0
) {

    return "Estou ouvindo você. Quer me contar um pouco mais?";
}

return lista[
    Math.floor(
        Math.random() * lista.length
    )
];

}

/* =====================================================
RESPONDER COM ATRASO
===================================================== */

function responderComAtraso(resposta, aposResponder) {

if (
    typeof resposta !== "string" ||
    !resposta.trim()
) {

    resposta =
        "Estou ouvindo você. Quer me contar um pouco mais?";
}

respondendo = true;

if (btnEnviarIA) {
    btnEnviarIA.disabled = true;
}

mostrarDigitando(true);

const tempo =
    Math.min(
        1600,
        Math.max(
            500,
            resposta.length * 8
        )
    );

setTimeout(function () {

    mostrarDigitando(false);

    adicionarMensagemIA(
        resposta,
        "ia"
    );

    salvarHistorico(
        "ia",
        resposta,
        categoriaAtual
    );

    respondendo = false;

    if (btnEnviarIA) {
        btnEnviarIA.disabled = false;
    }

    campoIA?.focus();

    rolarMensagens();

    if (typeof aposResponder === "function") {
        aposResponder();
    }

}, tempo);

}

/* =====================================================
TEXTAREA
===================================================== */

function ajustarTextarea() {

if (!campoIA) {
    return;
}

campoIA.style.height = "auto";

campoIA.style.height =
    Math.min(
        campoIA.scrollHeight,
        100
    ) + "px";

}

/* =====================================================
ROLAR MENSAGENS
===================================================== */

function rolarMensagens() {

if (!mensagensIA) {
    return;
}

mensagensIA.scrollTo({
    top: mensagensIA.scrollHeight,
    behavior: "smooth"
});

}

/* =====================================================
ERRO
===================================================== */

function mostrarErroIA() {

const mensagens =
    document.getElementById("mensagensIA");

if (!mensagens) {
    return;
}

mensagens.innerHTML = "";

const mensagem =
    document.createElement("div");

mensagem.className =
    "mensagem-ia ia";

mensagem.textContent =
    "Não consegui carregar o arquivo ia-conhecimento.json. Verifique se ele está na mesma pasta do index.html e se o JSON é válido.";

mensagens.appendChild(mensagem);

}

/* =====================================================
INICIALIZAÇÃO
===================================================== */

document.addEventListener(
"DOMContentLoaded",
function () {

    carregarConhecimentoIA();

});