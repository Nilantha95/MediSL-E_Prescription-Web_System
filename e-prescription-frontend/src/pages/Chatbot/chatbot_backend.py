# chatbot_backend.py
import firebase_admin
from firebase_admin import credentials, firestore
from flask import Flask, request, jsonify
from flask_cors import CORS
import nltk
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer
import re
import os

# --- NEW IMPORTS FOR SCIKIT-LEARN ---
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# --- Configuration ---
SERVICE_ACCOUNT_KEY_PATH = './medisl-ed07f-firebase-adminsdk-fbsvc-baf423578c.json'
SYMPTOMS_DISEASES_COLLECTION = 'diseases_symptoms'
DISEASES_MEDICINES_COLLECTION = 'diseases_medicines'

# --- Initialize Flask App ---
app = Flask(__name__)
CORS(app) # Enable CORS for frontend communication

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

# --- Initialize NLP tools ---
lemmatizer = WordNetLemmatizer()
stop_words = set(stopwords.words('english'))

# --- GLOBAL VARIABLES FOR TF-IDF ---
tfidf_vectorizer = None # This will hold our fitted TF-IDF vectorizer
# This list will store dictionaries, each containing a disease ID, its display name, and its TF-IDF vector
disease_symptom_vectors = []

# --- NLP Preprocessing Function ---
def preprocess_text(text):
    """
    Cleans and normalizes text for NLP processing.
    - Lowercases
    - Removes punctuation and special characters
    - Tokenizes
    - Removes stop words
    - Lemmatizes
    """
    text = text.lower()
    text = re.sub(r'[^a-z\s]', '', text) # Remove non-alphabetic characters
    tokens = nltk.word_tokenize(text)
    filtered_tokens = [
        lemmatizer.lemmatize(word) for word in tokens
        if word not in stop_words and len(word) > 1 # Remove single character tokens
    ]
    return filtered_tokens

# --- NEW FUNCTION: Load and Vectorize Symptoms Data from Firestore ---
def load_and_vectorize_symptoms_data():
    global tfidf_vectorizer, disease_symptom_vectors
    print("\n--- Loading and Vectorizing Symptoms Data for Chatbot ---")
    try:
        # 1. Fetch all disease data from Firestore
        diseases_ref = db.collection(SYMPTOMS_DISEASES_COLLECTION)
        all_diseases_docs = diseases_ref.stream()

        corpus = [] # List to hold all combined symptom strings for TF-IDF training
        disease_data_for_vectorization = [] # To map vectors back to disease info

        for doc in all_diseases_docs:
            disease_data = doc.to_dict()
            disease_id = disease_data.get('diseaseNameId') # Use the sanitized ID field
            disease_display = disease_data.get('diseaseNameDisplay')
            # Symptoms from Firestore are assumed to be already preprocessed list of tokens
            db_symptoms = disease_data.get('symptoms', [])

            # Join the preprocessed symptom tokens into a single string for TF-IDF
            symptoms_string = " ".join(db_symptoms)
            
            # Only add if there are actual symptoms
            if symptoms_string.strip():
                corpus.append(symptoms_string)
                disease_data_for_vectorization.append({
                    'disease_id': disease_id,
                    'disease_display': disease_display
                })

        if not corpus:
            print("Warning: No symptom data found in Firestore to vectorize. Chatbot matching will not work.")
            return

        # 2. Initialize and fit TF-IDF Vectorizer on the entire corpus
        tfidf_vectorizer = TfidfVectorizer()
        tfidf_matrix = tfidf_vectorizer.fit_transform(corpus)

        # 3. Store vectorized symptoms along with their IDs and display names
        disease_symptom_vectors = []
        for i, data_entry in enumerate(disease_data_for_vectorization):
            disease_symptom_vectors.append({
                'disease_id': data_entry['disease_id'],
                'disease_display': data_entry['disease_display'],
                'vector': tfidf_matrix[i] # Store the sparse matrix row for this disease
            })
        print(f"Successfully vectorized {len(disease_symptom_vectors)} unique diseases.")

    except Exception as e:
        print(f"Error loading or vectorizing symptom data: {e}")
        # If this fails, the chatbot can't function correctly for matching
        exit() # Consider more robust error handling for production

# --- Call this function once when the Flask app starts ---
# This ensures data is loaded and vectorizer is ready before any requests come in.
load_and_vectorize_symptoms_data()


# --- Chatbot Endpoint ---
@app.route('/chat', methods=['POST'])
def chat():
    """
    Handles patient symptom input, identifies diseases, and suggests medicines.
    Uses TF-IDF and Cosine Similarity for improved matching.
    """
    data = request.get_json()
    patient_symptoms_paragraph = data.get('symptoms', '').strip()

    if not patient_symptoms_paragraph:
        return jsonify({
            'disease': 'N/A',
            'medicines': [],
            'message': 'Please provide your symptoms to get a suggestion.',
            'disclaimer': 'This chatbot provides general information and is not a substitute for professional medical advice. Always consult a qualified healthcare professional for diagnosis and treatment.'
        }), 400

    # 1. NLP: Preprocess patient's symptoms
    processed_patient_symptoms_list = preprocess_text(patient_symptoms_paragraph)
    # Join into a single string for the TF-IDF vectorizer
    processed_patient_symptoms_string = " ".join(processed_patient_symptoms_list)
    print(f"Processed patient symptoms string: '{processed_patient_symptoms_string}'")

    identified_disease_id = 'Unknown'
    identified_disease_display = 'Unknown'
    suggested_medicines = []
    response_message = "I couldn't identify a specific disease based on your symptoms. Please try rephrasing or provide more details, or consult a doctor."

    try:
        # Check if TF-IDF model is loaded
        if tfidf_vectorizer is None or not disease_symptom_vectors:
            return jsonify({
                'disease': 'N/A',
                'medicines': [],
                'message': 'Chatbot data is not loaded. Please try again later or contact support.',
                'disclaimer': 'This chatbot provides general information and is not a substitute for professional medical advice. Always consult a qualified healthcare professional for diagnosis and treatment.'
            }), 500

        # Handle case where patient input yields no valid tokens after preprocessing
        if not processed_patient_symptoms_string:
            return jsonify({
                'disease': 'N/A',
                'medicines': [],
                'message': 'Please provide more descriptive symptoms. Your input did not contain enough recognizable words.',
                'disclaimer': 'This chatbot provides general information and is not a substitute for professional medical advice. Always consult a qualified healthcare professional for diagnosis and treatment.'
            }), 400

        # Transform patient's symptoms into a TF-IDF vector
        patient_symptoms_vector = tfidf_vectorizer.transform([processed_patient_symptoms_string])

        best_match_disease_id = None
        best_match_disease_display = None
        max_similarity_score = -1.0 # Initialize with a value lower than any possible similarity
        
        # --- TUNABLE PARAMETER: Minimum similarity score for a match ---
        # Adjust this value based on your data and desired strictness.
        # Higher value = stricter match, fewer results. Lower value = looser match, more results.
        SIMILARITY_THRESHOLD = 0.2 # Common range: 0.1 to 0.3. You may need to experiment.

        # Iterate through pre-vectorized diseases and calculate similarity
        for disease_data_entry in disease_symptom_vectors:
            disease_id = disease_data_entry['disease_id']
            disease_display = disease_data_entry['disease_display']
            disease_vector = disease_data_entry['vector']

            # Calculate cosine similarity between patient's symptoms and disease symptoms
            similarity = cosine_similarity(patient_symptoms_vector, disease_vector)[0][0]

            # Update best match if current similarity is higher and meets the threshold
            if similarity > max_similarity_score and similarity >= SIMILARITY_THRESHOLD:
                max_similarity_score = similarity
                best_match_disease_id = disease_id
                best_match_disease_display = disease_display
                print(f"Found better match: {best_match_disease_display} (ID: {best_match_disease_id}) with similarity {max_similarity_score:.4f}")

        if best_match_disease_id:
            identified_disease_id = best_match_disease_id
            identified_disease_display = best_match_disease_display
            response_message = f"Based on your symptoms, you might have: **{identified_disease_display.title()}** (Confidence: {max_similarity_score:.2f})."

            # 3. Medicine Suggestion: Search diseases_medicines dataset using the identified ID
            medicines_doc_ref = db.collection(DISEASES_MEDICINES_COLLECTION).document(identified_disease_id)
            medicines_doc = medicines_doc_ref.get()

            if medicines_doc.exists:
                medicines_data = medicines_doc.to_dict()
                suggested_medicines = [m.title() for m in medicines_data.get('medicines', [])] # Capitalize medicines
                if suggested_medicines:
                    response_message += "\n\nSuggested medicines (informational only):"
                    for med in suggested_medicines:
                        response_message += f"\n- {med}"
                else:
                    response_message += "\n\nI don't have specific medicine suggestions for this condition in my database."
            else:
                response_message += "\n\nI don't have specific medicine suggestions for this condition in my database."
        else:
            print("No disease identified with sufficient similarity score.")
            response_message = "I couldn't identify a specific disease based on your symptoms. Please try rephrasing or provide more details, or consult a doctor."

    except Exception as e:
        print(f"An error occurred during chatbot processing: {e}")
        response_message = "An error occurred while processing your request. Please try again later."

    return jsonify({
        'disease': identified_disease_display.title(), # Ensure the display name is used here
        'medicines': suggested_medicines,
        'message': response_message,
        'disclaimer': 'This chatbot provides general information and is not a substitute for professional medical advice. Always consult a qualified healthcare professional for diagnosis and treatment.'
    })

# --- Run the Flask app ---
if __name__ == '__main__':
    # Flask's reloader can cause issues with global variables re-initialization in debug mode.
    # For development, if you face issues with tfidf_vectorizer resetting, run with debug=False briefly or
    # ensure the data loading happens robustly. In production (WSGI), this is not an issue.
    app.run(debug=True, host='0.0.0.0', port=5000)