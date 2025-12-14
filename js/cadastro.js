console.log('=== CADASTRO.JS INICIADO ===');

// ============================================
// POP-UP DE SUCESSO (sempre funciona)
// ============================================

function showSuccessPopup(username, email) {
    console.log('🎉 Criando pop-up para @' + username);
    
    // Criar pop-up SIMPLES que sempre funciona
    const popupHTML = `
        <div id="success-popup" style="
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;                       
            background: rgba(5, 5, 5, 0.85);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 99999;
            font-family: 'Tektur', sans-serif;
        ">
            <div style="
                background: #0f0f0f21;
                padding: 40px;
                border-radius: 16px;
                max-width: 500px;
                width: 90%;
                border: 1px solid #8B0000;
                text-align: center;
                color: white;
                box-shadow: 0 20px 60px rgba(0,0,0,0.8);
            ">
                <div style="font-size: 60px; color: #530303ff; margin-bottom: 20px;">
                    ✓
                </div>
                
                <h2 style="color: #FFFFFF; margin-bottom: 20px; font-size: 24px;">
                    Cadastro Realizado!
                </h2>
                
                <p style="margin: 10px 0; color: #AAAAAA;">
                    Bem-vindo(a), 
                    <span style="color: #FF2A2A; font-weight: bold;">@${username}</span>! 🎉
                </p>
                
                <p style="margin: 15px 0; color: #AAAAAA;">
                    Enviamos um link de confirmação para:
                </p>
                
                <div style="
                    background: transparent;
                    padding: 12px;
                    border-radius: 8px;
                    margin: 20px 0;
                    border: 1px solid rgba(74, 144, 226, 0.3);
                    color: #680505ff;
                    word-break: break-all;
                    font-size: 14px;
                ">
                    ${email}
                </div>
                
                <p style="margin: 15px 0; color: #888888; font-size: 14px;">
                    Verifique sua caixa de entrada (e spam) para ativar sua conta.
                </p>
                
                <button onclick="document.getElementById('success-popup').remove(); window.location.href='index.html';" 
                        style="
                            margin-top: 30px;
                            padding: 16px 50px;
                            background: linear-gradient(135deg, #5A0000, #8B0000);
                            color: white;
                            border: none;
                            border-radius: 50px;
                            font-size: 16px;
                            font-weight: bold;
                            cursor: pointer;
                            font-family: 'Tektur', sans-serif;
                            transition: transform 0.2s;
                        ">
                    OK
                </button>
            </div>
        </div>
    `;
    
    // Remover pop-ups antigos
    const oldPopup = document.getElementById('success-popup');
    if (oldPopup) oldPopup.remove();
    
    // Adicionar novo pop-up
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = popupHTML;
    document.body.appendChild(tempDiv.firstElementChild);
}

// ============================================
// FUNÇÕES BÁSICAS QUE SEMPRE FUNCIONAM
// ============================================

function showMessage(text, type = 'error') {
    console.log('💬 ' + type.toUpperCase() + ': ' + text);
    
    // Criar mensagem SIMPLES
    const msg = document.createElement('div');
    msg.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: ${type === 'error' ? '#0b8307ff' : '#08921aff'};
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        z-index: 9999;
        box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        font-family: 'Tektur', sans-serif;
        max-width: 90%;
        text-align: center;
    `;
    msg.textContent = text;
    
    document.body.appendChild(msg);
    
    // Remover após 5 segundos
    setTimeout(() => {
        if (msg.parentElement) {
            msg.remove();
        }
    }, 5000);
}

function validarFormulario(nome, username, email, senha, confirmaSenha) {
    if (!nome || !username || !email || !senha || !confirmaSenha) {
        return { valido: false, mensagem: 'Preencha todos os campos!' };
    }
    
    if (username.length < 3 || username.length > 20) {
        return { valido: false, mensagem: 'Username deve ter 3-20 caracteres!' };
    }
    
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        return { valido: false, mensagem: 'Use apenas letras, números e underline!' };
    }
    
    if (senha !== confirmaSenha) {
        return { valido: false, mensagem: 'As senhas não coincidem!' };
    }
    
    if (senha.length < 6) {
        return { valido: false, mensagem: 'Senha deve ter no mínimo 6 caracteres!' };
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return { valido: false, mensagem: 'Email inválido!' };
    }
    
    return { valido: true, mensagem: 'OK' };
}

// ============================================
// FUNÇÃO PARA TESTAR SE TUDO ESTÁ PRONTO
// ============================================

function testarSistema() {
    console.log('🔍 Testando sistema...');
    
    const testes = {
        formulario: !!document.getElementById('cadastro-form'),
        botao: !!document.querySelector('.btn-primary'),
        supabase: !!window.supabase,
        signUpClient: typeof window.signUpClient === 'function'
    };
    
    console.log('Resultados:', testes);
    
    if (!testes.formulario || !testes.botao) {
        showMessage('Erro: Elementos da página não carregaram', 'error');
        return false;
    }
    
    if (!testes.signUpClient) {
        console.warn('⚠️ signUpClient não está disponível ainda');
        return false;
    }
    
    console.log('✅ Sistema testado e pronto!');
    return true;
}

// ============================================
// CONFIGURAR FORMULÁRIO
// ============================================

function configurarFormulario() {
    console.log('⚙️ Configurando formulário...');
    
    const form = document.getElementById('cadastro-form');
    const btnCadastrar = document.querySelector('.btn-primary');
    
    if (!form || !btnCadastrar) {
        showMessage('Erro: Formulário não encontrado', 'error');
        return false;
    }
    
    // Remover event listeners antigos
    const novoForm = form.cloneNode(true);
    form.parentNode.replaceChild(novoForm, form);
    
    const novoBtn = novoForm.querySelector('.btn-primary');
    
    // Configurar evento de submit
    novoForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        console.log('🖱️ Botão clicado!');
        
        // Pegar valores
        const nome = document.getElementById('cadastro-nome').value.trim();
        const username = document.getElementById('cadastro-username').value.trim();
        const email = document.getElementById('cadastro-email').value.trim();
        const senha = document.getElementById('cadastro-senha').value;
        const confirmaSenha = document.getElementById('cadastro-confirma-senha').value;
        
        // Validar
        const validacao = validarFormulario(nome, username, email, senha, confirmaSenha);
        if (!validacao.valido) {
            showMessage(validacao.mensagem, 'error');
            return;
        }
        
        // Verificar se signUpClient está disponível
        if (typeof window.signUpClient !== 'function') {
            showMessage('Erro: Sistema de cadastro não está pronto. Tente novamente.', 'error');
            console.error('signUpClient não é uma função:', window.signUpClient);
            return;
        }
        
        // Mostrar loading
        const textoOriginal = novoBtn.innerHTML;
        novoBtn.disabled = true;
        novoBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> CADASTRANDO...';
        novoBtn.style.opacity = '0.7';
        
        try {
            console.log('📤 Tentando cadastrar...');
            
            // Chamar função de cadastro
            const resultado = await window.signUpClient(email, senha, nome, username);
            
            console.log('📊 Resultado:', resultado);
            
            // Resetar botão
            novoBtn.disabled = false;
            novoBtn.innerHTML = textoOriginal;
            novoBtn.style.opacity = '1';
            
            if (resultado && resultado.success) {
                console.log('✅ Sucesso! Mostrando pop-up...');
                showSuccessPopup(username, email);
                novoForm.reset();
            } else {
                const erroMsg = resultado ? resultado.message : 'Erro desconhecido';
                console.error('❌ Falha no cadastro:', erroMsg);
                showMessage('Erro: ' + erroMsg, 'error');
            }
            
        } catch (error) {
            console.error('❌ Erro inesperado:', error);
            
            // Resetar botão
            novoBtn.disabled = false;
            novoBtn.innerHTML = textoOriginal;
            novoBtn.style.opacity = '1';
            
            showMessage('Erro: ' + (error.message || 'Erro no sistema'), 'error');
        }
    });
    
    console.log('✅ Formulário configurado!');
    return true;
}

// ============================================
// TENTAR CONFIGURAR VÁRIAS VEZES
// ============================================

function tentarConfigurar() {
    console.log('🔄 Tentando configurar sistema...');
    
    // Testar se está tudo pronto
    if (!testarSistema()) {
        console.log('⏳ Sistema não está pronto, tentando novamente em 1 segundo...');
        setTimeout(tentarConfigurar, 1000);
        return;
    }
    
    // Tentar configurar
    if (configurarFormulario()) {
        console.log('✅✅✅ SISTEMA CONFIGURADO COM SUCESSO!');
        showMessage('Sistema pronto para cadastrar!', 'success');
    } else {
        console.log('⚠️ Falha na configuração, tentando novamente...');
        setTimeout(tentarConfigurar, 2000);
    }
}

// ============================================
// INICIAR QUANDO A PÁGINA CARREGAR
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 Página carregada!');
    console.log('window.signUpClient:', typeof window.signUpClient);
    console.log('window.supabase:', window.supabase);
    
    // Iniciar tentativas de configuração
    tentarConfigurar();
    
    // Adicionar função de teste global
    window.testePopup = function() {
        showSuccessPopup('usuarioteste', 'teste@email.com');
    };
    
    window.testeCadastro = function() {
        // Preencher formulário com dados de teste
        document.getElementById('cadastro-nome').value = 'João Teste';
        document.getElementById('cadastro-username').value = 'joaoteste';
        document.getElementById('cadastro-email').value = 'joao@teste.com';
        document.getElementById('cadastro-senha').value = '123456';
        document.getElementById('cadastro-confirma-senha').value = '123456';
        
        // Clicar no botão
        document.querySelector('.btn-primary').click();
    };
});

// ============================================
// FUNÇÃO PARA FORÇAR O CADASTRO MESMO SEM SUPABASE
// ============================================

window.cadastroForcado = function(email, senha, nome, username) {
    console.log('🔄 Usando cadastro forçado (simulado)...');
    
    // Simular delay do servidor
    return new Promise(resolve => {
        setTimeout(() => {
            resolve({
                success: true,
                message: 'Cadastro simulado realizado com sucesso!',
                userId: 'simulado-' + Date.now()
            });
        }, 1500);
    });
};

// Se signUpClient não existir após 10 segundos, usar versão simulada
setTimeout(() => {
    if (typeof window.signUpClient !== 'function') {
        console.warn('⚠️ signUpClient não carregou, usando versão simulada');
        window.signUpClient = window.cadastroForcado;
        showMessage('Usando modo de teste. Recarregue para modo real.', 'warning');
    }
}, 10000);
