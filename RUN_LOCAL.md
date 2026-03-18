# Запуск проекта без Docker

## Предварительные требования

1. **Python 3.11+** должен быть установлен
2. **PostgreSQL** должен быть запущен
3. **Node.js 18+** должен быть установлен

## Backend (FastAPI)

### 1. Установка зависимостей

```bash
cd D:\6SEMESTR\PythonMarketplace\backend

# Создаем виртуальное окружение (если нет)
python -m venv venv

# Активируем (Windows)
venv\Scripts\activate

# Устанавливаем зависимости
pip install -r requirements.txt
```

### 2. Настройка БД

Убедитесь, что PostgreSQL запущен. Создайте БД:

```bash
# Через psql
psql -U postgres
CREATE DATABASE marketplace;
\q
```

Или через pgAdmin создайте базу данных `marketplace`.

**Важно:** Убедитесь, что пароль пользователя postgres = `admin` (или измените в `backend/.env`)

### 3. Запуск backend

```bash
cd D:\6SEMESTR\PythonMarketplace\backend
# Убедитесь, что виртуальное окружение активировано
venv\Scripts\activate

uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend будет доступен по адресу: http://localhost:8000
API Docs (Swagger): http://localhost:8000/docs

---

## Frontend (React)

### 1. Установка зависимостей

```bash
cd D:\6SEMESTR\PythonMarketplace\frontend
npm install
```

### 2. Запуск frontend

```bash
npm run dev
```

Frontend будет доступен по адресу: http://localhost:3000

---

## Быстрый старт (все команды)

Откройте 2 терминала:

```bash
# Terminal 1 - Backend
cd D:\6SEMESTR\PythonMarketplace\backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Terminal 2 - Frontend
cd D:\6SEMESTR\PythonMarketplace\frontend
npm install
npm run dev
```

---

## Возможные проблемы

### Ошибка подключения к БД
```
psycopg2.OperationalError: could not connect to server
```
**Решение:** Запустите PostgreSQL сервис

### Ошибка аутентификации БД
```
psycopg2.OperationalError: FATAL:  password authentication failed
```
**Решение:** Измените пароль в `backend/.env` или установите пароль postgres = `admin`

### ModuleNotFoundError
**Решение:** Убедитесь, что виртуальное окружение активировано и зависимости установлены
