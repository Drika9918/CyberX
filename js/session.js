// ============================================
// CONTROLE DE SESSÃO - VERSÃO CORRIGIDA (SEM REDIRECIONAMENTO AUTOMÁTICO)
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
 * SETUP DE LISTENER DE AUTENTICAÇÃO (modificado)
 */
function setupAuthListener() {
    supabase.auth.onAuthStateChange(async (event, session) => {
        console.log('📡 Evento de auth:', event);
        
        // APENAS LOG PARA DEBUG, NÃO REDIRECIONA
        switch (event) {
            case 'SIGNED_IN':
                console.log('✅ Usuário fez login');
                break;

            case 'SIGNED_OUT':
                console.log('🚪 Usuário fez logout');
                break;

            case 'USER_UPDATED':
                console.log('🔄 Usuário atualizado');
                break;
        }
    });
}

/**
 * INICIALIZAR VERIFICAÇÃO (modificado)
 */
async function initAuthCheck() {
    console.log('Iniciando verificação de auth...');
    
    // Configurar listener
    setupAuthListener();
    
    console.log('Verificação de auth concluída');
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
 * VERIFICAR SE É PÁGINA DE LOGIN
 */
function isLoginPage() {
    const currentPath = window.location.pathname;
    return currentPath.includes('index.html') || 
           currentPath.endsWith('/') || 
           currentPath.includes('login');
}

// ============================================
// INICIALIZAÇÃO MODIFICADA
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM carregado, verificando auth...');
    
    // Só executa se NÃO for página de login
    if (!isLoginPage()) {
        console.log('Página protegida, verificando login...');
        initAuthCheck();
        
        // Verificar se está logado (apenas para páginas protegidas)
        setTimeout(async () => {
            const session = await checkIfUserIsLogged();
            if (!session) {
                console.log('Usuário não logado em página protegida, redirecionando...');
                window.location.href = 'index.html';
            }
        }, 500);
    } else {
        console.log('Página de login, auth check desativado');
        // Na página de login, NÃO verificamos automaticamente
        // O usuário precisa clicar no botão
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
window.isLoginPage = isLoginPage;

console.log('✅ Sistema de sessão carregado!');