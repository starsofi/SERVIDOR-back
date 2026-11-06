// Ação executada quando o formulário de recuperação é submetido
function enviarInstrucoes(evento) {
    // Impede que a página recarregue sozinha
    evento.preventDefault();

    // Vai buscar o e-mail inserido pelo utilizador
    let emailUtilizador = document.getElementById('emailRecuperacao').value;

    // Mostra um aviso no ecrã a confirmar o envio
    alert("Instruções de recuperação enviadas com sucesso para: " + emailUtilizador);
}