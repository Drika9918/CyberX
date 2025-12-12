// js/admin-logic.js
// Certifique-se de que este arquivo existe em js/admin-logic.js para evitar 404/MIME issues.

// ---------- Config (usa global `supabase` do supabase-config.js) ----------
const supabaseClient = window.supabase || supabase;

// ---------- Estado ----------
let additionalImagesFiles = []; // File[] selecionadas pelo input
let currentProductId = null;

// ---------- UPLOAD DE ARQUIVOS PARA STORAGE ----------
async function uploadFileToStorage(file, productId) {
    try {
        const ext = file.name.split('.').pop();
        const fileName = `${productId}/${Date.now()}.${ext}`;
        const bucket = 'product-images';

        const { error: upErr } = await supabaseClient.storage
            .from(bucket)
            .upload(fileName, file, { cacheControl: '3600', upsert: false });

        if (upErr) {
            console.error('Upload error:', upErr);
            return null;
        }

        const { data: publicData } = supabaseClient.storage
            .from(bucket)
            .getPublicUrl(fileName);

        return publicData.publicUrl;
    } catch (err) {
        console.error('Upload exception:', err);
        return null;
    }
}

// ---------- CRUD ----------
async function createProductSupabase(productData, files = []) {
    try {
        const { data: inserted, error } = await supabaseClient
            .from('product')
            .insert([productData])
            .select()
            .single();

        if (error) {
            return { error };
        }

        const productId = inserted.id;
        const gallery = [];

        // upload each file
        for (const file of files) {
            const url = await uploadFileToStorage(file, productId);
            if (url) gallery.push(url);
        }

        // Atualiza specs.gallery se houver imagens
        const specs = inserted.specs || {};
        if (gallery.length) {
            specs.gallery = gallery;
            await supabaseClient.from('product').update({ specs }).eq('id', productId);
        }

        return { data: inserted };
    } catch (err) {
        console.error(err);
        return { error: err };
    }
}

async function updateProductSupabase(productId, productData) {
    try {
        const { data, error } = await supabaseClient
            .from('product')
            .update(productData)
            .eq('id', productId);

        return { data, error };
    } catch (err) {
        console.error(err);
        return { error: err };
    }
}

async function deleteProductSupabase(productId) {
    try {
        const { data, error } = await supabaseClient
            .from('product')
            .delete()
            .eq('id', productId);

        return { data, error };
    } catch (err) {
        console.error(err);
        return { error: err };
    }
}

async function fetchProductsAndRender() {
    try {
        const { data: products, error } = await supabaseClient
            .from('product')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Erro ao buscar produtos:', error);
            return;
        }

        renderProductsList(products || []);
    } catch (err) {
        console.error(err);
    }
}

// ---------- RENDER (substitui o HTML dinâmico que você já tem) ----------
function renderProductsList(products) {
    const container = document.getElementById('productListContainer');
    if (!container) return;

    container.innerHTML = '';

    products.forEach(p => {
        const price = Number(p.price || 0).toFixed(2);
        const image = p.image_url || (p.specs && p.specs.gallery && p.specs.gallery[0]) || 'https://via.placeholder.com/150';

        const item = document.createElement('div');
        item.className = 'product-item';
        item.dataset.productId = p.id;

        item.innerHTML = `
            <img src="${image}" class="prod-img" alt="${escapeHtml(p.name)}" onerror="this.src='https://via.placeholder.com/150'">
            <div class="prod-info">
                <h3>${escapeHtml(p.name)}</h3>
                <span>R$ ${price}</span>
                <div style="font-size:0.8rem;color:#666;margin-top:5px;">
                    Estoque: ${Number(p.stock||0)} | ${escapeHtml(p.brand||'')}
                </div>
            </div>
            <div class="prod-actions">
                <button class="btn btn-secondary btn-small" data-action="delete" data-id="${p.id}"><i class="fas fa-trash"></i></button>
                <button class="btn btn-success btn-small" data-action="edit" data-id="${p.id}">EDITAR</button>
            </div>
        `;

        container.appendChild(item);
    });

    // attach listeners for edit/delete
    container.querySelectorAll('[data-action="delete"]').forEach(btn => {
        btn.addEventListener('click', async (ev) => {
            const id = ev.currentTarget.dataset.id;
            if (!confirm('Deseja excluir este produto?')) return;
            const { error } = await deleteProductSupabase(id);
            if (error) alert('Erro ao deletar: ' + (error.message || JSON.stringify(error)));
            else fetchProductsAndRender();
        });
    });

    container.querySelectorAll('[data-action="edit"]').forEach(btn => {
        btn.addEventListener('click', async (ev) => {
            const id = ev.currentTarget.dataset.id;
            openEditModalById(id);
        });
    });
}

// ---------- Helpers ----------
function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function showNotification(msg, type = 'info') {
    // você já tem uma UI; aqui apenas um alert simples
    if (type === 'error') alert(msg);
    else console.log('[NOTIF]', msg);
}

// ---------- MODAIS / FORM HANDLERS ----------

// Handle additional images input (file input)
const additionalInput = document.getElementById('additionalImagesInput');
if (additionalInput) {
    additionalInput.addEventListener('change', function(e) {
        const files = Array.from(e.target.files || []);
        // limite 5
        additionalImagesFiles = additionalImagesFiles.concat(files).slice(0, 5);
        renderAdditionalImagesPreview();
        e.target.value = '';
    });
}

function renderAdditionalImagesPreview() {
    const preview = document.getElementById('additionalImagesPreview');
    if (!preview) return;
    preview.innerHTML = '';
    additionalImagesFiles.forEach((file, idx) => {
        const container = document.createElement('div');
        container.className = 'image-container';
        const img = document.createElement('img');
        img.src = URL.createObjectURL(file);
        img.className = 'additional-image';
        const btn = document.createElement('button');
        btn.className = 'remove-image';
        btn.innerText = '×';
        btn.onclick = () => {
            additionalImagesFiles.splice(idx, 1);
            renderAdditionalImagesPreview();
        };
        container.appendChild(img);
        container.appendChild(btn);
        preview.appendChild(container);
    });
}

// Add product form
const addForm = document.getElementById('addProductForm');
if (addForm) {
    addForm.addEventListener('submit', async function(ev) {
        ev.preventDefault();

        // Basic validation (you also have validateAddForm)
        const name = document.getElementById('addProductName').value.trim();
        if (!name) return showNotification('Nome é obrigatório', 'error');

        const specs = {
            color: document.getElementById('addProductColor').value,
            material: document.getElementById('addProductMaterial').value,
            warranty: document.getElementById('addProductWarranty').value,
            weight: document.getElementById('addProductWeight').value,
            dimensions: {
                length: document.getElementById('addProductLength').value,
                width: document.getElementById('addProductWidth').value,
                height: document.getElementById('addProductHeight').value,
            },
            tags: (document.getElementById('addProductTags').value || '').split(',').map(t => t.trim()).filter(Boolean)
        };

        const productData = {
            name,
            description: document.getElementById('addProductDescription').value,
            brand: document.getElementById('addProductBrand').value,
            category: document.getElementById('addProductCategory').value,
            price: parseFloat(document.getElementById('addProductPrice').value) || 0,
            old_price: document.getElementById('addProductOldPrice').value ? parseFloat(document.getElementById('addProductOldPrice').value) : null,
            stock: parseInt(document.getElementById('addProductStock').value) || 0,
            image_url: document.getElementById('addProductImage').value,
            is_featured: false,
            specs
        };

        const { data, error } = await createProductSupabase(productData, additionalImagesFiles);
        if (error) {
            alert('Erro ao criar: ' + (error.message || JSON.stringify(error)));
            return;
        }

        showNotification('Produto criado', 'success');
        document.getElementById('addModal').style.display = 'none';
        addForm.reset();
        additionalImagesFiles = [];
        renderAdditionalImagesPreview();
        fetchProductsAndRender();
    });
}

// Edit form handler
const editForm = document.getElementById('editProductForm');
if (editForm) {
    editForm.addEventListener('submit', async function(ev) {
        ev.preventDefault();
        if (!currentProductId) return alert('Produto inválido');

        const productData = {
            name: document.getElementById('productName').value,
            description: document.getElementById('productDescription').value,
            brand: document.getElementById('addProductBrand')?.value || '',
            category: document.getElementById('productCategory').value,
            price: parseFloat(document.getElementById('productPrice').value) || 0,
            image_url: document.getElementById('productImage').value,
            stock: parseInt(document.getElementById('productStock').value) || 0
        };

        const { error } = await updateProductSupabase(currentProductId, productData);
        if (error) {
            alert('Erro ao atualizar: ' + (error.message || JSON.stringify(error)));
            return;
        }

        showNotification('Produto atualizado', 'success');
        document.getElementById('editModal').style.display = 'none';
        currentProductId = null;
        fetchProductsAndRender();
    });
}

// Open edit modal by id (preencher campos)
async function openEditModalById(id) {
    const { data: product, error } = await supabaseClient.from('product').select('*').eq('id', id).single();
    if (error || !product) return alert('Produto não encontrado');

    currentProductId = id;
    document.getElementById('productName').value = product.name || '';
    document.getElementById('productPrice').value = product.price || '';
    document.getElementById('productDescription').value = product.description || '';
    document.getElementById('productImage').value = product.image_url || '';
    document.getElementById('productCategory').value = product.category || '';
    document.getElementById('productStock').value = product.stock || 0;
    document.getElementById('productStatus').value = (product.is_featured ? 'ativo' : 'inativo');

    const deleteBtn = document.getElementById('btn-delete');
    if (deleteBtn) {
        deleteBtn.style.display = 'block';
        deleteBtn.onclick = async () => {
            if (!confirm('Excluir este produto?')) return;
            const { error } = await deleteProductSupabase(id);
            if (error) alert('Erro ao deletar');
            else {
                document.getElementById('editModal').style.display = 'none';
                fetchProductsAndRender();
            }
        };
    }

    document.getElementById('editModal').style.display = 'flex';
}

// ---------- Inicialização ----------
document.addEventListener('DOMContentLoaded', () => {
    // apenas busca e renderiza inicialmente
    fetchProductsAndRender();

    // fechar modais quando clicar fora (se já definido no HTML)
    document.querySelectorAll('.modal-overlay').forEach(modal => {
        modal.addEventListener('click', function(event) {
            if (event.target === this) {
                this.style.display = 'none';
            }
        });
    });
});
