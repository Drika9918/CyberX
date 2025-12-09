// js/cadastro.js - VERSÃO CORRIGIDA

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('cadastro-form');
    const btnCadastrar = document.querySelector('.btn-primary');
    
    // Se não achar o formulário, para o script para não dar erro
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        debugger;
        // 1. IMPEDE O RECARREGAMENTO DA PÁGINA (CRUCIAL)
        e.preventDefault();
        
        console.log("🚀 Iniciando processo de cadastro...");

        // 2. Captura os dados
        const nome = document.getElementById('cadastro-nome').value;
        const email = document.getElementById('cadastro-email').value;
        const senha = document.getElementById('cadastro-senha').value;
        const confirmaSenha = document.getElementById('cadastro-confirma-senha').value;

        // 3. Validação Local (Rápida)
        if (senha !== confirmaSenha) {
            alert("❌ As senhas não coincidem!");
            return;
        }

        if (senha.length < 6) {
            alert("❌ A senha precisa ter pelo menos 6 caracteres.");
            return;
        }

        // 4. Feedback de Carregamento (UX)
        const textoOriginal = btnCadastrar.innerText;
        btnCadastrar.innerText = "CADASTRANDO...";
        btnCadastrar.disabled = true;
        btnCadastrar.style.opacity = "0.7";

        try {
            // 5. Chama a função do auth.js
            // Gera um username simples baseado no nome
            const username = nome.toLowerCase().replace(/\s+/g, '_') + Math.floor(Math.random() * 1000);
            
            const result = await window.signUpClient(email, senha, nome, username);

            if (result.success) {
                // SUCESSO!
                alert("✅ Cadastro realizado com sucesso! \n\nVocê será redirecionado para o Login.");
                window.location.href = 'index.html'; // Manda pro login manualmente agora
            } else {
                // ERRO DO SUPABASE (Ex: Email já existe)
                alert("❌ Erro ao cadastrar: " + result.message);
            }

        } catch (erro) {
            console.error(erro);
            alert("❌ Erro inesperado: " + erro.message);
        } finally {
            // 6. Restaura o botão (Sempre acontece, sucesso ou erro)
            btnCadastrar.innerText = textoOriginal;
            btnCadastrar.disabled = false;
            btnCadastrar.style.opacity = "1";
        }
    });
});