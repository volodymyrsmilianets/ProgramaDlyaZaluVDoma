// ai.js
const GEMINI_API_KEY = "AIzaSyAysgLFA2mgF3bIKy0U_ANF-GgRl6RaQk4";

async function getGeminiResponse(userText, userData, exercisesList) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

    const systemPrompt = `Ти — фітнес-асистент TRPoint. Користувач: ${userData.name}, ІМТ: ${userData.bmi}.`;

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