// API Base URL
const API_URL = 'http://localhost:3000/api';

// ========== МАРШРУТИ ==========

// Отримати всі маршрути
async function getAllRoutes() {
    try {
        const response = await fetch(`${API_URL}/routes`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Помилка отримання маршрутів:', error);
        return [];
    }
}

// Отримати маршрут за ID
async function getRouteById(id) {
    try {
        const response = await fetch(`${API_URL}/routes/${id}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Помилка отримання маршруту:', error);
        return null;
    }
}

// Додати маршрут (ADMIN)
async function addRoute(routeData) {
    try {
        const response = await fetch(`${API_URL}/routes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(routeData)
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Помилка додавання маршруту:', error);
        return null;
    }
}

// Оновити маршрут (ADMIN)
async function updateRoute(id, routeData) {
    try {
        const response = await fetch(`${API_URL}/routes/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(routeData)
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Помилка оновлення маршруту:', error);
        return null;
    }
}

// Видалити маршрут (ADMIN)
async function deleteRoute(id) {
    try {
        const response = await fetch(`${API_URL}/routes/${id}`, {
            method: 'DELETE'
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Помилка видалення маршруту:', error);
        return null;
    }
}

// ========== КВИТКИ ==========

// Купити квиток
async function buyTicket(ticketData) {
    try {
        const response = await fetch(`${API_URL}/tickets/buy`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(ticketData)
        });
        const data = await response.json();
        
        if (response.ok) {
            // Показати інформацію про квиток
            showTicketInfo(data.ticket);
            return data;
        } else {
            alert('Помилка: ' + data.error);
            return null;
        }
    } catch (error) {
        console.error('Помилка покупки квитка:', error);
        alert('Помилка покупки квитка');
        return null;
    }
}

// Забронювати квиток
async function bookTicket(ticketData) {
    try {
        const response = await fetch(`${API_URL}/tickets/book`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(ticketData)
        });
        const data = await response.json();
        
        if (response.ok) {
            showTicketInfo(data.ticket);
            return data;
        } else {
            alert('Помилка: ' + data.error);
            return null;
        }
    } catch (error) {
        console.error('Помилка бронювання:', error);
        return null;
    }
}

// Показати інформацію про квиток
function showTicketInfo(ticket) {
    const info = `
╔════════════════════════════════════╗
║         ЗАЛІЗНИЧНИЙ КВИТОК         ║
╚════════════════════════════════════╝

🎫 Номер квитка: ${ticket.ticketNumber}
👤 Пасажир: ${ticket.userName}
📧 Email: ${ticket.userEmail}

🚂 Потяг: ${ticket.trainNumber}
📍 Маршрут: ${ticket.from} → ${ticket.to}
📅 Дата: ${ticket.departureDate}
🕐 Відправлення: ${ticket.departureTime}
🕐 Прибуття: ${ticket.arrivalTime}

🚃 Вагон: ${ticket.carriage}
💺 Місце: ${ticket.seat}
💰 Ціна: ${ticket.price} грн
📦 Тип: ${ticket.type}

✅ Статус: ${ticket.status === 'paid' ? 'Оплачено' : 'Заброньовано'}
📱 QR-код: ${ticket.qrCode}
    `;
    
    console.log(info);
    alert('Квиток успішно куплено!\nДеталі виведено в консоль (F12)');
}

// Отримати всі квитки
async function getAllTickets() {
    try {
        const response = await fetch(`${API_URL}/tickets`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Помилка отримання квитків:', error);
        return [];
    }
}

// Отримати квитки користувача
async function getUserTickets(userId) {
    try {
        const response = await fetch(`${API_URL}/users/${userId}/tickets`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Помилка отримання квитків користувача:', error);
        return [];
    }
}

// Скасувати квиток
async function cancelTicket(id) {
    try {
        const response = await fetch(`${API_URL}/tickets/${id}`, {
            method: 'DELETE'
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Помилка скасування квитка:', error);
        return null;
    }
}

// ========== КОРИСТУВАЧІ ==========

// Вхід
async function login(email, password) {
    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        const data = await response.json();
        
        if (response.ok) {
            // Зберегти дані користувача в localStorage
            localStorage.setItem('user', JSON.stringify(data.user));
            return data.user;
        } else {
            alert('Помилка: ' + data.error);
            return null;
        }
    } catch (error) {
        console.error('Помилка входу:', error);
        return null;
    }
}

// Реєстрація
async function register(userData) {
    try {
        const response = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });
        const data = await response.json();
        
        if (response.ok) {
            localStorage.setItem('user', JSON.stringify(data.user));
            return data.user;
        } else {
            alert('Помилка: ' + data.error);
            return null;
        }
    } catch (error) {
        console.error('Помилка реєстрації:', error);
        return null;
    }
}

// Вийти
function logout() {
    localStorage.removeItem('user');
    window.location.href = '/index.html';
}

// Отримати поточного користувача
function getCurrentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
}

// ========== ПРИКЛАДИ ВИКОРИСТАННЯ ==========

// Приклад покупки квитка
async function exampleBuyTicket() {
    const user = getCurrentUser();
    if (!user) {
        alert('Спочатку увійдіть в систему');
        return;
    }

    const ticketData = {
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        routeId: 1, // ID маршруту
        departureDate: '2025-11-05',
        carriage: 5,
        seat: 12
    };

    const result = await buyTicket(ticketData);
    if (result) {
        console.log('Квиток куплено:', result.ticket);
    }
}

// Приклад отримання маршрутів
async function exampleGetRoutes() {
    const routes = await getAllRoutes();
    console.log('Доступні маршрути:', routes);
    return routes;
}

// Приклад входу
async function exampleLogin() {
    const user = await login('ivan@example.com', 'user123');
    if (user) {
        console.log('Вхід успішний:', user);
        // Перенаправити на сторінку користувача
        if (user.role === 'admin') {
            window.location.href = '/src/html/admin-dashboard.html';
        } else {
            window.location.href = '/src/html/user-dashboard.html';
        }
    }
}