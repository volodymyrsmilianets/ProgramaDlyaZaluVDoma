// --- JS LOGIC FOR FIT-TRAIN APP ---

// Змінна, яка зберігає унікальний ідентифікатор активного користувача (логін/email)
let activeUserIdentifier = null;

// 1. Управління темами
function setTheme(themeName) {
    let accentColor = '#dfc89a';
    let bgColor = '#0a0a0a';
    let textColor = '#e5e5e5';
    let headerBg = '#0c0c0c';

    switch(themeName) {
        case 'black_white':
            accentColor = '#555555';
            bgColor = '#ffffff';
            textColor = '#333333';
            headerBg = '#f0f0f0';
            break;
        case 'red':
            accentColor = '#ff6347';
            break;
        case 'orange':
            accentColor = '#ffa500';
            break;
        case 'yellow':
            accentColor = '#ffd700';
            break;
        case 'green':
            accentColor = '#3cb371';
            break;
        case 'blue':
            accentColor = '#4169e1';
            break;
        case 'indigo':
            accentColor = '#4b0082';
            break;
        // default залишає кольори як є
    }

    document.documentElement.style.setProperty('--accent-color', accentColor);
    if (themeName === 'black_white') {
        document.documentElement.style.setProperty('--bg-color', bgColor);
        document.documentElement.style.setProperty('--text-color', textColor);
        document.documentElement.style.setProperty('--header-bg', headerBg);
        document.documentElement.style.setProperty('--container-bg', 'rgba(0,0,0,0.05)');
        document.documentElement.style.setProperty('--border-color', '#dddddd');
        document.documentElement.style.setProperty('--input-bg', '#ffffff');
    } else {
        // Повертаємо темні кольори, якщо тема не black_white
        document.documentElement.style.setProperty('--bg-color', '#0a0a0a');
        document.documentElement.style.setProperty('--text-color', '#e5e5e5');
        document.documentElement.style.setProperty('--header-bg', '#0c0c0c');
        document.documentElement.style.setProperty('--container-bg', 'rgba(255,255,255,0.03)');
        document.documentElement.style.setProperty('--border-color', '#2a2a2a');
        document.documentElement.style.setProperty('--input-bg', '#111');
    }

    // ТЕМА: зберігаємо під загальним ключем, оскільки це налаштування браузера/пристрою, а не акаунту.
    localStorage.setItem('selectedTheme', themeName);
}

function loadTheme() {
    const savedTheme = localStorage.getItem('selectedTheme') || 'default';
    setTheme(savedTheme);
}

// 2. Управління навігацією та доступом

function updateNavigation(isLoggedIn, isProfileComplete) {
    const authLink = document.getElementById('navAuth');
    const homeLink = document.getElementById('navHome');
    const profileLink = document.getElementById('navProfile');
    const savedLink = document.getElementById('navSaved');
    const aboutAuthLink = document.getElementById('aboutAuthLink');

    if (authLink) {
        if (isLoggedIn) {
            authLink.textContent = 'Вийти';
            authLink.setAttribute('onclick', 'logoutUser()');
            authLink.style.display = 'inline-block';
        } else {
            authLink.textContent = 'Вхід / Реєстрація';
            authLink.setAttribute('onclick', "showSection('auth')");
            authLink.style.display = 'inline-block';
        }
    }

    // Керування видимістю великої кнопки "Увійти / Зареєструватися" в секції "Про сайт"
    if (aboutAuthLink) {
        aboutAuthLink.style.display = isLoggedIn ? 'none' : 'block';
    }


    // Керування посиланням Профіль (завжди видно після входу/реєстрації)
    if (profileLink) profileLink.style.display = isLoggedIn ? 'inline-block' : 'none';

    // Керування обмеженими посиланнями (Тільки якщо профіль повний)
    const restrictedDisplay = (isLoggedIn && isProfileComplete) ? 'inline-block' : 'none';
    if (homeLink) homeLink.style.display = restrictedDisplay;
    if (savedLink) savedLink.style.display = restrictedDisplay;
}

// *** ОНОВЛЕНО: Ініціалізуємо activeUserIdentifier та перевіряємо профіль***
function checkAuthAndRedirect() {
    // 1. Визначаємо, хто останній увійшов
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const lastUser = localStorage.getItem('lastLoggedInUser');

    if (isLoggedIn && lastUser) {
        activeUserIdentifier = lastUser; // Встановлюємо активного користувача
    } else {
        activeUserIdentifier = null;
    }

    // 2. Використовуємо activeUserIdentifier для визначення повноти профілю
    const profileData = JSON.parse(localStorage.getItem(`userProfile_${activeUserIdentifier}`) || '{}');
    const isProfileComplete = profileData.name && profileData.age && profileData.weight && profileData.height;

    updateNavigation(isLoggedIn, isProfileComplete);
    loadProfile(); // Завантажуємо дані профілю та статистики (використовуючи новий ключ)

    // Логіка перенаправлення при завантаженні сторінки
    if (!isLoggedIn) {
        showSection('about');
    } else if (isLoggedIn && !isProfileComplete) {
        showSection('profile');
    } else {
        showSection('home');
    }
}


function showSection(sectionId) {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

    // Перевірка профілю використовує activeUserIdentifier, тому тут це безпечно.
    const profileData = JSON.parse(localStorage.getItem(`userProfile_${activeUserIdentifier}`) || '{}');
    const isProfileComplete = profileData.name && profileData.age && profileData.weight && profileData.height;


    // БЛОК: Запобігання доступу без авторизації
    if (!isLoggedIn && sectionId !== 'about' && sectionId !== 'auth') {
        alert("Будь ласка, увійдіть або зареєструйтеся.");
        showSection('about');
        return;
    }

    // БЛОК: Запобігання доступу без повного профілю до обмежених секцій
    if (isLoggedIn && !isProfileComplete && (sectionId === 'home' || sectionId === 'saved')) {
        alert("Для доступу до цієї сторінки спочатку заповніть Ваш Профіль.");
        showSection('profile');
        return;
    }

    // Приховуємо всі секції
    const sections = ['about', 'auth', 'home', 'profile', 'saved'];
    sections.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.style.display = 'none';
        }
    });

    // Отримуємо елемент Hero Section (головний екран)
    const heroSection = document.querySelector('.hero');

    // Показуємо потрібну секцію
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.style.display = 'block';
    }

    // Управління видимістю Hero Section
    if (sectionId === 'about') {
        if (heroSection) {
            heroSection.style.display = 'flex';
        }
    } else {
        if (heroSection) {
            heroSection.style.display = 'none';
        }
    }
}

// НОВА ФУНКЦІЯ: Очищення полів профілю (для нового входу)
function clearProfileForm() {
    document.getElementById('userName').value = '';
    document.getElementById('userAge').value = '';
    document.getElementById('userWeight').value = '';
    document.getElementById('userHeight').value = '';
    document.getElementById('userGoal').value = 'lose'; // Скидаємо Select
    document.getElementById('userLevel').value = 'beginner'; // Скидаємо Select
}

// *** ОНОВЛЕНО: Вихід з акаунту (БЕЗ ОЧИЩЕННЯ ДАНИХ) ***
function logoutUser() {
    // 1. Прибираємо статус авторизації та активного користувача
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('lastLoggedInUser'); // Важливо!
    activeUserIdentifier = null; // Скидаємо глобальну змінну

    // 2. Очищаємо поля форми профілю на екрані (UI очищення)
    clearProfileForm();

    alert("Ви вийшли з акаунту. Тепер ви можете увійти з іншим обліковим записом.");

    // 3. Перевірка авторизації та перенаправлення на головну сторінку
    checkAuthAndRedirect();
}


// 3. Аутентифікація та Реєстрація
function showRegisterForm() {
    document.getElementById('registerForm').style.display = 'block';
}

function togglePasswordVisibility(id, element) {
    const input = document.getElementById(id);
    if (input.type === "password") {
        input.type = "text";
        element.textContent = '🔒';
    } else {
        input.type = "password";
        element.textContent = '👁️';
    }
}

// *** ОНОВЛЕНО: loginUser() ***
function loginUser() {
    // Використовуємо логін як унікальний ID
    const username = document.getElementById('loginUsername').value.toLowerCase();
    if (username) {
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('lastLoggedInUser', username); // Зберігаємо ID користувача
        activeUserIdentifier = username; // Встановлюємо активного користувача
        alert(`Вітаємо, ${username}! Вхід успішний.`);
        checkAuthAndRedirect();
    } else {
        alert("Будь ласка, введіть логін.");
    }
}

// *** ОНОВЛЕНО: registerUser() ***
function registerUser() {
    const username = document.getElementById('regUsername').value.toLowerCase();
    const password = document.getElementById('regPassword').value;

    if (username && password.length >= 6) {
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('lastLoggedInUser', username); // Зберігаємо ID користувача
        activeUserIdentifier = username; // Встановлюємо активного користувача
        alert(`Користувач ${username} успішно зареєстрований. Тепер заповніть Ваш Профіль.`);
        checkAuthAndRedirect();
    } else {
        alert("Будь ласка, заповніть усі поля. Пароль має бути не менше 6 символів.");
    }
}

// 4. Генерація та збереження програм
function generateProgram() {
    const goal = document.getElementById('goal').value;
    const level = document.getElementById('level').value;
    const programList = document.getElementById('programList');
    const programBox = document.getElementById('programBox');

    programList.innerHTML = '';

    let program = [];

    // --- СХУДНЕННЯ (LOSE) ---
    if (goal === 'lose' && level === 'beginner') {
        program = ["Кардіо (20 хв)", "Присідання (3x10)", "Віджимання з колін (3x8)", "Планка (3x30 сек)"];
    } else if (goal === 'lose' && level === 'middle') {
        program = ["Біг/Еліпс (30 хв)", "Випади (3x12 на кожну ногу)", "Тяга гантелей в нахилі (3x10)", "Берпі (3x10)"];
    } else if (goal === 'lose' && level === 'pro') {
        program = ["ВІІТ (Високоінтенсивне інтервальне тренування, 20 хв)", "Кругове тренування (4 кола):", "1. Стрибки з присіданням (15)", "2. Віджимання (20)", "3. Спринт на місці (30 сек)", "4. Планка з підтягуванням колін (20)"];
    }
    // --- М'ЯЗОВА МАСА (MUSCLE) ---
    else if (goal === 'muscle' && level === 'beginner') {
        program = ["Розминка (5 хв)", "Присідання з власною вагою (3x15)", "Віджимання з колін/лави (3x10)", "Зворотні випади (3x12 на ногу)", "Планка (3x45 сек)"];
    }
    else if (goal === 'muscle' && level === 'middle') {
        program = ["Розминка (5 хв)", "Жим лежачи (4x10)", "Тяга в нахилі (4x10)", "Армійський жим (3x12)", "Пресс (3x20)"];
    } else if (goal === 'muscle' && level === 'pro') {
        program = ["Розминка та Специфічне розтягування (10 хв)", "Жим лежачи (5x5, важка вага)", "Станова тяга (3x8)", "Підтягування (4xMax)", "Жим гантелей сидячи (3x10)", "Біцепс/Трицепс суперсет (3x12)"];
    }
    // --- ВИТРИВАЛІСТЬ (ENDURANCE) ---
    else if (goal === 'endurance') {
        if (level === 'beginner') {
            program = ["Розминка (5 хв)", "Легкий біг / Швидка ходьба (30 хв)", "Стрибки зі скакалкою (3 підходи по 60 сек)", "Велотренажер (15 хв)"];
        } else if (level === 'middle') {
            program = ["Інтервальний біг (40 хв, 1:1 інтенсивний/легкий темп)", "Берпі (4x10)", "Альпініст (4x30 сек)", "Планка (3x60 сек)"];
        } else if (level === 'pro') {
            program = ["Тривалий біг (60 хв+)", "Високоінтенсивне інтервальне тренування (ВІІТ, 20 хв)", "Стрибки з присіданням (4x15)", "Закрутка на прес (3x20)"];
        } else {
            program = ["Тренування на Витривалість:", "Біг (30 хв)", "Кругове тренування (3 підходи)"];
        }
    } else {
        // Фолбек для будь-якої іншої непередбаченої комбінації
        program = [`Персоналізована програма для ${goal}/${level}:`, "Вправа 1 (4x12)", "Вправа 2 (3x15)", "Вправа 3 (3x10)"];
    }


    program.forEach(item => {
        const li = document.createElement('li');
        li.textContent = item;
        programList.appendChild(li);
    });

    programBox.style.display = 'block';
}

// *** ОНОВЛЕНО: saveProgram() ***
function saveProgram() {
    if (!activeUserIdentifier) return alert("Помилка: Ви не авторизовані.");

    const programText = document.getElementById('programList').innerText;
    if (!programText || programText.includes("Згенерована програма:")) {
        alert("Спочатку згенеруйте програму!");
        return;
    }

    // Використовуємо унікальний ключ
    let savedPrograms = JSON.parse(localStorage.getItem(`savedPrograms_${activeUserIdentifier}`) || '[]');
    const date = new Date().toLocaleDateString('uk-UA');
    const newProgram = `[${date}] Тренування: ${programText.replace(/\n/g, ', ')}`;

    savedPrograms.push(newProgram);
    localStorage.setItem(`savedPrograms_${activeUserIdentifier}`, JSON.stringify(savedPrograms));

    alert("Програма успішно збережена!");
    loadSavedPrograms();
}

// *** ОНОВЛЕНО: loadSavedPrograms() ***
function loadSavedPrograms() {
    const savedList = document.getElementById('savedPrograms');
    savedList.innerHTML = '';

    if (!activeUserIdentifier) {
        savedList.innerHTML = '<p>Будь ласка, увійдіть, щоб побачити збережені програми.</p>';
        return;
    }

    // Використовуємо унікальний ключ
    const savedPrograms = JSON.parse(localStorage.getItem(`savedPrograms_${activeUserIdentifier}`) || '[]');

    if (savedPrograms.length === 0) {
        savedList.innerHTML = '<p>Тут поки що немає збережених програм.</p>';
        return;
    }

    savedPrograms.forEach((program, index) => {
        const li = document.createElement('li');
        li.innerHTML = `<strong>Програма #${index + 1}</strong><br>${program}
                        <button onclick="deleteProgram(${index})" style="width: auto; max-width: 120px; margin-top: 10px; background-color: #993333; color: white;">Видалити</button>`;
        savedList.appendChild(li);
    });
}

// *** ОНОВЛЕНО: deleteProgram() ***
function deleteProgram(index) {
    if (!activeUserIdentifier) return;

    // Використовуємо унікальний ключ
    let savedPrograms = JSON.parse(localStorage.getItem(`savedPrograms_${activeUserIdentifier}`) || '[]');
    savedPrograms.splice(index, 1);
    localStorage.setItem(`savedPrograms_${activeUserIdentifier}`, JSON.stringify(savedPrograms));
    loadSavedPrograms();
}

// 5. Профіль та Статистика

// *** ОНОВЛЕНО: saveProfile() ***
function saveProfile() {
    if (!activeUserIdentifier) return alert("Помилка: Ви не авторизовані.");

    const name = document.getElementById('userName').value;
    const age = document.getElementById('userAge').value;
    const weight = document.getElementById('userWeight').value;
    const height = document.getElementById('userHeight').value;
    const goal = document.getElementById('userGoal').value;
    const level = document.getElementById('userLevel').value;

    const profileData = { name, age, weight, height, goal, level };
    // ЗБЕРІГАННЯ ДАНИХ З УНІКАЛЬНИМ КЛЮЧЕМ
    localStorage.setItem(`userProfile_${activeUserIdentifier}`, JSON.stringify(profileData));

    // Перевірка повноти профілю
    const isProfileComplete = name && age && weight && height;

    if (isProfileComplete) {
        alert("Профіль успішно збережено! Тепер вам доступні всі розділи сайту.");
        // Розблоковуємо навігацію та перенаправляємо на головну робочу сторінку
        checkAuthAndRedirect();
    } else {
        alert("Профіль частково збережено. Будь ласка, заповніть всі ключові поля (Ім'я, Вік, Вага, Зріст).");
        updateNavigation(true, false);
    }

    loadProfile();
}

// *** ОНОВЛЕНО: loadProfile() ***
function loadProfile() {
    if (!activeUserIdentifier) {
        // Якщо користувач не увійшов, очищуємо форму
        clearProfileForm();
        loadStatistics(); // Завантажуємо пусту статистику
        loadSavedPrograms(); // Завантажуємо порожній список програм
        return;
    }

    // ЗАВАНТАЖЕННЯ ДАНИХ З УНІКАЛЬНИМ КЛЮЧЕМ
    const profileData = JSON.parse(localStorage.getItem(`userProfile_${activeUserIdentifier}`) || '{}');
    if (profileData.name) {
        document.getElementById('userName').value = profileData.name;
        document.getElementById('userAge').value = profileData.age;
        document.getElementById('userWeight').value = profileData.weight;
        document.getElementById('userHeight').value = profileData.height;
        document.getElementById('userGoal').value = profileData.goal;
        document.getElementById('userLevel').value = profileData.level;
    } else {
        // Якщо даних для цього акаунту немає, очищуємо форму
        clearProfileForm();
    }
    loadStatistics();
    loadSavedPrograms();
}

// *** ОНОВЛЕНО: loadStatistics() ***
function loadStatistics() {
    if (!activeUserIdentifier) {
        // Скидаємо відображення статистики, якщо користувач вийшов
        document.getElementById('trainingsCount').textContent = 0;
        document.getElementById('caloriesBurned').textContent = 0;
        document.getElementById('timeSpent').textContent = 0;
        return;
    }

    // ЗАВАНТАЖЕННЯ СТАТИСТИКИ З УНІКАЛЬНИМ КЛЮЧЕМ
    const stats = JSON.parse(localStorage.getItem(`userStats_${activeUserIdentifier}`) ||
        '{"trainingsCount": 0, "caloriesBurned": 0, "timeSpent": 0}');

    document.getElementById('trainingsCount').textContent = stats.trainingsCount;
    document.getElementById('caloriesBurned').textContent = stats.caloriesBurned;
    document.getElementById('timeSpent').textContent = stats.timeSpent;
}

// *** ОНОВЛЕНО: completeTraining() ***
function completeTraining() {
    if (!activeUserIdentifier) return alert("Помилка: Ви не авторизовані.");

    // ЗАВАНТАЖЕННЯ СТАТИСТИКИ З УНІКАЛЬНИМ КЛЮЧЕМ
    let stats = JSON.parse(localStorage.getItem(`userStats_${activeUserIdentifier}`) ||
        '{"trainingsCount": 0, "caloriesBurned": 0, "timeSpent": 0}');

    // Умовні значення для оновлення статистики
    stats.trainingsCount += 1;
    stats.caloriesBurned += 350;
    stats.timeSpent += 45;

    // ЗБЕРІГАННЯ СТАТИСТИКИ З УНІКАЛЬНИМ КЛЮЧЕМ
    localStorage.setItem(`userStats_${activeUserIdentifier}`, JSON.stringify(stats));
    loadStatistics();
    alert("Чудово! Тренування завершено, статистика оновлена.");
    document.getElementById('programBox').style.display = 'none'; // Сховати програму
}