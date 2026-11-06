// Esta função é chamada quando o utilizador clica no botão de criar conta
function mostrarMensagem(evento) {
    // Impede que a página recarregue sozinha ao enviar
    evento.preventDefault();

    // Vai buscar o texto que foi escrito na caixinha do nome
    let nomeUtilizador = document.getElementById('campoNome').value;

    // Mostra um aviso no ecrã com o nome da pessoa
    alert("Parabéns, " + nomeUtilizador + "! Conta criada com sucesso.");
}