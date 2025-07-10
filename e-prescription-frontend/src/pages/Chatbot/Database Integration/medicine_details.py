import pandas as pd
import firebase_admin
from firebase_admin import credentials, firestore
import re
import os

# --- Configuration ---
# IMPORTANT: Replace with the actual path to your Firebase service account key
SERVICE_ACCOUNT_KEY_PATH = '../API_keys/medisl-ed07f-firebase-adminsdk-fbsvc-2fe43ec477.json'
CSV_FILE_PATH = '../Dataset/diseases_medicines.csv'
MEDICINE_DETAILS_COLLECTION = 'medicine_details' # New collection name for medicine details

# --- Initialize Firebase Admin SDK ---
try:
    cred = credentials.Certificate(SERVICE_ACCOUNT_KEY_PATH)
    firebase_admin.initialize_app(cred)
    db = firestore.client()
    print("Firebase Admin SDK initialized successfully.")
except Exception as e:
    print(f"Error initializing Firebase: {e}")
    print("Please ensure your service account key file is in the correct path and is valid.")
    exit()

# --- Helper Function for Preprocessing Medicine Names ---
def preprocess_medicine_name(name):
    """
    Cleans and standardizes a medicine name for use as a Firestore document ID.
    - Lowercases
    - Replaces spaces and non-alphanumeric characters with underscores
    - Removes leading/trailing underscores
    """
    name = name.lower()
    name = re.sub(r'[^a-z0-9]+', '_', name) # Replace non-alphanumeric with underscore
    name = name.strip('_') # Remove leading/trailing underscores
    return name

# --- Main Ingestion Logic ---
def ingest_medicine_details():
    try:
        df = pd.read_csv(CSV_FILE_PATH)
        print(f"Successfully loaded '{CSV_FILE_PATH}' with {len(df)} records.")

        batch = db.batch()
        batch_size = 500 # Firestore allows max 500 operations per batch
        record_count = 0

        for index, row in df.iterrows():
            medicine_name_raw = row['Medicine Name']
            medicine_id = preprocess_medicine_name(medicine_name_raw)

            # Prepare data for Firestore document
            medicine_data = {
                'medicineNameRaw': medicine_name_raw, # Store original name
                'composition': row['Composition'],
                'uses': row['Uses'],
                'sideEffects': row['Side_effects'],
                'manufacturer': row['Manufacturer']
            }

            # Add to batch
            doc_ref = db.collection(MEDICINE_DETAILS_COLLECTION).document(medicine_id)
            batch.set(doc_ref, medicine_data)
            record_count += 1

            if record_count % batch_size == 0:
                batch.commit()
                batch = db.batch() # Start a new batch
                print(f"Committed {record_count} records so far...")

        # Commit any remaining records in the last batch
        if record_count % batch_size != 0 or record_count == 0:
            batch.commit()
            print(f"Finished committing all {record_count} records to Firestore.")

        print(f"Data ingestion for '{MEDICINE_DETAILS_COLLECTION}' completed successfully!")

    except FileNotFoundError:
        print(f"Error: The file '{CSV_FILE_PATH}' was not found. Please ensure it's in the same directory.")
    except KeyError as e:
        print(f"Error: Missing expected column in CSV file: {e}. Please check column headers.")
    except Exception as e:
        print(f"An unexpected error occurred during ingestion: {e}")

if __name__ == '__main__':
    ingest_medicine_details()