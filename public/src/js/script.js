// Burger menu toggle
function toggleMenu() {
    const nav = document.querySelector('nav ul');
    nav.classList.toggle('active');
}

// ========== ЗАГАЛЬНИЙ КОД ДЛЯ ВСІХ СТОРІНОК ==========
document.addEventListener('DOMContentLoaded', () => {
    
    // Перевірка, чи користувач увійшов в систему
    const user = getCurrentUser();
    const nav = document.getElementById('nav');

    if (user) {
        // Якщо користувач увійшов, змінюємо меню
        let userLinks = '';
        if (user.role === 'admin') {
            userLinks = `
                <li><a href="/html/admin-dashboard.html">Адмін-панель</a></li>
                <li><a href="/html/admin-routes.html">Маршрути</a></li>
                <li><a href="/html/admin-tickets.html">Квитки</a></li>
            `;
        } else {
            userLinks = `
                <li><a href="/html/user-dashboard.html">Мій кабінет</a></li>
            `;
        }
        
        nav.innerHTML = `
            <ul>
                <li><a href="/index.html">Головна</a></li>
                <li><a href="/html/routes.html">Знайти квиток</a></li>
                ${userLinks}
                <li><a href="#" id="logout-btn">Вихід (${user.name})</a></li>
            </ul>
        `;

        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                logout();
            });
        }

    } else {
        // Меню для гостя (як у вас і було)
        nav.innerHTML = `
            <ul>
                <li><a href="/index.html">Головна</a></li>
                <li><a href="/html/routes.html">Маршрути</a></li>
                <li><a href="/html/about.html">Про нас</a></li>
                <li><a href="/html/login.html">Вхід</a></li>
            </ul>
        `;
    }

    // Запускаємо логіку, специфічну для поточної сторінки
    initPage();
});

// ========== СПЕЦИФІЧНА ЛОГІКА ДЛЯ КОЖНОЇ СТОРІНКИ ==========

// Роутер, який запускає потрібну функцію залежно від сторінки
function initPage() {
    const path = window.location.pathname;

    if (path.endsWith('/') || path.endsWith('/index.html')) {
        // Логіка для головної сторінки (якщо потрібна)
    } else if (path.endsWith('/login.html')) {
        initLoginPage();
    } else if (path.endsWith('/routes.html')) {
        initRoutesPage();
    } else if (path.endsWith('/admin-routes.html')) {
        initAdminRoutesPage();
    } else if (path.endsWith('/admin-tickets.html')) {
        initAdminTicketsPage();
    } else if (path.endsWith('/user-dashboard.html')) {
        initUserDashboardPage();
    }
}


// --- 1. СТОРІНКА ВХОДУ ---
function initLoginPage() {
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault(); 
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            const user = await login(email, password);
            if (user) {
                alert('Успішний вхід! Вітаємо, ' + user.name);
                if (user.role === 'admin') {
                    window.location.href = '/html/admin-dashboard.html';
                } else {
                    window.location.href = '/html/user-dashboard.html';
                }
            }
        });
    }
}

// --- 2. СТОРІНКА МАРШРУТІВ (ПУБЛІЧНА) ---
async function initRoutesPage() {
    const routesContainer = document.getElementById('routes-list');
    if (!routesContainer) return;

    const routes = await getAllRoutes();
    routesContainer.innerHTML = ''; // Очищуємо заглушки

    if (routes.length === 0) {
        routesContainer.innerHTML = '<p>Наразі доступних маршрутів немає.</p>';
        return;
    }

    routes.forEach(route => {
        const routeCard = document.createElement('div');
        routeCard.className = 'card';
        routeCard.style.marginBottom = '1.5rem';
        routeCard.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
                <div>
                    <h3>${route.from} → ${route.to}</h3>
                    <p>Відправлення: ${route.departureTime} | Прибуття: ${route.arrivalTime}</p>
                    <p>Тип: ${route.type} | Доступно: ${route.availableSeats}</p>
                </div>
                <div>
                    <p style="font-size: 1.5rem; font-weight: bold; color: #667eea;">${route.price} грн</p>
                    <button class="btn" onclick="buyRoute(${route.id})">Забронювати</button>
                </div>
            </div>
        `;
        routesContainer.appendChild(routeCard);
    });
}

// Функція для кнопки "Забронювати"
function buyRoute(routeId) {
    const user = getCurrentUser();
    if (!user) {
        alert('Будь ласка, увійдіть в систему, щоб купити квиток.');
        window.location.href = '/html/login.html';
        return;
    }

    const departureDate = prompt('Введіть дату відправлення (напр. 2025-11-10):');
    if (!departureDate) return;

    const ticketData = {
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        routeId: routeId,
        departureDate: departureDate
    };
    
    // Викликаємо функцію з api.js
    buyTicket(ticketData);
}

// --- 3. СТОРІНКА АДМІН-МАРШРУТИ ---
async function initAdminRoutesPage() {
    const routesTableBody = document.getElementById('admin-routes-table-body');
    const addRouteForm = document.getElementById('add-route-form');

    // Функція для завантаження та відображення маршрутів
    async function loadRoutes() {
        if (!routesTableBody) return;
        
        const routes = await getAllRoutes();
        routesTableBody.innerHTML = ''; // Очищуємо заглушки
        
        routes.forEach(route => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${route.id}</td>
                <td>${route.from} → ${route.to}</td>
                <td>${route.departureTime}</td>
                <td>${route.arrivalTime}</td>
                <td>${route.price} грн</td>
                <td>${route.type}</td>
                <td>${route.availableSeats}</td>
                <td>
                    <button class="action-btn btn-delete" onclick="handleDeleteRoute(${route.id})">Видалити</button>
                </td>
            `;
            routesTableBody.appendChild(row);
        });
    }

    // Обробник для форми додавання
    if (addRouteForm) {
        addRouteForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const routeData = {
                from: document.getElementById('from').value,
                to: document.getElementById('to').value,
                departureTime: document.getElementById('departureTime').value,
                arrivalTime: document.getElementById('arrivalTime').value,
                price: parseInt(document.getElementById('price').value),
                type: document.getElementById('type').value,
                availableSeats: parseInt(document.getElementById('availableSeats').value)
            };

            const result = await addRoute(routeData);
            if (result && !result.error) {
                alert('Маршрут успішно додано!');
                addRouteForm.reset();
                loadRoutes(); // Оновити таблицю
            } else {
                alert('Помилка додавання маршруту: ' + (result ? result.error : ''));
            }
        });
    }

    // Початкове завантаження маршрутів
    loadRoutes();
}

// Обробник для кнопки видалення (глобальний, бо кнопки динамічні)
async function handleDeleteRoute(id) {
    if (confirm(`Ви впевнені, що хочете видалити маршрут ID ${id}?`)) {
        await deleteRoute(id);
        alert('Маршрут видалено');
        initAdminRoutesPage(); // Перезавантажити список
    }
}

// --- 4. СТОРІНКА АДМІН-КВИТКИ ---
async function initAdminTicketsPage() {
    const ticketsTableBody = document.getElementById('admin-tickets-table-body');
    if (!ticketsTableBody) return;

    const tickets = await getAllTickets();
    ticketsTableBody.innerHTML = ''; // Очищуємо заглушки

    tickets.forEach(ticket => {
        const row = document.createElement('tr');
        
        let statusColor = 'black';
        if (ticket.status === 'paid') statusColor = 'green';
        if (ticket.status === 'booked') statusColor = 'orange';
        if (ticket.status === 'cancelled') statusColor = 'red';

        row.innerHTML = `
            <td>${ticket.id}</td>
            <td>${ticket.userName} (ID: ${ticket.userId})</td>
            <td>${ticket.from} → ${ticket.to}</td>
            <td>${ticket.departureDate}</td>
            <td>Ваг ${ticket.carriage}, М ${ticket.seat}</td>
            <td>${ticket.price} грн</td>
            <td><span style="color: ${statusColor}; font-weight: bold;">${ticket.status}</span></td>
            <td>
                ${ticket.status !== 'cancelled' ? 
                `<button class="action-btn btn-delete" onclick="handleCancelTicket(${ticket.id})">Скасувати</button>` :
                'Немає дій'}
            </td>
        `;
        ticketsTableBody.appendChild(row);
    });
}

// Обробник для скасування квитка
async function handleCancelTicket(id) {
    if (confirm(`Скасувати квиток ID ${id}?`)) {
        await cancelTicket(id);
        alert('Квиток скасовано');
        initAdminTicketsPage(); // Перезавантажити список
    }
}

// --- 5. СТОРІНКА КАБІНЕТУ КОРИСТУВАЧА ---
async function initUserDashboardPage() {
    const user = getCurrentUser();
    if (!user) {
        window.location.href = '/html/login.html'; // Якщо не залогінений - на вхід
        return;
    }

    // Заповнюємо профіль
    document.getElementById('user-greeting').innerText = `Вітаємо, ${user.name}!`;
    document.getElementById('user-profile-name').innerText = user.name;
    document.getElementById('user-profile-email').innerText = user.email;
    
    // Завантажуємо квитки
    const ticketsTableBody = document.getElementById('user-tickets-table-body');
    if (!ticketsTableBody) return;
    
    const tickets = await getUserTickets(user.id);
    ticketsTableBody.innerHTML = ''; // Очищуємо заглушки

    if (tickets.length === 0) {
        ticketsTableBody.innerHTML = '<tr><td colspan="5">У вас ще немає квитків.</td></tr>';
        return;
    }

    tickets.forEach(ticket => {
        const row = document.createElement('tr');
        let statusColor = 'black';
        if (ticket.status === 'paid') statusColor = 'green';
        if (ticket.status === 'booked') statusColor = 'orange';
        if (ticket.status === 'cancelled') statusColor = 'red';

        row.innerHTML = `
            <td>${ticket.departureDate}</td>
            <td>${ticket.from} → ${ticket.to}</td>
            <td>Ваг ${ticket.carriage}, М ${ticket.seat}</td>
            <td><span style="color: ${statusColor};">${ticket.status}</span></td>
            <td>
                <button class"action-btn btn-edit" onclick="showTicketInfo(${JSON.stringify(ticket)})">Переглянути</button>
            </td>
        `;
        ticketsTableBody.appendChild(row);
    });
}