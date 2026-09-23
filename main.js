// ============================================
// MANDIMART - COMPLETE JAVASCRIPT
// All interactive features for the marketplace
// ============================================

// ===== DATA STORAGE (Simulated Database) =====
let mandis = [
    {crop:'Tomato', mandi:'Azadpur Mandi', min:1200, max:1800, modal:1500, trend:'up', dist:2.3},
    {crop:'Tomato', mandi:'Ghazipur Mandi', min:1100, max:1700, modal:1400, trend:'down', dist:5.1},
    {crop:'Onion', mandi:'Azadpur Mandi', min:2100, max:2600, modal:2350, trend:'up', dist:2.3},
    {crop:'Onion', mandi:'Keshopur Mandi', min:2000, max:2500, modal:2250, trend:'flat', dist:8.4},
    {crop:'Potato', mandi:'Ghazipur Mandi', min:1400, max:1900, modal:1650, trend:'up', dist:5.1},
    {crop:'Potato', mandi:'Okhla Mandi', min:1350, max:1850, modal:1600, trend:'flat', dist:9.0},
    {crop:'Wheat', mandi:'Narela Mandi', min:2200, max:2450, modal:2325, trend:'up', dist:14.2},
    {crop:'Wheat', mandi:'Karnal Mandi', min:2250, max:2500, modal:2375, trend:'up', dist:120},
    {crop:'Brinjal', mandi:'Azadpur Mandi', min:800, max:1200, modal:1000, trend:'down', dist:2.3},
    {crop:'Carrot', mandi:'Keshopur Mandi', min:1500, max:2000, modal:1750, trend:'up', dist:8.4},
    {crop:'Cauliflower', mandi:'Ghazipur Mandi', min:1800, max:2400, modal:2100, trend:'flat', dist:5.1},
    {crop:'Mango', mandi:'Okhla Mandi', min:3000, max:4500, modal:3750, trend:'up', dist:9.0}
];

let crops = [
    {id:1, name:'Tomato', qty:50, grade:'A', price:1500, img:'🍅', seller:'Ramesh Kumar', rating:4.8},
    {id:2, name:'Onion', qty:120, grade:'B', price:2250, img:'🧅', seller:'Sunita Devi', rating:4.5},
    {id:3, name:'Potato', qty:200, grade:'A', price:1650, img:'🥔', seller:'Gurpreet Singh', rating:4.9}
];

let auctions = [];
let nextCropId = 4;
let nextAuctionId = 1;
let bidTimers = {};

// ===== NAVIGATION =====
function showPage(pageId) {
    const pages = ['home', 'mandi', 'crops', 'auctions', 'compare', 'aicompare', 'admin', 'login'];
    pages.forEach(p => {
        const el = document.getElementById('page-' + p);
        if (el) el.style.display = (p === pageId) ? 'block' : 'none';
    });
}

// ===== MANDI PRICES =====
function loadMandiData() {
    const tbody = document.getElementById('mandiBody');
    if (!tbody) return;
    renderMandiTable(mandis);
}

function renderMandiTable(data) {
    const tbody = document.getElementById('mandiBody');
    if (!tbody) return;
    
    tbody.innerHTML = data.map(m => {
        const icon = m.trend === 'up' ? '<i class="bi bi-arrow-up-right text-danger"></i>' :
                    m.trend === 'down' ? '<i class="bi bi-arrow-down-right text-success"></i>' :
                    '<i class="bi bi-dash text-secondary"></i>';
        return `<tr>
            <td>${m.crop}</td>
            <td>${m.mandi}</td>
            <td>₹${m.min}</td>
            <td>₹${m.max}</td>
            <td><strong>₹${m.modal}</strong></td>
            <td>${icon}</td>
            <td>${m.dist} km</td>
        </tr>`;
    }).join('');
}

function filterMandi() {
    const q = document.getElementById('mandiSearch').value.toLowerCase();
    const filtered = mandis.filter(m => 
        m.crop.toLowerCase().includes(q) || 
        m.mandi.toLowerCase().includes(q)
    );
    renderMandiTable(filtered);
}

function findNearby() {
    const msg = document.getElementById('nearbyMsg');
    msg.style.display = 'block';
    msg.innerHTML = '<i class="bi bi-geo-alt-fill"></i> Nearest mandis: <strong>Azadpur (2.3 km)</strong>, <strong>Ghazipur (5.1 km)</strong>, <strong>Keshopur (8.4 km)</strong>. <em>(Google Maps API in production)</em>';
}

// ===== CROPS =====
async function loadCrops() {
    try {
        const response = await fetch("../backend/get_crops.php", {
            credentials: "include"
        });

        const result = await response.json();

        if (result.success) {
            crops = result.data.map(crop => ({
                id: crop.id,
                name: crop.name,
                qty: crop.quantity,
                grade: crop.grade,
                price: crop.price,
                img: crop.image,
                seller: crop.seller,
                rating: crop.rating
            }));

            renderCrops();
        } else {
            alert("❌ " + result.message);
        }

    } catch (error) {
        console.error(error);
        alert("❌ Failed to load crops.");
    }
}


async function addCrop(event) {
    event.preventDefault();

    const form = document.getElementById("cropForm");
    const formData = new FormData();

    formData.append("name", document.getElementById("cropName").value);
    formData.append("quantity", document.getElementById("cropQty").value);
    formData.append("grade", document.getElementById("cropGrade").value);
    formData.append("price", document.getElementById("cropPrice").value);

    const image = document.getElementById("cropImage").files[0];

    if (image) {
        formData.append("image", image);
    }

    try {
        const response = await fetch("../backend/add_crop.php", {
            method: "POST",
            body: formData,
            credentials: "include"
        });

        const result = await response.json();

        if (result.success) {
            alert("✅ Crop listed successfully!");

            form.reset();

            // Load the newly saved data from MySQL
            loadCrops();
        } else {
            alert("❌ " + result.message);
        }

    } catch (error) {
        console.error(error);
        alert("❌ Could not connect to the server.");
    }

    return false;
}
function contactSeller(seller) {
    toggleChat();
    setTimeout(() => {
        addChatMessage('bot', `Connecting you to ${seller}... 📞 Call: +91 98XXXXXX21 | 💬 Chat available.`);
    }, 400);
}

function placeOrderById(cropId) {

    const crop = crops.find(c => c.id === cropId);

    if (!crop) {
        alert("❌ Crop not found.");
        return;
    }

    const params = new URLSearchParams({
        id: crop.id,
        product: crop.name,
        price: crop.price,
        quantity: crop.qty,
        grade: crop.grade,
        seller: crop.seller,
        rating: crop.rating,
        image: crop.img
    });

    window.location.href = `checkout.html?${params.toString()}`;
}

// ===== AUCTIONS =====
function loadAuctions() {
    renderAuctions();
}

function createAuction(event) {
    event.preventDefault();
    const crop = document.getElementById('aucCrop').value;
    const qty = document.getElementById('aucQty').value;
    const base = document.getElementById('aucBase').value;
    const dur = document.getElementById('aucDur').value;
    
    if (!crop || !qty || !base || !dur) {
        alert('Fill all auction fields');
        return false;
    }
    
    const id = nextAuctionId++;
    const endTime = Date.now() + (parseInt(dur) * 60000);
    
    auctions.push({
        id: id,
        crop: crop,
        qty: parseFloat(qty),
        base: parseFloat(base),
        current: parseFloat(base),
        ends: endTime,
        bids: 0,
        winner: null,
        status: 'live'
    });
    
    startBidTimer(id);
    renderAuctions();
    document.getElementById('auctionForm').reset();
    alert('🎉 Auction started! Buyers can now bid.');
    return false;
}

function startBidTimer(id) {
    bidTimers[id] = setInterval(() => {
        const a = auctions.find(x => x.id === id);
        if (!a) { clearInterval(bidTimers[id]); return; }
        
        if (Date.now() >= a.ends && a.status === 'live') {
            a.status = 'ended';
            clearInterval(bidTimers[id]);
            if (a.winner) {
                alert(`🏆 Auction #${id} ended! Winner: ${a.winner} @ ₹${a.current}/q`);
            }
        }
        renderAuctions();
    }, 1000);
}

function placeBid(id) {
    const a = auctions.find(x => x.id === id);
    if (!a || a.status !== 'live') {
        alert('Auction ended');
        return;
    }
    
    const increment = Math.round(a.current * 0.05);
    a.current += increment;
    a.bids++;
    a.winner = 'Buyer ' + Math.floor(Math.random() * 900 + 100);
    renderAuctions();
}

function renderAuctions() {
    const list = document.getElementById('auctionList');
    if (!list) return;
    
    list.innerHTML = auctions.map(a => {
        const left = Math.max(0, Math.ceil((a.ends - Date.now()) / 1000));
        const mm = String(Math.floor(left / 60)).padStart(2, '0');
        const ss = String(left % 60).padStart(2, '0');
        const statusBadge = a.status === 'live' 
            ? '<span class="auction-live">LIVE</span>' 
            : '<span class="auction-ended">ENDED</span>';
        
        return `<div class="col-md-6">
            <div class="card auction-card">
                <div class="d-flex justify-content-between">
                    <span class="fw-bold">${a.crop} (${a.qty} q)</span>
                    ${statusBadge}
                </div>
                <div class="small text-muted">Base ₹${a.base}/q · Current: <strong class="text-success">₹${a.current}/q</strong></div>
                <div class="small">Bids: ${a.bids} ${a.winner ? '· Winner: ' + a.winner : ''}</div>
                <div class="progress mt-2">
                    <div class="progress-bar" style="width:${a.status === 'live' ? 60 : 100}%"></div>
                </div>
                <div class="timer mb-2">⏱ ${mm}:${ss}</div>
                ${a.status === 'live' 
                    ? `<button class="btn btn-mandi btn-sm" onclick="placeBid(${a.id})">Place Bid (+5%)</button>`
                    : '<span class="text-muted small">Auction closed</span>'}
            </div>
        </div>`;
    }).join('');
}

// ===== PRODUCT COMPARISON =====
// ============================================
// PRODUCT COMPARISON
// ============================================

function populateCompare() {

    const selectA = document.getElementById("compA");
    const selectB = document.getElementById("compB");

    if (!selectA || !selectB) {
        console.error("compA or compB not found");
        return;
    }

    const options = crops.map(c => `
        <option value="${c.id}">
            ${c.name} — ${c.seller}
        </option>
    `).join("");

    selectA.innerHTML =
        `<option value="">Select Product A</option>${options}`;

    selectB.innerHTML =
        `<option value="">Select Product B</option>${options}`;

    // Automatically select second product for B
    if (crops.length > 1) {
        selectB.value = crops[1].id;
    }

    // IMPORTANT
    selectA.onchange = compareProducts;
    selectB.onchange = compareProducts;

    compareProducts();
}


function compareProducts() {

    const selectA = document.getElementById("compA");
    const selectB = document.getElementById("compB");
    const result = document.getElementById("compareResult");

    if (!selectA || !selectB || !result) {
        console.error("Comparison HTML elements missing");
        return;
    }

    const idA = selectA.value;
    const idB = selectB.value;

    if (!idA || !idB) {

        result.innerHTML = `
            <div class="alert alert-info text-center">
                Please select two products to compare.
            </div>
        `;

        return;
    }

    const A = crops.find(c => String(c.id) === String(idA));
    const B = crops.find(c => String(c.id) === String(idB));

    if (!A || !B) {
        result.innerHTML = `
            <div class="alert alert-danger">
                Product data not found.
            </div>
        `;
        return;
    }

    if (A.id === B.id) {
        result.innerHTML = `
            <div class="alert alert-warning text-center">
                Please select two different products.
            </div>
        `;
        return;
    }

    const scoreA =
        Number(A.rating) * 10 +
        (A.grade === "A" ? 3 : 0);

    const scoreB =
        Number(B.rating) * 10 +
        (B.grade === "A" ? 3 : 0);

    const best = scoreA >= scoreB ? A : B;

    result.innerHTML = `

        <div class="card shadow-lg border-0">

            <div class="card-header bg-success text-white text-center p-3">
                <h4 class="mb-0">
                    ${A.name} vs ${B.name}
                </h4>
            </div>

            <div class="card-body">

                <div class="table-responsive">

                    <table class="table table-bordered table-hover text-center">

                        <thead class="table-light">

                            <tr>
                                <th>Attribute</th>
                                <th>
                                    ${A.name}<br>
                                    <small>${A.seller}</small>
                                </th>
                                <th>
                                    ${B.name}<br>
                                    <small>${B.seller}</small>
                                </th>
                            </tr>

                        </thead>

                        <tbody>

                            <tr>
                                <th>Price (₹/q)</th>
                                <td>₹${A.price}</td>
                                <td>₹${B.price}</td>
                            </tr>

                            <tr>
                                <th>Quality Grade</th>
                                <td>${A.grade}</td>
                                <td>${B.grade}</td>
                            </tr>

                            <tr>
                                <th>Quantity</th>
                                <td>${A.qty} q</td>
                                <td>${B.qty} q</td>
                            </tr>

                            <tr>
                                <th>Seller Rating</th>
                                <td>${A.rating} ⭐</td>
                                <td>${B.rating} ⭐</td>
                            </tr>

                            <tr>
                                <th>Seller</th>
                                <td>${A.seller}</td>
                                <td>${B.seller}</td>
                            </tr>

                        </tbody>

                    </table>

                </div>

                <div class="alert alert-success text-center mt-4">

                    <h5>🏆 Recommended Product</h5>

                    <strong>
                        ${best.name} from ${best.seller}
                    </strong>

                    <br>

                    <small>
                        Recommended based on quality grade and seller rating.
                    </small>

                </div>

            </div>

        </div>
    `;
}

/**
 * ============================================
 * AI VEGETABLE COMPARISON
 * Connects directly to the Python Flask API
 * ============================================
 *
 * Set this to wherever your Flask app (ai_api/app.py) is running:
 *  - Testing on your own PC:      "http://localhost:5000"
 *  - Deployed on Render, etc:     "https://your-service-name.onrender.com"
 */
const API_BASE_URL = "https://sujalgupta5508-jpg-xxxxx-5000.app.github.dev/compare";


// ============================================================
// IMAGE PREVIEW
// ============================================================

function loadImage(fileId, imgId, dzId) {
    const input = document.getElementById(fileId);
    const preview = document.getElementById(imgId);
    const dropZone = dzId ? document.getElementById(dzId) : null;

    if (!input || !preview) return;

    const file = input.files[0];
    if (!file) {
        preview.src = '';
        preview.style.display = 'none';
        return;
    }

    if (!file.type.startsWith('image/')) {
        alert('Please select a valid image.');
        input.value = '';
        return;
    }

    if (file.size > 5 * 1024 * 1024) {
        alert('Image must be smaller than 5 MB.');
        input.value = '';
        return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
        preview.src = e.target.result;
        preview.style.display = 'block';

        if (dropZone) {
            dropZone.classList.add('has-image');
            const icon = dropZone.querySelector('.upload-icon');
            if (icon) icon.style.display = 'none';
        }
    };
    reader.readAsDataURL(file);
}

// ============================================================
// RUN AI COMPARISON
// ============================================================

async function runAICompare() {
    const file1Input = document.getElementById('file1');
    const file2Input = document.getElementById('file2');
    const resultBox = document.getElementById('aiResult');

    if (!file1Input || !file2Input || !resultBox) {
        console.error('AI comparison elements not found.');
        return;
    }

    const file1 = file1Input.files[0];
    const file2 = file2Input.files[0];

    if (!file1 || !file2) {
        alert('Please upload BOTH vegetable images first.');
        return;
    }

    if (!file1.type.startsWith('image/') || !file2.type.startsWith('image/')) {
        alert('Both files must be valid images.');
        return;
    }

    if (file1.size > 5 * 1024 * 1024 || file2.size > 5 * 1024 * 1024) {
        alert('Each image must be smaller than 5 MB.');
        return;
    }

    resultBox.innerHTML = `
        <div class="text-center py-5">
            <div class="spinner-border text-success" style="width:3rem;height:3rem;"></div>
            <h5 class="mt-3">🤖 AI is analyzing the vegetables...</h5>
            <p class="text-muted">Comparing freshness, color, texture, defects and overall quality.</p>
        </div>
    `;

    const formData = new FormData();
    formData.append('image1', file1);
    formData.append('image2', file2);

    const API_URL = `${API_BASE_URL}/compare`;

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error(`AI server returned HTTP ${response.status}`);
        }

        const result = await response.json();

        if (!result.success) {
            throw new Error(result.message || 'AI comparison failed.');
        }

        displayAIResults(result.data);

    } catch (error) {
        console.error('MandiMart AI Error:', error);

        resultBox.innerHTML = `
            <div class="alert alert-danger">
                <h5>❌ AI comparison failed</h5>
                <p>Could not connect to the MandiMart AI server.</p>
                <hr>
                <p class="mb-1"><strong>API URL:</strong></p>
                <code>${API_URL}</code>
                <br><br>
                <p class="mb-1"><strong>Error:</strong></p>
                <small>${error.message}</small>
                <br><br>
                <button class="btn btn-success" onclick="runAICompare()">🔄 Try Again</button>
            </div>
        `;
    }
}

// ===== LOGIN / REGISTER =====
function showTab(tab, el) {
    document.querySelectorAll('.nav-pills-mandi .nav-link').forEach(x => x.classList.remove('active'));
    if (el) el.classList.add('active');
    
    document.getElementById('loginTab').style.display = tab === 'login' ? 'block' : 'none';
    document.getElementById('registerTab').style.display = tab === 'register' ? 'block' : 'none';
}

function doLogin(event) {
    event.preventDefault();
    const form = document.getElementById('loginForm');
    const formData = new FormData(form);
    
    fetch('../backend/login.php', {
        method: 'POST',
        body: formData
    })
    .then(r => r.json())
    .then(data => {
        if (data.success) {
            alert('✅ Login successful!');
            window.location.href = 'index.html';
        } else {
            alert('❌ ' + data.message);
        }
    })
    .catch(err => {
        // Demo mode - no backend
        alert('🔐 Demo Login: Welcome back!');
        window.location.href = 'index.html';
    });
    return false;
}

function doRegister(event) {
    event.preventDefault();
    const form = document.getElementById('registerForm');
    const formData = new FormData(form);
    
    fetch('../backend/register.php', {
        method: 'POST',
        body: formData
    })
    .then(r => r.json())
    .then(data => {
        if (data.success) {
            alert('✅ Account created! Please login.');
            showTab('login', null);
        } else {
            alert('❌ ' + data.message);
        }
    })
    .catch(err => {
        alert('📝 Demo Register: Account created!');
        showTab('login', null);
    });
    return false;
}

function logout() {
    fetch('../backend/logout.php')
    .then(() => {
        alert('👋 Logged out successfully');
        window.location.href = 'index.html';
    })
    .catch(() => {
        window.location.href = 'index.html';
    });
}

// ===== ADMIN =====
function loadAdminData() {
    updateAdminStats();
    adminTab('users', document.querySelector('.nav-pills-mandi .nav-link'));
}

function updateAdminStats() {
    const usersEl = document.getElementById('adUsers');
    const cropsEl = document.getElementById('adCrops');
    const auctionsEl = document.getElementById('adAuctions');
    const valueEl = document.getElementById('adValue');
    
    if (usersEl) usersEl.textContent = (1200 + crops.length * 7).toLocaleString();
    if (cropsEl) cropsEl.textContent = crops.length;
    if (auctionsEl) auctionsEl.textContent = auctions.length;
    if (valueEl) valueEl.textContent = '₹' + (21000000 + crops.reduce((s, c) => s + c.price * c.qty, 0)).toLocaleString('en-IN');
}

function adminTab(tab, el) {
    document.querySelectorAll('.nav-pills-mandi .nav-link').forEach(x => x.classList.remove('active'));
    if (el) el.classList.add('active');
    renderAdminTable(tab);
}

function renderAdminTable(tab) {
    const container = document.getElementById('adminTable');
    if (!container) return;
    
    if (tab === 'users') {
        container.innerHTML = `
            <table class="table table-striped">
                <thead><tr><th>ID</th><th>Name</th><th>Role</th><th>Status</th><th>Action</th></tr></thead>
                <tbody>
                    <tr><td>1</td><td>Ramesh Kumar</td><td>Farmer</td><td><span class="badge bg-success">Active</span></td><td><button class="btn btn-sm btn-outline-danger">Suspend</button></td></tr>
                    <tr><td>2</td><td>Sunita Devi</td><td>Farmer</td><td><span class="badge bg-success">Active</span></td><td><button class="btn btn-sm btn-outline-danger">Suspend</button></td></tr>
                    <tr><td>3</td><td>Gurpreet Singh</td><td>Farmer</td><td><span class="badge bg-warning">Pending</span></td><td><button class="btn btn-sm btn-outline-success">Verify</button></td></tr>
                </tbody>
            </table>`;
    } else if (tab === 'crops') {
        container.innerHTML = `
            <table class="table table-striped">
                <thead><tr><th>Crop</th><th>Qty</th><th>Grade</th><th>Price</th><th>Status</th></tr></thead>
                <tbody>
                    ${crops.map(c => `<tr><td>${c.name}</td><td>${c.qty} q</td><td>${c.grade}</td><td>₹${c.price}</td><td><span class="badge bg-success">Listed</span></td></tr>`).join('')}
                </tbody>
            </table>`;
    } else {
        container.innerHTML = `
            <table class="table table-striped">
                <thead><tr><th>ID</th><th>Type</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead>
                <tbody>
                    <tr><td>TX-1001</td><td>Tomato Sale</td><td>₹75,000</td><td><span class="badge bg-success">Completed</span></td><td>2026-09-02</td></tr>
                    <tr><td>TX-1002</td><td>Onion Sale</td><td>₹2,70,000</td><td><span class="badge bg-success">Completed</span></td><td>2026-09-01</td></tr>
                </tbody>
            </table>`;
    }
}

// ===== CHATBOT =====
function toggleChat() {
    const box = document.getElementById('chatBox');
    if (box) box.classList.toggle('open');
}

function addChatMessage(who, text) {
    const body = document.getElementById('chatBody');
    if (!body) return;
    body.innerHTML += `<div class="msg ${who}">${text}</div>`;
    body.scrollTop = body.scrollHeight;
}

function getBotReply(q) {
    q = q.toLowerCase();
    if (q.includes('price') || q.includes('rate') || q.includes('mandi'))
        return '📊 Today\'s Tomato at Azadpur: <strong>₹1,500/q</strong>. Onion: ₹2,350/q. Check <a href="mandi.html">Mandi Prices</a>!';
    if (q.includes('auction'))
        return '🔨 Visit <a href="auctions.html">Auctions</a>. Farmers create, buyers bid +5%, highest wins!';
    if (q.includes('crop') || q.includes('list'))
        return '🌾 Go to <a href="crops.html">Crops</a> to list produce with quantity, grade, and price.';
    if (q.includes('quality') || q.includes('compare'))
        return '🧪 Use <a href="aicompare.html">AI Compare</a> to upload vegetable images for quality scoring.';
    if (q.includes('tip') || q.includes('farm'))
        return '🌱 Tip: Store tomatoes at 12°C, 85% humidity. Grade before listing for better prices!';
    if (q.includes('hello') || q.includes('hi') || q.includes('namaste'))
        return '🙏 Namaste! Ask about prices, auctions, crops, or farming tips.';
    return '🤖 I can help with prices, auctions, crops, quality compare, and farming tips. Try "tomato price"!';
}

function sendChat() {
    const input = document.getElementById('chatInput');
    const q = input.value.trim();
    if (!q) return;
    
    addChatMessage('user', q);
    input.value = '';
    
    setTimeout(() => {
        addChatMessage('bot', getBotReply(q));
    }, 500);
}

// ===== DRAG & DROP =====
document.addEventListener('DOMContentLoaded', () => {
    ['dz1', 'dz2'].forEach(id => {
        const dz = document.getElementById(id);
        if (!dz) return;
        
        dz.addEventListener('dragover', (e) => {
            e.preventDefault();
            dz.classList.add('drag');
        });
        
        dz.addEventListener('dragleave', () => {
            dz.classList.remove('drag');
        });
        
        dz.addEventListener('drop', (e) => {
            e.preventDefault();
            dz.classList.remove('drag');
            // Handle file drop
        });
    });
});

// ===== INITIALIZE =====
console.log('🌾 MandiMart loaded successfully!');


function displayAIResults(data) {
    const resultDiv = document.getElementById('aiResult');
    
    const veg1 = data.vegetable_1;
    const veg2 = data.vegetable_2;
    const winner = data.winner;
    const winnerName = data.winner_name;
    const margin = data.margin;
    
    // Determine winner styling
    const veg1Class = winner === 1 ? 'winner-card' : '';
    const veg2Class = winner === 2 ? 'winner-card' : '';
    const veg1Badge = winner === 1 ? '<span class="winner-badge"><i class="bi bi-trophy"></i> WINNER</span>' : '';
    const veg2Badge = winner === 2 ? '<span class="winner-badge"><i class="bi bi-trophy"></i> WINNER</span>' : '';
    
    // Grade color mapping
    const gradeColor = (grade) => {
        const colors = {
            'A+': '#28a745', 'A': '#20c997', 'B': '#6c757d',
            'C': '#fd7e14', 'D': '#ffc107', 'F': '#dc3545'
        };
        return colors[grade] || '#6c757d';
    };
    
    resultDiv.innerHTML = `
        <div class="comparison-results">
            
            <!-- Result Header -->
            <div class="result-header mb-4">
                <h4><i class="bi bi-cpu"></i> AI Analysis Complete</h4>
                <div class="winner-announcement" style="background: linear-gradient(90deg, #145a24, #2e9e4f); color: white; padding: 1rem; border-radius: 12px; text-align: center;">
                    <div style="font-size: 1.5rem; font-weight: 800;">
                        <i class="bi bi-trophy-fill"></i> ${winnerName} Wins!
                    </div>
                    <div style="opacity: 0.9; margin-top: 0.5rem;">
                        By ${margin}% quality margin
                    </div>
                </div>
            </div>
            
            <!-- Side by Side Comparison -->
            <div class="row g-4">
                
                <!-- Vegetable 1 -->
                <div class="col-md-6">
                    <div class="result-card ${veg1Class}" style="position: relative;">
                        ${veg1Badge}
                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <h5 class="mb-0">Vegetable 1</h5>
                            <span class="grade-badge" style="background: ${gradeColor(veg1.quality_grade)}; color: white; padding: 0.3rem 0.8rem; border-radius: 20px; font-weight: 700;">
                                Grade ${veg1.quality_grade}
                            </span>
                        </div>
                        
                        <div class="score-big" style="font-size: 3rem; font-weight: 800; color: var(--green); text-align: center; margin: 1rem 0;">
                            ${veg1.overall_score}<small style="font-size: 1rem; color: #6b7a66;">/100</small>
                        </div>
                        
                        <div class="score-breakdown">
                            ${renderScoreBar('Freshness', veg1.freshness_score, '#28a745')}
                            ${renderScoreBar('Color', veg1.color_score, '#17a2b8')}
                            ${renderScoreBar('Texture', veg1.texture_score, '#6f42c1')}
                            ${renderScoreBar('No Defects', veg1.defect_score, '#fd7e14')}
                            ${renderScoreBar('Size/Shape', veg1.size_score, '#20c997')}
                        </div>
                        
                        <div class="mt-3 small text-muted">
                            <i class="bi bi-clock-history"></i> Est. shelf life: ${veg1.estimated_shelf_life_days || '~'} days
                        </div>
                    </div>
                </div>
                
                <!-- Vegetable 2 -->
                <div class="col-md-6">
                    <div class="result-card ${veg2Class}" style="position: relative;">
                        ${veg2Badge}
                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <h5 class="mb-0">Vegetable 2</h5>
                            <span class="grade-badge" style="background: ${gradeColor(veg2.quality_grade)}; color: white; padding: 0.3rem 0.8rem; border-radius: 20px; font-weight: 700;">
                                Grade ${veg2.quality_grade}
                            </span>
                        </div>
                        
                        <div class="score-big" style="font-size: 3rem; font-weight: 800; color: var(--green); text-align: center; margin: 1rem 0;">
                            ${veg2.overall_score}<small style="font-size: 1rem; color: #6b7a66;">/100</small>
                        </div>
                        
                        <div class="score-breakdown">
                            ${renderScoreBar('Freshness', veg2.freshness_score, '#28a745')}
                            ${renderScoreBar('Color', veg2.color_score, '#17a2b8')}
                            ${renderScoreBar('Texture', veg2.texture_score, '#6f42c1')}
                            ${renderScoreBar('No Defects', veg2.defect_score, '#fd7e14')}
                            ${renderScoreBar('Size/Shape', veg2.size_score, '#20c997')}
                        </div>
                        
                        <div class="mt-3 small text-muted">
                            <i class="bi bi-clock-history"></i> Est. shelf life: ${veg2.estimated_shelf_life_days || '~'} days
                        </div>
                    </div>
                </div>
                
            </div>
            
            <!-- Recommendation -->
            <div class="alert alert-success mt-4" style="border: none; background: linear-gradient(90deg, #d4edda, #c3e6cb);">
                <i class="bi bi-lightbulb-fill" style="color: #155724;"></i>
                <strong style="color: #155724;">AI Recommendation:</strong>
                <p class="mb-0 mt-2" style="color: #155724;">${data.recommendation}</p>
                <p class="mb-0 small" style="color: #155724; opacity: 0.8;">
                    <i class="bi bi-cash-coin"></i> ${data.market_value}
                </p>
            </div>
            
            <!-- Comparison Details -->
            ${data.summary ? renderComparisonDetails(data.summary) : ''}
            
            ${data.note ? `
            <div class="alert alert-warning mt-3">
                <i class="bi bi-info-circle"></i> ${data.note}
            </div>
            ` : ''}
            
        </div>
    `;
}

/**
 * Render a score progress bar
 */
function renderScoreBar(label, score, color) {
    const percentage = Math.min(100, Math.max(0, score));
    return `
        <div class="score-row mb-2">
            <div class="d-flex justify-content-between small mb-1">
                <span>${label}</span>
                <span style="font-weight: 600;">${score}%</span>
            </div>
            <div class="progress" style="height: 8px; border-radius: 4px;">
                <div class="progress-bar" style="width: ${percentage}%; background: ${color};"></div>
            </div>
        </div>
    `;
}

/**
 * Render detailed comparison summary
 */
function renderComparisonDetails(summary) {
    if (!summary.key_differences || summary.key_differences.length === 0) return '';
    
    return `
        <div class="card mt-3 p-3">
            <h6><i class="bi bi-list-check"></i> Detailed Comparison</h6>
            <ul class="list-unstyled mb-0">
                ${summary.key_differences.map(diff => `
                    <li><i class="bi bi-check-circle text-success"></i> ${diff}</li>
                `).join('')}
            </ul>
            <div class="mt-2 p-2" style="background: #f8f9fa; border-radius: 8px;">
                <small><strong>Buyer Advice:</strong> ${summary.buyer_advice}</small>
            </div>
        </div>
    `;
}

/**
 * Reset comparison form
 */
function resetComparison() {
    document.getElementById('file1').value = '';
    document.getElementById('file2').value = '';
    document.getElementById('img1').style.display = 'none';
    document.getElementById('img2').style.display = 'none';
    document.getElementById('aiResult').innerHTML = '';
    
    // Reset drop zones
    ['dz1', 'dz2'].forEach(id => {
        const dz = document.getElementById(id);
        if (dz) {
            dz.classList.remove('has-image');
            const icon = dz.querySelector('.upload-icon');
            const text = dz.querySelector('div:not(:has(img))');
            if (icon) icon.style.display = 'block';
            if (text) text.style.display = 'block';
        }
    });
}
// Add CSS for winner styling
const winnerStyles = document.createElement('style');
winnerStyles.textContent = `
    .winner-card {
        border: 3px solid #f5a623 !important;
        box-shadow: 0 0 20px rgba(245, 166, 35, 0.3) !important;
    }
    .winner-badge {
        position: absolute;
        top: -10px;
        right: 10px;
        background: linear-gradient(90deg, #f5a623, #ff8c00);
        color: white;
        padding: 0.4rem 1rem;
        border-radius: 20px;
        font-weight: 700;
        font-size: 0.85rem;
        box-shadow: 0 4px 12px rgba(245, 166, 35, 0.4);
    }
`;
document.head.appendChild(winnerStyles);
