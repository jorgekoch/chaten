const usuarios = [];
let usuario = '';
const mensagens = [];


function definirUsuario() {
    usuario = prompt("Digite seu nome de usuário:");

    while (usuario === null || usuario.trim() === '' || usuarios.includes(usuario)) {
        if (usuario === null || usuario.trim() === '') {
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
        }
        else if (mensagem.Tipo === 'message') {
            messageClass = 'text-message';
        }
        else if (mensagem.Tipo === 'private_message') {
            messageClass = 'private-message';
        }

        ul.innerHTML += `
            <li class="${messageClass}">
                <div class="message-time">${mensagem.Hora}</div>
                <div class="message-user">${mensagem.Nome}</div>
                <div class="message-text">${mensagem.Mensagem}</div>
            </li>`;
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

    if (campoMensagem.trim() !== '') {
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
            to: "Todos",
            text: campoMensagem,
            type: "message" 
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

let usuarioSelecionado = '';

function selecionarUsuario(usuario) {
    const selecionado = document.querySelector('.nome-destinatario');
    selecionado.classList.add('selecionado');

    usuarioSelecionado = usuario;
    const destinatario = document.querySelector('.nome-destinatario');

    destinatario.innerText = `Enviando para ${usuario} (reservadamente)`;   
}

document.querySelector('.destinatario').innerHTML = 'Enviando para Todos (público)';

function chamarParticipantes() {
    axios.get("https://mock-api.driven.com.br/api/v6/uol/participants/14ac71ea-a29f-4c8a-85dc-a54fe68263fe")
        .then(response => {
            const ul = document.querySelector(".lista-participantes");
            ul.innerHTML = "";

            response.data.forEach(participante => {
                ul.innerHTML += `
                    <div class="nome-destinatario">
                    ${participante.name}</div>
                    `;
            });
        })
        .catch(error => {
            console.error("Erro ao carregar participantes:", error);
        });
}

definirUsuario();

setInterval(manterConexao, 5000);

chamarParticipantes();

setInterval(chamarParticipantes, 5000);

carregarMensagens();

setInterval(carregarMensagens, 3000);

renderizarMensagem();