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
async function signUpClient(email, password, fullName, username) {
    try {
        console.log('📝 Iniciando cadastro para:', username);
        
        // 1. VALIDAÇÕES BÁSICAS
        if (email.toLowerCase().includes('admin@admin.com')) {
            throw new Error('Este email é reservado para administradores');
        }
        if (password.length < 6) {
            throw new Error('A senha deve ter pelo menos 6 caracteres');
        }

        // 2. CADASTRO NO SUPABASE AUTH
        const { data, error } = await supabase.auth.signUp({
            email: email.trim(),
            password: password,
            options: {
                data: {
                    full_name: fullName.trim(),
                    username: username.trim()
                },
                emailRedirectTo: window.location.origin + 'index.html'
            }
        });

        if (error) {
            console.error('❌ Erro do Supabase:', error);
            
            if (error.message.includes('already registered')) {
                throw new Error('Este email já está cadastrado. Faça login.');
            }
            throw new Error(error.message);
        }

        console.log('✅ Usuário criado no Auth:', data.user?.id);

        // 3. CRIAR PERFIL NA TABELA PROFILES
        if (data.user) {
            const { error: profileError } = await supabase
                .from('profiles')
                .insert({
                    id: data.user.id,
                    role: 'client',
                    full_name: fullName.trim(),
                    username: username.trim(),
                    is_admin: false,      // Cliente NUNCA é admin
                    email_verified: false, // Ainda não confirmou email
                    is_active: true
                });

            if (profileError) {
                console.warn('⚠️ Erro ao criar perfil:', profileError);
                // Não falha o cadastro, usuário pode atualizar depois
            }
        }

        return {
            success: true,
            message: '🎉 Cadastro realizado! Verifique seu email para confirmar.',
            userId: data.user?.id
        };

    } catch (error) {
        console.error('❌ Erro completo no cadastro:', error);
        return {
            success: false,
            message: error.message || 'Erro desconhecido no cadastro'
        };
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
