let activeUserIdentifier = null;

function setTheme(themeName) {
    const root = document.documentElement;
    const themes = {
        black_white: { acc: '#555', bg: '#fff', txt: '#222', head: '#eee', bord: '#ccc' },
        red: { acc: '#ff4d4d', bg: '#0a0a0a', txt: '#eee', head: '#0c0c0c', bord: '#2a2a2a' },
        green: { acc: '#4ade80', bg: '#0a0a0a', txt: '#eee', head: '#0c0c0c', bord: '#2a2a2a' },
        blue: { acc: '#3b82f6', bg: '#0a0a0a', txt: '#eee', head: '#0c0c0c', bord: '#2a2a2a' },
        default: { acc: '#dfc89a', bg: '#0a0a0a', txt: '#e5e5e5', head: '#0c0c0c', bord: '#2a2a2a' }
    };

    const t = themes[themeName] || themes.default;
    root.style.setProperty('--accent-color', t.acc);
    root.style.setProperty('--bg-color', t.bg);
    root.style.setProperty('--text-color', t.txt);
    root.style.setProperty('--header-bg', t.head);
    root.style.setProperty('--border-color', t.bord);
    localStorage.setItem('selectedTheme', themeName);
}

function loadTheme() { setTheme(localStorage.getItem('selectedTheme') || 'default'); }

function showSection(sectionId) {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const sections = ['about', 'auth', 'home', 'profile', 'saved'];

    sections.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });

    document.getElementById('hero-section').style.display = (sectionId === 'about') ? 'flex' : 'none';
    document.getElementById(sectionId).style.display = 'block';
}

function togglePasswordVisibility(id, btn) {
    const input = document.getElementById(id);
    input.type = input.type === 'password' ? 'text' : 'password';
    btn.textContent = input.type === 'password' ? '👁️' : '🔒';
}

function showRegisterForm() {
    document.getElementById('registerForm').style.display = 'block';
}

// Логіка користувачів
function loginUser() {
    const user = document.getElementById('loginUsername').value.toLowerCase();
    const pass = document.getElementById('loginPassword').value;
    const users = JSON.parse(localStorage.getItem('TRpointUsers')) || {};

    if (users[user] === pass) {
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('lastLoggedInUser', user);
        activeUserIdentifier = user;
        location.reload();
    } else {
        alert("Помилка входу");
    }
}

function registerUser() {
    const user = document.getElementById('regUsername').value.toLowerCase();
    const pass = document.getElementById('regPassword').value;
    let users = JSON.parse(localStorage.getItem('TRpointUsers')) || {};

    if (users[user]) return alert("Вже існує");

    users[user] = pass;
    localStorage.setItem('TRpointUsers', JSON.stringify(users));
    alert("Успіх! Увійдіть");
    location.reload();
}

function checkAuthAndRedirect() {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    activeUserIdentifier = localStorage.getItem('lastLoggedInUser');

    const navAuth = document.getElementById('navAuth');
    if (isLoggedIn) {
        navAuth.innerHTML = `<a onclick="logout()">Вийти (${activeUserIdentifier})</a>`;
        document.getElementById('navHome').style.display = 'block';
        document.getElementById('navProfile').style.display = 'block';
        document.getElementById('navSaved').style.display = 'block';
        document.getElementById('aboutAuthLink').style.display = 'none';
    } else {
        navAuth.innerHTML = `<a onclick="showSection('auth')">Увійти</a>`;
    }
    loadProfile();
}

function logout() {
    localStorage.removeItem('isLoggedIn');
    location.reload();
}

// Функції профілю та статистики (спрощено для роботи)
function saveProfile() {
    const data = {
        name: document.getElementById('userName').value,
        age: document.getElementById('userAge').value
    };
    localStorage.setItem(`profile_${activeUserIdentifier}`, JSON.stringify(data));
    alert("Збережено!");
}

function loadProfile() {
    if (!activeUserIdentifier) return;
    const data = JSON.parse(localStorage.getItem(`profile_${activeUserIdentifier}`));
    if (data) {
        document.getElementById('userName').value = data.name || '';
        document.getElementById('userAge').value = data.age || '';
    }
}

function generateProgram() {
    const list = document.getElementById('programList');
    list.innerHTML = "<li>Розминка 5 хв</li><li>Основне тренування 30 хв</li><li>Розтяжка 5 хв</li>";
    document.getElementById('programBox').style.display = 'block';
}
