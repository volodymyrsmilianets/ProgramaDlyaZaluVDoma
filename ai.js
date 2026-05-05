// ai.js
const GEMINI_API_KEY = "API Ключ";

async function getGeminiResponse(userText, userData, exercisesList) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${GEMINI_API_KEY}`;

    const systemPrompt = `Ти — суворий фітнес-коуч застосунку TRPoint. 
    Твоя сфера компетенції: ТІЛЬКИ фітнес, тренування, харчування та здоров'я.
    
    ПРАВИЛА ВАЛІДАЦІЇ ЗАПИТІВ:
    1. Якщо користувач питає про щось, що не стосується спорту (політика, програмування, рецепти страв, ігри тощо) — ввічливо відмов і поверни до тренувань.
    2. Твої відповіді мають базуватися на даних клієнта: ${userData.name}, ІМТ: ${userData.bmi}, Рівень: ${userData.level}.
    3. Якщо просять вправу — використовуй команду [EXECUTE_EXERCISE:Назва].
    
    Доступні вправи: ${exercisesList.join(", ")}.
    
    ПРИКЛАД ВІДМОВИ: "Я — твій фітнес-помічник, тому не можу обговорювати цю тему. Давай краще розберемо твоє сьогоднішнє тренування!"`;
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: systemPrompt + "\n\nЗапит: " + userText }] }]
            })
        });

        const data = await response.json();

        // ОБРОБКА ПЕРЕВАНТАЖЕННЯ (503)
        if (data.error && data.error.code === 503) {
            console.warn("ШІ перевантажений, видаю стандартну відповідь.");
            return "Зараз я отримую забагато запитів від атлетів! Спробуй написати ще раз за 10 секунд. Поки що пам'ятай: головне — техніка, а не вага!";
        }

        if (data.error) return `Помилка: ${data.error.message}`;

        return data.candidates[0].content.parts[0].text;

    } catch (error) {
        return "Сервер ШІ тимчасово не відповідає. Спробуй пізніше.";
    }
}