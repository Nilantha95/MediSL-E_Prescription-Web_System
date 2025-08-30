import firebase_admin
from firebase_admin import credentials, firestore
import pandas as pd
import os
import re

# --- Configuration ---
# !!! REPLACE THIS WITH THE ACTUAL PATH TO YOUR DOWNLOADED JSON KEY FILE !!!
SERVICE_ACCOUNT_KEY_PATH = '../API_keys/medisl-ed07f-firebase-adminsdk-fbsvc-4f8682039f.json'

# Collection name in Firestore
DISEASE_COLLECTION = 'diseases'

# --- Initialize Firebase Admin SDK ---
try:
    cred = credentials.Certificate(SERVICE_ACCOUNT_KEY_PATH)
    firebase_admin.initialize_app(cred)
    db = firestore.client()
    print("Firebase Admin SDK initialized successfully.")
except Exception as e:
    print(f"Error initializing Firebase: {e}")
    print("Please ensure your SERVICE_ACCOUNT_KEY_PATH is correct and the JSON file is valid.")
    exit()

# --- Helper function to sanitize string for Firestore Document ID ---
def sanitize_for_firestore_id(text):
    text = re.sub(r'[\\/#\[\]*`]', '_', text)
    text = re.sub(r'[\s_]+', '_', text)
    text = text.strip('_')
    return text.lower()

# --- Function to upload disease data ---
def upload_disease_data(csv_file_path):
    print(f"\n--- Uploading {csv_file_path} to Firestore ---")
    try:
        df = pd.read_csv(csv_file_path)
        df = df.fillna('')

        batch = db.batch()
        count = 0
        for index, row in df.iterrows():
            original_disease_name = str(row['name']).strip()
            disease_firestore_id = sanitize_for_firestore_id(original_disease_name)

            if not disease_firestore_id:
                print(f"Skipping row {index+1}: Disease name '{original_disease_name}' resulted in an empty Firestore ID.")
                continue

            doc_ref = db.collection(DISEASE_COLLECTION).document(disease_firestore_id)
            
            # Prepare the data dictionary
            data = {
                'name': original_disease_name,
                'symptoms': row['symptoms'].split(','), # Split symptoms string into a list
                'treatments': row['treatments'].split(',') # Split treatments string into a list
            }
            
            batch.set(doc_ref, data)
            count += 1
            if count % 500 == 0:
                batch.commit()
                batch = db.batch()
                print(f"Committed {count} documents for {DISEASE_COLLECTION}...")

        batch.commit()
        print(f"Successfully uploaded {count} diseases to '{DISEASE_COLLECTION}' collection.")

    except FileNotFoundError:
        print(f"Error: {csv_file_path} not found. Please ensure the file is in the correct directory.")
    except Exception as e:
        print(f"An error occurred during data upload: {e}")

# --- Main execution ---
if __name__ == "__main__":
    upload_disease_data('../Dataset/disease.csv')
    print("\nData ingestion process complete.")