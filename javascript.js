const usuarios = [];
let usuario = '';
const mensagens = [];
let usuarioSelecionado = 'Todos';


function definirUsuario() {
    usuario = prompt("Digite seu nome de usuário:");

    while (usuario === null || usuario === '' || usuarios.includes(usuario)) {
        if (usuario === null || usuario === '') {
            alert("Nome de usuário inválido");
        } else if (usuarios.includes(usuario)) {
            alert("Esse nome de usuário já existe, escolha outro nome");
        }
        usuario = prompt("Digite seu nome de usuário:");
    }
    usuarios.push({ name: usuario });

    const promessaUsuario = axios.post("https://mock-api.driven.com.br/api/v6/uol/participants/14ac71ea-a29f-4c8a-85dc-a54fe68263fe", { name: usuario });
    promessaUsuario.then(funcaoDeSucesso);
    promessaUsuario.catch(tratarErro);
}

function funcaoDeSucesso(response) {
    console.log("Usuário definido:", response);
}

function tratarErro(erro) {
    if (erro.response && erro.response.status === 400) {
        alert("Nome de usuário inválido");
        location.reload();
    } else {
        console.log(erro);
    }
}

function manterConexao() {
    axios.post("https://mock-api.driven.com.br/api/v6/uol/status/14ac71ea-a29f-4c8a-85dc-a54fe68263fe", { name: usuario })
        .then(response => {
            console.log("Usuário ainda online:", response);
        })
        .catch(error => {
            console.error("Erro ao manter conexão:", error);
        });
}

function renderizarMensagem() {
    const ul = document.querySelector(".mensagens");
    ul.innerHTML = "";

    for (let i = 0; i < mensagens.length; i++) {
        const mensagem = mensagens[i];
        let messageClass = '';

        if (mensagem.Tipo === 'status') {
            messageClass = 'status-message';
            ul.innerHTML += `
            <li class="${messageClass}">
                <div class="message-time">${mensagem.Hora}</div>
                <div class="message-user">${mensagem.Nome}</div>
                <div class="message-text">${mensagem.Mensagem}</div>
            </li>`;
        }
        else if (mensagem.Tipo === 'message') {
            messageClass = 'text-message';
            ul.innerHTML += `
            <li class="${messageClass}">
                <div class="message-time">${mensagem.Hora}</div>
                <div class="message-user">${mensagem.Nome}<span class="neutro"> para</span> Todos: </div>
                <div class="message-text">${mensagem.Mensagem}</div>
            </li>`;
        }
        else if (mensagem.Tipo === 'private_message') {
            messageClass = 'private-message';
            ul.innerHTML += `
            <li class="${messageClass}">
                <div class="message-time">${mensagem.Hora}</div>
                <div class="message-user">${mensagem.Nome} <span class="neutro">reservadamente para</span> ${usuarioSelecionado}: </div>
                <div class="message-text">${mensagem.Mensagem}</div>
            </li>`;
        }
    }
}

function adicionarMensagem() {
    let now = new Date();
    let hours = now.getHours().toString().padStart(2, '0');
    let minutes = now.getMinutes().toString().padStart(2, '0');
    let seconds = now.getSeconds().toString().padStart(2, '0');
    
    const campoHora = hours + ':' + minutes + ':' + seconds;
    const campoNome = usuario;
    const campoMensagem = document.querySelector(".chat").value;

    if (campoMensagem !== '') {
        const novaMensagem = {
            Hora: campoHora,
            Nome: campoNome,
            Mensagem: campoMensagem
        };
        mensagens.push(novaMensagem);
        renderizarMensagem();

        document.querySelector(".chat").value = ''; 

        const mensagemObj = {
            from: usuario,
            to: usuarioSelecionado, 
            text: campoMensagem,
            type: usuarioSelecionado === "Todos" ? "message" : "private_message" 
        };

        axios.post("https://mock-api.driven.com.br/api/v6/uol/messages/14ac71ea-a29f-4c8a-85dc-a54fe68263fe", mensagemObj)
            .then(response => {
                console.log(response);
            });
    }
}

function carregarMensagens() {
    axios.get("https://mock-api.driven.com.br/api/v6/uol/messages/14ac71ea-a29f-4c8a-85dc-a54fe68263fe")
        .then(response => {
            mensagens.length = 0;
            response.data.forEach(mensagem => {
                const novaMensagem = {
                    Hora: mensagem.time,
                    Nome: mensagem.from,
                    Mensagem: mensagem.text,
                    Tipo: mensagem.type 
                };
                mensagens.push(novaMensagem);
            });
            renderizarMensagem();
        })
        .catch(error => {
            console.error("Erro ao carregar mensagens:", error);
        });
}

function toggleMenu() {
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.overlay');
    sidebar.classList.toggle('open');
    overlay.classList.toggle('show');
}

function selecionarUsuario(usuario) {
    usuario.classList.add("selecionado");

    const nomeUsuario = document.querySelector(".selecionado .nome-usuario").innerText;
    usuarioSelecionado = nomeUsuario;

    const destinatario = document.querySelector('.destinatario');
    destinatario.innerText = `Enviando para ${nomeUsuario} (reservadamente)`;
}

function enviarParaTodos() {
        usuarioSelecionado = 'Todos';
        const destinatario = document.querySelector('.destinatario');
        destinatario.innerText = 'Enviando para Todos (público)';
    }

function chamarParticipantes() {
    axios.get("https://mock-api.driven.com.br/api/v6/uol/participants/14ac71ea-a29f-4c8a-85dc-a54fe68263fe")
        .then(response => {
            const ul = document.querySelector(".lista-participantes");
            ul.innerHTML = "";

            response.data.forEach(participante => {
                ul.innerHTML += `
                    <li onclick="selecionarUsuario(this)">
                    <ion-icon name="person-circle-outline"></ion-icon>
                    <div class="nome-usuario"> ${participante.name} </div>
                    </li>
                    `;
            });
        })
        .catch(error => {
            console.error("Erro ao carregar participantes:", error);
        });
}

document.querySelector('.destinatario').innerHTML = 'Enviando para Todos (público)';

const scroller = document.querySelector('.mensagens');
const observer = new MutationObserver(() => {
    scroller.scrollIntoView({ behavior: "smooth", block: "end", inline: "nearest" });
});

observer.observe(scroller, { childList: true });


definirUsuario();

setInterval(manterConexao, 5000);

chamarParticipantes();

setInterval(chamarParticipantes, 5000);

carregarMensagens();

setInterval(carregarMensagens, 3000);

renderizarMensagem();