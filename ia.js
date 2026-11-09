/* =====================================================
   ENTRE NÓS — IA DE ACOLHIMENTO 5.0
   Sistema local baseado em ia-conhecimento.json
   Arquivo único: não precisa de outro script da IA.
===================================================== */

let conhecimentoIA = null;
let historicoIA = [];
let categoriasDetectadas = new Set();
let categoriaAtual = null;
let ultimaCategoria = null;

let inicializada = false;
let respondendo = false;
let mensagensUsuario = 0;

let janelaIA, mensagensIA, campoIA, btnEnviarIA, btnAbrirIA, btnFecharIA;
let btnReiniciarIA, indicadorDigitacao, formIA, sugestoesIA, btnAbrirIAApoio;
let focoAnteriorIA = null;
let ultimoCartaoEm = -99;

// Novos controles (v5)
let invalidas = 0;
let chipsPendentes = null;
let timerRespiracao = null;
let lex = null;
let vocab = [];
let fonteLex = null;

/* Conhecimento da IA embutido: não é necessário o arquivo ia-conhecimento.json */
const CONHECIMENTO_EMBUTIDO = {
  "nome": "Entre Nós - IA de Acolhimento",
  "versao": "5.0",
  "inicio": {
    "mensagens": [
      "Olá! Eu sou a IA de acolhimento do Entre Nós. Estou aqui para conversar com você com calma. Como posso ajudar?",
      "Oi! Seja bem-vindo(a) ao Entre Nós. Quer conversar sobre alguma coisa?",
      "Olá! Podemos conversar no seu ritmo. O que você gostaria de falar?"
    ]
  },
  "categorias": {
    "controle": {
      "palavras": [
        "controla",
        "controlar",
        "controle",
        "proibe",
        "proibiu",
        "nao deixa",
        "senha",
        "olha meu celular",
        "ver meu celular",
        "vigia",
        "vigiando",
        "mexe no meu celular",
        "diz o que vestir"
      ],
      "perguntas": [
        "Você sente que consegue tomar suas próprias decisões nessa situação?",
        "Isso acontece com frequência?",
        "Como você se sente quando essa pessoa tenta controlar essas coisas?",
        "Quando você diz o que prefere, essa preferência costuma ser respeitada?"
      ]
    },
    "medo": {
      "palavras": [
        "medo",
        "assustada",
        "assustado",
        "receio",
        "tenho medo",
        "com medo",
        "apavorada",
        "apavorado",
        "pavor",
        "tenho receio"
      ],
      "perguntas": [
        "Entendi. Você está em segurança neste momento?",
        "Esse medo está relacionado a alguma situação específica?",
        "Quer me contar o que costuma acontecer quando você sente esse medo?"
      ]
    },
    "pressao": {
      "palavras": [
        "pressiona",
        "pressionou",
        "pressionando",
        "obrigou",
        "forcado",
        "forcada",
        "me obrigou",
        "insiste",
        "insistiu",
        "nao aceita meu nao"
      ],
      "perguntas": [
        "Você sente que consegue dizer não quando não quer alguma coisa?",
        "Essa pressão acontece com frequência?",
        "Como você costuma se sentir depois dessas situações?"
      ]
    },
    "isolamento": {
      "palavras": [
        "me afastou",
        "afastou meus amigos",
        "nao posso sair",
        "nao posso falar",
        "nao posso ver",
        "nao deixa eu sair",
        "nao deixa falar",
        "proibiu de ver",
        "perdi meus amigos"
      ],
      "perguntas": [
        "Você ainda consegue conversar com alguém em quem confia?",
        "Essa situação fez você se afastar de pessoas importantes?",
        "Como você se sente com esse afastamento?"
      ]
    },
    "humilhacao": {
      "palavras": [
        "humilha",
        "humilhou",
        "insulta",
        "insultou",
        "me chama de",
        "me faz sentir mal",
        "ridiculariza",
        "ridicularizou",
        "xinga",
        "xingou",
        "grita comigo",
        "gritou comigo",
        "me diminui"
      ],
      "perguntas": [
        "Isso acontece frequentemente?",
        "Como você costuma se sentir depois dessas situações?",
        "Existe alguém de confiança com quem você consegue conversar?"
      ]
    },
    "ameaca": {
      "palavras": [
        "ameaca",
        "ameacou",
        "ameacando",
        "vai me machucar",
        "disse que vai me machucar",
        "quer me machucar",
        "me bateu",
        "me agrediu",
        "me empurrou",
        "me apertou",
        "me bate"
      ],
      "perguntas": [
        "Você está em segurança neste momento?",
        "Existe alguma ameaça acontecendo agora?",
        "Há uma pessoa adulta de confiança por perto que possa ajudar?"
      ]
    },
    "tristeza": {
      "palavras": [
        "triste",
        "chorando",
        "chorei",
        "mal",
        "sozinha",
        "sozinho",
        "cansada",
        "cansado",
        "chateada",
        "chateado",
        "desanimada",
        "desanimado",
        "vazio",
        "sem animo"
      ],
      "perguntas": [
        "Sinto muito que você esteja passando por isso. Quer me contar um pouco mais?",
        "O que aconteceu para você se sentir assim?",
        "Existe alguém em quem você confia para conversar sobre isso?"
      ]
    },
    "confusao": {
      "palavras": [
        "nao sei",
        "confuso",
        "confusa",
        "nao entendo",
        "talvez",
        "acho que",
        "nao tenho certeza",
        "duvida",
        "perdido",
        "perdida"
      ],
      "perguntas": [
        "Tudo bem não ter certeza agora. Podemos tentar entender a situação passo a passo.",
        "Não tem problema estar confuso(a). O que aconteceu que fez você começar a pensar dessa maneira?",
        "Podemos organizar isso juntos. O que mais está deixando você em dúvida?"
      ]
    },
    "ciume": {
      "palavras": [
        "ciume",
        "ciumes",
        "ciumento",
        "ciumenta",
        "desconfia de mim",
        "acusa de trair",
        "me acusa",
        "tem ciume"
      ],
      "perguntas": [
        "Como você se sente quando o ciúme aparece nessa relação?",
        "Esse ciúme costuma virar cobrança ou proibição?",
        "Vocês conseguem conversar sobre isso com calma?"
      ]
    },
    "culpa": {
      "palavras": [
        "culpa",
        "culpada",
        "culpado",
        "sou o problema",
        "sou eu o problema",
        "eu provoquei",
        "mereci",
        "foi minha culpa"
      ],
      "perguntas": [
        "Muita gente sente culpa em situações difíceis. O que faz você pensar que a culpa é sua?",
        "Você sente que é cobrado(a) por coisas que não dependem de você?",
        "Como você acha que um amigo veria essa situação?"
      ]
    },
    "termino": {
      "palavras": [
        "terminar",
        "terminei",
        "terminou",
        "separar",
        "separacao",
        "fim do namoro",
        "me deixou",
        "quero sair da relacao",
        "terminamos"
      ],
      "perguntas": [
        "Esse é um momento delicado. Como você está se sentindo com isso?",
        "O que está pesando mais para você agora?",
        "Você tem alguém para conversar durante esse momento?"
      ]
    },
    "autoestima": {
      "palavras": [
        "nao sou boa o bastante",
        "nao sou bom o bastante",
        "me sinto feio",
        "me sinto feia",
        "nao valho nada",
        "ninguem me quer",
        "nao sirvo",
        "me odeio"
      ],
      "perguntas": [
        "Sinto muito que você esteja se sentindo assim. Desde quando esses pensamentos aparecem?",
        "Quando esse sentimento fica mais forte, o que costuma acontecer antes?",
        "Existe alguém que lembra você do seu valor?"
      ]
    }
  },
  "respostas": {
    "geral": [
      "Estou ouvindo você. Quer me contar um pouco mais?",
      "Entendi. Podemos conversar sobre isso com calma.",
      "Pode continuar. Estou acompanhando o que você está contando.",
      "Tudo bem. O que aconteceu depois?",
      "Se quiser, pode explicar um pouco mais sobre essa situação.",
      "Obrigado por confiar isso a mim. O que mais você gostaria de dizer?"
    ],
    "seguranca": [
      "Sua segurança é a prioridade. Se você estiver em perigo agora, procure imediatamente um adulto de confiança ou um serviço de emergência da sua região. Se puder, vá para um local seguro enquanto busca ajuda.",
      "Se existe perigo neste momento, procure ajuda presencial imediatamente. Um adulto de confiança, responsável ou serviço de emergência pode ajudar. O 190 atende perigo imediato e o 180 acolhe mulheres em situação de violência."
    ],
    "encerramento": [
      "Tudo bem. Você pode encerrar a conversa quando quiser. Cuide-se.",
      "Obrigado por conversar comigo. Você pode voltar quando precisar.",
      "Se quiser voltar a conversar depois, é só começar novamente. Até mais!"
    ],
    "continuidade": [
      "Estou acompanhando o que você está contando.",
      "Entendi. Quer continuar?",
      "Obrigado por explicar. Como você se sentiu depois disso?",
      "Podemos continuar exatamente de onde você parou."
    ]
  },
  "respostas_intencao": {
    "o_que_fazer": [
      "Você não precisa decidir tudo de uma vez. Podemos primeiro entender o que está acontecendo.",
      "Podemos pensar em opções aos poucos. Se quiser, conte o que aconteceu mais recentemente."
    ],
    "nao_sei": [
      "Tudo bem não saber o que fazer agora.",
      "Podemos começar entendendo o que aconteceu e como você se sente."
    ],
    "quero_conversar": [
      "Claro. Estou aqui para ouvir você.",
      "Pode começar pelo que estiver mais fácil de contar."
    ],
    "obrigado": [
      "Por nada! Obrigado por confiar esta conversa a mim.",
      "De nada! Estou aqui se quiser continuar."
    ]
  }
};

/* Deixe vazio para usar apenas a IA local (Live Server).
   Se criar um backend, coloque a URL, ex.: "http://localhost:5000/chat" */
const IA_BACKEND_URL = "";

/* =====================================================
   VOCABULÁRIO E TEXTOS (v5)
===================================================== */

const FUNCAO = new Set(
    "a e o as os um uma uns de do da dos das em no na nos nas por pra para com sem ou que se me te eu tu".split(" ")
);

const BASICAS = (
    "sim nao ok oi ola ei eai hey hello ah eh ne ta to ai ue bom boa bem mal tudo nada algo medo dor paz amor " +
    "ajuda ajudar triste sozinho sozinha cansado cansada briga brigou gritou ciume namoro namorado namorada " +
    "marido esposa amigo amiga mae pai casa sei quero posso pode tenho estou sou foi vai vou tem ter era ser " +
    "tchau valeu obrigado obrigada talvez agora hoje ontem muito pouco mais menos como onde quem quando " +
    "porque pq vc vcs voce ele ela eles elas meu minha seu sua isso esse essa aqui ali la ja nem mas ainda " +
    "sempre nunca depois antes dia tarde noite encerrar sair conversa conversar falar fazer faco devo resolver " +
    "preciso perigo seguro segura seguranca"
).split(" ");

const RESPOSTAS_INVALIDAS = {
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

const MSG_VIDA =
    "Sinto muito que você esteja com tanta dor. Você não precisa passar por isso sozinho(a), e a sua vida importa. " +
    "Se está pensando em se machucar ou em tirar a própria vida, ligue agora para o CVV no 188 (24 h, gratuito) " +
    "ou para o SAMU 192 / Polícia 190 se houver risco imediato, e, se puder, fique perto de alguém de confiança. " +
    "Estou aqui com você.";

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

/* =====================================================
   CARREGAR CONHECIMENTO
===================================================== */

async function carregarConhecimentoIA() {

    try {

        conhecimentoIA = JSON.parse(JSON.stringify(CONHECIMENTO_EMBUTIDO));

        if (!conhecimentoIA || typeof conhecimentoIA !== "object") throw new Error("JSON inválido.");

        if (!conhecimentoIA.inicio || typeof conhecimentoIA.inicio !== "object") conhecimentoIA.inicio = {};
        if (!Array.isArray(conhecimentoIA.inicio.alternativas)) conhecimentoIA.inicio.alternativas = [];

        if (!conhecimentoIA.categorias || typeof conhecimentoIA.categorias !== "object") conhecimentoIA.categorias = {};
        if (!conhecimentoIA.respostas || typeof conhecimentoIA.respostas !== "object") conhecimentoIA.respostas = {};

        if (!Array.isArray(conhecimentoIA.respostas.geral)) {
            conhecimentoIA.respostas.geral = [
                "Estou ouvindo você. Quer me contar um pouco mais?",
                "Entendi. Podemos conversar sobre isso com calma.",
                "Pode continuar. Estou acompanhando o que você está contando.",
                "Tudo bem. O que aconteceu depois?",
                "Se quiser, pode explicar um pouco mais sobre essa situação."
            ];
        }

        if (!conhecimentoIA.respostas_intencao || typeof conhecimentoIA.respostas_intencao !== "object") {
            conhecimentoIA.respostas_intencao = {};
        }

        // Adapta categorias na raiz do JSON ao formato esperado
        const nomes = ["controle", "medo", "pressao", "isolamento", "humilhacao", "ameaca", "tristeza", "confusao"];

        if (Object.keys(conhecimentoIA.categorias).length === 0) {
            nomes.forEach(function (nome) {
                const dados = conhecimentoIA[nome];
                if (dados && Array.isArray(dados.palavras)) conhecimentoIA.categorias[nome] = dados;
            });
        }

        if (!Array.isArray(conhecimentoIA.respostas.seguranca) &&
            conhecimentoIA.seguranca && Array.isArray(conhecimentoIA.seguranca.respostas)) {
            conhecimentoIA.respostas.seguranca = conhecimentoIA.seguranca.respostas;
        }

        if (!Array.isArray(conhecimentoIA.respostas.encerramento) && Array.isArray(conhecimentoIA.encerramento)) {
            conhecimentoIA.respostas.encerramento = conhecimentoIA.encerramento;
        }

        if (!Array.isArray(conhecimentoIA.respostas.continuidade) &&
            conhecimentoIA.respostas_gerais && Array.isArray(conhecimentoIA.respostas_gerais.continuidade)) {
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

    injetarEstilosIA();
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
            if (!campoIA) return;
            campoIA.value = botao.dataset.sugestao || "";
            ajustarTextarea();
            enviarMensagemIA();
        });
    });

    janelaIA?.addEventListener("click", function (evento) {
        if (evento.target === janelaIA) fecharIA();
    });

    document.addEventListener("keydown", function (evento) {

        if (!janelaIA || !janelaIA.classList.contains("ativa")) return;

        if (evento.key === "Escape") {
            fecharIA();
            return;
        }

        if (evento.key === "Tab") {

            const itens = Array.from(janelaIA.querySelectorAll("button, textarea, a[href]"))
                .filter(function (el) { return !el.disabled && el.offsetParent !== null; });

            if (itens.length === 0) return;

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
   ABRIR / FECHAR / REINICIAR
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

    if (historicoIA.length === 0) iniciarConversa();

    setTimeout(function () { campoIA?.focus(); }, 150);

}

function fecharIA() {

    if (!janelaIA) return;

    janelaIA.classList.remove("ativa");
    janelaIA.setAttribute("aria-hidden", "true");
    btnAbrirIA?.classList.remove("oculto");
    document.body.style.overflow = "";

    if (focoAnteriorIA && typeof focoAnteriorIA.focus === "function") focoAnteriorIA.focus();

    focoAnteriorIA = null;

}

function fecharModalAcolhimento() {

    const modal = document.getElementById("modalAcolhimento");

    if (!modal) return;

    modal.classList.remove("ativo");
    document.body.style.overflow = "";

}

function reiniciarIA() {

    historicoIA = [];
    categoriasDetectadas = new Set();
    categoriaAtual = null;
    ultimaCategoria = null;
    mensagensUsuario = 0;
    respondendo = false;
    ultimoCartaoEm = -99;
    invalidas = 0;
    chipsPendentes = null;

    clearTimeout(timerRespiracao);

    sugestoesIA?.classList.remove("oculto");

    if (mensagensIA) mensagensIA.innerHTML = "";

    iniciarConversa();

}

/* =====================================================
   PRIMEIRA MENSAGEM
===================================================== */

function iniciarConversa() {

    if (!conhecimentoIA) return;

    const inicio = conhecimentoIA.inicio || {};
    const configuradas = Array.isArray(inicio.mensagens) ? inicio.mensagens : [];

    const principal =
        (typeof inicio.mensagem === "string" && inicio.mensagem.trim())
            ? inicio.mensagem
            : (configuradas[0] || "Olá! Eu sou a IA de acolhimento do Entre Nós. Como posso conversar com você hoje?");

    const alternativas = Array.isArray(inicio.alternativas) ? inicio.alternativas : configuradas.slice(1);

    const mensagem = escolherAleatorio([principal, ...alternativas]);

    adicionarMensagemIA(mensagem, "ia");
    salvarHistorico("ia", mensagem, "inicio");

}

/* =====================================================
   ENVIAR MENSAGEM
===================================================== */

function enviarMensagemIA() {

    if (respondendo || !campoIA) return;

    const texto = campoIA.value.trim();

    if (!texto) return;

    removerChips();

    adicionarMensagemIA(texto, "usuario");
    salvarHistorico("usuario", texto);

    mensagensUsuario++;

    sugestoesIA?.classList.add("oculto");

    campoIA.value = "";
    ajustarTextarea();

    analisarMensagemIA(texto);

}

function salvarHistorico(autor, texto, categoria = null) {

    historicoIA.push({ autor: autor, texto: texto, categoria: categoria, momento: Date.now() });

}

function adicionarMensagemIA(texto, tipo) {

    if (!mensagensIA) return;

    const mensagem = document.createElement("div");

    mensagem.className = "mensagem-ia " + tipo;
    mensagem.textContent = String(texto);

    mensagensIA.appendChild(mensagem);

    rolarMensagens();

}

/* =====================================================
   CARTÃO DE EMERGÊNCIA
===================================================== */

function adicionarCartaoEmergencia() {

    if (!mensagensIA) return;

    // Evita repetir o cartão a cada mensagem
    if (mensagensUsuario - ultimoCartaoEm < 4) return;

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
   BOTÕES DE RESPOSTA RÁPIDA (v5)
===================================================== */

function removerChips() {

    document.querySelectorAll(".chips-ia").forEach(function (el) { el.remove(); });

}

function adicionarChips(lista) {

    if (!mensagensIA) return;

    removerChips();

    const caixa = document.createElement("div");
    caixa.className = "chips-ia";

    lista.forEach(function (item) {

        const botao = document.createElement("button");
        botao.type = "button";
        botao.textContent = item[0];

        botao.addEventListener("click", function () {

            removerChips();

            if (item[1] === "@respirar") {
                mostrarRespiracao();
                return;
            }

            campoIA.value = item[1];
            ajustarTextarea();
            enviarMensagemIA();

        });

        caixa.appendChild(botao);

    });

    mensagensIA.appendChild(caixa);

    rolarMensagens();

}

/* =====================================================
   EXERCÍCIO DE RESPIRAÇÃO (v5)
===================================================== */

function pararRespiracao() {

    clearTimeout(timerRespiracao);

    document.querySelectorAll(".cartao-respiracao").forEach(function (el) { el.remove(); });

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

    let ciclo = 0;
    let fase = 0;

    function passo() {

        if (!cartao.isConnected) return;

        if (ciclo >= 3) {
            texto.textContent = "Muito bem. Como você está se sentindo agora?";
            bola.style.animation = "none";
            return;
        }

        texto.textContent = fases[fase][0];

        timerRespiracao = setTimeout(function () {
            fase++;
            if (fase >= fases.length) { fase = 0; ciclo++; }
            passo();
        }, fases[fase][1]);

    }

    passo();

}

function injetarEstilosIA() {

    if (document.getElementById("estilos-ia-v5")) return;

    const estilo = document.createElement("style");
    estilo.id = "estilos-ia-v5";

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
            animation:respirarIA 12s ease-in-out infinite;
        }
        .resp-texto { color:#45206d; font-size:14px; min-height:20px; }
        .resp-fechar {
            padding:6px 12px; color:#6d35a8; background:#fff; font-size:11px; font-weight:600;
            border:1px solid #e0cdee; border-radius:14px; cursor:pointer;
        }
        @keyframes respirarIA { 0%{transform:scale(1)} 33%{transform:scale(1.5)} 50%{transform:scale(1.5)} 100%{transform:scale(1)} }
        @media (prefers-reduced-motion: reduce) { .resp-bola { animation:none; } }
    `;

    document.head.appendChild(estilo);

}

/* =====================================================
   DIGITANDO
===================================================== */

function mostrarDigitando(ativo) {

    indicadorDigitacao?.classList.toggle("ativo", ativo);

}

/* =====================================================
   IA GENERATIVA (BACKEND) + FALLBACK LOCAL
===================================================== */

async function analisarMensagemIA(texto) {

    if (!conhecimentoIA) {
        responderComAtraso("Ainda estou carregando meu conhecimento. Tente novamente em alguns segundos.");
        return;
    }

    const normalizado = normalizarTexto(texto);
    const termosDeRisco = ["ameaca", "me machucar", "violencia", "agressao", "perigo", "com medo", "me bateu"];
    const risco =
        termosDeRisco.some(function (t) { return normalizado.includes(t); }) ||
        RISCO_VIDA.some(function (r) { return r.test(normalizado); });

    // Sem backend (ou em situação de risco), usa as regras locais
    if (risco || !IA_BACKEND_URL) {
        analisarMensagemLocalIA(texto);
        return;
    }

    respondendo = true;
    if (btnEnviarIA) btnEnviarIA.disabled = true;
    mostrarDigitando(true);

    try {

        const historico = historicoIA.slice(0, -1).slice(-12).map(function (item) {
            return { role: item.autor === "usuario" ? "user" : "assistant", content: item.texto };
        });

        const resposta = await fetch(IA_BACKEND_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ mensagem: texto, historico: historico })
        });

        const dados = await resposta.json();

        if (!resposta.ok || !dados.resposta) throw new Error(dados.erro || "Serviço de IA indisponível.");

        mostrarDigitando(false);
        adicionarMensagemIA(dados.resposta, "ia");
        salvarHistorico("ia", dados.resposta, "generativa");

    } catch (erro) {

        console.warn("IA generativa indisponível; usando modo local:", erro);

        mostrarDigitando(false);
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
   DETECTOR DE TEXTO SEM SENTIDO (v5)
===================================================== */

function construirLexico() {

    if (lex && fonteLex === conhecimentoIA) return;

    fonteLex = conhecimentoIA;
    lex = new Set([...FUNCAO, ...BASICAS]);

    function visitar(obj) {

        if (!obj || typeof obj !== "object") return;

        if (Array.isArray(obj.palavras)) {
            obj.palavras.forEach(function (p) {
                normalizarTexto(p).split(/[^a-z]+/).forEach(function (w) { if (w) lex.add(w); });
            });
        }

        Object.values(obj).forEach(function (v) {
            if (v && typeof v === "object" && !Array.isArray(v)) visitar(v);
        });

    }

    visitar(conhecimentoIA);

    vocab = Array.from(lex).filter(function (w) { return w.length >= 5; });

}

const LINHAS_TECLADO = ["qwertyuiop", "asdfghjkl", "zxcvbnm"].reduce(function (lista, l) {
    return lista.concat([l, l.split("").reverse().join("")]);
}, []);

function temSequenciaTeclado(t) {

    for (let i = 0; i + 4 <= t.length; i++) {
        const trecho = t.slice(i, i + 4);
        if (LINHAS_TECLADO.some(function (linha) { return linha.includes(trecho); })) return true;
    }

    return false;

}

// Conta sinais de "bagunça" na palavra
function sinaisDeBagunca(t) {

    const vogais = (t.match(/[aeiou]/g) || []).length;
    let s = 0;

    if (t.length >= 3 && vogais === 0) s++;
    if (/(.)\1{2,}/.test(t)) s++;
    if (/[^aeiou]{5,}/.test(t)) s++;
    if (t.length >= 5 && (vogais / t.length < 0.2 || vogais / t.length > 0.8)) s++;
    if (temSequenciaTeclado(t)) s++;
    if (t.length >= 6 && new Set(t.split("")).size <= t.length * 0.4) s++;
    if (t.length >= 6 && /^(.{2,4})\1+.?$/.test(t)) s++;

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

// Corrige erros de digitação de 1 letra com o vocabulário do JSON
function corrigirDigitacao(n) {

    return n.replace(/[a-z]{5,}/g, function (w) {

        if (lex.has(w)) return w;

        for (let i = 0; i < vocab.length; i++) {
            if (distancia1(w, vocab[i])) return vocab[i];
        }

        return w;

    });

}

function classificarMensagem(n) {

    const t = n.split(/[^a-z]+/).filter(Boolean);

    if (!t.length) return "semsentido";

    if (t.every(function (x) { return /^(k{2,}|(ha|he|hi)+h?|rs+)$/.test(x); })) return "riso";

    let ruins = 0;

    t.forEach(function (x) {
        if (lex.has(x)) return;
        if (x.length <= 2 || sinaisDeBagunca(x) > 0) ruins++;
    });

    if (ruins / t.length >= 0.6) return "semsentido";

    if (t.every(function (x) { return FUNCAO.has(x); })) return "incompleto";

    if (t.length === 1 && !lex.has(t[0]) && t[0].length <= 5) return "incompleto";

    return "ok";

}

/* =====================================================
   ANALISAR MENSAGEM (LOCAL)
===================================================== */

function analisarMensagemLocalIA(texto) {

    if (!conhecimentoIA) {
        responderComAtraso("Ainda estou carregando meu conhecimento. Tente novamente em alguns segundos.");
        return;
    }

    construirLexico();

    const original = normalizarTexto(texto);

    if (!original) {
        responderComAtraso("Pode escrever o que você gostaria de conversar comigo.");
        return;
    }

    // 1) Risco de vida: prioridade máxima
    if (RISCO_VIDA.some(function (r) { return r.test(original); })) {
        invalidas = 0;
        ultimoCartaoEm = -99;
        responderComAtraso(MSG_VIDA, adicionarCartaoEmergencia);
        return;
    }

    // 2) Corrige digitação e verifica se faz sentido
    const normalizado = corrigirDigitacao(original);
    const tipo = classificarMensagem(normalizado);

    if (tipo === "riso") {
        invalidas = 0;
        responderComAtraso(escolherRespostaDiferente(RESPOSTAS_INVALIDAS.riso));
        return;
    }

    if (tipo === "semsentido" || tipo === "incompleto") {
        invalidas++;
        chipsPendentes = CHIPS_BASE;
        responderComAtraso(
            invalidas >= 3
                ? RESPOSTAS_INVALIDAS.insistente
                : escolherRespostaDiferente(RESPOSTAS_INVALIDAS[tipo])
        );
        return;
    }

    invalidas = 0;

    if (detectarSaudacao(normalizado)) {
        responderComAtraso(gerarRespostaSaudacao());
        return;
    }

    if (detectarDespedida(normalizado)) {
        responderComAtraso(escolherResposta("encerramento"));
        return;
    }

    const categorias = detectarCategorias(normalizado);

    if (categorias.includes("ameaca")) {

        categoriasDetectadas.add("ameaca");
        categoriaAtual = "ameaca";
        ultimaCategoria = "ameaca";

        responderComAtraso(gerarRespostaCategoria("ameaca"), adicionarCartaoEmergencia);
        return;

    }

    if (detectarIntencaoSeguranca(normalizado)) {
        responderComAtraso(escolherResposta("seguranca"), adicionarCartaoEmergencia);
        return;
    }

    // 3) Ansiedade ou pedido para respirar
    if (RESPIRAR.test(normalizado)) {
        responderComAtraso("Vamos fazer uma pausa juntos. Acompanhe o círculo, no seu ritmo.", mostrarRespiracao);
        return;
    }

    const intencao = detectarIntencao(normalizado);

    if (intencao) {
        responderComAtraso(escolherRespostaIntencao(intencao));
        return;
    }

    if (categorias.length > 0) {

        categorias.forEach(function (c) { categoriasDetectadas.add(c); });

        categoriaAtual = escolherCategoriaPrincipal(categorias);
        ultimaCategoria = categoriaAtual;

        // 4) Oferece respirar em medo, tristeza e confusão
        if (["medo", "tristeza", "confusao"].includes(categoriaAtual)) {
            chipsPendentes = [["Respirar um pouco", "@respirar"]];
        }

        responderComAtraso(gerarRespostaCategoria(categoriaAtual));
        return;

    }

    const respostaPergunta = responderPerguntaNormal(normalizado);

    if (respostaPergunta) {
        responderComAtraso(respostaPergunta);
        return;
    }

    responderComAtraso(gerarRespostaContextual(normalizado));

}

/* =====================================================
   NORMALIZAR TEXTO
===================================================== */

function normalizarTexto(texto) {

    if (typeof texto !== "string") return "";

    return texto
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, " ")
        .trim();

}

/* =====================================================
   SAUDAÇÕES E DESPEDIDAS
===================================================== */

function detectarSaudacao(texto) {

    const saudacoes = ["oi", "ola", "bom dia", "boa tarde", "boa noite", "e ai", "ei", "hello", "hey"];

    return saudacoes.some(function (s) { return texto === s || texto.startsWith(s + " "); });

}

function gerarRespostaSaudacao() {

    const hora = new Date().getHours();
    let cumprimento = "Boa noite";

    if (hora >= 5 && hora < 12) cumprimento = "Bom dia";
    else if (hora >= 12 && hora < 18) cumprimento = "Boa tarde";

    return escolherRespostaDiferente([
        cumprimento + "! Que bom conversar com você. Como posso ajudar?",
        cumprimento + "! Estou aqui para ouvir você. Sobre o que gostaria de conversar?",
        cumprimento + "! Podemos conversar com calma. O que você gostaria de me contar?"
    ]);

}

function detectarDespedida(texto) {

    const despedidas = ["tchau", "ate mais", "ate logo", "vou embora", "preciso ir", "encerrar", "quero sair da conversa"];

    return despedidas.some(function (t) { return texto === t || texto.includes(t); });

}

/* =====================================================
   SEGURANÇA E INTENÇÕES
===================================================== */

function detectarIntencaoSeguranca(texto) {

    const termos = [
        "estou em perigo", "nao estou segura", "nao estou seguro", "estou com medo agora",
        "acontecendo agora", "estou sozinho", "estou sozinha", "preciso de ajuda agora",
        "estou sendo ameacado", "estao me ameacando"
    ];

    return termos.some(function (t) { return texto.includes(t); });

}

function detectarIntencao(texto) {

    if (texto.includes("o que eu faco") || texto.includes("o que fazer") ||
        texto.includes("o que devo fazer") || texto.includes("como resolver")) return "o_que_fazer";

    if (texto === "nao sei" || texto.includes("nao sei o que fazer")) return "nao_sei";

    if (texto.includes("quero conversar") || texto.includes("quero falar")) return "quero_conversar";

    if (texto === "obrigado" || texto === "obrigada" ||
        texto.includes("muito obrigado") || texto.includes("muito obrigada")) return "obrigado";

    return null;

}

/* =====================================================
   CATEGORIAS
===================================================== */

function detectarCategorias(texto) {

    const encontradas = [];

    const categorias =
        conhecimentoIA && conhecimentoIA.categorias && typeof conhecimentoIA.categorias === "object"
            ? conhecimentoIA.categorias
            : {};

    Object.entries(categorias).forEach(function ([nome, dados]) {

        if (!dados || typeof dados !== "object" || !Array.isArray(dados.palavras)) return;

        const achou = dados.palavras.some(function (palavra) {
            const termo = normalizarTexto(palavra);
            return termo ? contemTermo(texto, termo) : false;
        });

        if (achou) encontradas.push(nome);

    });

    return encontradas;

}

// Busca por palavra inteira (evita "mal" dentro de "normal")
function contemTermo(texto, termo) {

    const seguro = termo.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    return new RegExp("(^|[^a-z0-9])" + seguro + "([^a-z0-9]|$)").test(texto);

}

function escolherCategoriaPrincipal(categorias) {

    const prioridade = ["ameaca", "medo", "pressao", "controle", "isolamento", "humilhacao", "tristeza", "confusao"];

    for (const categoria of prioridade) {
        if (categorias.includes(categoria)) return categoria;
    }

    return categorias[0] || null;

}

function gerarRespostaCategoria(categoria) {

    const dados = (conhecimentoIA?.categorias || {})[categoria];

    if (!dados) return escolherResposta("geral");

    if (categoria === "ameaca") return escolherResposta("seguranca");

    const respostas = Array.isArray(dados.perguntas) ? dados.perguntas : [];

    if (respostas.length === 0) return escolherResposta("geral");

    return escolherRespostaDiferente(respostas);

}

/* =====================================================
   PERGUNTAS NORMAIS E CONTEXTO
===================================================== */

function responderPerguntaNormal(texto) {

    if (texto.includes("qual seu nome") || texto.includes("como voce se chama") || texto.includes("quem e voce")) {
        return "Eu sou a Entre Nós IA, uma assistente educativa criada para conversar, ouvir e ajudar você a organizar seus pensamentos.";
    }

    if (texto.includes("o que voce faz") || texto.includes("para que voce serve")) {
        return "Meu objetivo é oferecer acolhimento e orientação inicial. Posso conversar sobre situações, sentimentos e relacionamentos sem fazer diagnósticos.";
    }

    if (texto.includes("voce e uma ia") || texto.includes("voce e inteligencia artificial")) {
        return "Sim. Eu sou uma inteligência artificial local do projeto Entre Nós. Meu funcionamento é baseado nas informações e regras definidas no sistema.";
    }

    if (texto.includes("como voce esta") || texto.includes("tudo bem com voce")) {
        return "Estou funcionando normalmente e pronta para conversar com você. E você, como está hoje?";
    }

    if (texto.includes("voce pode me ajudar")) {
        return "Posso tentar ajudar. Conte o que está acontecendo ou faça sua pergunta, e vamos conversar passo a passo.";
    }

    if (texto.endsWith("?")) {
        return "Posso tentar responder. Conte um pouco mais sobre a sua pergunta para que eu possa entender melhor o que você quer saber.";
    }

    return null;

}

function gerarRespostaContextual(texto) {

    const ultimoUsuario = encontrarUltimaMensagemUsuario();

    if (texto.includes("porque")) return "Entendo. Você pode explicar um pouco mais sobre o que aconteceu?";

    if (texto.includes("como")) return "Podemos pensar nisso passo a passo. Quer me contar um pouco mais?";

    if (texto === "sim" || texto.startsWith("sim ")) {
        if (ultimaCategoria) return gerarPerguntaContinuidade(ultimaCategoria);
        return "Entendi. Quer continuar contando o que aconteceu?";
    }

    if (texto === "nao" || texto.startsWith("nao ")) {
        return "Tudo bem. Você não precisa responder nada que não queira. Podemos conversar sobre outra parte da situação.";
    }

    if (ultimoUsuario && mensagensUsuario >= 3) return escolherResposta("continuidade");

    return escolherResposta("geral");

}

function gerarPerguntaContinuidade(categoria) {

    const dados = conhecimentoIA?.categorias?.[categoria];

    if (dados && Array.isArray(dados.perguntas)) return escolherRespostaDiferente(dados.perguntas);

    return escolherResposta("continuidade");

}

function encontrarUltimaMensagemUsuario() {

    for (let i = historicoIA.length - 1; i >= 0; i--) {
        if (historicoIA[i].autor === "usuario") return historicoIA[i];
    }

    return null;

}

/* =====================================================
   ESCOLHER RESPOSTAS
===================================================== */

function escolherResposta(categoria) {

    const respostas = conhecimentoIA?.respostas || {};

    return escolherRespostaDiferente(respostas[categoria] || respostas.geral);

}

function escolherRespostaIntencao(intencao) {

    const lista = (conhecimentoIA?.respostas_intencao || {})[intencao];

    if (!Array.isArray(lista)) return escolherResposta("geral");

    return escolherRespostaDiferente(lista);

}

function escolherRespostaDiferente(lista) {

    if (!Array.isArray(lista) || lista.length === 0) return "Estou ouvindo você. Quer me contar um pouco mais?";

    if (lista.length === 1) return lista[0];

    const ultimas = historicoIA
        .filter(function (item) { return item.autor === "ia"; })
        .slice(-5)
        .map(function (item) { return item.texto; });

    const disponiveis = lista.filter(function (item) { return !ultimas.includes(item); });

    return escolherAleatorio(disponiveis.length > 0 ? disponiveis : lista);

}

function escolherAleatorio(lista) {

    if (!Array.isArray(lista) || lista.length === 0) return "Estou ouvindo você. Quer me contar um pouco mais?";

    return lista[Math.floor(Math.random() * lista.length)];

}

/* =====================================================
   RESPONDER COM ATRASO
===================================================== */

function responderComAtraso(resposta, aposResponder) {

    if (typeof resposta !== "string" || !resposta.trim()) {
        resposta = "Estou ouvindo você. Quer me contar um pouco mais?";
    }

    const chips = chipsPendentes;
    chipsPendentes = null;

    respondendo = true;

    if (btnEnviarIA) btnEnviarIA.disabled = true;

    mostrarDigitando(true);

    const tempo = Math.min(1600, Math.max(500, resposta.length * 8));

    setTimeout(function () {

        mostrarDigitando(false);

        adicionarMensagemIA(resposta, "ia");
        salvarHistorico("ia", resposta, categoriaAtual);

        respondendo = false;

        if (btnEnviarIA) btnEnviarIA.disabled = false;

        campoIA?.focus();
        rolarMensagens();

        if (typeof aposResponder === "function") aposResponder();

        if (chips) adicionarChips(chips);

    }, tempo);

}

/* =====================================================
   TEXTAREA, ROLAGEM E ERRO
===================================================== */

function ajustarTextarea() {

    if (!campoIA) return;

    campoIA.style.height = "auto";
    campoIA.style.height = Math.min(campoIA.scrollHeight, 100) + "px";

}

function rolarMensagens() {

    if (!mensagensIA) return;

    mensagensIA.scrollTo({ top: mensagensIA.scrollHeight, behavior: "smooth" });

}

function mostrarErroIA() {

    const mensagens = document.getElementById("mensagensIA");

    if (!mensagens) return;

    mensagens.innerHTML = "";

    const mensagem = document.createElement("div");
    mensagem.className = "mensagem-ia ia";
    mensagem.textContent =
        "Não consegui carregar o arquivo ia-conhecimento.json. Verifique se ele está na mesma pasta do index.html e se o JSON é válido.";

    mensagens.appendChild(mensagem);

}

/* =====================================================
   INICIALIZAÇÃO
===================================================== */

document.addEventListener("DOMContentLoaded", function () {

    carregarConhecimentoIA();

});


/* =====================================================
   MELHORIAS DO SITE (estilos embutidos)
===================================================== */

(function () {
    const estilo = document.createElement("style");
    estilo.id = "estilos-melhorias-site";
    estilo.textContent = `
/* =====================================================
   ENTRE NÓS — MELHORIAS VISUAIS (carregar depois do style.css)
===================================================== */

/* ---------- Botão de tema ---------- */

.btn-tema {
    width: 42px;
    height: 42px;
    flex-shrink: 0;
    color: var(--roxo);
    font-size: 17px;
    background: #f5edff;
    border: 1px solid #e4d4ef;
    border-radius: 50%;
    transition: transform .2s ease, background .2s ease;
}

.btn-tema:hover {
    transform: rotate(18deg) scale(1.06);
}

/* ---------- Saída rápida ---------- */

.btn-saida-rapida {
    position: fixed;
    left: 18px;
    bottom: 18px;
    z-index: 950;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 10px 16px;
    color: #fff;
    font-size: 13px;
    font-weight: 600;
    background: #b3234f;
    border: 0;
    border-radius: 999px;
    box-shadow: 0 8px 22px rgba(179, 35, 79, .35);
    opacity: .88;
    transition: opacity .2s ease, transform .2s ease;
}

.btn-saida-rapida:hover {
    opacity: 1;
    transform: translateY(-2px);
}

@media (max-width: 600px) {
    .btn-saida-rapida { left: 12px; bottom: 12px; padding: 9px 13px; font-size: 12px; }
}

@media print {
    .btn-saida-rapida, .btn-tema { display: none; }
}

/* =====================================================
   TEMA ESCURO
===================================================== */

html[data-tema="escuro"] {
    color-scheme: dark;
    --texto: #ece4f3;
    --texto-suave: #b9aec4;
    --roxo: #b58be6;
    --roxo-escuro: #dcc6f5;
    --fundo-roxo: #3a2352;
    --borda: #4a3563;
}

html[data-tema="escuro"] body {
    color: var(--texto);
    background: #1a1024;
}

html[data-tema="escuro"] #header,
html[data-tema="escuro"] #header.rolado {
    background: rgba(32, 19, 44, .97);
    border-bottom-color: rgba(181, 139, 230, .18);
}

html[data-tema="escuro"] nav a { color: #d8cce4; }

html[data-tema="escuro"] .btn-tema {
    color: #ffd76a;
    background: #35224a;
    border-color: #4a3563;
}

html[data-tema="escuro"] .banner {
    background:
        radial-gradient(circle at 85% 20%, rgba(255, 64, 129, .18), transparent 30%),
        radial-gradient(circle at 10% 85%, rgba(109, 53, 168, .3), transparent 35%),
        linear-gradient(135deg, #25143a, #2e1530);
}

html[data-tema="escuro"] .banner::before,
html[data-tema="escuro"] .banner::after { opacity: .25; }

html[data-tema="escuro"] .banner p { color: #c9bdd6; }

html[data-tema="escuro"] .banner-texto > span,
html[data-tema="escuro"] .botao2 {
    color: #dcc6f5;
    background: rgba(255, 255, 255, .08);
    border-color: rgba(181, 139, 230, .3);
}

html[data-tema="escuro"] .sobre,
html[data-tema="escuro"] .contato {
    background: #1f1329;
}

html[data-tema="escuro"] .estatisticas,
html[data-tema="escuro"] .questionario,
html[data-tema="escuro"] .resultado,
html[data-tema="escuro"] .analise {
    background: #1a1024;
}

html[data-tema="escuro"] .card,
html[data-tema="escuro"] .pergunta,
html[data-tema="escuro"] .resultado-card,
html[data-tema="escuro"] .modal-acolhimento,
html[data-tema="escuro"] .item-grafico {
    color: var(--texto);
    background: #281a37;
    border-color: #3d2b52;
}

html[data-tema="escuro"] .pergunta label {
    color: #d8cce4;
    background: #2f2040;
    border-color: #45305c;
}

html[data-tema="escuro"] .pergunta label:hover,
html[data-tema="escuro"] .pergunta label:has(input:checked) {
    background: #3d2757;
    border-color: #b58be6;
}

html[data-tema="escuro"] .aviso-educativo,
html[data-tema="escuro"] #orientacoes,
html[data-tema="escuro"] #opcoesApoio,
html[data-tema="escuro"] #opcoesDenuncia,
html[data-tema="escuro"] .ia-convite {
    color: var(--texto);
    background: #2c1d3d;
    border-color: #45305c;
}

html[data-tema="escuro"] #mensagemResultado {
    background: #3a1d2d;
}

html[data-tema="escuro"] #mensagemResultado h3 { color: #ffb3cf; }
html[data-tema="escuro"] #mensagemResultado p { color: #eadff0; }

html[data-tema="escuro"] .barra,
html[data-tema="escuro"] .barra-progresso { background: #3d2b52; }

html[data-tema="escuro"] #formContato input,
html[data-tema="escuro"] #formContato textarea,
html[data-tema="escuro"] .seletor-grafico select {
    color: var(--texto);
    background: #2f2040;
    border-color: #45305c;
}

html[data-tema="escuro"] #opcoesApoio a,
html[data-tema="escuro"] #opcoesDenuncia a,
html[data-tema="escuro"] .opcoes-acolhimento button {
    color: #dcc6f5;
    background: #35224a;
    border-color: #4a3563;
}

html[data-tema="escuro"] .ia-container,
html[data-tema="escuro"] .sugestoes-ia,
html[data-tema="escuro"] .form-ia,
html[data-tema="escuro"] .ia-aviso {
    background: #231532;
    border-color: #3d2b52;
}

html[data-tema="escuro"] .mensagens-ia,
html[data-tema="escuro"] .indicador-digitacao { background: #1c1128; }

html[data-tema="escuro"] .mensagem-ia.ia {
    color: #ece4f3;
    background: #2f2040;
    border-color: #45305c;
}

html[data-tema="escuro"] .form-ia textarea {
    color: var(--texto);
    background: #2f2040;
    border-color: #45305c;
}

html[data-tema="escuro"] .cartao-emergencia { background: #3a1d2d; border-color: #6a2f4a; }
html[data-tema="escuro"] .cartao-emergencia a { color: var(--texto); background: #2f2040; border-color: #6a2f4a; }
html[data-tema="escuro"] .cartao-emergencia strong { color: #ffb3cf; }

html[data-tema="escuro"] .chips-ia button,
html[data-tema="escuro"] .resp-fechar { color: #dcc6f5; background: #2f2040; border-color: #45305c; }
html[data-tema="escuro"] .cartao-respiracao { background: #2c1d3d; border-color: #45305c; }
html[data-tema="escuro"] .resp-texto { color: #dcc6f5; }

`;
    document.head.appendChild(estilo);
})();

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
