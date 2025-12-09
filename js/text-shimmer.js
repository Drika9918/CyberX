// js/text-shimmer.js
// EFEITO DE BRILHO NO TEXTO - SIMPLES E FÁCIL

/**
 * FUNÇÃO PRINCIPAL: Adiciona efeito shimmer a qualquer elemento
 * @param {HTMLElement} element - O elemento HTML que vai ter o efeito
 * @param {Object} options - Opções do efeito
 * @param {number} options.duration - Duração da animação em segundos (padrão: 1.2)
 * @param {string} options.color1 - Primeira cor do gradiente
 * @param {string} options.color2 - Segunda cor do gradiente
 * @param {string} options.color3 - Terceira cor do gradiente (opcional)
 * @param {string} options.className - Classe CSS adicional
 */
function addTextShimmer(element, options = {}) {
  // Configurações padrão
  const config = {
    duration: options.duration || 1.2,
    color1: options.color1 || '#4a0b12',
    color2: options.color2 || '#D74444',
    color3: options.color3 || options.color1 || '#4a0b12',
    className: options.className || 'text-shimmer-red'
  };
  
  // 1. Adiciona a classe básica
  element.classList.add('text-shimmer');
  
  // 2. Adiciona a classe de cor
  element.classList.add(config.className);
  
  // 3. Configura a velocidade da animação
  element.style.setProperty('--shimmer-speed', `${config.duration}s`);
  
  // 4. Configura as cores (se diferentes do padrão)
  if (options.color1 || options.color2 || options.color3) {
    element.style.setProperty('--shimmer-color-1', config.color1);
    element.style.setProperty('--shimmer-color-2', config.color2);
    element.style.setProperty('--shimmer-color-3', config.color3);
  }
  
  // Salva as configurações no elemento
  element.dataset.shimmerConfig = JSON.stringify(config);
  
  console.log(`✅ Shimmer aplicado em: ${element.tagName} com classe ${config.className}`);
}

/**
 * FUNÇÃO: Remover efeito shimmer
 * @param {HTMLElement} element - Elemento a remover o efeito
 */
function removeTextShimmer(element) {
  element.classList.remove('text-shimmer', 
    'text-shimmer-red', 
    'text-shimmer-blue', 
    'text-shimmer-purple', 
    'text-shimmer-green');
  
  element.style.removeProperty('--shimmer-speed');
  element.style.removeProperty('--shimmer-color-1');
  element.style.removeProperty('--shimmer-color-2');
  element.style.removeProperty('--shimmer-color-3');
  
  delete element.dataset.shimmerConfig;
}

/**
 * FUNÇÃO FÁCIL: Aplicar shimmer automático a elementos com data-shimmer
 */
function initAutoShimmers() {
  // Elementos que já têm data-shimmer no HTML
  const elements = document.querySelectorAll('[data-shimmer]');
  
  elements.forEach(element => {
    const type = element.dataset.shimmer || 'red';
    const duration = element.dataset.shimmerDuration || 1.2;
    
    // Aplica baseado no tipo
    switch(type) {
      case 'blue':
        addTextShimmer(element, { 
          duration: parseFloat(duration),
          className: 'text-shimmer-blue'
        });
        break;
        
      case 'purple':
        addTextShimmer(element, { 
          duration: parseFloat(duration),
          className: 'text-shimmer-purple'
        });
        break;
        
      case 'green':
        addTextShimmer(element, { 
          duration: parseFloat(duration),
          className: 'text-shimmer-green'
        });
        break;
        
      case 'red':
      default:
        addTextShimmer(element, { 
          duration: parseFloat(duration),
          className: 'text-shimmer-red'
        });
    }
  });
  
  console.log(`✅ ${elements.length} elementos com shimmer automático`);
}

/**
 * FUNÇÃO: Exemplos pré-prontos para usar
 */
const TextShimmerExamples = {
  // Título vermelho (padrão do seu site)
  applyToTitle: function(elementId = 'login-title') {
    const element = document.getElementById(elementId) || document.querySelector('.login-title');
    if (element) {
      addTextShimmer(element, {
        duration: 2.0,
        className: 'text-shimmer-red'
      });
    }
  },
  
  // Subtítulo azul
  applyToSubtitle: function(elementId) {
    const element = elementId ? document.getElementById(elementId) : document.querySelector('.switch-link');
    if (element) {
      addTextShimmer(element, {
        duration: 3.0,
        className: 'text-shimmer-blue'
      });
    }
  },
  
  // Link roxo
  applyToLink: function(elementId) {
    const element = elementId ? document.getElementById(elementId) : document.querySelector('.forgot-password a');
    if (element) {
      addTextShimmer(element, {
        duration: 2.5,
        className: 'text-shimmer-purple'
      });
    }
  }
};

// Torna as funções disponíveis globalmente
window.TextShimmer = {
  add: addTextShimmer,
  remove: removeTextShimmer,
  init: initAutoShimmers,
  examples: TextShimmerExamples
};

console.log('✅ Biblioteca TextShimmer carregada!');