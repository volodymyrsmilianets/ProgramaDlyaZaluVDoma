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
    const btn = event.currentTarget; // Отримуємо саме ту кнопку, на яку натиснули
    if (!input) return;

    // Код іконок (я додав клас 'eye-icon' для керування кольором через CSS)
    const eyeIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="eye-icon"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/></svg>`;
    const eyeOffIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="eye-icon"><path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49"/><path d="M14.084 14.158a3 3 0 0 1-4.242-4.242"/><path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143"/><path d="m2 2 20 20"/></svg>`;

    if (input.type === "password") {
        input.type = "text";
        btn.innerHTML = eyeOffIcon;
    } else {
        input.type = "password";
        btn.innerHTML = eyeIcon;
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
    if (activeUser) {
        checkProfileBeforeHome();
    } else {
        showSection('auth');
        toggleAuthForms(true); // Додаємо цей рядок: true означає "показати реєстрацію"
    }
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

// 1. Словник посилань на ГІФки (просто додавай сюди нові)
const exerciseGifs = {
    "Віджимання від підлоги": "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExejFsb2k0djAxNzkyYnYwenJkdTU0ZjFuMDd3OXY3OTdrbXJvajV4ayZlcD12MV9naWZzX3JlbGF0ZWQmY3Q9Zw/SX9pF45td2gIniqSBm/giphy.gif",
    "Широкі віджимання": "https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExcmFub21hN3p2bDhzYTFycjhlZ3pvbmI5Ymdpem5kaGlodW4wZnczdCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/mnOS9hQ87XX8t0ZO9O/giphy.gif",
    "Алмазні віджимання": "https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3Zjl1NWdvNmM3dDN0bzY2dmMydjEwYmYxcmlrY2RtNnU4aTc4cHp1MCZlcD12MV9naWZzX3JlbGF0ZWQmY3Q9Zw/4XGl3yPyvnWCFfTaYV/giphy.gif",
    "Віджимання на стільцях": "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExejFsb2k0djAxNzkyYnYwenJkdTU0ZjFuMDd3OXY3OTdrbXJvajV4ayZlcD12MV9naWZzX3JlbGF0ZWQmY3Q9Zw/YQmmcPHmFgHekp7ktU/giphy.gif",
    "Планка з дотиком плечей": "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExZXV5eW15ZXBpd3dkNmtneGxqbWYwMDd5MWpuYWJqNG1sNW1hazNrcSZlcD12MV9naWZzX3JlbGF0ZWQmY3Q9Zw/bW0htPiZEGezMjCxDP/giphy.gif",
    "Жим штанги лежачи": "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMG1nbWVuZzh0cW0yZGM0N3Y2Z295OTJ0OHFxYnNlbGxsOWprYWl2MiZlcD12MV9naWZzX3JlbGF0ZWQmY3Q9Zw/DgAyvWzSjOhSNzaRwU/giphy.gif",
    "Жим гантелей": "https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExOXpyMGU3bDRmMTIzdmxoYmpkcTVkOGdmY2lnZ3dhOGhsN2RieXVtZSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/oxa540N5r9znP4nMYV/giphy.gif",
    "Розведення гантелей": "https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExNmRjZ3UwOTVyampvZzd6bXJ4eHE1M3M5c2J0NGFjaGJzcnlsYWw1ZCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/2EO0p1Vfh2xHp8u6C8/giphy.gif",
    "Кросовер": "https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3NuazZ1OTNjNnd6bzFxZHUxZjAwM3FtNHZ2eG9lejA4MnZ1dHYxMCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/Bpxk4YGfPU2frRGZz8/giphy.gif",
    "Віджимання на брусах": "https://media.giphy.com/media/Uj83hIkkCsdvSONzqV/giphy.gif",
    "Супермен": "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExamFzZjRwbXVnZHF5dXhpYnVoc2Jka3k5YjN5bGpydnhvaG8zMmJ0MSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/PmPRDFY1ENYMo/giphy.gif",
    "Човник": "https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExdHA4bG94dDVsZHV2ZzZhazNnczJ5N3h4bmFhczZibjZ1eG00NWtqZyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/9XbMdlJgKXXkEtC60Q/giphy.gif",
    "Тяга гантелей (пляшок) у нахилі": "https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExNzJ1MTF3d3Blbmw5cmNybmxxenkzMXl2OXFxcnZ3Z3FjemFzYjhxOCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/RuDMfiBPHlt0lVOMiq/giphy.gif",
    "Т-віджимання": "https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExcnd5MzQxN3RrdGV4YWhqdmJ5eWd5MnVscDNzbHc1N21rcml5a29qeSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/z0ftVK3v1sQTuC58iy/giphy.gif",
    "Ангел на підлозі": "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMTY1NHE4aTR0Z3V6NGE0bHpxazZnYWs5NnV6bmdkcjh5YW1yaWZrcyZlcD12MV9naWZzX3NlYXJjaCZjdD1n/umztdHvR8FJcpkrbfU/giphy.gif",
    "Тяга верхнього блоку": "https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3ZmbW5maGd3Ym5vem9tZWQ4Mm1uZWdnemdmMXgxbmh4aGJiem1vNiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/IpX7IpR2SzDMtQza2p/giphy.gif",
    "Тяга штанги в нахилі": "https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExbno5NzAxdDhyb2l3anNwMTR0aGs3cnBoeWpsamlvMHh6c3A5YW5sayZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/26BoCqTRJh7kS65oI/giphy.gif",
    "Станова тяга": "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExd252anV5bW8yaXd5aHZhZGJmbHhpaHVmYjdsNjZ4czdsbWVwNTVhOSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/2mLudFb8CoqhKp7n9Q/giphy.gif",
    "Гіперекстензія": "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcGV2M3ZuaXJ4ZXEybXJ4dWIwcDNmdDI4dzg5OGg5bGg0bHpnMGlxMyZlcD12MV9naWZzX3NlYXJjaCZjdD1n/F6evERhKBouBOWkXSr/giphy.gif",
    "Тяга Т-грифа": "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbzd0ajlxOTNzejZrYTFmc2dxdGtrMWdjNTcyeWI4OGFtaHE0NWxwdCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/0uxab54E964YRebbTW/giphy.gif",
    "Присідання": "https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExNGZoZWEzMDg2aHR2YmI1bmRnOWptYzR3cDdmNmRjaWV4Y3N1d3lyZCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/tHyPJtOwPChKmF0LKg/giphy.gif",
    "Випади": "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExaWJoZmllOHFxdGJhbW0ybGZnaGx2NXRkMmZ5d2FjOHhsaWkwcjZwdiZlcD12MV9naWZzX3NlYXJjaCZjdD1n/iHDn9oDwoUefLPKe9h/giphy.gif",
    "Болгарські випади": "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMnZyOGhha3M4NXQ3MXk3eXNqaTFrdDAzZ3YwMWticzh3NXY1dDBvaCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/Q8O1oo9cKR3zbBJA2D/giphy.gif",
    "Сідничний місток": "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExN2cwenEyaXdzbnV1YWZjN3I4aTgxbXJ4cGNtMTRvYXM2aTg1NGxmcCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/U1azrdYvCqgMUmLbkU/giphy.gif",
    "Бокові випади": "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcThvMXZuM3F0OTgxNDZnYW82dWtkdHNqMTNvcjV1NHV2eWxwZmszdiZlcD12MV9naWZzX3NlYXJjaCZjdD1n/cLOeR79kY2E9pEJUUE/giphy.gif",
    "Підйоми на носки": "https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExZzVzN2EyYzg2aHBtZXEzaHVrYTY0d3IxazYwMWhxNjUyZGp1dXZ5MSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/ag3OazmTmNfgFbcq4u/giphy.gif",
    "Жим ногами": "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3c1N3FvM3lmdGc4b3FwejZ6MTh3a2c4ejVheWltYThoZW0xeHVrbiZlcD12MV9naWZzX3NlYXJjaCZjdD1n/UIze7SZJbFQ6u4SP6E/giphy.gif",
    "Розгинання ніг": "https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExMnN1bHJ1eWg0ZzUwZXZ0ZjlleTFkd3A3ZXpzN2hodHV6djFzc29kZyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/uVy4XNbiUiMetnFyxv/giphy.gif",
    "Згинання ніг": "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExd2xhdHIxenk1ZHdhYjF2YnlqbTZyb3JzZ2J6MG55MmxzN2NsdDFoeSZlcD12MV9naWZzX3JlbGF0ZWQmY3Q9Zw/DJaIIKd3KLM4NfLaFn/giphy.gif",
    "Присідання зі штангою": "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbnFpdm9vczM0aGRtczQ5N2k2ajB6eGVkcmg0czJ5ZzZ2dmVwMm1mYSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/d832ZmpAR76kng271x/giphy.gif",
    "Фронтальні присідання": "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM216aDN4N2d5NDFpdG5wMzZicWR0bDloc25heGtxdnozb2RwOW9iMSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/UeCwB3u5BDzHH2autL/giphy.gif",
    "Зворотні віджимання": "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMmh0b3NidDdtdXB2OHFseXRjbDliaWh1ZTI0czF3NTEzajF4Nm84eCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/b4hNjbCD7cptHZV61y/giphy.gif",
    "Згинання рук з вагою": "https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExbDFsenczNTMwZ2Jyb2g4ejRycHJoYXJwdTFoNmgzNm5zdXcybTl1bSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/51Ze6SxVtXB8T7IQm9/giphy.gif",
    "Планка на ліктях": "https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3MDExeXZ1b2hxZTZ1ejkyZTMwZTd0dWR5NjVqcHNhd2hyZDZtc2Y5cyZlcD12MV9naWZzX3JlbGF0ZWQmY3Q9Zw/xrShezcf4yRtraX6fq/giphy.gif",
    "Молотки з пляшками": "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExY2NrYnprMGIyMHo2amk2bXU4d2k3ejQ0bTdyZ2VoZmljcWVzZnh1ciZlcD12MV9naWZzX3NlYXJjaCZjdD1n/7wjAml7kljXvs6BVwq/giphy.gif",
    "Біцепс зі штангою": "https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3eGVhdHJvanA2MGFnd2xkZjZqeno3dWprZ3Nqa3ZreG1zdmd4bmF0ayZlcD12MV9naWZzX3NlYXJjaCZjdD1n/e2FAiqJcnGgEwjNSJJ/giphy.gif",
    "Французький жим": "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExamxsN3U0N3Y2OWVzN2MwdWhzbDc5bnY5aTlhemJzMmZyajB6MTBoZiZlcD12MV9naWZzX3NlYXJjaCZjdD1n/TUUNLoXaZW3Rh4ngSU/giphy.gif",
    "Тріцепс на блоці": "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMjdrbDRlMnZsMXU1Ym0wdTJsY2drOXhlZHdkNzk1dnpocTZlYWJqNiZlcD12MV9naWZzX3JlbGF0ZWQmY3Q9Zw/BbKzzb7g9Cemv0eW9n/giphy.gif",
    "Молотки з гантелями": "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExamdvaHZpa2NzeTM3MXk4dzZtMHczYTdiMmJhbnpxMHdxdWZqbzBmNyZlcD12MV9naWZzX3NlYXJjaCZjdD1n/7wjAml7kljXvs6BVwq/giphy.gif",
    "Класична планка": "https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExZXFsdjBhZnMza2ZibmtqMGR3czM4ZDFkYjBiOXZvbzZucG5qaTZ1biZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/d3mlADRlF7SMFQRy/giphy.gif",
    "Скручування": "https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExYm1tOTM2M2J6aDIzYmYyMnBjOWhmNXgwdDJzZzBkOHJ6ZnluNXdmbiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/BULVD3364Ec9XMTTS4/giphy.gif",
    "Велосипед": "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExczl4NHN2b3AzbHAzb2d4OWQ4bXM0OG9nNmNhcGNjbDk2Y3NzeXU1MCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/oVdkHpQifYD5BQYpFK/giphy.gif",
    "Підйом ніг": "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExdHVmcHl4bWt3MDRqM3FleHBwcGx5YjlvdTB6NnAzYnVyM21sMjU2bSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/pWiVMJ0bMMizrlNeDG/giphy.gif",
    "Повороти тулуба": "https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3bTY2MGlsam53NTNmODJybm5mN3Q1NndzYzV2Zmo2bnoxMGR6d3gzZiZlcD12MV9naWZzX3JlbGF0ZWQmY3Q9Zw/DfeEVAQlxq2oWfq5f5/giphy.gif",
    "Прес у висі": "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExZDBmbGE3NGphY2dhOXhicXN6MGN4N2VscTJ5eDNwZThudnp4MDhycCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/eRmwgfuLtU3JtM63sd/giphy.gif",
    "Підйом ніг у висі": "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExOGI2bWZxYmE4d25icHRrcXczNmk1d3QxMzgwZzBhc3dqejdqN2pxcCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/1FsjYEOIEXQTosCu9T/giphy.gif",
    "Бічна планка": "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcHM5Z2htanp2aDBrNW1yNmJla2lqdzBmdzR0NXJsdXp1MWN6ZWtqayZlcD12MV9naWZzX3NlYXJjaCZjdD1n/7m70b4wcZOOstmKCE8/giphy.gif",
    "Книжка": "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExZjBoOTUxbDZkd3B3Y2Rlc3UzdWJibzQyMmM1cmx3Z3c4aDZqc2V0dSZlcD12MV9naWZzX3JlbGF0ZWQmY3Q9Zw/UrW9mjKCp9xd91mQDO/giphy.gif",
    "Берпі": "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExaTRpa2FkMTN0c2N6eDl5aWgxbGt6c293MjB0cXhtMTZmdGFocjFtZCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/xT8qBfdej5EQRF1oQw/giphy.gif",
    "Альпініст": "https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3bTlibTg5c3hmZG45NjZ5cHlyeXRvdnBkYmpub3E2aWFxYzZwcmhoOCZlcD12MV9naWZzX3JlbGF0ZWQmY3Q9Zw/vI2BMBcFDgbbFrB0bA/giphy.gif",
    "Стрибки Jack": "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExOGVra2I5YmRwNnYxZGI1dXJ3N2N5b2Z2aWxmMmg1OThpamp3em9ueSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/RgtuKqJ8rPII4qdRjp/giphy.gif",
    "Біг на місці": "https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExYzBlNW5iY2FnN29mdHl0djduM3l0amx1MTN1Ynpuc2VmcnNsYW1vYSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/62aGqZoUJYtPsl0Hb0/giphy.gif",
    "Вистрибування": "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExZXJtbGdsYW8zYTJyZmZ5N293ZHN0Nm4wYnI2ZzUycWsybmkzd2djZiZlcD12MV9naWZzX3JlbGF0ZWQmY3Q9Zw/1rL6hWfg8a2zLAg9GW/giphy.gif",
};

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
            gym: ["Жим ногами", "Розгинання ніг", "Згинання ніг", "Присідання зі штангою", "Фронтальні присідання"]
        },
        arms: {
            home: ["Зворотні віджимання", "Згинання рук з вагою", "Планка на ліктях", "Молотки з пляшками"],
            gym: ["Біцепс зі штангою", "Французький жим", "Тріцепс на блоці", "Молотки з гантелями"]
        },
        core: {
            home: ["Класична планка", "Скручування", "Велосипед", "Підйом ніг", "Повороти тулуба"],
            gym: ["Прес у висі", "Підйом ніг у висі", "Бічна планка", "Книжка"]
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
        // БЕРЕМО ГІФКУ ЗІ СЛОВНИКА АБО ЗАГЛУШКУ
        gif: exerciseGifs[name] || `https://placehold.co/600x400/222/dfc89a?text=${encodeURIComponent(name)}`,
        reps
    }));

    document.getElementById('aiAnalysis').textContent = `ІМТ: ${bmi.toFixed(1)} | Рівень: ${level}`;
    document.getElementById('programTitle').textContent = `План: ${goal === 'lose' ? 'Схуднення' : 'Маса'}`;
    document.getElementById('programList').innerHTML = exercises.map(ex => `
        <li class="list-item-flex">
            <span>${ex.name} — <b>${ex.reps}</b></span>
            <button class="btn-demo" onclick="openModal('${ex.gif}', '${ex.name}')"> Як робити?</button>
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
    const container = document.getElementById('savedProgramsList'); // Переконайся, що у тебе є такий ID в HTML

    if (!user.saved?.length) {
        container.innerHTML = "<p style='text-align:center; color:#888; padding:20px;'>Збережених планів поки немає.</p>";
        return;
    }

    // Рендеримо за новою структурою: план-картка -> заголовок -> список вправ
    container.innerHTML = user.saved.map((plan, i) => `
        <li class="plan-card">
            <div class="plan-header">
                <span class="plan-date">${plan.title}</span>
                <button class="btn-delete" onclick="deleteSaved(${i})">Видалити</button>
            </div>
            <div class="analysis-text" style="font-size: 11px; color: #888; margin-bottom: 10px;">${plan.analysis}</div>
            <ul class="plan-exercises">
                ${plan.exercises.map(ex => `
                    <li class="plan-exercise-item">
                        <span>${ex.name} <small style="color: #666;">(${ex.reps})</small></span>
                        <button class="btn-demo-small" onclick="openModal('${ex.gif}', '${ex.name}')">Як робити?</button>
                    </li>
                `).join('')}
            </ul>
        </li>
    `).join('');
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

// Викликати, коли треба саме ВХІД
function openLogin() {
    showSection('auth');
    toggleAuthForms(false);
}

// Викликати, коли треба саме РЕЄСТРАЦІЮ
function openRegister() {
    showSection('auth');
    toggleAuthForms(true);
}