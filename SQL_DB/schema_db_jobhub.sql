-- Таблиця для всіх акаунтів: і робітників, і роботодавців
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    -- 'job_seeker' (робітник) або 'employer' (роботодавець)
    role ENUM('job_seeker', 'employer') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Профіль шукача роботи, розширює таблицю users
CREATE TABLE job_seeker_profiles (
    user_id INT PRIMARY KEY,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    city VARCHAR(100),
    about TEXT, -- Для "Про себе", varchar(500) може бути замало
    profile_photo_url VARCHAR(255), -- Шлях до фото

    -- Налаштування з image_99f843.png
    notify_email_new_jobs BOOL DEFAULT TRUE,
    notify_email_status_change BOOL DEFAULT TRUE,
    show_profile_to_employers BOOL DEFAULT TRUE,
    allow_contact_from_recruiters BOOL DEFAULT TRUE,

    -- Зв'язок "один-до-одного" з таблицею users
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Профіль роботодавця (компанії), також розширює users
CREATE TABLE employer_profiles (
    user_id INT PRIMARY KEY,
    company_name VARCHAR(255) NOT NULL,
    company_logo_url VARCHAR(255),
    company_description TEXT,
    city VARCHAR(100),
    website_url VARCHAR(255),

    -- Зв'язок "один-до-одного" з таблицею users
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE vacancies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    -- Хто опублікував вакансію
    employer_user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    city VARCHAR(100),
    salary_min INT,
    salary_max INT,
    salary_currency VARCHAR(10) DEFAULT 'USD',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (employer_user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE resumes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    job_seeker_user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL, -- Наприклад, "Frontend Developer (React)"
    file_url VARCHAR(255) NOT NULL, -- Шлях до PDF/DOCX файлу
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (job_seeker_user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- "Словник" усіх навичок (React, Node.js, TypeScript тощо)
CREATE TABLE skills (
    id INT AUTO_INCREMENT PRIMARY KEY,
    skill_name VARCHAR(100) NOT NULL UNIQUE
);

-- Які навички має шукач
CREATE TABLE job_seeker_skills (
    job_seeker_user_id INT NOT NULL,
    skill_id INT NOT NULL,
    PRIMARY KEY (job_seeker_user_id, skill_id), -- Комбінований ключ
    FOREIGN KEY (job_seeker_user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE
);

-- Які навички потрібні для вакансії
CREATE TABLE vacancy_skills (
    vacancy_id INT NOT NULL,
    skill_id INT NOT NULL,
    PRIMARY KEY (vacancy_id, skill_id),
    FOREIGN KEY (vacancy_id) REFERENCES vacancies(id) ON DELETE CASCADE,
    FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE
);

-- Які вакансії зберіг шукач
CREATE TABLE saved_vacancies (
    job_seeker_user_id INT NOT NULL,
    vacancy_id INT NOT NULL,
    saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (job_seeker_user_id, vacancy_id), -- Щоб не можна було зберегти двічі
    FOREIGN KEY (job_seeker_user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (vacancy_id) REFERENCES vacancies(id) ON DELETE CASCADE
);

-- Заявки шукачів на вакансії
CREATE TABLE applications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    job_seeker_user_id INT NOT NULL,
    vacancy_id INT NOT NULL,
    -- ID резюме, яке було використане для цієї заявки
    resume_id INT, 
    -- "На розгляді", "Відхилено"
    status ENUM('pending', 'viewed', 'rejected', 'accepted') DEFAULT 'pending',
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Не можна подати 2 заявки на 1 вакансію
    UNIQUE KEY (job_seeker_user_id, vacancy_id), 
    FOREIGN KEY (job_seeker_user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (vacancy_id) REFERENCES vacancies(id) ON DELETE CASCADE,
    FOREIGN KEY (resume_id) REFERENCES resumes(id) ON DELETE SET NULL
);


