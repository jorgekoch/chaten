const usuarios = [];
let usuario = '';

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

definirUsuario();

function manterConexao() {
    axios.post("https://mock-api.driven.com.br/api/v6/uol/status/14ac71ea-a29f-4c8a-85dc-a54fe68263fe", { name: usuario })
        .then(response => {
            console.log("Usuário ainda online:", response);
        })
        .catch(error => {
            console.error("Erro ao manter conexão:", error);
        });
}

setInterval(manterConexao, 5000);

const mensagens = [];

function renderizarMensagem() {
    const ul = document.querySelector(".mensagens");
    ul.innerHTML = "";

    for (let i = 0; i < mensagens.length; i++) {
        const mensagem = mensagens[i];
        let messageClass = '';

        if (mensagem.Tipo === 'status') {
            if (mensagem.Mensagem.includes('entrou na sala')) {
                messageClass = 'message-enter';
            } else if (mensagem.Mensagem.includes('saiu da sala')) {
                messageClass = 'message-exit';
            }
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

carregarMensagens();

setInterval(carregarMensagens, 3000);

renderizarMensagem();