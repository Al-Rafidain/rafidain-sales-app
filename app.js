// استيراد أو استخدام Firebase (حسب طريقة ربطك إياها بالـ HTML، هنا نفترض استخدام SDK العادي)
// تأكد أنك معرف firebaseConfig عندك أو مخليه بالصفحة

let currentUser = null;
let userData = {
    coins: 0,
    dailyProfit: 0,
    perDay: 0,
    logs: [],
    rooms: []
};

// تهيئة التطبيق عند الفتح
window.addEventListener('DOMContentLoaded', () => {
    const savedUser = localStorage.getItem('rafidain_user');
    if (savedUser) {
        currentUser = savedUser;
        loadUserDataFromCloud(); // جلب البيانات من Firebase مباشرة
        document.getElementById('registerPage').style.display = 'none';
        document.getElementById('mainApp').style.display = 'block';
        const splash = document.getElementById('splash');
        if(splash) {
            splash.style.opacity = '0';
            setTimeout(() => splash.style.display = 'none', 500);
        }
    } else {
        const splash = document.getElementById('splash');
        if(splash) splash.style.display = 'none';
    }
    initStore();
    initTasks();
});

// إنشاء حساب جديد وحفظه في Firestore
async function createAccount() {
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
    
    await saveUserDataToCloud(); // حفظ البيانات لأول مرة في Firebase
    
    document.getElementById('registerPage').style.display = 'none';
    document.getElementById('mainApp').style.display = 'block';
    updateUI();
}

function logout() {
    localStorage.removeItem('rafidain_user');
    location.reload();
}

// جلب البيانات من قاعدة بيانات Firebase (Firestore)
async function loadUserDataFromCloud() {
    try {
        const docRef = db.collection("users").doc(currentUser);
        const doc = await docRef.get();
        if (doc.exists) {
            userData = doc.data();
        } else {
            // إذا مو موجودة، نخلق وحدة افتراضية
            await saveUserDataToCloud();
        }
        updateUI();
    } catch (error) {
        console.error("خطأ في جلب البيانات:", error);
    }
}

// حفظ البيانات في قاعدة بيانات Firebase (Firestore)
async function saveUserDataToCloud() {
    try {
        await db.collection("users").doc(currentUser).set(userData);
        updateUI();
    } catch (error) {
        console.error("خطأ في حفظ البيانات:", error);
    }
}

// دالة التحديث الشاملة (تستدعي الحفظ بالسحاب تلقائياً)
function saveUserData() {
    saveUserDataToCloud();
}

function updateUI() {
    const setElemText = (id, text) => {
        const el = document.getElementById(id);
        if (el) el.innerText = text;
    };

    setElemText('coins', userData.coins + ' نقطة');
    setElemText('coinsDollar', 'يعادل $' + (userData.coins * 0.001).toFixed(3) + ' دولار');
    setElemText('dailyProfit', userData.dailyProfit + ' نقطة/يوم');
    setElemText('perDay', '+' + userData.perDay + ' نقطة/24 ساعة');
    setElemText('coins2', 'رصيدك: ' + userData.coins + ' نقطة');
    setElemText('coins3', 'رصيدك: ' + userData.coins + ' نقطة');
    setElemText('userName', currentUser);
    setElemText('myReferralCode', 'REF-' + currentUser.toUpperCase());
    setElemText('myReferralLink', 'https://rafidain-app.local/?ref=' + currentUser);
    
    const logList = document.getElementById('logList');
    if (logList) {
        if (userData.logs && userData.logs.length > 0) {
            logList.innerHTML = userData.logs.map(l => `<div class="logItem ${l.type}"><div>${l.text}</div><div style="font-size:10px;color:#888">${l.time}</div></div>`).join('');
        } else {
            logList.innerHTML = '<p style="color:#aaa">لا توجد معاملات مسجلة</p>';
        }
    }
}

function showPage(pageId, element) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const targetPage = document.getElementById(pageId);
    if(targetPage) targetPage.classList.add('active');
    
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
    if (!storeList) return;
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
        showToast('تم الشراء بنجاح وحفظه في السحاب!');
    } else {
        alert('رصيدك غير كافٍ للشراء!');
    }
}

function showToast(msg) {
    const t = document.getElementById('toast');
    if(!t) return;
    t.innerText = msg;
    t.style.display = 'block';
    setTimeout(() => { t.style.display = 'none'; }, 3000);
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if(modal) modal.style.display = 'none';
}

function openXO() {
    const modal = document.getElementById('xoModal');
    if(modal) modal.style.display = 'block';
    initXOBoard();
}

function initXOBoard() {
    const board = document.getElementById('xoBoard');
    if (!board) return;
    board.innerHTML = '';
    for (let i = 0; i < 9; i++) {
        const cell = document.createElement('div');
        cell.className = 'xoCell';
        cell.onclick = () => {
            if (cell.innerText === '') {
                cell.innerText = 'X';
                userData.coins += 10;
                userData.logs.unshift({ text: 'ربح من لعبة XO (+10 نقاط)', type: 'win', time: new Date().toLocaleTimeString() });
                saveUserData();
                const res = document.getElementById('xoResult');
                if(res) res.innerText = 'ربحت 10 نقاط وتم حفظها!';
            }
        };
        board.appendChild(cell);
    }
}

function openDomino() { const m = document.getElementById('dominoModal'); if(m) m.style.display = 'block'; }
function openLudo() { const m = document.getElementById('ludoModal'); if(m) m.style.display = 'block'; }
function spinWheel() { const m = document.getElementById('wheelModal'); if(m) m.style.display = 'block'; }
function openBox() { const m = document.getElementById('boxModal'); if(m) m.style.display = 'block'; }
function openMemory() { const m = document.getElementById('memoryModal'); if(m) m.style.display = 'block'; }

function openGlobalChat() {
    showPage('globalChat', null);
}

function sendGlobalMsg() {
    const input = document.getElementById('globalChatInput');
    if(!input) return;
    const msg = input.value.trim();
    if (!msg) return;
    
    const chatBox = document.getElementById('globalChatBox');
    if(chatBox) {
        chatBox.innerHTML += `<div class="chatMsg me"><b>${currentUser}:</b> ${msg}</div>`;
        chatBox.scrollTop = chatBox.scrollHeight;
    }
    input.value = '';
}

function openCreateRoom() {
    const m = document.getElementById('createRoomModal');
    if(m) m.style.display = 'block';
}

function createRoom() {
    const nameInput = document.getElementById('newRoomName');
    if(!nameInput) return;
    const name = nameInput.value.trim();
    if (!name) return alert('أدخل اسم الغرفة');
    if (userData.coins < 80000) return alert('الرصيد غير كافٍ لإنشاء غرفة');
    
    userData.coins -= 80000;
    userData.rooms.push({ id: Date.now().toString().slice(-4), name: name, owner: currentUser });
    saveUserData();
    closeModal('createRoomModal');
    alert('تم إنشاء الغرفة بنجاح وحفظها!');
}

function initTasks() {
    const tasksDiv = document.getElementById('dailyTasks');
    if (!tasksDiv) return;
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
    showToast('تم استلام مكافأة المهمة وحفظها!');
}

function searchFriends() {
    const queryInput = document.getElementById('searchFriendsInput');
    if(!queryInput) return;
    const query = queryInput.value.trim();
    const results = document.getElementById('searchResults');
    if (!query || !results) return;
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
