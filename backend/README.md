# Backend Setup for School App (WAMP)

## 1. Database Setup

1. Open phpMyAdmin (http://localhost/phpmyadmin) or use MySQL CLI.
2. Run the following SQL to create the database and users table:

```sql
CREATE DATABASE IF NOT EXISTS school_app;
USE school_app;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('user', 'teacher', 'admin') NOT NULL DEFAULT 'user'
);
```

## 2. PHP Backend API

- Place the files `db.php`, `register.php`, and `login.php` in a folder, e.g., `C:/wamp64/www/school_app/backend/`.
- Your API endpoints will be:
  - `http://localhost/school_app/backend/register.php`
  - `http://localhost/school_app/backend/login.php`

## 3. CORS (if needed)
If you access from a device or emulator, you may need to add CORS headers to the PHP files:
```php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type');
```

## 4. Test
- Use Postman or your React Native app to POST to these endpoints.
- Registration expects: `{ name, email, password, role }`
- Login expects: `{ email, password }` 