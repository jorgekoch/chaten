const usuario = [];
usuario += prompt("Digite seu nome de usuário: ");
if (usuario === null || usuario === '') {
    alert("Nome de usuário inválido");
    location.reload();
    usuarioDuplicado();
}

function usuarioDuplicado() {
    if (usuario === mensagens[Nome]){
        alert("Esse nome de usuário já existente, escolha outro nome");
        location.reload();
    }
}

const mensagens = [];

function renderizarMensagem() {
    const ul = document.querySelector(".mensagens");
    ul.innerHTML = "";

    for (let i = 0; i < mensagens.length; i++) {
        const mensagem = mensagens[i];
        ul.innerHTML += `
            <li>
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
    }
}

renderizarMensagem();
