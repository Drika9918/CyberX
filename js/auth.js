// ============================================
// SISTEMA DE AUTENTICAÇÃO - CORRIGIDO
// ============================================

/**
 * CADASTRAR CLIENTE
 */
async function signUpClient(email, password, fullName, username) {
    try {
        console.log('📝 Iniciando cadastro para:', email);
        
        // 1. Validações
        if (password.length < 6) {
            throw new Error('A senha deve ter pelo menos 6 caracteres');
        }

        // 2. Criar usuário no Auth
        const { data, error } = await supabase.auth.signUp({
            email: email.trim(),
            password: password,
            options: {
                data: { full_name: fullName.trim(), username: username.trim() }
            }
        });

        if (error) throw error;

        // 3. Criar perfil no Banco (Tabela profiles)
        if (data.user) {
            const { error: profileError } = await supabase
                .from('profiles')
                .insert({
                    id: data.user.id,
                    role: 'client',
                    full_name: fullName.trim(),
                    username: username.trim(),
                    is_admin: false,
                    email_verified: false
                });

            if (profileError) console.warn('⚠️ Erro ao criar perfil:', profileError);
        }

        return {
            success: true,
            message: '🎉 Cadastro realizado! Faça login.',
            userId: data.user?.id
        };

    } catch (error) {
        console.error('❌ Erro no cadastro:', error);
        return { success: false, message: error.message };
    }
}

/**
 * LOGIN DE USUÁRIO (COM DEBUG DE ADMIN)
 */
async function loginUser(email, password) {
    try {
        console.log('🔐 Tentando login:', email);
        
        // 1. Login no Auth
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email.trim(),
            password: password
        });

        if (error) throw new Error("Email ou senha incorretos.");

        console.log('✅ Auth Sucesso. ID:', data.user.id);

        // 2. Buscar Perfil no Banco (Para saber se é Admin)
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();

        // --- ÁREA DE DEBUG (Olhe o F12 se der erro) ---
        console.log('🔍 Dados do Perfil:', profile);
        if (profileError) console.error('❌ Erro ao ler perfil (RLS?):', profileError);
        // ----------------------------------------------

        // 3. Verifica se é Admin
        // A regra é: O perfil deve existir E a coluna is_admin deve ser TRUE
        const isAdmin = profile && profile.is_admin === true;

        if (isAdmin) {
            console.log('👑 ADMIN IDENTIFICADO!');
            return {
                success: true,
                role: 'admin',
                user: data.user,
                message: 'Bem-vindo, Administrador.'
            };
        } else {
            console.log('👤 Cliente identificado.');
            return {
                success: true,
                role: 'client',
                user: data.user,
                message: 'Login realizado com sucesso!'
            };
        }

    } catch (error) {
        console.error('❌ Falha no login:', error);
        return { success: false, message: error.message };
    }
}

/**
 * REDIRECIONAMENTO (CORRIGIDO)
 */
function redirectBasedOnRole(role) {
    console.log('🔄 Redirecionando usuário do tipo:', role);
    
    if (role === 'admin') {
        // CORREÇÃO AQUI: Aponta para o arquivo novo que criamos
        window.location.href = 'admin-dashboard.html'; 
    } else {
        window.location.href = 'client-home.html';
    }
}

/**
 * OBTER SESSÃO ATUAL
 */
async function getCurrentSession() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return null;

    // Busca role atualizada
    const { data: profile } = await supabase
        .from('profiles')
        .select('role, is_admin')
        .eq('id', session.user.id)
        .single();

    return {
        session,
        user: session.user,
        role: (profile && profile.is_admin) ? 'admin' : 'client'
    };
}

async function logoutUser() {
    await supabase.auth.signOut();
    localStorage.clear(); // Limpa dados locais por segurança
    window.location.href = 'index.html';
}

// EXPORTAR FUNÇÕES GLOBALMENTE
window.signUpClient = signUpClient;
window.loginUser = loginUser;
window.logoutUser = logoutUser;
window.redirectBasedOnRole = redirectBasedOnRole;
window.getCurrentSession = getCurrentSession;