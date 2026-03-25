"""
Скрипт для добавления поля description в таблицу items
Запускать после изменений в models.py
"""
import sqlite3
import os

# Путь к базе данных
DB_PATH = os.path.join(os.path.dirname(__file__), "marketplace.db")

def migrate():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Проверяем, существует ли уже колонка description
    cursor.execute("PRAGMA table_info(items)")
    columns = [column[1] for column in cursor.fetchall()]
    
    if "description" not in columns:
        print("Добавление колонки description в таблицу items...")
        cursor.execute("ALTER TABLE items ADD COLUMN description TEXT")
        conn.commit()
        print("✓ Колонка description успешно добавлена!")
    else:
        print("✓ Колонка description уже существует")
    
    conn.close()
    print("Миграция завершена!")

if __name__ == "__main__":
    migrate()
