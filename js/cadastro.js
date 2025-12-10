
console.log('=== CADASTRO.JS INICIADO ===');

// AGUARDAR Supabase estar pronto
function waitForSupabase() {
    return new Promise((resolve, reject) => {
        console.log('⏳ Aguardando Supabase...');
        
        // Verificar se já está pronto
        if (window.supabase && typeof window.supabase.auth !== 'undefined') {
            console.log('✅ Supabase já está pronto');
            resolve();
            return;
        }
        
        // Ou esperar pelo evento
        const timeout = setTimeout(() => {
            console.error('❌ Timeout esperando Supabase');
            reject(new Error('Timeout ao aguardar Supabase'));
        }, 10000); // 10 segundos
        
        window.addEventListener('supabaseReady', () => {
            clearTimeout(timeout);
            console.log('✅ Evento supabaseReady recebido');
            resolve();
        });
    });
}

// AGUARDAR signUpClient estar disponível
function waitForSignUpClient() {
    return new Promise((resolve, reject) => {
        console.log('⏳ Aguardando signUpClient...');
        
        if (typeof window.signUpClient !== 'undefined') {
            console.log('✅ signUpClient já disponível');
            resolve();
            return;
        }
        
        // Verificar a cada 100ms
        const interval = setInterval(() => {
            if (typeof window.signUpClient !== 'undefined') {
                clearInterval(interval);
                console.log('✅ signUpClient carregada');
                resolve();
            }
        }, 100);
        
        // Timeout após 5 segundos
        setTimeout(() => {
            clearInterval(interval);
            console.error('❌ Timeout esperando signUpClient');
            reject(new Error('Função signUpClient não carregada'));
        }, 5000);
    });
}

// FUNÇÃO PRINCIPAL - Executa quando tudo estiver pronto
async function initCadastro() {
    console.log('🚀 Inicializando sistema de cadastro...');
    
    try {
        // 1. Aguardar Supabase
        await waitForSupabase();
        
        console.log('📊 Supabase status:');
        console.log('- supabase object:', typeof window.supabase);
        console.log('- supabase.auth:', typeof window.supabase?.auth);
        console.log('- supabase.auth.signUp:', typeof window.supabase?.auth?.signUp);
        
        // 2. Aguardar signUpClient
        await waitForSignUpClient();
        
        console.log('🎉 Tudo pronto! Iniciando formulário...');
        
        // 3. Configurar formulário
        setupFormulario();
        
    } catch (error) {
        console.error('❌ ERRO CRÍTICO na inicialização:', error);
        showMessage('❌ Erro de configuração: ' + error.message, 'error');
        
        // Botão para recarregar
        const reloadBtn = document.createElement('button');
        reloadBtn.textContent = 'Recarregar Página';
        reloadBtn.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            padding: 15px 30px;
            background: var(--color-red-wine);
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            cursor: pointer;
            z-index: 10000;
        `;
        reloadBtn.onclick = () => location.reload();
        document.body.appendChild(reloadBtn);
    }
}

// FUNÇÃO PARA CONFIGURAR FORMULÁRIO
function setupFormulario() {
    const form = document.getElementById('cadastro-form');
    const btnCadastrar = form ? form.querySelector('.btn-primary') : null;
    
    if (!form) {
        console.error('❌ Formulário não encontrado!');
        return;
    }
    
    console.log('📄 Formulário configurado com sucesso!');
    console.log('signUpClient disponível?', typeof window.signUpClient);
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        console.log('🖱️ Botão CADASTRAR clicado');
        
        // 1. PEGAR VALORES DO FORMULÁRIO
        const nome = document.getElementById('cadastro-nome').value.trim();
        const username = document.getElementById('cadastro-username').value.trim();
        const email = document.getElementById('cadastro-email').value.trim();
        const senha = document.getElementById('cadastro-senha').value;
        const confirmaSenha = document.getElementById('cadastro-confirma-senha').value;
        
        console.log('📋 Dados capturados:', { nome, username, email, senha: '***' });
        
        // 2. VALIDAÇÕES
        const validacoes = validarFormulario(nome, username, email, senha, confirmaSenha);
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
            console.log('📤 Chamando signUpClient...');
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
                
                // Opcional: Redirecionar após 3 segundos
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 3000);
                
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
            showMessage('❌ Erro: ' + error.message, 'error');
        }
    });
}



/**
 * VALIDAR FORMULÁRIO (atualizada para incluir username)
 */
function validarFormulario(nome, username, email, senha, confirmaSenha) {
    console.log('🔍 Validando formulário...');
    
    // 1. Campos obrigatórios
    if (!nome || !username || !email || !senha || !confirmaSenha) {
        return { valido: false, mensagem: 'Preencha todos os campos obrigatórios!' };
    }
    
    // 2. Validação do username
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(username)) {
        return { valido: false, mensagem: 'Username inválido! Use apenas letras, números e underline.' };
    }
    
    if (username.length < 3) {
        return { valido: false, mensagem: 'Username deve ter no mínimo 3 caracteres!' };
    }
    
    if (username.length > 20) {
        return { valido: false, mensagem: 'Username deve ter no máximo 20 caracteres!' };
    }
    
    // 3. Senhas iguais
    if (senha !== confirmaSenha) {
        return { valido: false, mensagem: 'As senhas não coincidem!' };
    }
    
    // 4. Tamanho mínimo da senha
    if (senha.length < 6) {
        return { valido: false, mensagem: 'A senha deve ter no mínimo 6 caracteres!' };
    }
    
    // 5. Email válido
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return { valido: false, mensagem: 'Digite um email válido!' };
    }
    
    // 6. Nome válido
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
    
    document.body.appendChild(message);
    
    setTimeout(() => {
        message.classList.add('show');
    }, 10);
    
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
document.addEventListener('DOMContentLoaded', () => {
    checkUrlMessages();
    initCadastro(); // <-- ADICIONAR ESTA CHAMADA
});
