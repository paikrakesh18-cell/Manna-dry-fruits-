const defaultProducts = [
    { id: 1, name: "প্রিমিয়াম কাজু বাদাম (Cashew 250g)", category: "Dry Fruits", price: 240, stock: 25, icon: "🥜" },
    { id: 2, name: "ক্যালিফোর্নিয়া আমন্ড (Almond 250g)", category: "Dry Fruits", price: 220, stock: 30, icon: "🌰" },
    { id: 3, name: "আখরোট (Walnut 250g)", category: "Dry Fruits", price: 310, stock: 15, icon: "🧠" },
    { id: 4, name: "কিশমিশ (Raisins 250g)", category: "Dry Fruits", price: 110, stock: 40, icon: "🍇" },
    { id: 5, name: "সবুজ এলাচ (Green Cardamom 50g)", category: "Spices", price: 160, stock: 20, icon: "🌿" },
    { id: 6, name: "লবঙ্গ ও দারুচিনি কম্বো (100g)", category: "Spices", price: 130, stock: 18, icon: "🍂" }
];

let products = JSON.parse(localStorage.getItem('manna_products')) || defaultProducts;
let orders = JSON.parse(localStorage.getItem('manna_orders')) || [];
let offerText = localStorage.getItem('manna_offer') || "🎉 স্পেশাল অফার: ৫০০ টাকার ওপর কেনাকাটায় ১০% ছাড়! দোকানে আসার আগে Pre-Order করে রাখুন।";
let adminPass = localStorage.getItem('manna_admin_pass') || "admin123";
let cart = [];
let currentFilter = 'All';
const CANCEL_LIMIT_MINUTES = 30;

function saveData() {
    localStorage.setItem('manna_products', JSON.stringify(products));
    localStorage.setItem('manna_orders', JSON.stringify(orders));
    localStorage.setItem('manna_offer', offerText);
    localStorage.setItem('manna_admin_pass', adminPass);
}

function showSection(id, btn) {
    document.querySelectorAll('.section').forEach(function(s) { s.classList.remove('active'); });
    document.getElementById(id).classList.add('active');
    if (btn) {
        document.querySelectorAll('nav button').forEach(function(b) { b.classList.remove('active'); });
        btn.classList.add('active');
    }
    renderAll();
}

function accessAdmin(btn) {
    const pass = prompt("Admin Password দিন:");
    if (pass === adminPass) {
        showSection('admin', btn);
    } else if (pass !== null) {
        alert("ভুল পাসওয়ার্ড!");
    }
}

function changeAdminPassword() {
    const newPass = document.getElementById('new-admin-pass').value.trim();
    if (newPass.length < 4) {
        alert("পাসওয়ার্ড কমপক্ষে ৪ অক্ষরের হতে হবে!");
        return;
    }
    adminPass = newPass;
    saveData();
    document.getElementById('new-admin-pass').value = '';
    alert("✅ অ্যাডমিন পাসওয়ার্ড সফলভাবে পরিবর্তন হয়েছে!");
}

function filterProducts(cat, btn) {
    currentFilter = cat;
    document.querySelectorAll('.filters button').forEach(function(b) { b.classList.remove('active'); });
    btn.classList.add('active');
    renderShop();
}

function renderShop() {
    document.getElementById('banner-text').innerText = offerText;
    const grid = document.getElementById('product-grid');
    grid.innerHTML = '';

    const filtered = currentFilter === 'All' ? products : products.filter(function(p) { return p.category === currentFilter; });

    filtered.forEach(function(p) {
        const isAvailable = p.stock > 0;
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = 
            '<div class="card-img">' + (p.icon || '📦') + '</div>' +
            '<div class="card-body">' +
                '<span class="badge ' + (isAvailable ? 'in-stock' : 'out-stock') + '">' +
                    (isAvailable ? '● In Stock' : '● Out of Stock') +
                '</span>' +
                '<span class="badge cat-tag">' + p.category + '</span>' +
                '<h3>' + p.name + '</h3>' +
                '<div class="price">₹' + p.price + '</div>' +
                '<button class="btn btn-primary" ' + (!isAvailable ? 'disabled' : '') + ' onclick="addToCart(' + p.id + ')">' +
                    (isAvailable ? '🛒 Add to Cart' : 'স্টক শেষ') +
                '</button>' +
            '</div>';
        grid.appendChild(card);
    });
}

function addToCart(id) {
    const prod = products.find(function(p) { return p.id === id; });
    const existing = cart.find(function(c) { return c.id === id; });
    if (existing) {
        if (existing.qty < prod.stock) {
            existing.qty++;
        } else {
            alert("দুঃখিত, এর চেয়ে বেশি স্টক নেই!");
            return;
        }
    } else {
        cart.push({ id: prod.id, name: prod.name, price: prod.price, qty: 1 });
    }
    updateCartCount();
    alert('"' + prod.name + '" কার্টে যোগ হয়েছে!');
}

function updateCartCount() {
    document.getElementById('cart-count').innerText = cart.reduce(function(sum, item) { return sum + item.qty; }, 0);
}

function renderCart() {
    const container = document.getElementById('cart-items');
    const checkoutBox = document.getElementById('checkout-box');
    if (cart.length === 0) {
        container.innerHTML = "<p>আপনার কার্ট এখন খালি। শপ থেকে পণ্য যোগ করুন।</p>";
        checkoutBox.style.display = 'none';
        document.getElementById('cart-total').innerText = '0';
        return;
    }
    checkoutBox.style.display = 'block';
    let total = 0;
    let html = '<table><tr><th>পণ্য</th><th>পরিমাণ</th><th>দাম</th><th>বাদ দিন</th></tr>';
    cart.forEach(function(item, index) {
        const sub = item.price * item.qty;
        total += sub;
        html += '<tr><td>' + item.name + '</td><td>' + item.qty + '</td><td>₹' + sub + '</td><td><button class="btn btn-danger" onclick="removeFromCart(' + index + ')">X</button></td></tr>';
    });
    html += '</table>';
    container.innerHTML = html;
    document.getElementById('cart-total').innerText = total;
}

function removeFromCart(idx) {
    cart.splice(idx, 1);
    updateCartCount();
    renderCart();
}

function toggleVisitTime() {
    const type = document.getElementById('order-type').value;
    document.getElementById('visit-time-box').style.display = type === 'Store Visit Pre-Order' ? 'block' : 'none';
    document.getElementById('address-box').style.display = type === 'Home Delivery' ? 'block' : 'none';
}

function placeOrder() {
    const name = document.getElementById('cust-name').value.trim();
    const phone = document.getElementById('cust-phone').value.trim();
    const type = document.getElementById('order-type').value;
    const extra = type === 'Store Visit Pre-Order' 
        ? "সময়: " + (document.getElementById('visit-time').value || "উল্লেখ নেই")
        : "ঠিকানা: " + (document.getElementById('cust-address').value || "উল্লেখ নেই");

    if (!name || !phone) {
        alert("অনুগ্রহ করে আপনার নাম ও মোবাইল নম্বর দিন।");
        return;
    }

    cart.forEach(function(c) {
        const p = products.find(function(prod) { return prod.id === c.id; });
        if (p) p.stock = Math.max(0, p.stock - c.qty);
    });

    const total = cart.reduce(function(sum, i) { return sum + (i.price * i.qty); }, 0);
    const newOrder = {
        id: 'ORD-' + Math.floor(1000 + Math.random() * 9000),
        customer: name,
        phone: phone,
        type: type,
        extra: extra,
        items: cart.slice(),
        total: total,
        timestamp: Date.now(),
        dateStr: new Date().toLocaleDateString(),
        status: 'Confirmed'
    };

    orders.unshift(newOrder);
    cart = [];
    updateCartCount();
    saveData();
    alert('🎉 ধন্যবাদ ' + name + '! আপনার অর্ডার (' + newOrder.id + ') সফলভাবে গৃহীত হয়েছে।');
    showSection('orders', document.getElementById('nav-orders'));
}

function renderCustomerOrders() {
    const list = document.getElementById('customer-orders-list');
    if (orders.length === 0) {
        list.innerHTML = "<p>এখনো কোনো অর্ডার করা হয়নি।</p>";
        return;
    }
    list.innerHTML = orders.map(function(o) {
        const elapsedMins = (Date.now() - o.timestamp) / 60000;
        const canCancel = o.status === 'Confirmed' && elapsedMins <= CANCEL_LIMIT_MINUTES;
        const minsLeft = Math.max(0, Math.ceil(CANCEL_LIMIT_MINUTES - elapsedMins));
        const itemsSummary = o.items.map(function(i) { return i.name + ' (x' + i.qty + ')'; }).join(', ');

        return '<div style="border:1px solid #E0D0C0; padding:12px; border-radius:8px; margin-bottom:10px;">' +
            '<strong>Order ID: ' + o.id + '</strong> | <span style="color:' + (o.status === 'Cancelled' ? 'red' : 'green') + '; font-weight:bold;">' + o.status + '</span><br>' +
            '<small>' + o.type + ' (' + o.extra + ')</small><br>' +
            '<p style="margin:5px 0;">পণ্য: ' + itemsSummary + '</p>' +
            '<strong>মোট: ₹' + o.total + '</strong>' +
            (canCancel ? '<div style="margin-top:8px;"><button class="btn btn-danger" onclick="cancelOrder(\'' + o.id + '\')">❌ Cancel Order (' + minsLeft + ' মিনিট বাকি)</button></div>' : '') +
        '</div>';
    }).join('');
}

function cancelOrder(orderId) {
    if (!confirm("আপনি কি নিশ্চিতভাবে অর্ডারটি ক্যানসেল করতে চান?")) return;
    const order = orders.find(function(o) { return o.id === orderId; });
    if (order && order.status === 'Confirmed') {
        order.status = 'Cancelled';
        order.items.forEach(function(item) {
            const p = products.find(function(prod) { return prod.id === item.id; });
            if (p) p.stock += item.qty;
        });
        saveData();
        renderAll();
        alert("অর্ডার ক্যানসেল করা হয়েছে এবং স্টক আপডেট হয়েছে।");
    }
}

function renderAdmin() {
    const today = new Date().toLocaleDateString();
    const todaysOrders = orders.filter(function(o) { return o.dateStr === today && o.status !== 'Cancelled'; });
    const todaysSales = todaysOrders.reduce(function(sum, o) { return sum + o.total; }, 0);

    document.getElementById('stat-sales').innerText = todaysSales;
    document.getElementById('stat-orders').innerText = todaysOrders.length;
    document.getElementById('stat-products').innerText = products.length;
    document.getElementById('new-offer-input').value = offerText;

    const pList = document.getElementById('admin-product-list');
    pList.innerHTML = products.map(function(p) {
        return '<tr>' +
            '<td>' + p.icon + ' ' + p.name + '</td>' +
                        '<td>' + p.category + '</td>' +
            '<td><input type="number" class="inline-input" value="' + p.price + '" onchange="editProduct(' + p.id + ', \'price\', this.value)"></td>' +
            '<td><input type="number" class="inline-input" value="' + p.stock + '" onchange="editProduct(' + p.id + ', \'stock\', this.value)"></td>' +
            '<td><button class="btn btn-danger" onclick="deleteProduct(' + p.id + ')">Remove</button></td>' +
        '</tr>';
    }).join('');

    const oList = document.getElementById('admin-orders-list');
    oList.innerHTML = orders.map(function(o) {
        return '<tr>' +
            '<td><strong>' + o.id + '</strong><br><small>' + o.dateStr + '</small></td>' +
            '<td>' + o.customer + ' (' + o.phone + ')<br><small>' + o.type + ' - ' + o.extra + '</small></td>' +
            '<td>' + o.items.map(function(i) { return i.name + ' x' + i.qty; }).join('<br>') + '</td>' +
            '<td>₹' + o.total + '</td>' +
            '<td style="color:' + (o.status === 'Cancelled' ? 'red' : 'green') + '; font-weight:bold;">' + o.status + '</td>' +
        '</tr>';
    }).join('');
}

function addProduct() {
    const name = document.getElementById('p-name').value.trim();
    const category = document.getElementById('p-cat').value;
    const price = Number(document.getElementById('p-price').value);
    const stock = Number(document.getElementById('p-stock').value);
    const icon = document.getElementById('p-icon').value || '📦';

    if (!name || price <= 0) {
        alert("সঠিক নাম ও দাম দিন।");
        return;
    }

    products.push({ id: Date.now(), name: name, category: category, price: price, stock: stock, icon: icon });
    saveData();
    renderAdmin();
    document.getElementById('p-name').value = '';
    document.getElementById('p-price').value = '';
    document.getElementById('p-stock').value = '';
    alert("নতুন প্রোডাক্ট যোগ হয়েছে!");
}

function editProduct(id, field, val) {
    const p = products.find(function(prod) { return prod.id === id; });
    if (p) {
        p[field] = Number(val);
        saveData();
        alert("আপডেট সফল হয়েছে!");
    }
}

function deleteProduct(id) {
    if (!confirm("প্রোডাক্টটি ডিলিট করতে চান?")) return;
    products = products.filter(function(p) { return p.id !== id; });
    saveData();
    renderAdmin();
}

function updateOffer() {
    offerText = document.getElementById('new-offer-input').value;
    saveData();
    renderAll();
    alert("অফার ব্যানার আপডেট হয়েছে!");
}

function renderAll() {
    renderShop();
    renderCart();
    renderCustomerOrders();
    renderAdmin();
}

window.onload = function() {
    renderAll();
};

                                         
