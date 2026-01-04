/**
 * 丸龜製麵 - 主要 JavaScript
 * 購物車邏輯、API 串接、QR 動態生成
 */

// ============== 全域變數 ==============
let cart = [];
let menuData = [];
let sidesData = [];
const API_BASE = 'http://localhost:8000'; // 後端 API 基礎路徑

// ============== 頁面初始化 ==============
document.addEventListener('DOMContentLoaded', () => {
    loadMenu();
    updateCartUI();
});

// ============== API 呼叫 ==============

/**
 * 載入菜單資料
 */
async function loadMenu() {
    try {
        showLoading(true);
        const response = await fetch(`${API_BASE}/api/menu`);
        const result = await response.json();
        
        if (result.success) {
            menuData = result.data.menu;
            sidesData = result.data.sides || [];
            renderMenuGrid(menuData);
            renderSidesSection(sidesData);
        } else {
            showError('無法載入菜單，請重新整理頁面');
        }
    } catch (error) {
        console.error('載入菜單失敗:', error);
        showError('網路連線錯誤，請檢查網路狀態');
    } finally {
        showLoading(false);
    }
}

// ============== 渲染函數 ==============

/**
 * 渲染菜單 Grid
 */
function renderMenuGrid(items) {
    const grid = document.getElementById('menu-grid');
    if (!grid) return;
    
    grid.innerHTML = items.map(item => createMenuCard(item)).join('');
}

/**
 * 建立餐點卡片 HTML
 */
function createMenuCard(item) {
    const spicyIcons = '🌶️'.repeat(item.spicy_level || 0);
    const popularBadge = item.is_popular ? '<span class="popular-badge">🔥 人氣</span>' : '';
    
    // 動態 QR Code URL (使用免費 QR API)
    const arUrl = `${window.location.origin}/ar?id=${item.id}`;
    const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(arUrl)}`;
    
    return `
        <div class="menu-card" data-id="${item.id}">
            <div class="card-img-container">
                ${popularBadge}
                <img src="${item.image}" alt="${item.name}" 
                     onerror="this.src='/static/img/placeholder.jpg'">
                
                <!-- Hover 時顯示的 QR Overlay -->
                <div class="qr-overlay">
                    <img src="${qrImageUrl}" alt="AR QR Code">
                    <p>📱 掃描體驗 AR</p>
                    <a href="${arUrl}" class="ar-btn" target="_blank">
                        🥽 直接進入 AR
                    </a>
                </div>
            </div>
            
            <div class="card-content">
                <h3>${item.name}</h3>
                <p class="jp-name">${item.name_jp || ''}</p>
                <p class="description">${item.description}</p>
                <div class="d-flex justify-content-between align-items-center">
                    <span class="price">NT$${item.price}</span>
                    <span class="spicy-level">${spicyIcons}</span>
                </div>
            </div>
            
            <button class="add-to-cart-btn" onclick="addToCart(${item.id}, event)">
                加入點餐
            </button>
        </div>
    `;
}

/**
 * 渲染副餐區塊
 */
function renderSidesSection(sides) {
    const sidesGrid = document.getElementById('sides-grid');
    if (!sidesGrid || !sides) return;
    
    sidesGrid.innerHTML = sides.map(item => `
        <div class="menu-card side-card" data-id="${item.id}">
            <div class="card-img-container">
                <img src="${item.image}" alt="${item.name}"
                     onerror="this.src='/static/img/placeholder.jpg'">

                <!-- Hover 時顯示的 QR Overlay -->
                ${(() => {
                    const arUrl = `${window.location.origin}/ar?id=${item.id}`;
                    const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(arUrl)}`;
                    return `
                        <div class="qr-overlay">
                            <img src="${qrImageUrl}" alt="AR QR Code">
                            <p>📱 掃描體驗 AR</p>
                            <a href="${arUrl}" class="ar-btn" target="_blank">
                                🥽 直接進入 AR
                            </a>
                        </div>
                    `;
                })()}
            </div>
            <div class="card-content">
                <h3>${item.name}</h3>
                <p class="description">${item.description}</p>
                <span class="price">NT$${item.price}</span>
            </div>
            <button class="add-to-cart-btn" onclick="addToCart(${item.id}, event)">
                加點
            </button>
        </div>
    `).join('');
}

// ============== 購物車邏輯 ==============

/**
 * 加入購物車
 */
function addToCart(itemId, event) {
    if (event) event.stopPropagation();
    
    // 從 menuData 或 sides 中尋找商品
    const allItems = [...menuData, ...sidesData];
    const item = allItems.find(i => i.id === itemId);
    
    if (!item) {
        // 嘗試從 API 取得
        fetch(`${API_BASE}/api/menu/${itemId}`)
            .then(res => res.json())
            .then(result => {
                if (result.success) {
                    addItemToCart(result.data);
                }
            });
        return;
    }
    
    addItemToCart(item);
}

/**
 * 實際加入購物車
 */
function addItemToCart(item) {
    const existingItem = cart.find(i => i.id === item.id);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: 1
        });
    }
    
    updateCartUI();
    showToast(`已加入 ${item.name} 🍜`);
    
    // 儲存到 localStorage
    saveCart();
}

/**
 * 從購物車移除
 */
function removeFromCart(itemId) {
    const index = cart.findIndex(i => i.id === itemId);
    if (index > -1) {
        if (cart[index].quantity > 1) {
            cart[index].quantity -= 1;
        } else {
            cart.splice(index, 1);
        }
    }
    updateCartUI();
    saveCart();
}

/**
 * 清空購物車
 */
function clearCart() {
    cart = [];
    updateCartUI();
    saveCart();
}

/**
 * 更新購物車 UI
 */
function updateCartUI() {
    const countEl = document.getElementById('cart-count');
    const totalEl = document.getElementById('cart-total');
    const checkoutBtn = document.getElementById('checkout-btn');
    
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    if (countEl) countEl.textContent = totalItems;
    if (totalEl) totalEl.textContent = `NT$${totalPrice}`;
    if (checkoutBtn) checkoutBtn.disabled = totalItems === 0;
}

/**
 * 儲存購物車到 localStorage
 */
function saveCart() {
    localStorage.setItem('marugame_cart', JSON.stringify(cart));
}

/**
 * 從 localStorage 載入購物車
 */
function loadCart() {
    const saved = localStorage.getItem('marugame_cart');
    if (saved) {
        cart = JSON.parse(saved);
        updateCartUI();
    }
}

// ============== 結帳功能 ==============

/**
 * 顯示購物車詳情 Modal
 */
function showCartModal() {
    const modalBody = document.getElementById('cart-modal-body');
    if (!modalBody) return;
    
    if (cart.length === 0) {
        modalBody.innerHTML = '<p class="text-center text-muted">購物車是空的 🛒</p>';
        return;
    }
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    modalBody.innerHTML = `
        <table class="table">
            <thead>
                <tr>
                    <th>餐點</th>
                    <th>單價</th>
                    <th>數量</th>
                    <th>小計</th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
                ${cart.map(item => `
                    <tr>
                        <td>${item.name}</td>
                        <td>$${item.price}</td>
                        <td>
                            <button class="btn btn-sm btn-outline-secondary" onclick="removeFromCart(${item.id})">-</button>
                            <span class="mx-2">${item.quantity}</span>
                            <button class="btn btn-sm btn-outline-secondary" onclick="addToCart(${item.id})">+</button>
                        </td>
                        <td>$${item.price * item.quantity}</td>
                        <td>
                            <button class="btn btn-sm btn-danger" onclick="removeItemCompletely(${item.id})">🗑️</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
            <tfoot>
                <tr>
                    <th colspan="3">總計</th>
                    <th colspan="2" class="text-danger fs-4">NT$${total}</th>
                </tr>
            </tfoot>
        </table>
    `;
}

/**
 * 完全移除某項商品
 */
function removeItemCompletely(itemId) {
    cart = cart.filter(i => i.id !== itemId);
    updateCartUI();
    saveCart();
    showCartModal(); // 重新渲染 Modal
}

/**
 * 送出訂單
 */
async function submitOrder() {
    if (cart.length === 0) {
        showToast('購物車是空的！', 'warning');
        return;
    }
    
    const orderData = {
        items: cart.map(item => ({
            menu_id: item.id,
            quantity: item.quantity
        })),
        customer_note: document.getElementById('order-note')?.value || ''
    };
    
    try {
        const response = await fetch(`${API_BASE}/api/order`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(orderData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            // 跳轉到訂單確認頁面，帶上訂單編號與資訊
            clearCart();
            const orderId = encodeURIComponent(result.order.order_id || '');
            const orderInfo = encodeURIComponent(JSON.stringify(result.order.info || {}));
            window.location.href = `order_confirm.html?order_id=${orderId}&order_info=${orderInfo}`;
        } else {
            showToast('訂單送出失敗，請重試', 'error');
        }
    } catch (error) {
        console.error('訂單錯誤:', error);
        showToast('網路錯誤，請檢查連線', 'error');
    }
}

// ============== 分類篩選 ==============

/**
 * 篩選餐點分類
 */
function filterCategory(category) {
    // 更新 Tab 狀態
    document.querySelectorAll('.category-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // 篩選資料
    if (category === 'all') {
        renderMenuGrid(menuData);
    } else if (category === 'popular') {
        const filtered = menuData.filter(item => item.is_popular);
        renderMenuGrid(filtered);
    } else {
        const filtered = menuData.filter(item => item.category === category);
        renderMenuGrid(filtered);
    }
}

// ============== 工具函數 ==============

/**
 * 顯示/隱藏載入動畫
 */
function showLoading(show) {
    const loader = document.getElementById('loading-spinner');
    if (loader) {
        loader.style.display = show ? 'flex' : 'none';
    }
}

/**
 * 顯示錯誤訊息
 */
function showError(message) {
    const grid = document.getElementById('menu-grid');
    if (grid) {
        grid.innerHTML = `
            <div class="col-12 text-center py-5">
                <p class="text-danger fs-4">❌ ${message}</p>
                <button class="btn btn-primary mt-3" onclick="loadMenu()">
                    🔄 重新載入
                </button>
            </div>
        `;
    }
}

/**
 * 顯示 Toast 提示
 */
function showToast(message, type = 'success') {
    // 建立 Toast 元素
    const toast = document.createElement('div');
    toast.className = `custom-toast ${type}`;
    toast.innerHTML = message;
    
    // 加入容器
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }
    
    container.appendChild(toast);
    
    // 3 秒後移除
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ============== 初始化載入購物車 ==============
loadCart();
