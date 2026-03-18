import psycopg2
import sys
import os

# Устанавливаем кодировку
os.environ['PYTHONIOENCODING'] = 'utf-8'

# Пробуем подключиться
try:
    print("Попытка подключения к PostgreSQL...")
    print(f"Host: localhost, User: postgres, Password: admin")
    
    conn = psycopg2.connect(
        host="localhost",
        port=5432,
        user="postgres",
        password="admin",
        client_encoding="UTF8"
    )
    print("✅ Успешное подключение!")
    
    # Создаем базу данных
    conn.autocommit = True
    cur = conn.cursor()
    
    try:
        cur.execute("CREATE DATABASE marketplace;")
        print("✅ База данных 'marketplace' создана!")
    except psycopg2.errors.DuplicateDatabase:
        print("ℹ️ База данных 'marketplace' уже существует")
    
    cur.close()
    conn.close()
    
except psycopg2.OperationalError as e:
    print(f"❌ Ошибка подключения: {e}")
    print("\nВозможные решения:")
    print("1. Проверьте, запущен ли PostgreSQL (services.msc)")
    print("2. Проверьте пароль пользователя postgres")
    print("3. Откройте pgAdmin и создайте БД 'marketplace' вручную")
    sys.exit(1)
except Exception as e:
    print(f"❌ Ошибка: {e}")
    sys.exit(1)
