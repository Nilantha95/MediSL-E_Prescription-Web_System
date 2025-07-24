import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore
import csv
import os # For getting the current directory

# --- Configuration ---
# IMPORTANT: Update this path to your Firebase Service Account Key JSON file.
# It should be the same one you use for chatbot_backend.py
SERVICE_ACCOUNT_KEY_PATH = '../API_keys/medisl-ed07f-firebase-adminsdk-fbsvc-ad3fdc406c.json'

# IMPORTANT: Update this path to your health_tips.csv file.
# Assuming health_tips.csv is in the same directory as this script for now
CSV_FILE_PATH = os.path.join(os.path.dirname(__file__), '../Dataset/health_tips.csv') 

COLLECTION_NAME = 'health_tips'

# --- Initialize Firebase Admin SDK ---
try:
    cred = credentials.Certificate(SERVICE_ACCOUNT_KEY_PATH)
    if not firebase_admin._apps: # Check if app is already initialized to prevent error
        firebase_admin.initialize_app(cred)
    db = firestore.client()
    print("Firebase Admin SDK initialized successfully.")
except Exception as e:
    print(f"Error initializing Firebase Admin SDK: {e}")
    # If the key path is wrong or missing, exit
    print("Please ensure SERVICE_ACCOUNT_KEY_PATH is correct and the file exists.")
    exit()

def import_csv_to_firestore(csv_file, collection_name):
    try:
        # We use 'r' mode because the CSV seems to be a simple list of lines, not necessarily
        # adhering strictly to CSV format with a header row and delimiters.
        with open(csv_file, mode='r', encoding='utf-8') as file:
            tips = file.readlines() # Read all lines
            
            if not tips:
                print("CSV file is empty or could not be read.")
                return

            batch = db.batch()
            doc_count = 0
            
            for i, tip_line in enumerate(tips):
                tip_content = tip_line.strip() # Remove leading/trailing whitespace
                if not tip_content: # Skip empty lines
                    continue

                # Create a dictionary for the Firestore document.
                # Assuming this CSV only contains English tips, store them under 'tip_en'.
                # You would manually add 'tip_si' and 'tip_ta' later if needed.
                doc_data = {
                    'tip_en': tip_content,
                    # If you manually add Sinhala/Tamil tips to your CSV later,
                    # you'd modify this part to parse those columns.
                    # 'tip_si': row.get('tip_si', ''),
                    # 'tip_ta': row.get('tip_ta', ''),
                }

                # Auto-generate document ID for each tip
                doc_ref = db.collection(collection_name).document() 
                
                batch.set(doc_ref, doc_data)
                doc_count += 1
                
                # Commit batch in chunks of 500 (Firestore limit)
                if doc_count % 499 == 0: # Using 499 to be safe with Firestore's 500 limit
                    batch.commit()
                    batch = db.batch() # Start a new batch
                    print(f"Committed {doc_count} documents.")

            # Commit any remaining documents in the last batch
            if doc_count % 499 != 0 or doc_count == 0:
                batch.commit()
            
            print(f"Successfully imported {doc_count} documents from '{csv_file}' to collection '{collection_name}'.")

    except FileNotFoundError:
        print(f"Error: CSV file not found at '{csv_file}'")
        print("Please ensure CSV_FILE_PATH is correct.")
    except Exception as e:
        print(f"An error occurred during import: {e}")

if __name__ == "__main__":
    import_csv_to_firestore(CSV_FILE_PATH, COLLECTION_NAME)