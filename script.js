let activeUser = localStorage.getItem('activeUser') || null;
let currentGeneratedPlan = null;

// --- БЛОК ІНТЕЛЕКТУАЛЬНОГО АСИСТЕНТА (ШІ) ---
const botKnowledge = [
    // ПРИВІТАННЯ ТА ХТО Я
    {
        keywords: ["привіт", "вітаю", "добри", "хай", "хто ти", "допомог"],
        answers: [
            "Привіт! Я твоя підтримка у світі фітнесу. Питання про м'язи, харчування чи вправи? Я тут!",
            "Вітаю! Я TRpoint AI. Можу скласти пораду щодо тренувань або пояснити, як замінити гантелі вдома.",
            "Привіт! Готовий ставати кращим? Запитуй що завгодно про спорт!"
        ]
    },

    // --- РОЗШИРЕНИЙ БЛОК: ТРАВМИ, БОЛІ ТА ДИСКОМФОРТ ---
    {
        keywords: ["колін", "суглоб", "хруст", "меніск", "чашечк"],
        answers: [
            "При болях у колінах прибери стрибки та глибокі присідання. Перевір, чи не виходять коліна за носки. Якщо біль гострий — негайно до лікаря!",
            "Хрускіт без болю — зазвичай норма, але якщо супроводжується набряком, краще дати відпочинок на 3-4 дні."
        ]
    },
    {
        keywords: ["спин", "поперек", "хребет", "гриж", "протруз", "лопатк"],
        answers: [
            "Біль у попереку? Скоріш за все, ти перевантажуєш його замість пресу або ніг. Тримай 'нейтральну спину' і не роби різких нахилів з вагою.",
            "Якщо болить між лопатками, зверни увагу на розминку грудного відділу. Твоя спина має бути рівною, як струна."
        ]
    },
    {
        keywords: ["плеч", "плечо", "ключиц", "манжет"],
        answers: [
            "Плечі — найрухливіші суглоби. Якщо болить при жимі — зменш амплітуду або заміни штангу на гантелі (паралельний хват).",
            "Обов'язково розігрівай ротаторну манжету плеча перед будь-яким тренуванням верху тіла!"
        ]
    },
    {
        keywords: ["лікот", "лікт", "епіконд"],
        answers: [
            "Біль у ліктях часто виникає через 'лікоть тенісиста' або занадто вузький хват. Спробуй не випрямляти руки до кінця (не 'вставляй' суглоб у замок)."
        ]
    },
    {
        keywords: ["зап'яст", "кист", "руки болять", "пальц"],
        answers: [
            "При болях у зап'ястях під час упорів на підлогу спробуй робити вправи на кулаках або використовуй спеціальні упори. Це зніме зайвий злам у суглобі.", // Прибрали "віджиман"
            "Часто зап'ястя болять через слабкість передпліч. Додай вправи на хват у кінці тренування."
        ]
    },
    {
        keywords: ["стоп", "п'ят", "гомілк", "ахіл"],
        answers: [
            "Біль у стопі може бути через погане взуття. Не тренуйся в кедах з плоскою підошвою, якщо робиш велику вагу або багато стрибаєш."
        ]
    },
    {
        keywords: ["судом", "зводить", "тягне"],
        answers: [
            "М'язи зводить? Можливо, не вистачає магнію, калію або ти п'єш замало води. Спробуй додати мінеральну воду в раціон та добре розтягуйся."
        ]
    },
    {
        keywords: ["шиї", "шия", "потилиц"],
        answers: [
            "Біль у шиї при тренуванні пресу каже про те, що ти тягнеш голову руками. Погляд має бути спрямований у стелю, а між підборіддям і грудьми має проходити кулак."
        ]
    },
    {
        keywords: ["кріпатур", "м'яз", "після тренуван", "ниє"],
        answers: [
            "Кріпатура — це ознака мікротравм, які змушують м'язи рости. Допоможе тепла ванна, легка активність (ходьба) та сон.",
            "Якщо м'язи болять так, що не можеш рухатись — ти перетренувався. Наступного разу зменш кількість підходів на 30%."
        ]
    },

    // --- РОЗШИРЕНИЙ БЛОК: ДОМАШНІ ТРЕНУВАННЯ ТА ЛАЙФХАКИ ---
    {
        keywords: ["вдома", "дома", "квартир", "кімнат"],
        answers: [
            "Для крутого тренування вдома достатньо 2х2 метри простору. Твоя вага — це найкращий інвентар!",
            "Тренування вдома економлять час. Головне — прибрати все, що заважає, і виставити таймер."
        ]
    },
    {
        keywords: ["замінити гантел", "немає гантел", "пляшк", "баклаж"],
        answers: [
            "Замість гантелей бери пляшки з водою: 0.5л = 0.5кг, 2л = 2кг. Хочеш важче? Насип у них пісок або крупу.",
            "Для великої ваги (як штанга) візьми 5-літрові баклажки або рюкзак, набитий книгами."
        ]
    },
    {
        keywords: ["замінити лаву", "стільц", "диван", "табурет"],
        answers: [
            "Замість лави для жиму чи розведень рук використовуй два стійких стільця (без спинок) або край дивану.",
            "Для вправ на трицепс в упорі ззаду диван або низьке крісло — ідеальний варіант." // Прибрали "віджиман"
        ]
    },
    {
        keywords: ["турнік", "підтягуван", "двері", "одвірок"],
        answers: [
            "Немає турніка? Можна робити 'тягу рушника', лежачи на животі, або підтягуватися на міцному столі.",
            "Можна підтягуватися на верхньому краї міцних дверей, підклавши під них щось для фіксації."
        ]
    },
    {
        keywords: ["килимок", "підлог", "каремат", "ковдр", "рушник"],
        answers: [
            "Немає каремата? Склади звичайну ковдру у 2-3 рази або поклади товстий рушник, щоб не було боляче колінам."
        ]
    },
    {
        keywords: ["гумк", "еспандер", "резинк"],
        answers: [
            "Фітнес-гумки — це 'кишеньковий зал'. Вони замінюють більшість тренажерів. Якщо немає — використовуй еластичний бинт."
        ]
    },
    {
        keywords: ["скакалк", "кардіо вдома", "стрибат"],
        answers: [
            "Немає скакалки? Роби 'імітацію скакалки' або вправу 'джампінг джек'. Біг на місці теж чудово працює."
        ]
    },
    {
        keywords: ["обтяжувач", "рюкзак", "книг"],
        answers: [
            "Рюкзак — це найкращий домашній обтяжувач. Поклади туди книги або пляшки з водою і роби присідання."
        ]
    },
    {
        keywords: ["підтягуван", "тяга", "рушник"],
        answers: [
            "Візьми звичайний рушник, зачепи його за ручку дверей — і ти зможеш робити тягу під нахилом."
        ]
    },

    // ЗАЛ ТА ТРЕНАЖЕРИ
    {
        keywords: ["зал", "фітнес", "тренажерк", "абонемент"],
        answers: [
            "Перший раз у залі? Почни з кардіо (10 хв), щоб оглянутись. Не бійся запитувати чергового тренера про інвентар.",
            "У залі головне — регулярність. Навіть якщо немає настрою, просто прийди і зроби хоча б розминку."
        ]
    },
    {
        keywords: ["штанг", "гриф", "блін", "замок", "стійк"],
        answers: [
            "Стандартний олімпійський гриф важить 20 кг. Завжди використовуй замки на штанзі!",
            "Якщо береш велику вагу на штангу — обов'язково попроси когось тебе підстрахувати."
        ]
    },
    {
        keywords: ["зайнято", "черга", "замінити тренажер"],
        answers: [
            "Тренажер зайнятий? Запропонуй робити по черзі. Більшість тренажерів можна замінити вільними вагами (гантелями).",
            "Жим у Хаммері можна замінити жимом гантелей лежачи, якщо тренажер зайнятий."
        ]
    },
    {
        keywords: ["гантел", "ряд", "важк", "легк"],
        answers: [
            "Гантельний ряд — це твоя база. Завжди клади гантелі на місце після себе. Це етикет залу!",
            "Обирай вагу гантелей так, щоб останні 2 повторення в підході були важкими, але технічними."
        ]
    },
    {
        keywords: ["кросовер", "блок", "тяг", "трос"],
        answers: [
            "Кросовер — універсальний тренажер. На ньому можна опрацювати все тіло: від грудей до пресу.",
            "Працюючи на блоках, не дозволяй вазі різко падати вниз. Контролюй рух."
        ]
    },
    {
        keywords: ["доріжк", "біг", "еліпс", "вело", "степ"],
        answers: [
            "Кардіо-тренажери ідеальні для розминки (5-10 хв) або для спалювання жиру після силового тренування.",
            "Не тримайся руками за поручні бігової доріжки — так ти спалюєш менше калорій."
        ]
    },
    {
        keywords: ["ваг", "скільки ставити", "прогрес"],
        answers: [
            "Принцип прогресії: намагайся щотижня додавати хоча б трохи ваги або робити на 1 повторення більше.",
            "Не намагайся підняти все і відразу. Техніка понад усе."
        ]
    },
    {
        keywords: ["страх", "стидно", "дивляться", "перший раз"],
        answers: [
            "Повір, у залі всі дивляться тільки на себе в дзеркало. Всі колись починали з нуля!",
            "Одягни навушники з улюбленою музикою — це допоможе зосередитись."
        ]
    },
    {
        keywords: ["рушник", "гігієн", "піт", "футболк"],
        answers: [
            "Брати рушник у зал — це база. Стели його на лаву, поважай інших атлетів!"
        ]
    },

    // --- РОЗШИРЕНИЙ БЛОК: ХАРЧУВАННЯ, ДІЄТИ ТА СПОРТИВНІ ДОБАВКИ ---
    {
        keywords: ["їст", "харчува", "дієт", "калорій", "меню", "рецепт"],
        answers: [
            "Базове правило: витрачай більше калорій, ніж споживаєш — і ти схуднеш.",
            "Прибери 'рідкі калорії' (солодкі напої) — це вже дасть результат.",
            "Намагайся їсти 3-4 рази на день невеликими порціями."
        ]
    },
    {
        keywords: ["білок", "білк", "протеїн", "курк", "яйц", "сир", "м'яс"],
        answers: [
            "Білок — будівельний матеріал для м'язів. Норма: 1.5–2 г на 1 кг ваги.",
            "Протеїновий коктейль зручний, але не замінить звичайну їжу."
        ]
    },
    {
        keywords: ["вуглев", "каш", "макарон", "рис", "греч", "енергія"],
        answers: [
            "Вуглеводи — твоє пальне. Обирай складні: гречку, рис, макарони твердих сортів.",
            "Не бійся вуглеводів! Без них не буде сил на важкі тренування."
        ]
    },
    {
        keywords: ["жир", "олій", "горіх", "авокад"],
        answers: [
            "Жири важливі для гормонів! Додавай горіхи, оливкову олію, авокадо.",
            "Уникай трансжирів (фастфуд), але не виключай корисні жири."
        ]
    },
    {
        keywords: ["до тренуван", "перед тренуван", "їсти до"],
        answers: [
            "Ідеально поїсти за 1.5–2 години до залу: складні вуглеводи + білок.",
            "Якщо до тренування 30 хвилин — з'їж банан."
        ]
    },
    {
        keywords: ["після тренуван", "їсти після", "вікно"],
        answers: [
            "Після тренування потрібен білок і вуглеводи. Поїж протягом години-півтори.",
            "Затягувати з їжею після залу не варто, організму потрібні ресурси."
        ]
    },
    {
        keywords: ["креатин", "сила", "памп"],
        answers: [
            "Креатин дає силу та робить м'язи більшими за рахунок води. Пий 5 г щодня.",
            "Креатин працює накопичувально, пий його і в дні відпочинку."
        ]
    },
    {
        keywords: ["вітамін", "омега", "магній", "цинк"],
        answers: [
            "Омега-3 корисна для суглобів, магній — від судом. Але краще здай аналізи!",
            "Мультивітаміни корисні при інтенсивних навантаженнях."
        ]
    },
    {
        keywords: ["солодк", "цукор", "тортик", "читміл", "зірвався"],
        answers: [
            "Читміл допомагає психологічно. З'їж свій бургер і тренуйся далі!",
            "Замінюй солодощі фруктами або протеїновими батончиками."
        ]
    },
    {
        keywords: ["ніч", "на ніч", "перед сном", "їсти ввечері"],
        answers: [
            "Їсти на ніч можна, якщо це вписується в норму. Кращий вибір — білок з овочами.",
            "Вуглеводи після 18:00 не стають жиром автоматично. Важлива добова калорійність."
        ]
    },

    // --- РОЗШИРЕНИЙ БЛОК: РЕЖИМ, СОН ТА ВІДНОВЛЕННЯ ---
    {
        keywords: ["сон", "спати", "ніч", "недосип"],
        answers: [
            "Сон — головний анаболік. Тобі потрібно 7-9 годин якісного сну.",
            "Намагайся лягати до 23:00 для оптимального гормонального фону."
        ]
    },
    {
        keywords: ["відновлен", "відпочинок", "пауз", "вихідн"],
        answers: [
            "М'язи ростуть, коли ти відпочиваєш. Роби 1-2 повних дні відпочинку на тиждень.",
            "Активне відновлення (прогулянка, плавання) допомагає м'язам швидше."
        ]
    },
    {
        keywords: ["перетренован", "втом", "сил немає", "не хочу", "апатія"],
        answers: [
            "Симптоми перетренованості: поганий сон, дратівливість, зупинка прогресу. Візьми тиждень легких тренувань (делоад).",
            "Іноді 'менше' означає 'більше' для результату. Дай ЦНС відпочити."
        ]
    },
    {
        keywords: ["гаряча ванн", "лазня", "саун", "душ", "масаж"],
        answers: [
            "Сауна та гаряча ванна покращують кровообіг. Масаж знімає затискачі.",
            "Контрастний душ чудово бадьорить судини після тренування."
        ]
    },
    {
        keywords: ["розтяжк", "стретчинг", "йог", "гнучк"],
        answers: [
            "Розтяжка після тренування покращує еластичність м'язів і знижує ризик травм.",
            "Йога в дні відпочинку допомагає покращити поставу."
        ]
    },
    {
        keywords: ["щодня", "кожен день", "частота"],
        answers: [
            "Тренуватися щодня — погана ідея для новачків. М'язам потрібно час.",
            "Кращий графік — 3-4 тренування на тиждень."
        ]
    },
    {
        keywords: ["стрес", "нерв", "робот", "психолог"],
        answers: [
            "Психологічний стрес виснажує так само, як і штанга. Кортизол руйнує м'язи.",
            "Використовуй спорт як розрядку, а не як додатковий стрес."
        ]
    },

    // --- РОЗШИРЕНИЙ БЛОК: МОТИВАЦІЯ ТА ПСИХОЛОГІЯ УСПІХУ ---
    {
        keywords: ["лін", "не хочу", "немає сил", "ліньки", "не можу", "важко"],
        answers: [
            "Спробуй 'правило 5 хвилин': потренуйся лише 5 хвилин. Зазвичай втягуєшся!",
            "Лінь — це часто просто втома. Розбий тренування на маленькі частини.",
            "Найважче — одягнути кросівки. Далі буде легше!"
        ]
    },
    {
        keywords: ["мотивац", "надих", "стимул", "навіщо"],
        answers: [
            "Мотивація допомагае почати. Дисципліна змушує продовжувати.",
            "Твій результат через рік залежить від того, що ти зробиш сьогодні.",
            "Твоє тіло — єдине місце, де тобі доведеться жити. Зроби його сильним!"
        ]
    },
    {
        keywords: ["результат", "не бачу змін", "коли буде", "вага стоїть", "плато"],
        answers: [
            "Перші зміни ти побачиш через 4 тижні регулярності. Не здавайся!",
            "Вага може стояти через ріст м'язів. Орієнтуйся на заміри та дзеркало.",
            "Якщо прогрес зупинився — зміни вправи або додай трохи кардіо."
        ]
    },
    {
        keywords: ["кинут", "здаюсь", "набридло", "вигоран"],
        answers: [
            "Якщо ти втомився — навчися відпочивати, а не кидати.",
            "Згадай, чому ти почав. Ти вже пройшов більше, ніж ті, хто не спробував."
        ]
    },
    {
        keywords: ["звичк", "режим", "система"],
        answers: [
            "Зроби спорт частиною рутини, як чищення зубів. Постійність — ключ до успіху.",
            "Краще 20 хвилин, але регулярно, ніж 2 години один раз на місяць."
        ]
    },
    {
        keywords: ["сором", "дивляться", "не вмію", "смішно"],
        answers: [
            "Поважай свій шлях. Ти прийшов працювати над собою, а не оцінювати інших.",
            "Люди в залі зайняті собою, ніхто не буде сміятися."
        ]
    },
    {
        keywords: ["успіх", "ціль", "мрія", "вогонь"],
        answers: [
            "Став маленькі досяжні цілі. Маленькі перемоги ведуть до великих результатів!",
            "Пишайся кожним виконаним підходом."
        ]
    },

    // --- РОЗШИРЕНИЙ БЛОК: М'ЯЗИ ТА КОНКРЕТНІ ВПРАВИ ---
    {
        keywords: ["груди", "грудн", "жим"], // ОЧИЩЕНО ВІД "віджиман"
        answers: [
            "Найкращі вправи на груди: жим штанги чи гантелей. Для верху роби жим під нахилом.",
            "Хочеш широкі грудні? Додай розведення гантелей або кросовер."
        ]
    },
    {
        keywords: ["спин", "широчайш", "підтягуван", "тяг"],
        answers: [
            "Для ширини спини роби підтягування, для товщини — тягу штанги в нахилі.",
            "Не тягни вагу руками, тягни ліктями назад. Працюй спиною."
        ]
    },
    {
        keywords: ["рук", "біцепс", "тріцепс", "брахіаліс"], // ОЧИЩЕНО ВІД "віджиман"
        answers: [
            "Тріцепс складає 60% об'єму руки. Спробуй вправи на брусах.",
            "Для біцепса найкраще — згинання рук. Не розгойдуйся корпусом!"
        ]
    },
    {
        keywords: ["прес", "живіт", "кубик", "боки", "талія"],
        answers: [
            "Прес любить багато повторень та статику (планка). Кубики з'являються, коли знижується відсоток жиру.",
            "Роби підйоми ніг для нижнього пресу та скручування для верхнього."
        ]
    },
    {
        keywords: ["ног", "ноги", "квадріцепс", "стегн", "литк"],
        answers: [
            "База для ніг — це присідання та випади. Виконуй їх технічно.",
            "Не забувай про литки! Підйоми на носки можна робити всюди."
        ]
    },
    {
        keywords: ["сідниц", "ягодиц", "поп", "жоп"],
        answers: [
            "Найкращі вправи: сідничний місток, глибокі присідання та румунська тяга.",
            "Випади назад — чудовий спосіб 'підняти' сідниці."
        ]
    },
    {
        keywords: ["плеч", "дельт", "плечі"],
        answers: [
            "Плечі складаються з 3 пучків. Роби жими та махи гантелей.",
            "Широкі плечі роблять талію візуально вужчою."
        ]
    },
    {
        keywords: ["постав", "сутул", "рівна спина"],
        answers: [
            "Сутулишся? Зміцнюй м'язи спини та розтягуй грудні м'язи."
        ]
    },
    {
        keywords: ["кардіо", "біг", "худнути", "стрибк"],
        answers: [
            "Кардіо краще робити після силового тренування або окремим днем.",
            "Інтервальний біг або швидка ходьба під гору дуже ефективні."
        ]
    },

    // --- БЛОК НЕ ПО ТЕМІ ---
    {
        keywords: ["погода", "політик", "новин", "грати", "ігр", "фільм", "музик", "купити", "грош", "президент"],
        answers: [
            "Це цікаво, але я краще розуміюся на кількості підходів. Обговоримо тренування?",
            "Моя база знань зосереджена на спорті. Давай краще про прес!",
            "Algorithm on: спалювання жиру. Давай про розминку?",
            "Поки всі обговорюють новини, ми зробимо ще підхід. Що скажеш?"
        ]
    }
];

document.addEventListener('DOMContentLoaded', () => {
    updateUI();
    goHome();

    // Ініціалізація чату
    const trigger = document.getElementById('chat-trigger');
    const closeBtn = document.getElementById('close-chat');
    const sendBtn = document.getElementById('send-btn');
    const input = document.getElementById('user-query');
    const chatContainer = document.getElementById('chat-container');

    if (trigger) {
        trigger.onclick = () => {
            chatContainer.classList.toggle('chat-closed');
            if (!chatContainer.classList.contains('chat-closed')) {
                input.focus();
            }
        };
    }

    if (closeBtn) {
        closeBtn.onclick = () => chatContainer.classList.add('chat-closed');
    }

    if (sendBtn) sendBtn.onclick = sendMessage;

    if (input) {
        input.onkeypress = (e) => { if(e.key === 'Enter') sendMessage(); };
    }
});

function sendMessage() {
    const input = document.getElementById('user-query');
    const messages = document.getElementById('chat-messages');
    const userText = input.value.trim();

    // Перевірка наявності користувача та тексту
    if (!userText || !activeUser) return;

    const users = JSON.parse(localStorage.getItem('users')) || {};
    const user = users[activeUser];
    const profile = user.profile || {};

    // Виводимо повідомлення користувача в чат
    messages.innerHTML += `<div class="msg user-msg">${userText}</div>`;

    const lowerText = userText.toLowerCase();
    let response = "";
    let actionAfterMsg = null;

    // --- 1. ПЕРСОНАЛІЗОВАНІ ЗАПИТИ (ІМТ, ВОДА, ІМ'Я) ---
    if (lowerText.includes("імт") || lowerText.includes("індекс маси")) {
        if (profile.weight && profile.height) {
            const bmi = profile.weight / ((profile.height / 100) ** 2);
            let status = bmi < 18.5 ? "недостатня вага" : bmi < 25 ? "норма" : bmi < 30 ? "надлишкова вага" : "ожиріння";
            response = `Твій ІМТ: **${bmi.toFixed(1)}** (${status}). ${bmi > 25 ? "Раджу додати більше кардіо." : "Все супер, тримай темп!"}`;
        } else {
            response = "Мені потрібні твої зріст та вага для розрахунку. Онови їх у профілі!";
        }
    }
    else if (lowerText.includes("вод") && (lowerText.includes("норм") || lowerText.includes("скільки"))) {
        const waterNorm = (profile.weight * 35) / 1000 || 2.5;
        response = `${profile.name || 'Друже'}, твоя норма: **${waterNorm.toFixed(1)} л**. Ти випив **${user.water || 0}** склянок сьогодні.`;
    }

    // --- 2. ПОШУК ВПРАВИ (GIF) - ПРІОРІТЕТ НАД БАЗОЮ ЗНАНЬ ---
    if (!response) {
        // Шукаємо ключ у об'єкті exerciseGifs
        const exerciseKey = Object.keys(exerciseGifs).find(name => {
            const cleanName = name.toLowerCase();
            // Перевіряємо, чи є назва вправи в тексті (напр. "віджимання")
            return lowerText.includes(cleanName.split(' ')[0]);
        });

        if (exerciseKey) {
            response = `Ось техніка вправи **${exerciseKey}**. Виконуй плавно та без поспіху!`;
            actionAfterMsg = () => openModal(exerciseGifs[exerciseKey], exerciseKey);
        }
    }

    // --- 3. ЗАГАЛЬНА БАЗА ЗНАНЬ ---
    if (!response) {
        const found = botKnowledge.find(item =>
            item.keywords.some(k => lowerText.includes(k))
        );

        if (found) {
            response = found.answers[Math.floor(Math.random() * found.answers.length)];
        }
    }

    // --- 4. FALLBACK (ЯКЩО НІЧОГО НЕ ПІДІЙШЛО) ---
    if (!response) {
        const fallbacks = [
            "Я — твій фітнес-асистент. Запитай мене про вправи, ІМТ або харчування!",
            "Цікаво, але давай краще про тренування. Може, показати як робити віджимання?",
            "Не впевнений, що зрозумів. Спробуй уточнити запит щодо спорту."
        ];
        response = fallbacks[Math.floor(Math.random() * fallbacks.length)];
    }

    // Очищення поля та скрол
    input.value = '';
    messages.scrollTop = messages.scrollHeight;

    // Відповідь бота з невеликою затримкою
    setTimeout(() => {
        messages.innerHTML += `<div class="msg bot-msg">${response}</div>`;
        messages.scrollTop = messages.scrollHeight;

        // Виклик модалки, якщо була знайдена вправа
        if (actionAfterMsg) {
            setTimeout(actionAfterMsg, 600);
        }
    }, 500);
}

// --- РЕШТА ФУНКЦІЙ (БЕЗ ЗМІН) ---

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
    const btn = event.currentTarget;
    if (!input) return;

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

function showSection(sectionId) {
    const ids = ['about', 'auth', 'profile', 'home', 'saved', 'dashboard'];

    // 1. Перемикаємо видимість секцій
    ids.forEach(x => {
        const el = document.getElementById(x);
        if (el) {
            // Виправлено: використовуємо sectionId замість id
            el.style.display = (x === sectionId ? 'block' : 'none');
        }
    });

    // 3. Запуск специфічних функцій для кожної секції
    if (sectionId === 'profile') loadProfile();
    if (sectionId === 'saved') renderSaved();
    if (sectionId === 'dashboard') updateDashboardUI();

    // Прокрутка вгору при зміні сторінки (корисно для мобільних)
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function handleStartClick() {
    if (activeUser) {
        checkProfileBeforeHome();
    } else {
        showSection('auth');
        toggleAuthForms(true);
    }
}

function checkProfileBeforeHome() {
    let usersStr = localStorage.getItem('users');
    if (!usersStr) return;
    let users = JSON.parse(usersStr);
    let user = users[activeUser];
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
        updateUI(); // Цей рядок тепер увімкне чат
        goHome();
    } else {
        notify("Невірний логін або пароль!", true);
    }
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

    // Ховаємо саме вікно чату, якщо воно було відкрите
    const chatContainer = document.getElementById('chat-container');
    if (chatContainer) chatContainer.classList.add('chat-closed');

    clearAllForms();
    updateUI(); // Цей рядок тепер приховає кнопку чату
    showSection('about'); // Повертаємо на головну
}

function toggleAuthForms(isRegister) {
    const loginBox = document.getElementById('loginBox');
    const registerBox = document.getElementById('registerBox');

    if (isRegister) {
        loginBox.style.display = 'none';
        registerBox.style.display = 'block';
    } else {
        loginBox.style.display = 'block';
        registerBox.style.display = 'none';
    }
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

function updateWater(change) {
    const users = JSON.parse(localStorage.getItem('users')) || {};
    if (!activeUser || !users[activeUser]) return;

    const user = users[activeUser];
    if (user.water === undefined) user.water = 0;

    // Обмеження від 0 до 8
    user.water = Math.max(0, Math.min(8, user.water + change));

    localStorage.setItem('users', JSON.stringify(users));

    const countEl = document.getElementById('waterCount');
    const progressEl = document.getElementById('waterProgressBar');
    const adviceEl = document.getElementById('water-advice');
    const dashCountEl = document.getElementById('dashWaterCount');
    const dashBarEl = document.getElementById('dashWaterBar');

    const percent = (user.water / 8) * 100;

    // ВИЗНАЧЕННЯ КОЛЬОРУ СМУЖКИ
    // Якщо 8 склянок — зелений (#2ecc71), якщо менше — синій (#00d2ff або твій акцент)
    const barColor = user.water >= 8 ? "#2ecc71" : "#00d2ff";

    // Оновлення цифр
    if (countEl) countEl.innerText = user.water;
    if (dashCountEl) dashCountEl.innerText = user.water;

    // Оновлення смужок (ширина та колір)
    if (progressEl) {
        progressEl.style.width = percent + '%';
        progressEl.style.backgroundColor = barColor;
    }
    if (dashBarEl) {
        dashBarEl.style.width = percent + '%';
        dashBarEl.style.backgroundColor = barColor;
    }

    // НАЛАШТУВАННЯ НАДПИСІВ
    if (adviceEl) {
        // Колір надпису завжди золотий (як кнопки + та -)
        adviceEl.style.color = "#ffd700";
        adviceEl.style.fontWeight = "bold"; // Щоб краще читалися на темному фоні

        let adviceText = "";
        if (user.water === 0) {
            adviceText = "Час випити першу склянку води!";
        } else if (user.water < 4) {
            adviceText = "Вода прискорює метаболізм та дає енергію.";
        } else if (user.water < 8) {
            adviceText = "Ти на правильному шляху до мети!";
        } else {
            adviceText = "Ви досягли норми! Твій організм працює як годинник.";
        }

        adviceEl.innerText = adviceText;
    }
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

// Тут твій великий масив exerciseGifs залишається без змін (скоротив для читання відповіді)
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
    let usersStr = localStorage.getItem('users');
    if (!usersStr) return;
    const users = JSON.parse(usersStr);
    const user = users[activeUser];
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
    const container = document.getElementById('savedProgramsList');

    if (!user.saved?.length) {
        container.innerHTML = "<p style='text-align:center; color:#888; padding:20px;'>Збережених планів поки немає.</p>";
        return;
    }

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

    // Навігація
    ['navHome', 'navProfile', 'navSaved'].forEach(n => {
        const el = document.getElementById(n);
        if(el) el.style.display = isAuth ? 'block' : 'none';
    });

    // Кнопка Вхід/Вихід
    const navAuth = document.getElementById('navAuth');
    if(navAuth) {
        navAuth.innerHTML = isAuth
            ? `<a href="#" onclick="logout()">Вихід</a>`
            : `<a href="#" onclick="openLogin()">Вхід</a>`;
    }

    // --- ЛОГІКА ЧАТУ ---
    const chatBtn = document.getElementById('chat-trigger');
    if (chatBtn) {
        // Показуємо кнопку чату ТІЛЬКИ якщо користувач залогінений
        chatBtn.style.display = isAuth ? 'block' : 'none';
    }
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

function openLogin() {
    // 1. Показуємо основну секцію авторизації
    showSection('auth');

    // 2. Отримуємо посилання на блоки
    const loginBox = document.getElementById('loginBox');
    const registerBox = document.getElementById('registerBox');

    // 3. ПРИМУСОВО вмикаємо Вхід і вимикаємо Реєстрацію
    if (loginBox && registerBox) {
        loginBox.style.display = 'block';
        registerBox.style.display = 'none';
    }

    // Скролимо вгору, щоб користувач точно бачив форму
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function openRegister() {
    // 1. Показуємо основну секцію авторизації
    showSection('auth');

    // 2. Отримуємо посилання на блоки
    const loginBox = document.getElementById('loginBox');
    const registerBox = document.getElementById('registerBox');

    // 3. ПРИМУСОВО вмикаємо Реєстрацію і вимикаємо Вхід
    if (loginBox && registerBox) {
        loginBox.style.display = 'none';
        registerBox.style.display = 'block';
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
}