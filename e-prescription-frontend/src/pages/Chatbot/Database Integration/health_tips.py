#--used chatgpt and gemini ai for code enhancement

import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore
import csv
import os 

SERVICE_ACCOUNT_KEY_PATH = '../API_keys/medisl-ed07f-firebase-adminsdk-fbsvc-d2764a2e96.json'

CSV_FILE_PATH = os.path.join(os.path.dirname(__file__), '../Dataset/health_tips.csv') 

COLLECTION_NAME = 'health_tips'

# --- Initialize Firebase Admin SDK ---
try:
    cred = credentials.Certificate(SERVICE_ACCOUNT_KEY_PATH)
    if not firebase_admin._apps: 
        firebase_admin.initialize_app(cred)
    db = firestore.client()
    print("Firebase Admin SDK initialized successfully.")
except Exception as e:
    print(f"Error initializing Firebase Admin SDK: {e}")
    
    print("Please ensure SERVICE_ACCOUNT_KEY_PATH is correct and the file exists.")
    exit()

def import_csv_to_firestore(csv_file, collection_name):
    try:
        
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

                
                doc_data = {
                    'tip_en': tip_content,
                    
                }

               
                doc_ref = db.collection(collection_name).document() 
                
                batch.set(doc_ref, doc_data)
                doc_count += 1
                
                
                if doc_count % 499 == 0: 
                    batch.commit()
                    batch = db.batch() 
                    print(f"Committed {doc_count} documents.")

            
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