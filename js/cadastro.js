// cadastro.js - CONTROLE DO FORMULÁRIO DE CADASTRO (SEM REDIRECIONAMENTO AUTOMÁTICO)
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('cadastro-form');
    const btnCadastrar = form ? form.querySelector('.btn-primary') : null;
    const loginLink = document.querySelector('.link-blue'); // Link "Faça Login"
    
    console.log('📄 Formulário de cadastro carregado');
    
    if (!form) {
        console.error('❌ Formulário não encontrado!');
        return;
    }
    
    // Link "Faça Login" continua funcionando normalmente
    if (loginLink) {
        loginLink.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('🔗 Clique no link "Faça Login"');
            window.location.href = 'index.html'; // Redireciona SÓ quando clicar
        });
    }
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        console.log('🖱️ Botão CADASTRAR clicado');
        
        // 1. PEGAR VALORES DO FORMULÁRIO
        const nome = document.getElementById('cadastro-nome').value.trim();
        const email = document.getElementById('cadastro-email').value.trim();
        const senha = document.getElementById('cadastro-senha').value;
        const confirmaSenha = document.getElementById('cadastro-confirma-senha').value;
        
        console.log('📋 Dados capturados:', { nome, email, senha: '***' });
        
        // 2. VALIDAÇÕES
        const validacoes = validarFormulario(nome, email, senha, confirmaSenha);
        if (!validacoes.valido) {
            showMessage(validacoes.mensagem, 'error');
            return;
        }
        
        // 3. MOSTRAR LOADING
        if(btnCadastrar) {
            btnCadastrar.disabled = true;
            btnCadastrar.innerHTML = '<i class="fas fa-spinner fa-spin"></i> CADASTRANDO...';
            btnCadastrar.style.opacity = '0.8';
        }
        
        try {
            // 4. CHAMAR FUNÇÃO DE CADASTRO
            console.log('📤 Enviando dados para cadastro...');
            
            // Usar o username baseado no nome
            const username = nome.toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/\s+/g, '_')
                .replace(/[^a-z0-9_]/g, '');
            
            const result = await window.signUpClient(email, senha, nome, username);
            
            // 5. RESETAR BOTÃO
            if(btnCadastrar) {
                btnCadastrar.disabled = false;
                btnCadastrar.innerHTML = 'Cadastrar';
                btnCadastrar.style.opacity = '1';
            }
            
            // 6. MOSTRAR RESULTADO
            if (result.success) {
                showMessage('✅ ' + result.message, 'success');
                form.reset();
                
                // NÃO REDIRECIONA automaticamente
                // O usuário deve clicar no link "Faça Login" quando quiser
                
            } else {
                showMessage('❌ ' + result.message, 'error');
            }
            
        } catch (error) {
            console.error('❌ Erro inesperado:', error);
            if(btnCadastrar) {
                btnCadastrar.disabled = false;
                btnCadastrar.innerHTML = 'Cadastrar';
                btnCadastrar.style.opacity = '1';
            }
            showMessage('❌ Erro inesperado: ' + error.message, 'error');
        }
    });
});

/**
 * VALIDAR FORMULÁRIO
 */
function validarFormulario(nome, email, senha, confirmaSenha) {
    console.log('🔍 Validando formulário...');
    
    // 1. Campos obrigatórios
    if (!nome || !email || !senha || !confirmaSenha) {
        return { valido: false, mensagem: 'Preencha todos os campos obrigatórios!' };
    }
    
    // 2. Senhas iguais
    if (senha !== confirmaSenha) {
        return { valido: false, mensagem: 'As senhas não coincidem!' };
    }
    
    // 3. Tamanho mínimo da senha
    if (senha.length < 6) {
        return { valido: false, mensagem: 'A senha deve ter no mínimo 6 caracteres!' };
    }
    
    // 4. Email válido
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return { valido: false, mensagem: 'Digite um email válido!' };
    }
    
    // 5. Nome válido
    if (nome.length < 2) {
        return { valido: false, mensagem: 'O nome deve ter no mínimo 2 caracteres!' };
    }
    
    console.log('✅ Validações passaram!');
    return { valido: true, mensagem: 'Tudo válido!' };
}

/**
 * MOSTRAR MENSAGEM NA TELA
 */
function showMessage(text, type = 'info') {
    console.log(`💬 Mostrando mensagem (${type}):`, text);
    
    const oldMessage = document.querySelector('.premium-message');
    if (oldMessage) oldMessage.remove();
    
    const message = document.createElement('div');
    message.className = `premium-message ${type}`;
    message.textContent = text;
    
    // Adicionar ao DOM
    document.body.appendChild(message);
    
    // Mostrar com animação
    setTimeout(() => {
        message.classList.add('show');
    }, 10);
    
    // Auto-remover após 5 segundos (mais tempo para sucesso)
    const duration = type === 'success' ? 8000 : 5000;
    setTimeout(() => {
        message.classList.remove('show');
        setTimeout(() => {
            if (message.parentElement) {
                message.remove();
            }
        }, 400);
    }, duration);
}

// Verificar se há mensagem na URL
function checkUrlMessages() {
    const urlParams = new URLSearchParams(window.location.search);
    
    if (urlParams.has('success')) {
        showMessage('Cadastro realizado com sucesso! Verifique seu email.', 'success');
    }
    
    if (urlParams.has('error')) {
        const error = urlParams.get('error');
        showMessage('Erro: ' + decodeURIComponent(error), 'error');
    }
}

// Executar quando carregar
checkUrlMessages();