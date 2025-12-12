// ==========================================================
// VARIÁVEIS DE ESTADO E INICIALIZAÇÃO
// ==========================================================
let isAdmin = false;
let cartItems = []; // Array para armazenar os itens do carrinho

const productsGrid = document.getElementById('products-grid');
const adminControls = document.getElementById('admin-controls');
const modal = document.getElementById('product-modal');
const form = document.getElementById('product-form');

// INICIALIZAÇÃO GERAL (Executa tudo ao carregar o DOM)
document.addEventListener('DOMContentLoaded', async () => {
    // Inicialização da lógica de autenticação e produtos
    await initProductSystem(); 
    
    // Inicialização do carrinho
    loadCart(); 
    updateCartCount();
    
    // Inicialização do Carrossel e outros listeners
    initSwiper();
    initUserMenuListener();
    initSearchListener();

    // Nota: updateWelcomeMessage() é chamado dentro de initProductSystem para usar o mesmo profile data.
});

// ==========================================================
// SEÇÃO 1: ADMIN E PRODUTOS (SUPABASE)
// ==========================================================

async function initProductSystem() {
    // 1. Verificar Sessão e Perfil (Admin vs Client)
    // Usando getCurrentSession() ou getCurrentUserInfo() do seu 'session.js'
    const sessionInfo = await getCurrentUserInfo(); 

    if (sessionInfo && sessionInfo.role === 'admin') {
        isAdmin = true;
        if (adminControls) adminControls.style.display = 'block'; // Mostra botão de adicionar
        console.log('👑 Modo Administrador Ativado');
    }

    // 2. Atualiza a mensagem de boas-vindas (INTEGRAÇÃO DE CÓDIGO)
    await updateWelcomeMessage(sessionInfo);

    // 3. Carregar Produtos
    await fetchProducts();
}

// ATUALIZAÇÃO DO CÓDIGO EXISTENTE: Agora recebe o user do initProductSystem
async function updateWelcomeMessage(user) {
    const welcomeSpan = document.getElementById('welcome-message');
    
    if (welcomeSpan) {
        if (user) {
            // Usa o nome completo ou o e-mail se o nome não estiver disponível
            const nome = user.fullName || user.email.split('@')[0];
            welcomeSpan.textContent = `Olá, ${nome}!`;
            welcomeSpan.href = "perfil.html"; 
            
        } else {
            welcomeSpan.textContent = `Entre ou Cadastre-se`;
            // Redireciona para login ao clicar (ajuste o href se necessário)
            welcomeSpan.parentElement.onclick = () => window.location.href = 'login.html'; 
        }
    }
}

async function fetchProducts() {
    if (productsGrid) {
        productsGrid.innerHTML = '<p style="color: white; grid-column: 1/-1; text-align: center;">Carregando sistema...</p>';
    }

    const { data: products, error } = await supabase
        .from('product')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Erro ao buscar produtos:', error);
        if (productsGrid) productsGrid.innerHTML = '<p style="color: red; grid-column: 1/-1; text-align: center;">Falha na conexão com a base de dados.</p>';
        return;
    }

    renderProducts(products);
}

function renderProducts(products) {
    if (!productsGrid) return;
    productsGrid.innerHTML = '';

    products.forEach(product => {
        // Formatar preço
        const price = parseFloat(product.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
        
        // Botão de Editar (Só aparece se for admin)
        const editBtn = isAdmin ? `
            <button onclick="editProduct('${product.id}')" 
                style="position: absolute; top: 10px; right: 10px; z-index: 10; background: rgba(0,0,0,0.8); color: #00ff88; border: 1px solid #00ff88; padding: 5px 10px; cursor: pointer; border-radius: 4px;">
                <i class="fas fa-edit"></i> EDITAR
            </button>
        ` : '';

        const html = `
            <div class="product-card" style="position: relative;">
                ${editBtn}
                <div class="product-image-container">
                    <img src="${product.image_url}" alt="${product.name}" onerror="this.src='https://via.placeholder.com/300'">
                    <div class="image-overlay"></div>
                </div>

                <div class="product-name-overlay">
                    <h3>${product.name}</h3>
                </div>

                <div class="product-bottom-bar">
                    <div class="bar-content">
                        <p class="product-price-bar">R$ ${price}</p>
                        <button class="btn-ver-produto" onclick="window.location.href='produto.html?id=${product.id}'">
                            VER PRODUTO
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        productsGrid.innerHTML += html;
    });
}

// === FUNÇÕES DO MODAL E CRUD (ADMIN) ===

window.openProductModal = () => {
    if (!isAdmin) return alert('Sem permissão.');
    if (!form || !modal) return;
    
    form.reset();
    document.getElementById('prod-id').value = '';
    document.getElementById('modal-title').innerText = 'NOVO HARDWARE';
    document.getElementById('btn-delete').style.display = 'none';
    modal.style.display = 'flex';
}

window.closeProductModal = () => {
    if (modal) modal.style.display = 'none';
}

window.editProduct = async (id) => {
    if (!isAdmin || !modal) return alert('Sem permissão.');
    
    const { data: product } = await supabase.from('product').select('*').eq('id', id).single();
    
    if (product) {
        document.getElementById('prod-id').value = product.id;
        document.getElementById('prod-name').value = product.name;
        document.getElementById('prod-brand').value = product.brand;
        document.getElementById('prod-category').value = product.category;
        document.getElementById('prod-price').value = product.price;
        document.getElementById('prod-image').value = product.image_url;
        document.getElementById('prod-desc').value = product.description || '';

        document.getElementById('modal-title').innerText = 'EDITAR HARDWARE';
        
        const deleteBtn = document.getElementById('btn-delete');
        deleteBtn.style.display = 'block';
        deleteBtn.onclick = () => deleteProduct(id);

        modal.style.display = 'flex';
    }
}

// SALVAR (Criar ou Atualizar)
if (form) {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!isAdmin) return alert('Sem permissão.');

        const id = document.getElementById('prod-id').value;
        const productData = {
            name: document.getElementById('prod-name').value,
            brand: document.getElementById('prod-brand').value,
            category: document.getElementById('prod-category').value,
            price: parseFloat(document.getElementById('prod-price').value),
            image_url: document.getElementById('prod-image').value,
            description: document.getElementById('prod-desc').value,
            stock: 10 // Padrão
        };

        let error;

        if (id) {
            // Update
            const res = await supabase.from('product').update(productData).eq('id', id);
            error = res.error;
        } else {
            // Insert
            const res = await supabase.from('product').insert([productData]);
            error = res.error;
        }

        if (error) {
            alert('Erro ao salvar: ' + error.message);
        } else {
            closeProductModal();
            fetchProducts(); // Recarrega a lista
        }
    });
}

// DELETAR
async function deleteProduct(id) {
    if (!isAdmin) return alert('Sem permissão.');
    if (confirm('Tem certeza que deseja deletar este produto?')) {
        const { error } = await supabase.from('product').delete().eq('id', id);
        if (error) alert('Erro ao deletar');
        else {
            closeProductModal();
            fetchProducts();
        }
    }
}

// ==========================================================
// SEÇÃO 2: CARRINHO (CÓDIGO EXISTENTE MANTIDO)
// ==========================================================

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
 */
function formatCurrency(value) {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

/**
 * Adiciona um item ao carrinho ou aumenta sua quantidade se já existir.
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
        // Estas funções devem ser definidas em 'carrinho.html'
        if (typeof renderCartItems === 'function') renderCartItems(); 
        if (typeof updateOrderSummary === 'function') updateOrderSummary();
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

/**
 * Mostra a mensagem de confirmação (Toast).
 */
function showToast(message) {
    const toast = document.getElementById('toast-confirmacao');
    if (toast) {
        // Atualiza a mensagem do toast (se desejar)
        // toast.querySelector('.toast-message').textContent = message; 

        toast.classList.add('show');
        // Oculta a mensagem após 3 segundos
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
}

// ==========================================================
// SEÇÃO 3: COMPONENTES UI (CÓDIGO EXISTENTE MANTIDO)
// ==========================================================

// CARROSSEL
function initSwiper() {
    if (typeof Swiper !== 'undefined') {
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
    }
}

// MINHA CONTA (Listener simples, mantido)
function initUserMenuListener() {
    const userDropdown = document.querySelector('.user-menu-dropdown');
    
    // Adiciona evento para fechar o menu se o usuário clicar fora (para acessibilidade)
    document.addEventListener('click', (event) => {
        if (userDropdown && !userDropdown.contains(event.target)) {
            if (document.activeElement === userDropdown) {
                 document.activeElement.blur();
            }
        }
    });

    userDropdown.addEventListener('focusout', (event) => {
        if (!userDropdown.contains(event.relatedTarget)) {
            // Lógica de fechar se necessário
        }
    });
}


// BARRA DE PESQUISA E FILTRO (CÓDIGO EXISTENTE MANTIDO)
function initSearchListener() {
    const form = document.getElementById('search-form');
    const input = document.getElementById('search-input');

    if (!form || !input) return;

    function filterItems() {
        const searchTerm = input.value.toLowerCase().trim();
        // Seleciona todos os itens na grid de produtos
        const itemsToFilter = document.querySelectorAll('#products-grid .product-card'); 

        itemsToFilter.forEach(item => {
            const itemText = item.textContent.toLowerCase();

            if (itemText.includes(searchTerm)) {
                item.style.display = ''; // Exibe o item
            } else {
                item.style.display = 'none'; // Esconde o item
            }
        });
    }

    // 5. Adiciona o listener para filtrar em tempo real (a cada letra digitada)
    input.addEventListener('input', filterItems);

    // 6. Impedir que o formulário recarregue a página ao apertar Enter
    form.addEventListener('submit', (e) => {
        e.preventDefault(); 
        filterItems(); 
        
        // Se você tiver uma função saveSearchTerm, chame-a aqui
        const term = input.value.trim();
        if (term && typeof saveSearchTerm === 'function') {
            saveSearchTerm(term); 
        }
    });
}