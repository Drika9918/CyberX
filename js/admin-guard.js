
document.addEventListener('DOMContentLoaded', async () => {
    console.log("🔒 Verificando permissão de Administrador...");

    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
        console.warn("⛔ Usuário não logado. Redirecionando para login...");
        window.location.href = 'login.html';
        return;
    }

    const { data: profile, error } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', session.user.id)
        .single();

    if (error || !profile || profile.is_admin !== true) {
        alert("⛔ ACESSO NEGADO: Esta área é restrita.");
        window.location.href = 'index.html'; // Manda de volta pra loja
    } else {
        console.log("✅ Administrador confirmado. Acesso liberado.");
    }
});