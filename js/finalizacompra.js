document.getElementById('form-checkout').addEventListener('submit', function(event) {
    // 1. Previne o envio padrão do formulário
    event.preventDefault();

    // 2. Coleta os dados do formulário
    const whatsapp = document.getElementById('whatsapp').value;
    const tipoPagamento = document.getElementById('tipo-pagamento').value;
    
    // 3. Coleta o resumo do carrinho (você pode adaptar isso para seu código real)
    const itensCarrinho = document.getElementById('lista-itens-carrinho').innerText;
    const total = document.getElementById('valor-total').innerText;
    
    // 4. Constrói a mensagem para o WhatsApp
    // É importante usar "%0A" para quebrar linha (que é o que o WhatsApp entende como Enter)
    let mensagem = `*✅ NOVO PEDIDO - GRANDE CYBERX* %0A%0A`;
    mensagem += `*Detalhes do Pedido:* %0A`;
    // Adiciona os itens do carrinho e o total
    mensagem += `---%0A${itensCarrinho}%0A---%0A`; 
    mensagem += `*Total:* ${total} %0A%0A`;
    mensagem += `*Tipo de Pagamento Escolhido:* ${tipoPagamento} %0A%0A`;
    mensagem += `*WhatsApp do Cliente (Para confirmação):* ${whatsapp} %0A%0A`;
    mensagem += `Nossa equipe fica agradecida pela confiança no Grande CYBERX! Entraremos em contato em breve para finalizar o seu pedido.`;


    // 5. Codifica a mensagem para garantir que caracteres especiais funcionem
    const mensagemCodificada = encodeURIComponent(mensagem);

    // 6. Cria o link de redirecionamento para o WhatsApp do *cliente*
    // O formato é wa.me/SEUNUMERO?text=MENSAGEM
    // **IMPORTANTE:** Você deve substituir 'SEU_NUMERO_DE_ATENDIMENTO' pelo seu número real do CYBERX (com código do país e DDD, sem símbolos).
    const seuNumeroCyberX = 'SEU_NUMERO_DE_ATENDIMENTO'; // Ex: 5511998765432
    
    if (seuNumeroCyberX === 'SEU_NUMERO_DE_ATENDIMENTO') {
        alert("ERRO: Por favor, substitua 'SEU_NUMERO_DE_ATENDIMENTO' no arquivo script.js pelo seu número real de WhatsApp.");
        return; // Interrompe a função se o número não foi configurado
    }
    
    const urlWhatsApp = `https://wa.me/${seuNumeroCyberX}?text=${mensagemCodificada}`;

    // 7. Abre o link no WhatsApp
    // A ideia original era mandar para o número do cliente, mas isso não é possível por segurança (só se envia do cliente para um número de atendimento). 
    // Por isso, a melhor prática é enviar o pedido do cliente para o SEU número de atendimento.
    window.open(urlWhatsApp, '_blank');
    
    // 8. Opcional: Mostra uma mensagem de sucesso na tela
    document.getElementById('form-checkout').style.display = 'none';
    document.getElementById('agradecimento-msg').style.display = 'block';

});