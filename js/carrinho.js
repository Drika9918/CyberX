// --- LÓGICA DO CARRINHO DE COMPRAS ---

// Array global que armazena os itens do carrinho. É a nossa "fonte da verdade".
let cartItems = [];

/**
 * Carrega os itens do carrinho do localStorage para o array global 'cartItems'.
 */
function loadCart() {
    const storedCart = localStorage.getItem('cyberxCart');
    cartItems = storedCart ? JSON.parse(storedCart) : [];
}

/**
 * Salva o estado atual do array 'cartItems' no localStorage e atualiza o contador do ícone.
 */
function saveCart() {
    localStorage.setItem('cyberxCart', JSON.stringify(cartItems));
    updateCartCount(); // Sempre atualiza o contador visual após salvar.
}

/**
 * Adiciona um item ao carrinho ou incrementa sua quantidade se já existir.
 * @param {string} id - ID único do produto.
 * @param {string} name - Nome do produto.
 * @param {number} price - Preço do produto.
 * @param {string} image - URL da imagem do produto.
 * @param {string} marca - Marca do produto.
 */
function addItemToCart(id, name, price, image, marca) {
    loadCart(); // Garante que estamos trabalhando com a versão mais recente do carrinho.
    
    const existingItem = cartItems.find(item => item.id === id);

    if (existingItem) {
        // Se o item já existe, apenas aumenta a quantidade.
        existingItem.quantity += 1;
        showToast(`Mais um <strong>${name}</strong> foi adicionado!`);
    } else {
        // Se for um item novo, adiciona ao array.
        cartItems.push({ id, name, price, image, marca, quantity: 1 });
        showToast(`<strong>${name}</strong> adicionado ao carrinho!`);
    }

    saveCart();
}

/**
 * Atualiza a quantidade de um item específico no carrinho.
 * @param {string} id - ID do produto a ser atualizado.
 * @param {number} delta - A mudança na quantidade (+1 para adicionar, -1 para remover).
 */
function updateQuantity(id, delta) {
    loadCart();
    const itemIndex = cartItems.findIndex(item => item.id === id);

    if (itemIndex > -1) {
        cartItems[itemIndex].quantity += delta;
        
        // Se a quantidade chegar a zero, remove o item do carrinho.
        if (cartItems[itemIndex].quantity <= 0) {
            cartItems.splice(itemIndex, 1);
        }
    }
    
    saveCart();
}

/**
 * Remove completamente um item do carrinho, independentemente da quantidade.
 * @param {string} id - ID do produto a ser removido.
 */
function removeItem(id) {
    loadCart();
    cartItems = cartItems.filter(item => item.id !== id);
    saveCart();
}

/**
 * Calcula o valor total (subtotal) de todos os itens no carrinho.
 * @returns {number} O valor total.
 */
function calculateTotal() {
    loadCart();
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
}

/**
 * Formata um número para o padrão de moeda brasileiro (BRL).
 * @param {number} value - O valor numérico a ser formatado.
 * @returns {string} O valor formatado como moeda (ex: "R$ 1.234,56").
 */
function formatCurrency(value) {
    if (typeof value !== 'number') return 'R$ 0,00';
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

/**
 * Atualiza o número exibido no ícone do carrinho no cabeçalho.
 */
function updateCartCount() {
    loadCart();
    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const contador = document.getElementById('carrinho-contador');

    if (contador) {
        contador.textContent = totalItems;
        contador.style.display = totalItems > 0 ? 'block' : 'none';
    }
}

/**
 * Mostra uma mensagem de confirmação (toast) na tela.
 * @param {string} message - A mensagem a ser exibida.
 */
function showToast(message) {
    const toast = document.getElementById('toast-confirmacao');
    const toastMessage = document.getElementById('toast-message');

    if (toast && toastMessage) {
        toastMessage.innerHTML = message;
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
}

// --- FUNÇÕES DE RENDERIZAÇÃO DA PÁGINA DO CARRINHO ---

/**
 * Renderiza dinamicamente toda a página do carrinho com base nos itens.
 */
function renderCartPage() {
    renderCartItems();
    updateOrderSummary();
}

/**
 * Cria e insere os elementos HTML para cada item do carrinho na página.
 */
function renderCartItems() {
    loadCart();
    const cartContainer = document.querySelector('.item-carrinho-list');
    const freteResumo = document.querySelector('.frete-resumo-container');
    const botoesCarrinho = document.querySelector('.botoes-carrinho');

    if (!cartContainer) return;

    if (cartItems.length === 0) {
        cartContainer.innerHTML = `<p class="empty-cart-message">Seu carrinho está vazio. Adicione produtos na página inicial!</p>`;
        if (freteResumo) freteResumo.style.display = 'none';
        if (botoesCarrinho) botoesCarrinho.style.display = 'none';
    } else {
        cartContainer.innerHTML = ''; // Limpa a mensagem "Carregando...".
        if (freteResumo) freteResumo.style.display = 'flex';
        if (botoesCarrinho) botoesCarrinho.style.display = 'flex';

        cartItems.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'item-carrinho';
            itemElement.innerHTML = `
               
                <div class="item-detalhes">
                    <h2>${item.name}</h2>
                    <p class="marca">Marca: ${item.marca || 'N/A'}</p>
                    <div class="quantidade-controle">
                        <button class="btn-qty-decrease" onclick="updateItemAndRender('${item.id}', -1)">-</button>
                        <input type="number" value="${item.quantity}" min="1" class="qty-input" readonly>
                        <button class="btn-qty-increase" onclick="updateItemAndRender('${item.id}', 1)">+</button>
                    </div>
                </div>
                <div class="item-preco">
                    <p>${formatCurrency(item.price * item.quantity)}</p>
                    <button class="btn-remover" onclick="removeItemAndRender('${item.id}')">Remover</button>
                </div>
            `;
            cartContainer.appendChild(itemElement);
        });
    }
}

/**
 * Atualiza os valores de Subtotal e Total no resumo do pedido.
 */
function updateOrderSummary() {
    const subtotal = calculateTotal();
    const totalElement = document.getElementById('resumo-total');
    const subtotalElement = document.getElementById('resumo-subtotal');

    if (subtotalElement) {
        subtotalElement.textContent = formatCurrency(subtotal);
    }
    if (totalElement) {
        // Por enquanto, o total é igual ao subtotal (frete não calculado).
        totalElement.textContent = formatCurrency(subtotal);
    }
}

/**
 * Função "wrapper" para remover um item e imediatamente re-renderizar a página do carrinho.
 */
function removeItemAndRender(id) {
    removeItem(id);
    renderCartPage(); // Re-renderiza tudo.
}

/**
 * Função "wrapper" para atualizar a quantidade de um item e re-renderizar a página.
 */
function updateItemAndRender(id, delta) {
    updateQuantity(id, delta);
    renderCartPage(); // Re-renderiza tudo.
}


// --- INICIALIZAÇÃO ---

// Garante que o contador do carrinho seja atualizado assim que qualquer página carregar.
document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();
});
// carrinho.js

// ... (todas as funções existentes: loadCart, saveCart, addItemToCart, etc.)

// --- LÓGICA DO MODAL DE CONFIRMAÇÃO ---

/**
 * Exibe o modal de confirmação com o valor total atualizado.
 */
function showCheckoutModal() {
    const modal = document.getElementById('checkout-modal');
    const totalValueSpan = document.getElementById('modal-total-value');
    
    // 1. Calcula o total e atualiza o texto no modal
    const total = calculateTotal();
    totalValueSpan.textContent = formatCurrency(total);

    // 2. Exibe o modal
    if (modal) {
        modal.classList.add('show');
    }
}

/**
 * Oculta o modal de confirmação.
 */
function hideCheckoutModal() {
    const modal = document.getElementById('checkout-modal');
    if (modal) {
        modal.classList.remove('show');
    }
}

// --- INICIALIZAÇÃO E EVENT LISTENERS DO CARRINHO ---

document.addEventListener('DOMContentLoaded', () => {
    // ... (código de inicialização existente)
    updateCartCount();
    
    // Chama a renderização da página do carrinho (lista de itens e resumo)
    renderCartPage();

    // ======================================================
    // NOVO: Adiciona a lógica de clique para o botão 'Continuar'
    // ======================================================
    const btnContinuar = document.querySelector('.btn-continuar');
    const btnCancelModal = document.getElementById('modal-cancel-btn');
    const total = calculateTotal(); // Calcula o total na inicialização (ou chame a cada clique)

    if (btnContinuar) {
        btnContinuar.addEventListener('click', (event) => {
            // Previne o comportamento padrão (navegar) se o carrinho estiver vazio
            if (cartItems.length === 0) {
                event.preventDefault(); 
                alert('Seu carrinho está vazio. Adicione produtos para continuar.');
            } else {
                event.preventDefault(); // Previne a navegação imediata
                showCheckoutModal();
            }
        });
    }

    // Listener para o botão 'Cancelar' do modal
    if (btnCancelModal) {
        btnCancelModal.addEventListener('click', hideCheckoutModal);
    }
    
    // Adiciona listener para fechar o modal ao clicar fora (no overlay)
    const modalOverlay = document.getElementById('checkout-modal');
    if (modalOverlay) {
        modalOverlay.addEventListener('click', (event) => {
            if (event.target === modalOverlay) {
                hideCheckoutModal();
            }
        });
    }
    
});