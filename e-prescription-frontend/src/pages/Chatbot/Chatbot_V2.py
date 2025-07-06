import firebase_admin
from firebase_admin import credentials, firestore
import pandas as pd
import os

# --- Configuration ---
# Path to your Firebase service account key JSON file
SERVICE_ACCOUNT_KEY_PATH = './medisl-ed07f-firebase-adminsdk-fbsvc-b68db987a3.json'
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
    print("Please ensure 'serviceAccountKey.json' is in the correct path and is valid.")
    exit()

# --- Function to upload symptoms_diseases data ---
def upload_symptoms_diseases(csv_file_path):
    print(f"\n--- Uploading {csv_file_path} to Firestore ---")
    try:
        df = pd.read_csv(csv_file_path)
        # Fill NaN values with an empty string for easier processing
        df = df.fillna('')

        # Group by 'disease' and collect all symptoms into a list for each disease
        # We'll iterate through all 'symptoms' columns (symptoms, symptoms.1, etc.)
        diseases_symptoms_map = {}
        for index, row in df.iterrows():
            disease = row['disease'].strip().lower() # Normalize disease name
            symptoms_list = []
            # Iterate through all columns that start with 'symptoms'
            for col in df.columns:
                if col.startswith('symptoms') and row[col].strip() != '':
                    symptoms_list.append(row[col].strip().lower().replace('_', ' ')) # Normalize symptoms

            if disease not in diseases_symptoms_map:
                diseases_symptoms_map[disease] = set() # Use a set to avoid duplicate symptoms
            diseases_symptoms_map[disease].update(symptoms_list)

        # Convert sets back to lists for Firestore
        for disease, symptoms_set in diseases_symptoms_map.items():
            diseases_symptoms_map[disease] = sorted(list(symptoms_set)) # Sort for consistency

        batch = db.batch()
        count = 0
        for disease, symptoms in diseases_symptoms_map.items():
            doc_ref = db.collection(SYMPTOMS_DISEASES_COLLECTION).document(disease) # Use disease name as document ID
            batch.set(doc_ref, {
                'diseaseName': disease,
                'symptoms': symptoms
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

        # Group by 'disease' and collect all medicines into a list for each disease
        diseases_medicines_map = {}
        for index, row in df.iterrows():
            disease = row['disease'].strip().lower() # Normalize disease name
            medicine = row['medicines'].strip().lower() # Normalize medicine name

            if disease not in diseases_medicines_map:
                diseases_medicines_map[disease] = set() # Use a set to avoid duplicate medicines
            if medicine: # Only add if not empty
                diseases_medicines_map[disease].add(medicine)

        # Convert sets back to lists for Firestore
        for disease, medicines_set in diseases_medicines_map.items():
            diseases_medicines_map[disease] = sorted(list(medicines_set)) # Sort for consistency

        batch = db.batch()
        count = 0
        for disease, medicines in diseases_medicines_map.items():
            doc_ref = db.collection(DISEASES_MEDICINES_COLLECTION).document(disease) # Use disease name as document ID
            batch.set(doc_ref, {
                'diseaseName': disease,
                'medicines': medicines
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
        print("Error: 'symptoms_diseases.csv' not found. Please upload it.")
        exit()
    if not os.path.exists('./Dataset/diseases_medicines.csv'):
        print("Error: 'diseases_medicines.csv' not found. Please upload it.")
        exit()

    upload_symptoms_diseases('./Dataset/symptoms_diseases.csv')
    upload_diseases_medicines('./Dataset/diseases_medicines.csv')
    print("\nData ingestion process complete.")