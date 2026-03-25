"""
Скрипт для полной очистки базы данных
Удаляет все данные из всех таблиц
"""
import sqlite3
import os

# Путь к базе данных
DB_PATH = os.path.join(os.path.dirname(__file__), "app", "marketplace.db")

def reset_database():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    print("⚠️  Внимание! Все данные будут удалены!")
    response = input("Продолжить? (да/нет): ").strip().lower()
    
    if response != 'да' and response != 'yes' and response != 'y':
        print("Отменено.")
        conn.close()
        return
    
    # Отключаем внешние ключи на время очистки
    cursor.execute("PRAGMA foreign_keys = OFF")
    
    # Список всех таблиц для очистки
    tables = [
        "order_items",
        "orders",
        "item_images",
        "items",
        "cards",
        "users"
    ]
    
    for table in tables:
        cursor.execute(f"DELETE FROM {table}")
        print(f"✓ Таблица {table} очищена")
    
    # Сброс автоинкремента
    cursor.execute("DELETE FROM sqlite_sequence")
    print("✓ Счётчики автоинкремента сброшены")
    
    cursor.execute("PRAGMA foreign_keys = ON")
    conn.commit()
    conn.close()
    
    print("\n✅ База данных полностью очищена!")

if __name__ == "__main__":
    reset_database()
