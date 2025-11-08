const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// -----------------------------------------------------------------
// ▼▼▼ ОСЬ ГОЛОВНЕ ВИПРАВЛЕННЯ ▼▼▼
// 
// Ми кажемо Express, що корінь нашого сайту (де лежить index.html)
// знаходиться в папці 'public/src'.
//
app.use(express.static(path.join(__dirname, 'public/src')));
//
// ▲▲▲ КІНЕЦЬ ВИПРАВЛЕННЯ ▲▲▲
// -----------------------------------------------------------------


// Шляхи до JSON файлів
const DB_PATH = path.join(__dirname, 'database');
const ROUTES_FILE = path.join(DB_PATH, 'routes.json');
const TICKETS_FILE = path.join(DB_PATH, 'tickets.json');
const USERS_FILE = path.join(DB_PATH, 'users.json');

// Створення папки database якщо не існує
async function initDatabase() {
    try {
        await fs.mkdir(DB_PATH, { recursive: true });
        
        // Перевірка та створення файлів якщо не існують
        try {
            await fs.access(ROUTES_FILE);
        } catch {
            await fs.writeFile(ROUTES_FILE, JSON.stringify([
                { "id": 1, "from": "Київ", "to": "Львів", "departureTime": "08:00", "arrivalTime": "14:30", "price": 450, "type": "Купе", "availableSeats": 50 },
                { "id": 2, "from": "Київ", "to": "Одеса", "departureTime": "22:00", "arrivalTime": "08:30", "price": 380, "type": "Плацкарт", "availableSeats": 48 },
                { "id": 3, "from": "Харків", "to": "Дніпро", "departureTime": "15:20", "arrivalTime": "19:45", "price": 280, "type": "Купе", "availableSeats": 50 }
            ]));
        }
        
        try {
            await fs.access(TICKETS_FILE);
        } catch {
            await fs.writeFile(TICKETS_FILE, '[]');
        }
        
        try {
            await fs.access(USERS_FILE);
        } catch {
            await fs.writeFile(USERS_FILE, JSON.stringify([
                { "id": 1, "name": "Admin", "email": "admin@example.com", "password": "admin", "role": "admin" },
                { "id": 2, "name": "Іван Петренко", "email": "ivan@example.com", "password": "user123", "role": "user" }
            ]));
        }
        
        console.log('✅ База даних ініціалізована');
    } catch (error) {
        console.error('❌ Помилка ініціалізації бази даних:', error);
    }
}

// Допоміжні функції для роботи з файлами
async function readJSON(filePath) {
    try {
        const data = await fs.readFile(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error(`Помилка читання ${filePath}:`, error.message);
        return [];
    }
}

async function writeJSON(filePath, data) {
    try {
        await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
    } catch (error) {
        console.error(`Помилка запису ${filePath}:`, error.message);
    }
}

// ========== ГОЛОВНА СТОРІНКА API ==========
app.get('/api', (req, res) => {
    res.json({
        message: '🚂 Railway Ticket System API',
        version: '1.0.0',
        endpoints: {
            routes: '/api/routes',
            tickets: '/api/tickets',
            users: '/api/users',
            login: '/api/login',
            register: '/api/register'
        }
    });
});

// ========== МАРШРУТИ API ==========

// Отримати всі маршрути
app.get('/api/routes', async (req, res) => {
    try {
        const routes = await readJSON(ROUTES_FILE);
        res.json(routes);
    } catch (error) {
        res.status(500).json({ error: 'Помилка читання маршрутів' });
    }
});

// Отримати маршрут за ID
app.get('/api/routes/:id', async (req, res) => {
    try {
        const routes = await readJSON(ROUTES_FILE);
        const route = routes.find(r => r.id === parseInt(req.params.id));
        if (route) {
            res.json(route);
        } else {
            res.status(404).json({ error: 'Маршрут не знайдено' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Помилка отримання маршруту' });
    }
});

// Додати новий маршрут (ADMIN)
app.post('/api/routes', async (req, res) => {
    try {
        const routes = await readJSON(ROUTES_FILE);
        const newRoute = {
            id: routes.length > 0 ? Math.max(...routes.map(r => r.id)) + 1 : 1,
            from: req.body.from,
            to: req.body.to,
            departureTime: req.body.departureTime,
            arrivalTime: req.body.arrivalTime,
            price: req.body.price,
            type: req.body.type,
            availableSeats: req.body.availableSeats || 50
        };
        routes.push(newRoute);
        await writeJSON(ROUTES_FILE, routes);
        res.status(201).json(newRoute);
    } catch (error) {
        res.status(500).json({ error: 'Помилка створення маршруту' });
    }
});

// Оновити маршрут (ADMIN)
app.put('/api/routes/:id', async (req, res) => {
    try {
        const routes = await readJSON(ROUTES_FILE);
        const index = routes.findIndex(r => r.id === parseInt(req.params.id));
        if (index !== -1) {
            routes[index] = { ...routes[index], ...req.body };
            await writeJSON(ROUTES_FILE, routes);
            res.json(routes[index]);
        } else {
            res.status(404).json({ error: 'Маршрут не знайдено' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Помилка оновлення маршруту' });
    }
});

// Видалити маршрут (ADMIN)
app.delete('/api/routes/:id', async (req, res) => {
    try {
        let routes = await readJSON(ROUTES_FILE);
        const newRoutes = routes.filter(r => r.id !== parseInt(req.params.id));
        await writeJSON(ROUTES_FILE, newRoutes);
        res.json({ message: 'Маршрут видалено' });
    } catch (error) {
        res.status(500).json({ error: 'Помилка видалення маршруту' });
    }
});

// ========== КВИТКИ API ==========

// Отримати всі квитки
app.get('/api/tickets', async (req, res) => {
    try {
        const tickets = await readJSON(TICKETS_FILE);
        res.json(tickets);
    } catch (error) {
        res.status(500).json({ error: 'Помилка читання квитків' });
    }
});

// Отримати квиток за ID
app.get('/api/tickets/:id', async (req, res) => {
    try {
        const tickets = await readJSON(TICKETS_FILE);
        const ticket = tickets.find(t => t.id === parseInt(req.params.id));
        if (ticket) {
            res.json(ticket);
        } else {
            res.status(404).json({ error: 'Квиток не знайдено' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Помилка отримання квитка' });
    }
});

// Купити квиток (CREATE)
app.post('/api/tickets/buy', async (req, res) => {
    try {
        const tickets = await readJSON(TICKETS_FILE);
        const routes = await readJSON(ROUTES_FILE);
        
        const route = routes.find(r => r.id === req.body.routeId);
        if (!route) {
            return res.status(404).json({ error: 'Маршрут не знайдено' });
        }

        // Генерація номера квитка
        const ticketNumber = `TKT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        
        const newTicket = {
            id: tickets.length > 0 ? Math.max(...tickets.map(t => t.id)) + 1 : 1,
            ticketNumber: ticketNumber,
            userId: req.body.userId,
            userName: req.body.userName,
            userEmail: req.body.userEmail,
            routeId: route.id,
            from: route.from,
            to: route.to,
            departureDate: req.body.departureDate,
            departureTime: route.departureTime,
            arrivalTime: route.arrivalTime,
            trainNumber: `№${route.id}`,
            carriage: req.body.carriage || Math.floor(Math.random() * 10) + 1,
            seat: req.body.seat || Math.floor(Math.random() * 50) + 1,
            price: route.price,
            type: route.type,
            status: 'paid',
            purchaseDate: new Date().toISOString(),
            qrCode: `QR-${ticketNumber}`
        };

        tickets.push(newTicket);
        await writeJSON(TICKETS_FILE, tickets);
        
        // Зменшити кількість доступних місць
        route.availableSeats -= 1;
        const routeIndex = routes.findIndex(r => r.id === route.id);
        routes[routeIndex] = route;
        await writeJSON(ROUTES_FILE, routes);

        res.status(201).json({
            message: 'Квиток успішно куплено',
            ticket: newTicket
        });
    } catch (error) {
        console.error('Помилка покупки квитка:', error);
        res.status(500).json({ error: 'Помилка покупки квитка' });
    }
});

// Забронювати квиток
app.post('/api/tickets/book', async (req, res) => {
    try {
        const tickets = await readJSON(TICKETS_FILE);
        const routes = await readJSON(ROUTES_FILE);
        
        const route = routes.find(r => r.id === req.body.routeId);
        if (!route) {
            return res.status(404).json({ error: 'Маршрут не знайдено' });
        }

        const ticketNumber = `TKT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        
        const newTicket = {
            id: tickets.length > 0 ? Math.max(...tickets.map(t => t.id)) + 1 : 1,
            ticketNumber: ticketNumber,
            userId: req.body.userId,
            userName: req.body.userName,
            userEmail: req.body.userEmail,
            routeId: route.id,
            from: route.from,
            to: route.to,
            departureDate: req.body.departureDate,
            departureTime: route.departureTime,
            arrivalTime: route.arrivalTime,
            trainNumber: `№${route.id}`,
            carriage: req.body.carriage || Math.floor(Math.random() * 10) + 1,
            seat: req.body.seat || Math.floor(Math.random() * 50) + 1,
            price: route.price,
            type: route.type,
            status: 'booked',
            bookingDate: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        };

        tickets.push(newTicket);
        await writeJSON(TICKETS_FILE, tickets);

        res.status(201).json({
            message: 'Квиток успішно заброньовано',
            ticket: newTicket
        });
    } catch (error) {
        res.status(500).json({ error: 'Помилка бронювання квитка' });
    }
});

// Скасувати квиток
app.delete('/api/tickets/:id', async (req, res) => {
    try {
        let tickets = await readJSON(TICKETS_FILE);
        const ticketIndex = tickets.findIndex(t => t.id === parseInt(req.params.id));
        
        if (ticketIndex !== -1) {
            tickets[ticketIndex].status = 'cancelled';
            await writeJSON(TICKETS_FILE, tickets);
            res.json({ message: 'Квиток скасовано' });
        } else {
            res.status(404).json({ error: 'Квиток не знайдено' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Помилка скасування квитка' });
    }
});

// Отримати квитки користувача
app.get('/api/users/:userId/tickets', async (req, res) => {
    try {
        const tickets = await readJSON(TICKETS_FILE);
        const userTickets = tickets.filter(t => t.userId === parseInt(req.params.userId));
        res.json(userTickets);
    } catch (error) {
        res.status(500).json({ error: 'Помилка отримання квитків користувача' });
    }
});

// ========== КОРИСТУВАЧІ API ==========

// Отримати всіх користувачів (ADMIN)
app.get('/api/users', async (req, res) => {
    try {
        const users = await readJSON(USERS_FILE);
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: 'Помилка читання користувачів' });
    }
});

// Вхід користувача (спрощений)
app.post('/api/login', async (req, res) => {
    try {
        const users = await readJSON(USERS_FILE);
        const user = users.find(u => u.email === req.body.email && u.password === req.body.password);
        
        if (user) {
            res.json({
                message: 'Успішний вхід',
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                }
            });
        } else {
            res.status(401).json({ error: 'Невірний email або пароль' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Помилка входу' });
    }
});

// Реєстрація користувача
app.post('/api/register', async (req, res) => {
    try {
        const users = await readJSON(USERS_FILE);
        
        const existingUser = users.find(u => u.email === req.body.email);
        if (existingUser) {
            return res.status(400).json({ error: 'Користувач з таким email вже існує' });
        }

        const newUser = {
            id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
            name: req.body.name,
            email: req.body.email,
            password: req.body.password, // У реальному світі паролі треба хешувати!
            phone: req.body.phone || '',
            role: 'user',
            createdAt: new Date().toISOString()
        };

        users.push(newUser);
        await writeJSON(USERS_FILE, users);

        res.status(201).json({
            message: 'Користувач зареєстрований',
            user: {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Помилка реєстрації' });
    }
});

// Запуск сервера
async function startServer() {
    await initDatabase();
    
    app.listen(PORT, () => {
        console.log('\n' + '='.repeat(50));
        console.log('🚂 RAILWAY TICKET SYSTEM');
        console.log('='.repeat(50));
        // Тепер правильний шлях до головної сторінки
        console.log(`✅ Сервер запущено на http://localhost:${PORT}`);
        console.log(`📡 API доступне на http://localhost:${PORT}/api`);
        console.log('='.repeat(50));
    });
}

startServer();