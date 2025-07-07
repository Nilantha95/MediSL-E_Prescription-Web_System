# ingest_data_to_firestore.py
import firebase_admin
from firebase_admin import credentials, firestore
import pandas as pd
import os
import re # Import regex module for cleaning strings

# --- Configuration ---
# Path to your Firebase service account key JSON file
# !!! UPDATE THIS PATH TO YOUR NEWLY GENERATED KEY FILE !!!
SERVICE_ACCOUNT_KEY_PATH = './medisl-ed07f-firebase-adminsdk-fbsvc-baf423578c.json' # Example: Update with your actual new file name

# Collection names in Firestore
SYMPTOMS_DISEASES_COLLECTION = 'diseases_symptoms'
DISEASES_MEDICINES_COLLECTION = 'diseases_medicines'

# --- Initialize Firebase Admin SDK ---
try:
    cred = credentials.Certificate(SERVICE_ACCOUNT_KEY_PATH)
    firebase_admin.initialize_app(cred)
    db = firestore.client()
    print("Firebase Admin SDK initialized successfully.")
except Exception as e:
    print(f"Error initializing Firebase: {e}")
    print("Please ensure your SERVICE_ACCOUNT_KEY_PATH is correct and the JSON file is valid and accessible.")
    exit()

# --- Helper function to sanitize string for Firestore Document ID ---
def sanitize_for_firestore_id(text):
    """
    Cleans a string to be suitable for a Firestore Document ID.
    Firestore document IDs cannot contain any of the following characters:
    '/', '\', '#', '[', ']', '*', '`'
    """
    # Replace problematic characters with an underscore
    text = re.sub(r'[\\/#\[\]*`]', '_', text)
    # Replace multiple spaces/underscores with a single underscore
    text = re.sub(r'[\s_]+', '_', text)
    # Remove leading/trailing underscores
    text = text.strip('_')
    # Convert to lowercase for consistency
    return text.lower()


# --- Function to upload symptoms_diseases data ---
def upload_symptoms_diseases(csv_file_path):
    print(f"\n--- Uploading {csv_file_path} to Firestore ---")
    try:
        df = pd.read_csv(csv_file_path)
        # Fill NaN values with an empty string for easier processing
        df = df.fillna('')

        diseases_symptoms_map = {}
        for index, row in df.iterrows():
            original_disease_name = str(row['disease']).strip() # Ensure it's a string
            # Sanitize the disease name for use as Firestore document ID
            disease_firestore_id = sanitize_for_firestore_id(original_disease_name)

            # --- NEW CHECK: Ensure the sanitized ID is not empty ---
            if not disease_firestore_id:
                print(f"Skipping row {index+1} in {csv_file_path}: Disease name '{original_disease_name}' resulted in an empty Firestore ID after sanitization.")
                continue # Skip this row

            symptoms_list = []
            # Iterate through all columns that start with 'symptoms'
            for col in df.columns:
                if col.startswith('symptoms') and str(row[col]).strip() != '': # Ensure symptom is a string
                    # Normalize symptom text: lowercase, replace underscores with spaces
                    symptoms_list.append(str(row[col]).strip().lower().replace('_', ' '))

            if disease_firestore_id not in diseases_symptoms_map:
                # Store original name for display, and a set for unique symptoms
                diseases_symptoms_map[disease_firestore_id] = {
                    'diseaseNameDisplay': original_disease_name,
                    'symptoms': set()
                }
            diseases_symptoms_map[disease_firestore_id]['symptoms'].update(symptoms_list)

        batch = db.batch()
        count = 0
        for disease_id, data in diseases_symptoms_map.items():
            doc_ref = db.collection(SYMPTOMS_DISEASES_COLLECTION).document(disease_id)
            batch.set(doc_ref, {
                'diseaseNameDisplay': data['diseaseNameDisplay'],
                'diseaseNameId': disease_id, # Store the sanitized ID name as a field
                'symptoms': sorted(list(data['symptoms'])) # Convert set to sorted list
            })
            count += 1
            if count % 500 == 0: # Commit batch every 500 operations
                batch.commit()
                batch = db.batch()
                print(f"Committed {count} documents for {SYMPTOMS_DISEASES_COLLECTION}...")

        batch.commit() # Commit any remaining operations
        print(f"Successfully uploaded {count} unique diseases to '{SYMPTOMS_DISEASES_COLLECTION}' collection.")

    except FileNotFoundError:
        print(f"Error: {csv_file_path} not found. Please ensure the file is in the correct directory.")
    except Exception as e:
        print(f"An error occurred during symptoms_diseases upload: {e}")

# --- Function to upload diseases_medicines data ---
def upload_diseases_medicines(csv_file_path):
    print(f"\n--- Uploading {csv_file_path} to Firestore ---")
    try:
        df = pd.read_csv(csv_file_path)
        df = df.fillna('')

        diseases_medicines_map = {}
        for index, row in df.iterrows():
            original_disease_name = str(row['disease']).strip() # Ensure it's a string
            # Sanitize the disease name for use as Firestore document ID
            disease_firestore_id = sanitize_for_firestore_id(original_disease_name)
            
            # --- NEW CHECK: Ensure the sanitized ID is not empty ---
            if not disease_firestore_id:
                print(f"Skipping row {index+1} in {csv_file_path}: Disease name '{original_disease_name}' resulted in an empty Firestore ID after sanitization.")
                continue # Skip this row

            medicine = str(row['medicines']).strip().lower() # Ensure medicine is a string

            if disease_firestore_id not in diseases_medicines_map:
                # Store original name for display, and a set for unique medicines
                diseases_medicines_map[disease_firestore_id] = {
                    'diseaseNameDisplay': original_disease_name,
                    'medicines': set()
                }
            if medicine: # Only add if not empty
                diseases_medicines_map[disease_firestore_id]['medicines'].add(medicine)

        batch = db.batch()
        count = 0
        for disease_id, data in diseases_medicines_map.items():
            doc_ref = db.collection(DISEASES_MEDICINES_COLLECTION).document(disease_id)
            batch.set(doc_ref, {
                'diseaseNameDisplay': data['diseaseNameDisplay'],
                'diseaseNameId': disease_id, # Store the sanitized ID name as a field
                'medicines': sorted(list(data['medicines'])) # Convert set to sorted list
            })
            count += 1
            if count % 500 == 0: # Commit batch every 500 operations
                batch.commit()
                batch = db.batch()
                print(f"Committed {count} documents for {DISEASES_MEDICINES_COLLECTION}...")

        batch.commit() # Commit any remaining operations
        print(f"Successfully uploaded {count} unique diseases to '{DISEASES_MEDICINES_COLLECTION}' collection.")

    except FileNotFoundError:
        print(f"Error: {csv_file_path} not found. Please ensure the file is in the correct directory.")
    except Exception as e:
        print(f"An error occurred during diseases_medicines upload: {e}")

# --- Main execution ---
if __name__ == "__main__":
    # Ensure CSV files exist
    if not os.path.exists('./Dataset/symptoms_diseases.csv'):
        print("Error: 'symptoms_diseases.csv' not found. Please ensure it's in the same directory or update path.")
        exit()
    if not os.path.exists('./Dataset/diseases_medicines.csv'):
        print("Error: 'diseases_medicines.csv' not found. Please ensure it's in the same directory or update path.")
        exit()

    upload_symptoms_diseases('./Dataset/symptoms_diseases.csv')
    upload_diseases_medicines('./Dataset/diseases_medicines.csv')
    print("\nData ingestion process complete.")