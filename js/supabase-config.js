// ============================================
// supabase-simple.js - INICIALIZAÇÃO GARANTIDA
// ============================================

console.log('🚀 INICIANDO SUPABASE-SIMPLE.JS');

// ============================================
// 1. CONFIGURAÇÃO
// ============================================
const SUPABASE_CONFIG = {
    supabaseUrl: 'https://zxtpydfmwwscxbzhpsdm.supabase.co',
    supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp4dHB5ZGZtd3dzY3hiemhwc2RtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2MDU1MTQsImV4cCI6MjA4MDE4MTUxNH0.KdRkqeI1fSvFI6fwxTY7soGKHuOcFhB_NWATfDjpS9E'
};

// ============================================
// 2. INICIALIZAÇÃO GARANTIDA DO SUPABASE
// ============================================
let supabase = null;

function inicializarSupabase() {
    console.log('🔄 Inicializando Supabase...');
    
    try {
        // Verificar se a biblioteca existe
        if (typeof supabaseLibrary !== 'undefined') {
            // Se já carregou globalmente como 'supabaseLibrary'
            supabase = supabaseLibrary.createClient(
                SUPABASE_CONFIG.supabaseUrl,
                SUPABASE_CONFIG.supabaseAnonKey
            );
            console.log('✅ Supabase inicializado via supabaseLibrary');
        } 
        // Verificar se já existe no window
        else if (window.supabase && window.supabase.createClient) {
            supabase = window.supabase.createClient(
                SUPABASE_CONFIG.supabaseUrl,
                SUPABASE_CONFIG.supabaseAnonKey,
                {
                    auth: {
                        autoRefreshToken: true,
                        persistSession: true,
                        detectSessionInUrl: true
                    }
                }
            );
            console.log('✅ Supabase inicializado via window.supabase');
        }
        // Verificar se a biblioteca CDN carregou
        else if (typeof createClient !== 'undefined') {
            // Usar a função global que a CDN disponibiliza
            supabase = createClient(
                SUPABASE_CONFIG.supabaseUrl,
                SUPABASE_CONFIG.supabaseAnonKey,
                {
                    auth: {
                        autoRefreshToken: true,
                        persistSession: true,
                        detectSessionInUrl: true
                    }
                }
            );
            console.log('✅ Supabase inicializado via createClient global');
        } else {
            console.error('❌ Biblioteca Supabase não encontrada!');
            // Tentar carregar dinamicamente
            carregarSupabaseDinamicamente();
            return false;
        }
        
        // Testar conexão
        testarConexao();
        return true;
        
    } catch (error) {
        console.error('❌ Erro ao inicializar Supabase:', error);
        return false;
    }
}

// ============================================
// 3. FUNÇÕES DE AUTENTICAÇÃO
// ============================================

// CADASTRO
async function signUpClient(email, password, nome, username) {
    console.log('📝 Tentando cadastrar:', email);
    
    try {
        // Se supabase não estiver pronto, usar simulador
        if (!supabase) {
            console.warn('⚠️ Supabase não inicializado, usando simulador');
            return cadastroSimulado(email, password, nome, username);
        }
        
        const { data, error } = await supabase.auth.signUp({
            email: email.trim(),
            password: password,
            options: {
                data: {
                    full_name: nome,
                    username: username
                },
                emailRedirectTo: window.location.origin + '/reset-password.html'
            }
        });
        
        if (error) {
            console.error('❌ Erro Supabase:', error);
            let mensagem = error.message;
            
            if (error.message.includes('already registered')) {
                mensagem = 'Este email já está cadastrado.';
            } else if (error.message.includes('Password')) {
                mensagem = 'Senha deve ter no mínimo 6 caracteres.';
            }
            
            return { success: false, message: mensagem };
        }
        
        console.log('✅ Cadastro bem-sucedido:', data);
        return {
            success: true,
            message: 'Cadastro realizado! Verifique seu email.',
            userId: data.user?.id
        };
        
    } catch (error) {
        console.error('❌ Erro inesperado:', error);
        return cadastroSimulado(email, password, nome, username);
    }
}

// LOGIN
async function loginUser(email, password) {
    console.log('🔐 Tentando login:', email);
    
    try {
        // Se supabase não estiver pronto
        if (!supabase) {
            console.error('❌ Supabase não inicializado para login');
            return { 
                success: false, 
                message: 'Sistema de autenticação não disponível. Recarregue a página.' 
            };
        }
        
        // VERIFICAR se supabase.auth existe
        if (!supabase.auth) {
            console.error('❌ supabase.auth é undefined!');
            return { 
                success: false, 
                message: 'Erro no sistema de autenticação.' 
            };
        }
        
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email.trim(),
            password: password
        });
        
        if (error) {
            console.error('❌ Erro no login:', error);
            
            let mensagem = 'Email ou senha incorretos.';
            if (error.message.includes('Email not confirmed')) {
                mensagem = 'Confirme seu email antes de fazer login.';
            }
            
            return { success: false, message: mensagem };
        }
        
        console.log('✅ Login bem-sucedido:', data.user?.email);
        return {
            success: true,
            user: data.user,
            message: 'Login realizado com sucesso!'
        };
        
    } catch (error) {
        console.error('❌ Erro catch no login:', error);
        return { 
            success: false, 
            message: 'Erro ao conectar com o servidor.' 
        };
    }
}

// LOGOUT
async function logoutUser() {
    console.log('🚪 Fazendo logout...');
    
    if (supabase && supabase.auth) {
        try {
            await supabase.auth.signOut();
        } catch (error) {
            console.warn('⚠️ Erro ao fazer logout:', error);
        }
    }
    
    localStorage.clear();
    window.location.href = 'index.html';
}

// ============================================
// 4. FUNÇÕES AUXILIARES
// ============================================

// Função simuladora
async function cadastroSimulado(email, password, nome, username) {
    console.log('🔄 Usando cadastro simulado');
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
        success: true,
        message: 'Cadastro simulado (recarregue para modo real)',
        userId: 'simulado-' + Date.now(),
        simulador: true
    };
}

// Testar conexão
async function testarConexao() {
    if (!supabase) return;
    
    try {
        const { data, error } = await supabase.from('profiles').select('count').limit(1);
        if (error) {
            console.warn('⚠️ Teste de conexão falhou (pode ser normal):', error.message);
        } else {
            console.log('✅ Conexão com Supabase OK');
        }
    } catch (error) {
        console.warn('⚠️ Erro no teste de conexão:', error.message);
    }
}

// Carregar Supabase dinamicamente
function carregarSupabaseDinamicamente() {
    console.log('📥 Carregando Supabase dinamicamente...');
    
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/@supabase/supabase-js@2/dist/umd/supabase.min.js';
    script.onload = function() {
        console.log('✅ Supabase carregado dinamicamente');
        inicializarSupabase();
    };
    script.onerror = function() {
        console.error('❌ Falha ao carregar Supabase');
    };
    document.head.appendChild(script);
}

// ============================================
// 5. DISPONIBILIZAR FUNÇÕES GLOBALMENTE
// ============================================

// Tornar funções disponíveis de MÚLTIPLAS formas
window.signUpClient = signUpClient;
window.loginUser = loginUser;
window.logoutUser = logoutUser;

// Também em objeto CyberX
if (!window.CyberX) window.CyberX = {};
window.CyberX.auth = {
    signUp: signUpClient,
    login: loginUser,
    logout: logoutUser,
    supabase: supabase
};

// E como propriedades diretas
window.fazerCadastro = signUpClient;
window.fazerLogin = loginUser;
window.sair = logoutUser;

// ============================================
// 6. INICIALIZAÇÃO
// ============================================

// Aguardar DOM e bibliotecas
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 DOM carregado - inicializando Supabase...');
    
    // Tentar inicializar
    setTimeout(() => {
        const inicializado = inicializarSupabase();
        
        if (inicializado && supabase) {
            console.log('✅✅✅ SUPABASE INICIALIZADO COM SUCESSO!');
            console.log('- supabase:', !!supabase);
            console.log('- supabase.auth:', !!supabase.auth);
            console.log('- signUpClient:', typeof window.signUpClient);
            console.log('- loginUser:', typeof window.loginUser);
            
            // Disparar evento de pronto
            window.dispatchEvent(new CustomEvent('supabase-ready'));
        } else {
            console.error('❌❌❌ FALHA NA INICIALIZAÇÃO DO SUPABASE');
            
            // Criar funções simuladas como fallback
            window.signUpClient = cadastroSimulado;
            window.loginUser = async () => ({ 
                success: false, 
                message: 'Sistema temporariamente indisponível.' 
            });
        }
    }, 500);
});

// Tentar novamente após 2 segundos (fallback)
setTimeout(() => {
    if (!supabase) {
        console.log('🔄 Tentando inicialização tardia do Supabase...');
        inicializarSupabase();
    }
}, 2000);

console.log('✅ supabase-simple.js carregado - funções disponíveis:');
console.log('- signUpClient:', typeof window.signUpClient);
console.log('- loginUser:', typeof window.loginUser);
