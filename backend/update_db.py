import sqlite3
from pathlib import Path

# Путь к базе данных
DB_PATH = Path(__file__).parent / "marketplace.db"

# Подключение к базе данных
conn = sqlite3.connect(DB_PATH)
cursor = conn.cursor()

# Добавление колонки image_url в таблицу items
try:
    cursor.execute("ALTER TABLE items ADD COLUMN image_url TEXT")
    print("Колонка image_url успешно добавлена в таблицу items")
except sqlite3.OperationalError as e:
    if "duplicate column name" in str(e):
        print("Колонка image_url уже существует")
    else:
        print(f"Ошибка: {e}")

conn.commit()
conn.close()

print("База данных обновлена!")
