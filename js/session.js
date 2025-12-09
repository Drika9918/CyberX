// ============================================
// CONTROLE DE SESSÃO - VERSÃO CORRIGIDA (PERMITE CADASTRO)
// ============================================

/**
 * VERIFICAR SE USUÁRIO ESTÁ LOGADO (sem redirecionar)
 */
async function checkIfUserIsLogged() {
    try {
        const sessionInfo = await getCurrentSession();
        return sessionInfo;
    } catch (error) {
        console.error('Erro ao verificar sessão:', error);
        return null;
    }
}

/**
 * PROTEGER PÁGINA (para páginas internas)
 */
async function protectPage(allowedRoles = ['admin', 'client'], redirectTo = 'index.html') {
    try {
        const sessionInfo = await getCurrentSession();
        
        // Se não tem sessão, redirecionar para login
        if (!sessionInfo) {
            console.log('Usuário não logado, redirecionando para login');
            window.location.href = redirectTo;
            return null;
        }

        // Verificar se role está permitido
        if (!allowedRoles.includes(sessionInfo.role)) {
            console.log('Role não permitido:', sessionInfo.role);
            
            // Redirecionar baseado no role
            if (sessionInfo.role === 'admin') {
                window.location.href = 'adm-desboard.html';
            } else if (sessionInfo.role === 'client') {
                window.location.href = 'client-home.html';
            } else {
                window.location.href = redirectTo;
            }
            return null;
        }

        return sessionInfo;

    } catch (error) {
        console.error('Erro na proteção de página:', error);
        return null;
    }
}

/**
 * SETUP DE LISTENER DE AUTENTICAÇÃO
 */
function setupAuthListener() {
    if (!window.supabase) return;

    supabase.auth.onAuthStateChange(async (event, session) => {
        // APENAS LOG PARA DEBUG, NÃO REDIRECIONA AUTOMATICAMENTE AQUI
        switch (event) {
            case 'SIGNED_IN':
                console.log('✅ Usuário fez login');
                break;
            case 'SIGNED_OUT':
                console.log('🚪 Usuário fez logout');
                break;
        }
    });
}

/**
 * INICIALIZAR VERIFICAÇÃO
 */
async function initAuthCheck() {
    console.log('Iniciando listener de auth...');
    setupAuthListener();
}

/**
 * OBTER INFORMAÇÕES DO USUÁRIO ATUAL
 */
async function getCurrentUserInfo() {
    const session = await getCurrentSession();
    
    if (!session) return null;
    
    return {
        id: session.user.id,
        email: session.user.email,
        name: session.profile?.full_name || session.user.user_metadata?.full_name || 'Usuário',
        username: session.profile?.username || session.user.user_metadata?.username,
        role: session.role,
        emailConfirmed: !!session.user.email_confirmed_at,
        createdAt: session.profile?.created_at || session.user.created_at
    };
}

/**
 * VERIFICAR SE É PÁGINA PÚBLICA (LOGIN OU CADASTRO)
 * AQUI ESTAVA O ERRO: Adicionei cadastro.html na lista de permitidos.
 */
function isPublicPage() {
    const currentPath = window.location.pathname;
    return currentPath.includes('index.html') || 
           currentPath.endsWith('/') || 
           currentPath.includes('login') ||
           currentPath.includes('cadastro.html') ||        // <--- ADICIONADO
           currentPath.includes('sucesso-cadastro.html');  // <--- ADICIONADO
}

// ============================================
// INICIALIZAÇÃO DO SCRIPT
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('🛡️ session.js carregado.');
    
    // Só executa verificação de segurança se NÃO for página pública
    if (!isPublicPage()) {
        console.log('🔒 Página protegida detectada. Verificando credenciais...');
        initAuthCheck();
        
        // Verificar se está logado (apenas para páginas protegidas)
        setTimeout(async () => {
            const session = await checkIfUserIsLogged();
            if (!session) {
                console.warn('⛔ Usuário não logado em página protegida. Redirecionando...');
                window.location.href = 'index.html';
            }
        }, 500);
    } else {
        console.log('🔓 Página pública (Login/Cadastro). Verificação automática pausada.');
    }
});

// ============================================
// EXPORTAR FUNÇÕES
// ============================================

window.protectPage = protectPage;
window.setupAuthListener = setupAuthListener;
window.initAuthCheck = initAuthCheck;
window.getCurrentUserInfo = getCurrentUserInfo;
window.checkIfUserIsLogged = checkIfUserIsLogged;