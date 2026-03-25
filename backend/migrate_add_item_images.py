"""
Скрипт для добавления таблицы item_images для галереи товаров
Запускать после изменений в models.py
"""
import sqlite3
import os

# Путь к базе данных
DB_PATH = os.path.join(os.path.dirname(__file__), "app", "marketplace.db")

def migrate():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Проверяем, существует ли уже таблица item_images
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='item_images'")
    table_exists = cursor.fetchone() is not None
    
    if not table_exists:
        print("Создание таблицы item_images...")
        cursor.execute("""
            CREATE TABLE item_images (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                item_id INTEGER NOT NULL,
                image_url TEXT NOT NULL,
                "order" INTEGER DEFAULT 0,
                FOREIGN KEY (item_id) REFERENCES items (id) ON DELETE CASCADE
            )
        """)
        conn.commit()
        print("✓ Таблица item_images успешно создана!")
    else:
        print("✓ Таблица item_images уже существует")
    
    # Проверяем, существует ли индекс для item_images
    cursor.execute("SELECT name FROM sqlite_master WHERE type='index' AND name='idx_item_images_item_id'")
    index_exists = cursor.fetchone() is not None
    
    if not index_exists:
        print("Создание индекса для item_images...")
        cursor.execute("CREATE INDEX idx_item_images_item_id ON item_images(item_id)")
        conn.commit()
        print("✓ Индекс успешно создан!")
    
    conn.close()
    print("Миграция завершена!")

if __name__ == "__main__":
    migrate()
