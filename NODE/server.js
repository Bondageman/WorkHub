// 1. Імпорт бібліотек
require('dotenv').config(); 
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const bcrypt = require('bcrypt'); 
const jwt = require('jsonwebtoken'); 


const app = express();
app.use(cors()); 
app.use(express.json()); 

const PORT = process.env.PORT || 3001;

// 3. Налаштування пулу з'єднань з БД
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
}).promise();

// ------------------------------------------
// MIDDLEWARE 
// ------------------------------------------
const authMiddleware = (req, res, next) => {
    try {
        // Отримуємо токен з заголовка: "Bearer <token>"
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Беремо сам <token>

        if (token == null) {
            // 401 Unauthorized - токен не надано
            return res.status(401).json({ message: 'Токен не надано. Доступ заборонено.' });
        }

        // Перевіряємо токен
        jwt.verify(token, process.env.JWT_SECRET, (err, decodedPayload) => {
            if (err) {
                // 403 Forbidden - токен недійсний (старий або підроблений)
                return res.status(403).json({ message: 'Токен недійсний.' });
            }

            // === ВАЖЛИВО ===
            // Кладемо 'payload' з токена (який містить userId та role) в req.user
            req.user = decodedPayload; // decodedPayload виглядає як { userId: 1, role: 'job_seeker' }
            next(); // Передаємо керування далі
        });
    } catch (error) {
        res.status(500).json({ message: 'Помилка автентифікації', error: error.message });
    }
};

// 4. МАРШРУТИ (API ENDPOINTS)

// ------------------------------------------
// --- МАРШРУТ ДЛЯ РЕЄСТРАЦІЇ (POST) ---
// ------------------------------------------
app.post('/api/register', async (req, res) => {
    const { 
        email, password, role, 
        firstName, lastName, phone, city, about, 
        profile_photo_url, notify_email_new_jobs, 
        notify_email_status_change, show_profile_to_employers, 
        allow_contact_from_recruiters,
        companyName, company_logo_url, company_description, 
        website_url 
    } = req.body;

    // --- Хешування ---
    const saltRounds = parseInt(process.env.SALT_ROUNDS || 10);
    const password_hash = await bcrypt.hash(password, saltRounds);
    // ----------------------------------

    let connection;
    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();

        const [userResult] = await connection.query(
            'INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)',
            [email, password_hash, role] // <-- Зберігаємо хеш, а не пароль
        );
        const newUserId = userResult.insertId;

        if (role === 'job_seeker') {
            await connection.query(
                `INSERT INTO job_seeker_profiles (
                    user_id, first_name, last_name, phone, city, about, profile_photo_url,
                    notify_email_new_jobs, notify_email_status_change, 
                    show_profile_to_employers, allow_contact_from_recruiters
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    newUserId, firstName || null, lastName || null, phone || null, city || null,
                    about || null, profile_photo_url || null,
                    notify_email_new_jobs ?? 1, notify_email_status_change ?? 1,
                    show_profile_to_employers ?? 1, allow_contact_from_recruiters ?? 1
                ]
            );
        } else if (role === 'employer') {
            await connection.query(
                `INSERT INTO employer_profiles (
                    user_id, company_name, company_logo_url, 
                    company_description, city, website_url
                ) VALUES (?, ?, ?, ?, ?, ?)`,
                [
                    newUserId, companyName, company_logo_url || null,
                    company_description || null, city || null, website_url || null
                ]
            );
        }

        await connection.commit();
        res.status(201).json({ message: 'Користувача успішно зареєстровано!', userId: newUserId });
    } catch (error) {
        if (connection) await connection.rollback();
        console.error('Помилка реєстрації:', error);
        res.status(500).json({ message: 'Помилка під час реєстрації.', error: error.message });
    } finally {
        if (connection) connection.release();
    }
});

// ------------------------------------------
// --- МАРШРУТ ДЛЯ ВХОДУ (LOGIN) ---
// ------------------------------------------
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Перевіряємо, чи є такий email
        const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(401).json({ message: 'Неправильний email або пароль.' });
        }
        const user = users[0];

        // 2. Перевіряємо пароль (bcrypt.compare)
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Неправильний email або пароль.' });
        }

        // 3. Створюємо "Payload"
        const payload = {
            userId: user.id, // Тепер middleware буде знати ID
            role: user.role  // і роль
        };

        // 4. Підписуємо JWT токен
        const token = jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '1d' } // Токен дійсний 1 день
        );

        // 5. Відправляємо токен клієнту (React)
        res.status(200).json({
            message: 'Вхід успішний!',
            token: token // React має зберегти цей токен
        });

    } catch (error) {
        console.error('Помилка входу:', error);
        res.status(500).json({ message: 'Помилка сервера.', error: error.message });
    }
});


// ------------------------------------------
// --- МАРШРУТ ДЛЯ СТВОРЕННЯ ВАКАНСІЇ (POST) ---
// ------------------------------------------
app.post('/api/vacancies', authMiddleware, async (req, res) => {
    
    if (req.user.role !== 'employer') {
        return res.status(403).json({ message: 'Тільки роботодавці можуть створювати вакансії.' });
    }

    const { title, description, city, salary_min, salary_max, skills } = req.body;
    const employerUserId = req.user.userId; // <-- Беремо ID з токена, а не з 'x-user-id'
    
    let connection;
    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();

        // Крок 1: Логіка "Знайди або Створи" для навичок
        const skillIds = [];
        if (skills && skills.length > 0) {
            for (const skillName of skills) {
                let [rows] = await connection.query('SELECT id FROM skills WHERE skill_name = ?', [skillName]);
                let skillId;
                if (rows.length > 0) {
                    skillId = rows[0].id;
                } else {
                    const [insertResult] = await connection.query('INSERT INTO skills (skill_name) VALUES (?)', [skillName]);
                    skillId = insertResult.insertId;
                }
                skillIds.push(skillId);
            }
        }

        // Крок 2: Вставляємо саму вакансію
        const [vacancyResult] = await connection.query(
            `INSERT INTO vacancies (employer_user_id, title, description, city, salary_min, salary_max) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [employerUserId, title, description, city, salary_min, salary_max]
        );
        const newVacancyId = vacancyResult.insertId;

        // Крок 3: Вставляємо зв'язки навичок (vacancy_skills)
        if (skillIds.length > 0) {
            const skillValues = skillIds.map(id => [newVacancyId, id]);
            await connection.query('INSERT INTO vacancy_skills (vacancy_id, skill_id) VALUES ?', [skillValues]);
        }

        await connection.commit();
        res.status(201).json({ message: 'Вакансію успішно створено!', vacancyId: newVacancyId });

    } catch (error) {
        if (connection) await connection.rollback();
        console.error('Помилка при створенні вакансії:', error);
        res.status(500).json({ message: 'Помилка сервера.', error: error.message });
    } finally {
        if (connection) connection.release();
    }
});

// ------------------------------------------
// --- МАРШРУТ ДЛЯ ОТРИМАННЯ ВАКАНСІЙ (GET) ---
// ------------------------------------------
app.get('/api/vacancies', async (req, res) => {
    try {
        const [results] = await pool.query(`
            SELECT 
                v.*, 
                ep.company_name 
            FROM vacancies v
            JOIN employer_profiles ep ON v.employer_user_id = ep.user_id
            ORDER BY v.created_at DESC
        `);
        res.status(200).json(results);
    } catch (error) {
        console.error('Помилка при отриманні вакансій:', error);
        res.status(500).json({ message: 'Не вдалося отримати вакансії.', error: error.message });
    }
});

// ------------------------------------------
// --- НОВИЙ МАРШРУТ для пошуку навичок (GET) ---
// ------------------------------------------
app.get('/api/skills', async (req, res) => {
    try {
        const { search } = req.query;
        if (!search) {
            return res.status(200).json([]);
        }
        const [skills] = await pool.query(
            'SELECT id, skill_name FROM skills WHERE skill_name LIKE ? LIMIT 10',
            [search + '%']
        );
        res.status(200).json(skills);
    } catch (error) {
        console.error('Помилка при пошуку навичок:', error);
        res.status(500).json({ message: 'Не вдалося отримати навички.', error: error.message });
    }
});

// --- Допоміжні функції для кабінетів ---

async function getJobSeekerDashboard(userId) {
    const [
        [profile], skills, savedVacancies, applications
    ] = await Promise.all([
        pool.query('SELECT * FROM job_seeker_profiles WHERE user_id = ?', [userId]),
        pool.query(`SELECT s.id, s.skill_name FROM skills s JOIN job_seeker_skills jss ON s.id = jss.skill_id WHERE jss.job_seeker_user_id = ?`, [userId]),
        pool.query(`SELECT v.*, ep.company_name FROM vacancies v JOIN saved_vacancies sv ON v.id = sv.vacancy_id JOIN employer_profiles ep ON v.employer_user_id = ep.user_id WHERE sv.job_seeker_user_id = ?`, [userId]),
        pool.query(`SELECT v.title, ep.company_name, a.status, a.applied_at FROM applications a JOIN vacancies v ON a.vacancy_id = v.id JOIN employer_profiles ep ON v.employer_user_id = ep.user_id WHERE a.job_seeker_user_id = ? ORDER BY a.applied_at DESC`, [userId])
    ]);
    return { profile: profile[0] || null, skills, savedVacancies, applications };
}

async function getEmployerDashboard(userId) {
    const [
        [profile], postedVacancies, receivedApplications
    ] = await Promise.all([
        pool.query('SELECT * FROM employer_profiles WHERE user_id = ?', [userId]),
        pool.query('SELECT * FROM vacancies WHERE employer_user_id = ? ORDER BY created_at DESC', [userId]),
        pool.query(`
            SELECT a.id as application_id, a.status, a.applied_at, v.title as vacancy_title, 
                   jsp.first_name, jsp.last_name, jsp.email, r.file_url as resume_url
            FROM applications a
            JOIN vacancies v ON a.vacancy_id = v.id
            JOIN job_seeker_profiles jsp ON a.job_seeker_user_id = jsp.user_id
            LEFT JOIN resumes r ON a.resume_id = r.id
            WHERE v.employer_user_id = ?
            ORDER BY a.applied_at DESC`, [userId])
    ]);
    return { profile: profile[0] || null, postedVacancies, receivedApplications };
}

// ------------------------------------------
// --- МАРШРУТ ДЛЯ ОСОБИСТОГО КАБІНЕТУ (GET) ---
// --- Тепер захищено справжнім authMiddleware ---
// ------------------------------------------
app.get('/api/cabinet/me', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.userId; // <-- Беремо ID з токена
        const userRole = req.user.role; // <-- Беремо роль з токена
        let dashboardData;

        if (userRole === 'job_seeker') {
            dashboardData = await getJobSeekerDashboard(userId);
        } else if (userRole === 'employer') {
            dashboardData = await getEmployerDashboard(userId);
        } else {
            return res.status(400).json({ message: 'Невідома роль користувача.' });
        }
        res.status(200).json(dashboardData);
    } catch (error) {
        console.error('Помилка при отриманні даних кабінету:', error);
        res.status(500).json({ message: 'Помилка сервера.', error: error.message });
    }
});

// ------------------------------------------
// --- ДОДАВАННЯ РЕЗЮМЕ (POST) ---
// ------------------------------------------
app.post('/api/resumes', authMiddleware, async (req, res) => {
    if (req.user.role !== 'job_seeker') {
        return res.status(403).json({ message: 'Тільки шукачі роботи можуть додавати резюме.' });
    }
    const { title, file_url } = req.body;
    
    try {
        const [result] = await pool.query(
            'INSERT INTO resumes (job_seeker_user_id, title, file_url) VALUES (?, ?, ?)',
            [req.user.userId, title, file_url]
        );
        res.status(201).json({ message: 'Резюме додано!', resumeId: result.insertId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Помилка сервера', error: error.message });
    }
});

// ------------------------------------------
// --- ПОДАЧА ЗАЯВКИ НА ВАКАНСІЮ (POST) ---
// ------------------------------------------
app.post('/api/applications', authMiddleware, async (req, res) => {
    if (req.user.role !== 'job_seeker') {
        return res.status(403).json({ message: 'Тільки шукачі роботи можуть подавати заявки.' });
    }
    const { vacancy_id, resume_id } = req.body;

    try {
        await pool.query(
            'INSERT INTO applications (job_seeker_user_id, vacancy_id, resume_id) VALUES (?, ?, ?)',
            [req.user.userId, vacancy_id, resume_id]
        );
        res.status(201).json({ message: 'Заявку успішно подано!' });
    } catch (error) {
        // Якщо помилка Duplicate entry (вже подавався)
        if (error.code === 'ER_DUP_ENTRY') {
             return res.status(400).json({ message: 'Ви вже подали заявку на цю вакансію.' });
        }
        console.error(error);
        res.status(500).json({ message: 'Помилка сервера', error: error.message });
    }
});

// ------------------------------------------
// --- ЗБЕРЕЖЕННЯ ВАКАНСІЇ (POST) ---
// ------------------------------------------
app.post('/api/saved-vacancies', authMiddleware, async (req, res) => {
    if (req.user.role !== 'job_seeker') {
        return res.status(403).json({ message: 'Тільки шукачі можуть зберігати вакансії.' });
    }
    const { vacancy_id } = req.body;

    try {
        await pool.query(
            'INSERT INTO saved_vacancies (job_seeker_user_id, vacancy_id) VALUES (?, ?)',
            [req.user.userId, vacancy_id]
        );
        res.status(201).json({ message: 'Вакансію збережено!' });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
             return res.status(400).json({ message: 'Вакансія вже збережена.' });
        }
        res.status(500).json({ message: 'Помилка сервера', error: error.message });
    }
});

// 5. Запуск сервера
app.listen(PORT, () => {
    console.log(`Сервер запущено на http://localhost:${PORT}`);
});