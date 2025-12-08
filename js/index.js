

    // CARROSSEL
 var swiper = new Swiper(".mySwiper", {
      spaceBetween: 30,
      centeredSlides: true,
      autoplay: {
        delay: 2800,
        disableOnInteraction: false,
      },
      pagination: {
        el: ".swiper-pagination",
        clickable: true,
      },
      
    });



// MINHA CONTA
document.addEventListener('DOMContentLoaded', () => {
    const userDropdown = document.querySelector('.user-menu-dropdown');
    
    // Adiciona evento para fechar o menu se o usuário clicar fora
    document.addEventListener('click', (event) => {
        // Verifica se o clique não está dentro do contêiner do menu
        if (userDropdown && !userDropdown.contains(event.target)) {
            // Se você usasse JS para mostrar/esconder (ex: toggle class 'show')
            // O código de fechar estaria aqui, mas o CSS com :hover já faz isso.
            
            // Para acessibilidade, você pode remover o foco
            if (document.activeElement === userDropdown) {
                 document.activeElement.blur();
            }
        }
    });

    // Opcional: Para manter o foco quando o mouse sai, mas o usuário usa TAB
    userDropdown.addEventListener('focusout', (event) => {
        // Garante que se o foco sair do dropdown, ele se esconda.
        if (!userDropdown.contains(event.relatedTarget)) {
            // O CSS já lida com isso se não houver a classe 'show'
        }
    });
});

// ... (Certifique-se que a função getLoggedInUser está disponível) ...

// Função para exibir o nome de usuário na página
function updateWelcomeMessage() {
    const user = getLoggedInUser(); // Pega os dados do localStorage
    const welcomeSpan = document.getElementById('welcome-message');
    
    if (welcomeSpan) {
        if (user) {
            // Se o usuário estiver logado, exibe o nome
            welcomeSpan.textContent = `Olá, ${user.usuario}!`;
            // Você também pode esconder/mostrar botões de login/cadastro
        } else {
            // Se não estiver logado
            welcomeSpan.textContent = `Olá, Visitante.`;
        }
    }
}

// Chama a função ao carregar a página principal (index.html)
document.addEventListener('DOMContentLoaded', updateWelcomeMessage);
   // Array para armazenar os itens do carrinho temporariamente
// Armazenamento dos itens do carrinho (usaremos um array)



//  CARRINHOO ====
// ... código anterior (saveCart, calculateTotal, formatCurrency)

/**
 * Recalcula o número total de itens e atualiza o badge do carrinho.
 */
document.addEventListener('DOMContentLoaded', () => {
    // 1. Garante que os itens salvos sejam carregados para a variável 'cartItems'
    loadCart();        
    
    // 2. Garante que o contador no cabeçalho seja atualizado com o valor carregado
    updateCartCount(); 
});
/**
 * Mostra a mensagem de confirmação (Toast).
 */
function showToast() {
    const toast = document.getElementById('toast-confirmacao');
    if (toast) {
        toast.classList.add('show');
        // Oculta a mensagem após 3 segundos
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
}
// --- LÓGICA DO CARRINHO DE COMPRAS ---

let cartItems = []; // Array para armazenar os itens do carrinho

/**
 * Carrega os itens do carrinho do localStorage.
 */
function loadCart() {
    const storedCart = localStorage.getItem('cyberxCart');
    cartItems = storedCart ? JSON.parse(storedCart) : [];
}

/**
 * Salva os itens do carrinho no localStorage.
 */
function saveCart() {
    localStorage.setItem('cyberxCart', JSON.stringify(cartItems));
    updateCartCount(); // Sempre atualiza o contador após salvar
}

/**
 * Calcula o valor total (subtotal) dos itens no carrinho.
 * @returns {number} O valor total.
 */
function calculateTotal() {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
}

/**
 * Formata um número como moeda BRL.
 * @param {number} value - O valor a ser formatado.
 * @returns {string} O valor formatado.
 */
function formatCurrency(value) {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

/**
 * Adiciona um item ao carrinho ou aumenta sua quantidade se já existir.
 * @param {string} id - ID único do produto.
 * @param {string} name - Nome do produto.
 * @param {number} price - Preço unitário do produto.
 * @param {string} image - URL da imagem do produto.
 */
function addItemToCart(id, name, price, image) {
    const existingItemIndex = cartItems.findIndex(item => item.id === id);

    if (existingItemIndex > -1) {
        cartItems[existingItemIndex].quantity += 1;
        showToast(`Mais um item **${name}** adicionado!`);
    } else {
        cartItems.push({ id, name, price, image, quantity: 1 });
        showToast(`**${name}** adicionado ao carrinho!`);
    }

    saveCart();
    
    // Se estiver na página do carrinho, re-renderiza
    const currentPage = window.location.pathname.split("/").pop();
    if (currentPage === 'carrinho.html') {
        renderCartItems();
        updateOrderSummary();
    }
}

/**
 * Recalcula o número total de itens e atualiza o badge do carrinho.
 */
function updateCartCount() {
    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const contador = document.getElementById('carrinho-contador');

    if (contador) {
        contador.textContent = totalItems;
        if (totalItems > 0) {
            contador.style.display = 'block'; // Mostra o badge
        } else {
            contador.style.display = 'none'; // Oculta o badge se estiver vazio
        }
    }
}
// Arquivo: index.js
  // BARRA DE PESQUISA 
document.addEventListener('DOMContentLoaded', function () {
    // ... código para a BARRA DE PESQUISA e sugestões (já existe)

    const form = document.getElementById('search-form');
    const input = document.getElementById('search-input');
    // ... (restante do seu código de histórico e sugestões)
    
    // ===============================================
    // CÓDIGO DO FILTRO DE BUSCA (Adicione este bloco)
    // ===============================================

    function filterItems() {
        // 1. Pega o termo de busca e o converte para minúsculas para uma busca não sensível a maiúsculas/minúsculas
        const searchTerm = input.value.toLowerCase().trim();

        // 2. Seleciona todos os itens que devem ser filtrados
        // Mude '.product-item' para a classe que você usou na sua lista de itens.
        const itemsToFilter = document.querySelectorAll('.product-card'); 

        itemsToFilter.forEach(item => {
            // 3. Pega todo o texto de dentro do item e o converte para minúsculas para comparação
            const itemText = item.textContent.toLowerCase();

            // 4. Lógica de filtragem: verifica se o texto do item INCLUI o termo de busca
            if (itemText.includes(searchTerm)) {
                // Se o termo for encontrado, o item é exibido
                item.style.display = ''; // Isso reverte ao estilo de display padrão (block, flex, grid, etc.)
            } else {
                // Se o termo NÃO for encontrado, o item é escondido
                item.style.display = 'none';
            }
        });
    }

    // 5. Adiciona o listener para filtrar em tempo real (a cada letra digitada)
    input.addEventListener('input', filterItems);

    // 6. OPCIONAL: Impedir que o formulário recarregue a página ao apertar Enter
    form.addEventListener('submit', (e) => {
        e.preventDefault(); // Impede o envio tradicional do formulário
        filterItems(); // Garante que a filtragem ocorra (embora o 'input' já faça isso)
        
        // Se você quiser que o Enter também salve a busca no histórico:
        const term = input.value.trim();
        if (term) {
             saveSearchTerm(term); // Reutiliza a função de histórico que já existe no seu JS
        }
    });

    // FIM DO CÓDIGO DO FILTRO DE BUSCA

    



});