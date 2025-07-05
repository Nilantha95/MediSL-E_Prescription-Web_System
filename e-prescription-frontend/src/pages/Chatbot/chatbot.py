import csv
import firebase_admin
from firebase_admin import credentials, firestore

# Initialize Firebase Admin
cred = credentials.Certificate("medisl-ed07f-firebase-adminsdk-fbsvc-b68db987a3.json")
firebase_admin.initialize_app(cred)
db = firestore.client()

# === Upload symptoms_diseases.csv ===
print("Uploading symptoms_diseases.csv...")
with open('./Dataset/symptoms_diseases.csv', newline='', encoding='utf-8') as csvfile:
    reader = csv.DictReader(csvfile)
    for idx, row in enumerate(reader, start=2):
        if idx > 7: break  # Upload only 5 rows for testing
        try:
            symptoms_raw = row.get("symptoms", "")
            disease = row.get("disease", "").strip()

            if symptoms_raw and disease:
                symptoms = [s.strip().lower() for s in symptoms_raw.split(',') if s.strip()]
                if symptoms:
                    db.collection("symptoms_diseases").add({
                        "symptoms": symptoms,
                        "disease": disease
                    })
                    print(f"✅ Uploaded: {symptoms} => {disease}")
                else:
                    print(f"⚠️ Skipping row {idx}: No valid symptoms")
            else:
                print(f"⚠️ Skipping row {idx}: Missing symptoms or disease")
        except Exception as e:
            print(f"❌ Error in symptoms_diseases row #{idx}: {e}")

# === Upload diseases_medicines.csv ===
print("\nUploading diseases_medicines.csv...")
with open('./Dataset/diseases_medicines.csv', newline='', encoding='utf-8') as csvfile:
    reader = csv.DictReader(csvfile)
    for idx, row in enumerate(reader, start=2):
        if idx > 7: break  # Upload only 5 rows for testing
        try:
            disease = row.get("disease", "").strip()
            medicines_raw = row.get("medicines", "")
            medicines = [m.strip() for m in medicines_raw.split(',') if m.strip()]

            if disease and medicines:
                db.collection("diseases_medicines").add({
                    "disease": disease,
                    "medicines": medicines
                })
                print(f"✅ Uploaded: {disease} => {medicines}")
            else:
                print(f"⚠️ Skipping row {idx}: Missing disease or medicines")
        except Exception as e:
            print(f"❌ Error in diseases_medicines row #{idx}: {e}")

print("\n✅ Upload complete.")

