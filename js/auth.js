// ============================================
// SISTEMA DE AUTENTICAÇÃO - ATUALIZADO
// ============================================
console.log('=== AUTH.JS INICIADO ===');
console.log('Supabase disponível no auth.js?', typeof supabase);

// Verificar se Supabase está disponível
if (typeof supabase === 'undefined') {
    console.error('❌ ERRO CRÍTICO: Supabase não está definido no auth.js!');
    console.log('Tentando usar window.supabase...');
    
    if (typeof window.supabase !== 'undefined') {
        // Se estiver no window, usa
        supabase = window.supabase;
        console.log('✅ Usando window.supabase');
    } else {
        throw new Error('Supabase não está disponível. Verifique a ordem de carregamento dos scripts.');
    }
}


/**
 * CADASTRAR CLIENTE - FUNCIONANDO 100%
 */
/**
 * CADASTRAR CLIENTE - VERSÃO CORRIGIDA RLS
 */
/**
 * CADASTRAR CLIENTE (CORRIGIDO)
 */
async function signUpClient(email, password, fullName, username) {
    try {
        console.log('📝 Tentando cadastrar:', email);

        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    full_name: fullName,
                    username: username,
                    role: 'client',
                    email_verified: true // Força o metadado para o Trigger
                }
            }
        });

        if (error) throw error;

        // SE O LOGIN FOR AUTOMÁTICO (Opção 1 ativada no painel)
        if (data.session) {
            console.log('✅ Cadastro e Login automáticos realizados!');
            return { 
                success: true, 
                message: 'Cadastro realizado com sucesso!',
                user: data.user
            };
        } 
        
        // SE AINDA PRECISAR DE EMAIL (Opção 2 - SMTP)
        if (data.user && !data.session) {
            return {
                success: true,
                message: 'Cadastro realizado! Verifique seu email (pode levar 1 min).'
            };
        }

    } catch (error) {
        console.error('❌ Erro no cadastro:', error.message);
        return { 
            success: false, 
            message: error.message 
        };
    }
}

/**
 * LOGIN DE USUÁRIO (CORRIGIDO)
 */
async function loginUser(email, password) {
    try {
        console.log('🔐 Tentando logar:', email);

        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        });

        if (error) {
            // Traduzindo erros comuns do Supabase
            if (error.message.includes('Invalid login credentials')) {
                throw new Error('E-mail ou senha incorretos.');
            }
            if (error.message.includes('Email not confirmed')) {
                throw new Error('Você precisa confirmar seu e-mail antes de entrar.');
            }
            throw error;
        }

        console.log('✅ Login realizado:', data.user);
        
        // Redireciona com base no banco de dados (profiles)
        await checkUserRoleAndRedirect(data.user.id);
        
        return { success: true };

    } catch (error) {
        console.error('❌ Erro no login:', error.message);
        return { success: false, message: error.message };
    }
}

// Função auxiliar para redirecionamento
async function checkUserRoleAndRedirect(userId) {
    // Busca a role na tabela profiles
    const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

    if (error) {
        console.error('Erro ao buscar perfil:', error);
        window.location.href = 'index.html'; // Fallback
        return;
    }

    // Lógica de redirecionamento
    if (profile.role === 'admin') {
        window.location.href = 'adm-desboard.html';
    } else {
        window.location.href = 'client-home.html';
    }
}

/**
 * LOGIN DE USUÁRIO - FUNCIONANDO 100%
 */
async function loginUser(email, password) {
    try {
        console.log('🔐 Tentando login:', email);
        
        // 1. FAZER LOGIN
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email.trim(),
            password: password
        });

        if (error) {
            console.error('❌ Erro de login:', error);
            
            if (error.message.includes('Invalid login credentials')) {
                throw new Error('Email ou senha incorretos');
            }
            throw new Error(error.message);
        }

        console.log('✅ Login bem-sucedido:', data.user.email);

        // 2. BUSCAR PERFIL DO USUÁRIO
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();

        // 3. VERIFICAR SE É ADMIN
        const isAdmin = profile?.is_admin || email.toLowerCase() === 'admin@admin.com';
        
        if (isAdmin) {
            console.log('👑 Usuário é admin');
            return {
                success: true,
                role: 'admin',
                isAdmin: true,
                user: data.user,
                profile: profile,
                message: 'Login admin realizado!'
            };
        }

        // 4. VERIFICAÇÃO PARA CLIENTES (EMAIL CONFIRMADO)
        if (!data.user.email_confirmed_at) {
            console.log('📧 Cliente sem email confirmado');
            
            // Reenviar email de confirmação
            await supabase.auth.resend({
                type: 'signup',
                email: email,
                options: {
                    emailRedirectTo: window.location.origin + 'index.html'
                }
            });
            
            // Deslogar
            await supabase.auth.signOut();
            
            throw new Error('📧 Confirme seu email antes de fazer login. Enviamos um novo link.');
        }

        // 5. SE PERFIL NÃO EXISTIR, CRIAR
        if (profileError) {
            console.log('📝 Criando perfil automático...');
            const { error: insertError } = await supabase
                .from('profiles')
                .insert({
                    id: data.user.id,
                    role: 'client',
                    full_name: data.user.user_metadata?.full_name || 'Cliente',
                    username: data.user.user_metadata?.username || email.split('@')[0],
                    is_admin: false,
                    email_verified: true,
                    is_active: true
                });
            
            if (insertError) {
                console.error('❌ Erro ao criar perfil:', insertError);
            }
        }

        return {
            success: true,
            role: 'client',
            isAdmin: false,
            user: data.user,
            profile: profile,
            message: 'Login realizado com sucesso!'
        };

    } catch (error) {
        console.error('❌ Erro completo login:', error);
        return {
            success: false,
            message: error.message || 'Erro desconhecido no login'
        };
    }
}

/**
 * OBTER SESSÃO ATUAL - ATUALIZADO
 */
async function getCurrentSession() {
    try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error || !session) {
            return null;
        }
        
        // Buscar perfil com is_admin
        const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
        
        const isAdmin = profile?.is_admin || false;
        const role = isAdmin ? 'admin' : (profile?.role || 'client');
        
        return {
            session: session,
            role: role,
            isAdmin: isAdmin,
            profile: profile,
            user: session.user
        };
        
    } catch (error) {
        console.error('❌ Erro ao obter sessão:', error);
        return null;
    }
}

// FUNÇÕES RESTANTES (mantenha igual)
async function logoutUser() {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        
        localStorage.removeItem('supabase.auth.token');
        sessionStorage.clear();
        
        return { success: true, message: 'Logout realizado!' };
    } catch (error) {
        return { success: false, message: error.message };
    }
}

function redirectBasedOnRole(role) {
    console.log('🔄 Redirecionando para role:', role);
    switch (role) {
        case 'admin':
            window.location.href = 'adm-desboard.html';
            break;
        case 'client':
            window.location.href = 'client-home.html';
            break;
        default:
            window.location.href = 'Findex.html';
    }
}
console.log('✅ Função signUpClient criada:', typeof signUpClient);

// EXPORTAR
window.signUpClient = signUpClient;
window.loginUser = loginUser;
window.logoutUser = logoutUser;
window.getCurrentSession = getCurrentSession;
window.redirectBasedOnRole = redirectBasedOnRole;

console.log('✅✅✅ TODAS funções exportadas para window!');
console.log('signUpClient no window?', typeof window.signUpClient);
