let activeUser = localStorage.getItem('activeUser') || null;
let currentGeneratedPlan = null;

document.addEventListener('DOMContentLoaded', () => {
    updateUI();
    goHome();
});

// --- 1. СИСТЕМНІ ПОВІДОМЛЕННЯ ТА ДОПОМІЖНІ ФУНКЦІЇ ---
function notify(msg, isError = false) {
    const t = document.getElementById('toast');
    if (!t) return;
    t.textContent = msg;
    t.style.background = isError ? "#ff4d4d" : "#dfc89a";
    t.style.color = isError ? "#fff" : "#000";
    t.style.display = 'block';
    setTimeout(() => t.style.display = 'none', 3000);
}

function togglePasswordVisibility(inputId) {
    const input = document.getElementById(inputId);
    if (!input) return;
    if (input.type === "password") {
        input.type = "text";
        event.target.textContent = "🙈";
    } else {
        input.type = "password";
        event.target.textContent = "👁️";
    }
}

function clearAllForms() {
    const fields = [
        'userName', 'userAge', 'userWeight', 'userHeight',
        'loginUsername', 'loginPassword', 'regUsername', 'regPassword'
    ];
    fields.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
    const level = document.getElementById('userLevel');
    if (level) level.value = 'beginner';

    const pBox = document.getElementById('programBox');
    if (pBox) pBox.style.display = 'none';
}

// --- 2. НАВІГАЦІЯ ---
function goHome() {
    activeUser ? showSection('dashboard') : showSection('about');
}

function showSection(id) {
    const ids = ['about', 'auth', 'profile', 'home', 'saved', 'dashboard'];
    ids.forEach(x => {
        const el = document.getElementById(x);
        if(el) el.style.display = (x === id ? 'block' : 'none');
    });

    if (id === 'profile') loadProfile();
    if (id === 'saved') renderSaved();
    if (id === 'dashboard') updateDashboardUI();
}

function handleStartClick() {
    activeUser ? checkProfileBeforeHome() : showSection('auth');
}

function checkProfileBeforeHome() {
    let user = JSON.parse(localStorage.getItem('users'))[activeUser];
    if (!user.profile?.name) {
        notify("Спочатку заповніть профіль!", true);
        showSection('profile');
    } else {
        showSection('home');
        toggleSplit();
    }
}

// --- 3. АВТОРИЗАЦІЯ ---
function loginUser() {
    const email = document.getElementById('loginUsername').value.trim();
    const pass = document.getElementById('loginPassword').value;
    let users = JSON.parse(localStorage.getItem('users')) || {};

    if (users[email] && users[email].password === pass) {
        activeUser = email;
        localStorage.setItem('activeUser', email);
        clearAllForms();
        updateUI();
        goHome();
    } else { notify("Невірний логін або пароль!", true); }
}

function registerUser() {
    const email = document.getElementById('regUsername').value.trim();
    const pass = document.getElementById('regPassword').value;
    if (!email || pass.length < 6) return notify("Пароль від 6 символів", true);

    let users = JSON.parse(localStorage.getItem('users')) || {};
    if (users[email]) return notify("Email вже зайнятий", true);

    users[email] = {
        password: pass,
        profile: { name: "", age: "", weight: 0, height: 0, level: "beginner" },
        saved: [],
        water: 0,
        waterDate: new Date().toDateString()
    };
    localStorage.setItem('users', JSON.stringify(users));

    activeUser = email;
    localStorage.setItem('activeUser', email);
    clearAllForms();
    updateUI();
    notify("Акаунт створено! Налаштуйте профіль.");
    showSection('profile');
}

function logout() {
    localStorage.removeItem('activeUser');
    activeUser = null;
    clearAllForms();
    updateUI();
    goHome();
}

function toggleAuthForms(reg) {
    document.getElementById('loginBox').style.display = reg ? 'none' : 'block';
    document.getElementById('registerBox').style.display = reg ? 'block' : 'none';
}

// --- 4. ПРОФІЛЬ ТА ВОДА ---
function saveProfile() {
    let users = JSON.parse(localStorage.getItem('users'));
    const name = document.getElementById('userName').value.trim();
    if(!name) return notify("Введіть ім'я", true);

    users[activeUser].profile = {
        name: name,
        age: document.getElementById('userAge').value,
        weight: parseFloat(document.getElementById('userWeight').value) || 0,
        height: parseFloat(document.getElementById('userHeight').value) || 0,
        level: document.getElementById('userLevel').value
    };
    localStorage.setItem('users', JSON.stringify(users));
    notify("Дані збережено!");
    showSection('dashboard');
}

function loadProfile() {
    let users = JSON.parse(localStorage.getItem('users'));
    let user = users[activeUser];
    if (user && user.profile) {
        document.getElementById('userName').value = user.profile.name || "";
        document.getElementById('userAge').value = user.profile.age || "";
        document.getElementById('userWeight').value = user.profile.weight || "";
        document.getElementById('userHeight').value = user.profile.height || "";
        document.getElementById('userLevel').value = user.profile.level || "beginner";
    }
    syncWaterUI(user.water || 0);
}

function updateWater(v) {
    if (!activeUser) return;
    let users = JSON.parse(localStorage.getItem('users')) || {};
    let user = users[activeUser];

    let today = new Date().toDateString();
    if (user.waterDate !== today) {
        user.water = 0;
        user.waterDate = today;
    }

    let current = parseInt(user.water) || 0;
    if (v > 0 && current >= 8) {
        notify("Денну норму (8 склянок) виконано! 🌊");
        return;
    }

    user.water = Math.max(0, current + v);
    users[activeUser] = user;
    localStorage.setItem('users', JSON.stringify(users));

    syncWaterUI(user.water);
    if (user.water === 8 && v > 0) notify("Супер! Норма води виконана!");
}

function syncWaterUI(amount) {
    const val = parseInt(amount) || 0;
    const percent = Math.min((val / 8) * 100, 100);
    const color = val >= 8 ? "#10b981" : "#3b82f6";

    const dCount = document.getElementById('dashWaterCount');
    const dBar = document.getElementById('dashWaterBar');
    if(dCount) dCount.textContent = val;
    if(dBar) { dBar.style.width = percent + '%'; dBar.style.background = color; }

    const pCount = document.getElementById('waterCount');
    const pBar = document.getElementById('waterProgressBar');
    const plusBtn = document.getElementById('waterPlusBtn');
    if(pCount) pCount.textContent = val;
    if(pBar) { pBar.style.width = percent + '%'; pBar.style.background = color; }
    if(plusBtn) plusBtn.disabled = (val >= 8);
}

// --- 5. КОНСТРУКТОР ТРЕНУВАНЬ ---
function toggleSplit() {
    const g = document.getElementById('goal').value;
    const sg = document.getElementById('splitGroup');
    if(sg) sg.style.display = (g === 'muscle' ? 'block' : 'none');
}

function generateProgram() {
    const user = JSON.parse(localStorage.getItem('users'))[activeUser];
    const loc = document.getElementById('location').value;
    const goal = document.getElementById('goal').value;
    const level = user.profile.level || 'beginner';
    const bmi = user.profile.weight / ((user.profile.height / 100) ** 2);

    const db = {
        chest: {
            home: ["Віджимання від підлоги", "Широкі віджимання", "Алмазні віджимання", "Віджимання на стільцях", "Планка з дотиком плечей"],
            gym: ["Жим штанги лежачи", "Жим гантелей", "Розведення гантелей", "Кросовер", "Віджимання на брусах"]
        },
        back: {
            home: ["Супермен", "Човник", "Тяга гантелей (пляшок) у нахилі", "Т-віджимання", "Ангел на підлозі"],
            gym: ["Тяга верхнього блоку", "Тяга штанги в нахилі", "Станова тяга", "Гіперекстензія", "Тяга Т-грифа"]
        },
        legs: {
            home: ["Присідання", "Випади", "Болгарські випади", "Сідничний місток", "Бокові випади", "Підйоми на носки"],
            gym: ["Жим ногами", "Розгинання ніг", "Згинання ніг", "Присідання зі штангою", "Гак-присідання"]
        },
        arms: {
            home: ["Зворотні віджимання", "Згинання рук з вагою", "Планка на ліктях", "Молотки з пляшками"],
            gym: ["Біцепс зі штангою", "Французький жим", "Тріцепс на блоці", "Молотки з гантелями"]
        },
        core: {
            home: ["Класична планка", "Скручування", "Велосипед", "Підйом ніг", "Російський твіст"],
            gym: ["Прес у висі", "Скручування на блоці (Молитва)", "Бічна планка", "Книжка"]
        },
        cardio: ["Берпі", "Альпініст", "Стрибки Jack", "Біг на місці", "Вистрибування"]
    };

    let pool = [];
    if (goal === 'lose') {
        pool = [...db.chest[loc], ...db.legs[loc], ...db.core[loc], ...db.cardio];
    } else {
        const selected = document.querySelectorAll('.muscle-cb:checked');
        if (!selected.length) return notify("Оберіть м'язи!", true);
        selected.forEach(cb => { if (db[cb.value]) pool = pool.concat(db[cb.value][loc]); });
    }

    if (bmi > 28) pool = pool.filter(ex => !["Берпі", "Стрибки Jack", "Вистрибування"].includes(ex));

    pool = [...new Set(pool)];
    let count = level === 'pro' ? 8 : (level === 'middle' ? 6 : 4);
    let reps = goal === 'lose' ? (level === 'pro' ? "4х20" : "3х15") : (level === 'pro' ? "4х12" : "3х10");

    let exercises = pool.sort(() => 0.5 - Math.random()).slice(0, count).map(name => ({
        name,
        gif: `https://placehold.co/600x400/222/dfc89a?text=${encodeURIComponent(name)}`,
        reps
    }));

    document.getElementById('aiAnalysis').textContent = `ІМТ: ${bmi.toFixed(1)} | Рівень: ${level}`;
    document.getElementById('programTitle').textContent = `План: ${goal === 'lose' ? 'Схуднення' : 'Маса'}`;
    document.getElementById('programList').innerHTML = exercises.map(ex => `
        <li class="list-item-flex">
            <span>${ex.name} — <b>${ex.reps}</b></span>
            <button class="btn-demo" onclick="openModal('${ex.gif}', '${ex.name}')">🎥 Як робити?</button>
        </li>
    `).join('');

    document.getElementById('programBox').style.display = 'block';
    currentGeneratedPlan = { title: document.getElementById('programTitle').textContent, exercises, analysis: document.getElementById('aiAnalysis').textContent };
}

// --- 6. ЗБЕРЕЖЕННЯ ТА ДАШБОРД ---
function saveProgram() {
    if (!currentGeneratedPlan) return;
    let users = JSON.parse(localStorage.getItem('users'));
    let saved = users[activeUser].saved || [];

    const currentKey = currentGeneratedPlan.exercises.map(e => e.name).sort().join('|');
    const isDup = saved.some(p => p.exercises.map(e => e.name).sort().join('|') === currentKey);

    if (isDup) return notify("Такий план уже збережено!", true);

    users[activeUser].saved.push(currentGeneratedPlan);
    localStorage.setItem('users', JSON.stringify(users));
    notify("Збережено успішно!");
}

function renderSaved() {
    let user = JSON.parse(localStorage.getItem('users'))[activeUser];
    const container = document.getElementById('savedProgramsList');
    if (!user.saved?.length) {
        container.innerHTML = "<p style='text-align:center; color:#888; padding:20px;'>Збережених планів поки немає.</p>";
        return;
    }

    container.innerHTML = `<div class="saved-grid">` + user.saved.map((plan, i) => `
        <div class="saved-card">
            <h3>${plan.title}</h3>
            <div class="analysis-text">${plan.analysis}</div>
            <ul>${plan.exercises.map(ex => `<li>${ex.name} (${ex.reps}) <button class="btn-demo" onclick="openModal('${ex.gif}', '${ex.name}')">🎥</button></li>`).join('')}</ul>
            <button class="btn-delete" onclick="deleteSaved(${i})">Видалити</button>
        </div>
    `).join('') + `</div>`;
}

function deleteSaved(i) {
    let users = JSON.parse(localStorage.getItem('users'));
    users[activeUser].saved.splice(i, 1);
    localStorage.setItem('users', JSON.stringify(users));
    renderSaved();
    notify("Видалено", true);
}

function updateDashboardUI() {
    if (!activeUser) return;
    let user = JSON.parse(localStorage.getItem('users'))[activeUser];
    const dGreet = document.getElementById('dashGreeting');
    if(dGreet) dGreet.textContent = `Привіт, ${user.profile?.name || 'Спортсмене'}!`;
    syncWaterUI(user.water || 0);

    const tips = ["Розминка - це важливо!", "Спи 8 годин.", "Пий воду маленькими ковтками.", "Техніка понад усе.", "Відпочинок - частина прогресу."];
    const tipEl = document.getElementById('dailyTip');
    if(tipEl) tipEl.textContent = tips[new Date().getDate() % tips.length];
}

function updateUI() {
    const isAuth = !!activeUser;
    ['navHome', 'navProfile', 'navSaved'].forEach(n => {
        const el = document.getElementById(n);
        if(el) el.style.display = isAuth ? 'block' : 'none';
    });
    const navAuth = document.getElementById('navAuth');
    if(navAuth) navAuth.innerHTML = isAuth ? `<a href="#" onclick="logout()">Вихід</a>` : `<a href="#" onclick="showSection('auth')">Вхід</a>`;
}

// --- 7. МОДАЛЬНІ ВІКНА ---
function openModal(url, title) {
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalGif').src = url;
    document.getElementById('gifModal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('gifModal').style.display = 'none';
}