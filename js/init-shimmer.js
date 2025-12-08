// js/init-shimmer.js
// INICIALIZADOR SIMPLES - Coloque este script no final do seu HTML

(function() {
  console.log('🚀 Inicializando efeitos Shimmer...');
  
  // Espera o DOM carregar
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  
  function init() {
    // OPÇÃO 1: Inicializa automáticos (se houver elementos com data-shimmer)
    if (window.TextShimmer && window.TextShimmer.init) {
      window.TextShimmer.init();
    }
    
    // OPÇÃO 2: Aplica manualmente no título de login (RECOMENDADO)
    setTimeout(function() {
      const loginTitle = document.querySelector('.login-title');
      if (loginTitle && !loginTitle.classList.contains('text-shimmer')) {
        
        // Remove outras classes de efeito se existirem
        loginTitle.classList.remove('blood-flow', 'video-dark', 'tv-scan', 'cinematic-film', 'horror-tech');
        
        // Aplica o shimmer vermelho
        if (window.TextShimmer && window.TextShimmer.add) {
          window.TextShimmer.add(loginTitle, {
            duration: 1.8,
            className: 'text-shimmer-red'
          });
        } else {
          // Fallback direto se a biblioteca não carregar
          loginTitle.classList.add('text-shimmer', 'text-shimmer-red');
          loginTitle.style.setProperty('--shimmer-speed', '1.8s');
        }
        
        console.log('✨ Efeito Shimmer aplicado no título LOGIN');
      }
      
      // Exemplo: aplicar no link "Esqueci minha senha?"
      const forgotLink = document.querySelector('.forgot-password a');
      if (forgotLink) {
        forgotLink.classList.add('text-shimmer', 'text-shimmer-blue');
        forgotLink.style.setProperty('--shimmer-speed', '8s');
      }
      
    }, 1000); // Espera 1 segundo para carregar tudo
  }
})();