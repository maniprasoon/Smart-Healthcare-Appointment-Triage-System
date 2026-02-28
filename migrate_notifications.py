import sqlite3

def run_migration():
    try:
        conn = sqlite3.connect('sql_app.db')
        cursor = conn.cursor()
        
        # Create notifications table if it doesn't exist
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS notifications (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                patient_id INTEGER,
                appointment_id INTEGER,
                notification_type VARCHAR,
                message VARCHAR,
                status VARCHAR DEFAULT 'Sent',
                sent_at DATETIME,
                FOREIGN KEY(patient_id) REFERENCES patients(id),
                FOREIGN KEY(appointment_id) REFERENCES appointments(id)
            )
        """)
        
        conn.commit()
        print("Notifications table migration successful.")
            
    except Exception as e:
        print(f"Migration error: {e}")
    finally:
        if 'conn' in locals():
            conn.close()

if __name__ == "__main__":
    run_migration()
