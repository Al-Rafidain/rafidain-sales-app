let currentUser = null;
let userData = {
    coins: 0,
    dailyProfit: 0,
    perDay: 0,
    logs: [],
    rooms: []
};

window.addEventListener('DOMContentLoaded', () => {
    const savedUser = localStorage.getItem('rafidain_user');
    if (savedUser) {
        currentUser = savedUser;
        loadUserData();
        document.getElementById('registerPage').style.display = 'none';
        document.getElementById('mainApp').style.display = 'block';
        document.getElementById('splash').style.opacity = '0';
        setTimeout(() => document.getElementById('splash').style.display = 'none', 500);
    } else {
        document.getElementById('splash').style.display = 'none';
    }
    initStore();
    initTasks();
});

function createAccount() {
    const name = document.getElementById('regName').value.trim();
    const pass = document.getElementById('regPass').value.trim();
    if (!name || !pass) {
        alert('الرجاء إدخال الاسم وكلمة السر');
        return;
    }
    currentUser = name;
    localStorage.setItem('rafidain_user', currentUser);
    
    userData = {
        coins: 100,
        dailyProfit: 10,
        perDay: 10,
        logs: [{ text: 'إنشاء حساب جديد وحصول على مكافأة', type: 'win', time: new Date().toLocaleTimeString() }],
        rooms: []
    };
    saveUserData();
    
    document.getElementById('registerPage').style.display = 'none';
    document.getElementById('mainApp').style.display = 'block';
    updateUI();
}

function logout() {
    localStorage.removeItem('rafidain_user');
    location.reload();
}

function loadUserData() {
    const data = localStorage.getItem('rafidain_data_' + currentUser);
    if (data) {
        userData = JSON.parse(data);
    }
    updateUI();
}

function saveUserData() {
    localStorage.setItem('rafidain_data_' + currentUser, JSON.stringify(userData));
    updateUI();
}

function updateUI() {
    document.getElementById('coins').innerText = userData.coins + ' نقطة';
    document.getElementById('coinsDollar').innerText = 'يعادل $' + (userData.coins * 0.001).toFixed(3) + ' دولار';
    document.getElementById('dailyProfit').innerText = userData.dailyProfit + ' نقطة/يوم';
    document.getElementById('perDay').innerText = '+' + userData.perDay + ' نقطة/24 ساعة';
    document.getElementById('coins2').innerText = 'رصيدك: ' + userData.coins + ' نقطة';
    document.getElementById('coins3').innerText = 'رصيدك: ' + userData.coins + ' نقطة';
    document.getElementById('userName').innerText = currentUser;
    document.getElementById('myReferralCode').innerText = 'REF-' + currentUser.toUpperCase();
    document.getElementById('myReferralLink').innerText = 'https://rafidain-app.local/?ref=' + currentUser;
    
    const logList = document.getElementById('logList');
    if (userData.logs && userData.logs.length > 0) {
        logList.innerHTML = userData.logs.map(l => `<div class="logItem ${l.type}"><div>${l.text}</div><div style="font-size:10px;color:#888">${l.time}</div></div>`).join('');
    } else {
        logList.innerHTML = '<p style="color:#aaa">لا توجد معاملات مسجلة</p>';
    }
}

function showPage(pageId, element) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
    
    if (element) {
        document.querySelectorAll('.navItem').forEach(n => n.classList.remove('active'));
        element.classList.add('active');
    }
}

const storeItems = [
    { id: 1, name: 'عداد برونزي', price: 500, profit: 50 },
    { id: 2, name: 'عداد فضي', price: 2000, profit: 250 },
    { id: 3, name: 'عداد ذهبي', price: 10000, profit: 1500 }
];

function initStore() {
    const storeList = document.getElementById('storeList');
    storeList.innerHTML = storeItems.map(item => `
        <div class="box">
            <h3>${item.name}</h3>
            <p>الإنتاج: +${item.profit} نقطة/يوم</p>
            <p>السعر: ${item.price} نقطة</p>
            <button class="btn btn-green" onclick="buyItem(${item.id})">شراء</button>
        </div>
    `).join('');
}

function buyItem(id) {
    const item = storeItems.find(i => i.id === id);
    if (userData.coins >= item.price) {
        userData.coins -= item.price;
        userData.perDay += item.profit;
        userData.dailyProfit += item.profit;
        userData.logs.unshift({ text: `شراء ${item.name} مقابل ${item.price} نقطة`, type: 'buy', time: new Date().toLocaleTimeString() });
        saveUserData();
        showToast('تم الشراء بنجاح!');
    } else {
        alert('رصيدك غير كافٍ للشراء!');
    }
}

function showToast(msg) {
    const t = document.getElementById('toast');
    t.innerText = msg;
    t.style.display = 'block';
    setTimeout(() => { t.style.display = 'none'; }, 3000);
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

function openXO() {
    document.getElementById('xoModal').style.display = 'block';
    initXOBoard();
}

function initXOBoard() {
    const board = document.getElementById('xoBoard');
    board.innerHTML = '';
    for (let i = 0; i < 9; i++) {
        const cell = document.createElement('div');
        cell.className = 'xoCell';
        cell.onclick = () => {
            if (cell.innerText === '') {
                cell.innerText = 'X';
                userData.coins += 10;
                saveUserData();
                document.getElementById('xoResult').innerText = 'ربحت 10 نقاط!';
            }
        };
        board.appendChild(cell);
    }
}

function openDomino() { document.getElementById('dominoModal').style.display = 'block'; }
function openLudo() { document.getElementById('ludoModal').style.display = 'block'; }
function spinWheel() { document.getElementById('wheelModal').style.display = 'block'; }
function openBox() { document.getElementById('boxModal').style.display = 'block'; }
function openMemory() { document.getElementById('memoryModal').style.display = 'block'; }

function openGlobalChat() {
    showPage('globalChat', null);
}

function sendGlobalMsg() {
    const input = document.getElementById('globalChatInput');
    const msg = input.value.trim();
    if (!msg) return;
    
    const chatBox = document.getElementById('globalChatBox');
    chatBox.innerHTML += `<div class="chatMsg me"><b>${currentUser}:</b> ${msg}</div>`;
    input.value = '';
    chatBox.scrollTop = chatBox.scrollHeight;
}

function openCreateRoom() {
    document.getElementById('createRoomModal').style.display = 'block';
}

function createRoom() {
    const name = document.getElementById('newRoomName').value.trim();
    if (!name) return alert('أدخل اسم الغرفة');
    if (userData.coins < 80000) return alert('الرصيد غير كافٍ لإنشاء غرفة');
    
    userData.coins -= 80000;
    userData.rooms.push({ id: Date.now().toString().slice(-4), name: name, owner: currentUser });
    saveUserData();
    closeModal('createRoomModal');
    alert('تم إنشاء الغرفة بنجاح!');
}

function initTasks() {
    const tasksDiv = document.getElementById('dailyTasks');
    tasksDiv.innerHTML = `
        <div class="box">
            <h3>تسجيل الدخول اليومي</h3>
            <button class="btn btn-blue" onclick="claimTask()">استلام 50 نقطة</button>
        </div>
    `;
}

function claimTask() {
    userData.coins += 50;
    userData.logs.unshift({ text: 'إنجاز مهمة يومية وحصول على 50 نقطة', type: 'win', time: new Date().toLocaleTimeString() });
    saveUserData();
    showToast('تم استلام مكافأة المهمة!');
}

function searchFriends() {
    const query = document.getElementById('searchFriendsInput').value.trim();
    const results = document.getElementById('searchResults');
    if (!query) return;
    results.innerHTML = `<div class="userItem"><span>${query}</span> <button class="btn btn-blue" style="width:auto;padding:8px" onclick="showToast('تم إرسال طلب الاضافة')">إضافة</button></div>`;
}

function copyCode() {
    navigator.clipboard.writeText('REF-' + currentUser.toUpperCase());
    showToast('تم نسخ رمز الإحالة!');
}

function copyLink() {
    navigator.clipboard.writeText('https://rafidain-app.local/?ref=' + currentUser);
    showToast('تم نسخ الرابط!');
}

function clearLog() {
    userData.logs = [];
    saveUserData();
    updateUI();
}

