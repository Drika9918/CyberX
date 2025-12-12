
document.addEventListener('DOMContentLoaded', async () => {
    await carregarDadosAdmin();

    const btnLogout = document.getElementById('btn-logout');
    if (btnLogout) {
        btnLogout.addEventListener('click', async (e) => {
            e.preventDefault();
            await fazerLogout();
        });
    }
});

async function carregarDadosAdmin() {
    try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
            const { data: profile } = await supabase
                .from('profiles')
                .select('full_name')
                .eq('id', session.user.id)
                .single();

            const nomeExibicao = profile?.full_name || 'Administrador';
            
            const nomeEl = document.getElementById('admin-name-display');
            if (nomeEl) nomeEl.innerText = nomeExibicao;
        }
    } catch (error) {
        console.error('Erro ao carregar admin:', error);
    }
}

async function fazerLogout() {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Erro ao sair:', error);
        window.location.href = 'index.html';
    }
}