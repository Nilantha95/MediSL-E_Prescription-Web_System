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

# --- GOOGLE TRANSLATE API IMPORTS ---
from google.cloud import translate_v3 as translate
# Set GOOGLE_APPLICATION_CREDENTIALS environment variable or provide path here
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = "./API_keys/medisl-ed07f-b0b46af4e5bc.json"

# Ensure NLTK data is available
try:
    nltk.data.find('corpora/stopwords')
    nltk.data.find('corpora/wordnet')
    nltk.data.find('tokenizers/punkt')
except LookupError: # <--- CHANGED TO LookupError
    print("NLTK data not found (LookupError). Attempting to download necessary NLTK data...")
    nltk.download('punkt')
    nltk.download('stopwords')
    nltk.download('wordnet')
    nltk.download('omw-1.4') # Open Multilingual Wordnet (for lemmatization context)
except Exception as e: # <--- ADDED A MORE GENERIC CATCH FOR OTHER ERRORS
    print(f"An unexpected error occurred during NLTK data check: {e}")
    print("Please try running 'python -c \"import nltk; nltk.download(\'all\')\"' in your terminal.")


# --- Configuration ---
SERVICE_ACCOUNT_KEY_PATH = './API_keys/medisl-ed07f-firebase-adminsdk-fbsvc-04097b5b1d.json'
# Using English-specific collections as we will translate input/output
SYMPTOMS_DISEASES_COLLECTION = 'diseases_symptoms'
DISEASES_MEDICINES_COLLECTION = 'diseases_medicines'
MEDICINE_DETAILS_COLLECTION = 'medicine_details'

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

# --- Initialize Google Translate Client ---
# Your Google Cloud Project ID (Replace with your actual Project ID)
PROJECT_ID = "medisl-ed07f" 
translate_client = translate.TranslationServiceClient()
parent = f"projects/{PROJECT_ID}/locations/global"

print(f"Google Translate Client initialized for Project ID: {PROJECT_ID}")

# --- Initialize NLP tools (English only, as we'll translate to English) ---
lemmatizer = WordNetLemmatizer()
stop_words = set(stopwords.words('english'))

# --- GLOBAL VARIABLES FOR TF-IDF (English only) ---
tfidf_vectorizer = None # This will hold our fitted TF-IDF vectorizer
disease_symptom_vectors = [] # This list will store dictionaries for English data

# --- NLP Preprocessing Function for Symptoms (now exclusively English) ---
def preprocess_text(text):
    """
    Cleans and normalizes text for NLP processing (English only).
    """
    text = text.lower()
    text = re.sub(r'[^a-z\s]', '', text) # Remove non-alphabetic characters
    tokens = nltk.word_tokenize(text)
    filtered_tokens = [
        lemmatizer.lemmatize(word) for word in tokens
        if word not in stop_words and len(word) > 1 # Remove single character tokens
    ]
    return filtered_tokens

# --- Helper Function: Preprocess Medicine Names for Lookup (IDs should be English/standardized) ---
def preprocess_medicine_name(name):
    """
    Cleans and standardizes a medicine name for use as a Firestore document ID.
    IDs should remain in a consistent, typically English-based, format.
    """
    name = name.lower()
    name = re.sub(r'[^a-z0-9]+', '_', name) # Replace non-alphanumeric with underscore
    name = name.strip('_') # Remove leading/trailing underscores
    return name

# --- Google Translate Helper Function ---
def translate_text(text, target_language_code, source_language_code=None):
    """Translates text into the target language.

    Args:
        text (str): The text to translate.
        target_language_code (str): The language code to translate to (e.g., "en", "si", "ta").
        source_language_code (str, optional): The language code of the input text. If not
                                               specified, Google will auto-detect.

    Returns:
        str: The translated text, or the original text if translation fails.
    """
    if not text:
        return ""
    
    # If source and target are the same, no translation needed
    if source_language_code and target_language_code == source_language_code:
        return text
    
    # Handle common variants of English language codes
    if target_language_code in ['en', 'eng'] and source_language_code in ['en', 'eng']:
        return text

    try:
        if source_language_code:
            response = translate_client.translate_text(
                request={
                    "parent": parent,
                    "contents": [text],
                    "target_language_code": target_language_code,
                    "source_language_code": source_language_code,
                }
            )
        else:
            response = translate_client.translate_text(
                request={
                    "parent": parent,
                    "contents": [text],
                    "target_language_code": target_language_code,
                }
            )
        
        if response.translations:
            print(f"Translated '{text[:30]}...' from {response.translations[0].detected_language_code or 'auto'} to {target_language_code}: '{response.translations[0].translated_text[:30]}...'")
            return response.translations[0].translated_text
        return text # Return original if no translation
    except Exception as e:
        print(f"Translation Error: {e}")
        return text # Return original text on error

# --- Function to load and vectorize symptoms from Firestore (English only) ---
def load_and_vectorize_symptoms_data():
    global tfidf_vectorizer, disease_symptom_vectors
    print("\n--- Loading and Vectorizing English Symptoms Data for Chatbot ---")
    try:
        # 1. Fetch all disease data from Firestore (English collection)
        diseases_ref = db.collection(SYMPTOMS_DISEASES_COLLECTION)
        all_diseases_docs = diseases_ref.stream()

        corpus = []
        disease_data_for_vectorization = []

        for doc in all_diseases_docs:
            disease_data = doc.to_dict()
            disease_id = disease_data.get('diseaseNameId')
            disease_display = disease_data.get('diseaseNameDisplay')
            db_symptoms = disease_data.get('symptoms', []) # Symptoms are expected to be in English

            symptoms_string = " ".join(db_symptoms)
            
            if symptoms_string.strip():
                corpus.append(symptoms_string)
                disease_data_for_vectorization.append({
                    'disease_id': disease_id,
                    'disease_display': disease_display
                })

        if not corpus:
            print(f"Warning: No symptom data found in Firestore collection '{SYMPTOMS_DISEASES_COLLECTION}'. Chatbot matching will not work.")
            return

        # 2. Initialize and fit TF-IDF Vectorizer on the English corpus
        tfidf_vectorizer = TfidfVectorizer()
        tfidf_matrix = tfidf_vectorizer.fit_transform(corpus)

        # 3. Store vectorized symptoms along with their IDs and display names
        disease_symptom_vectors = []
        for i, data_entry in enumerate(disease_data_for_vectorization):
            disease_symptom_vectors.append({
                'disease_id': data_entry['disease_id'],
                'disease_display': data_entry['disease_display'],
                'vector': tfidf_matrix[i]
            })
        print(f"Successfully vectorized {len(disease_symptom_vectors)} unique diseases in English.")

    except Exception as e:
        print(f"Error loading or vectorizing English symptom data: {e}")
        # Consider logging this error and returning, rather than exiting, in production
        pass # Allow the app to start even if data loading fails, though chatbot won't work


# --- Call this function once when the Flask app starts ---
load_and_vectorize_symptoms_data()


# --- Chatbot Endpoint for Disease Diagnosis ---
@app.route('/chat', methods=['POST'])
def chat():
    data = request.get_json()
    patient_symptoms_paragraph = data.get('symptoms', '').strip()
    # Get the language the patient selected on the frontend
    user_selected_lang = data.get('language', 'en') 

    # Ensure disclaimer is translated by frontend or comes from a translated source
    disclaimer_message_en = 'This chatbot provides general information and is not a substitute for professional medical advice. Always consult a qualified healthcare professional for diagnosis and treatment.'

    if not patient_symptoms_paragraph:
        # Response messages for these cases should ideally be handled by frontend i18n
        return jsonify({
            'disease': 'N/A',
            'medicines': [],
            'message': translate_text('Please provide your symptoms to get a suggestion.', user_selected_lang, 'en'),
            'disclaimer': translate_text(disclaimer_message_en, user_selected_lang, 'en')
        }), 400

    # Translate input to English if not already English
    input_text_for_nlp = patient_symptoms_paragraph
    # Check for both 'en' and 'eng' as common English language codes
    if user_selected_lang not in ['en', 'eng']:
        input_text_for_nlp = translate_text(patient_symptoms_paragraph, 'en', user_selected_lang)
        if not input_text_for_nlp: # Handle case where translation fails
            return jsonify({
                'disease': 'N/A',
                'medicines': [],
                'message': translate_text('Could not translate your symptoms. Please try again.', user_selected_lang, 'en'),
                'disclaimer': translate_text(disclaimer_message_en, user_selected_lang, 'en')
            }), 500

    # Perform NLP preprocessing on the English text
    processed_patient_symptoms_list = preprocess_text(input_text_for_nlp)
    processed_patient_symptoms_string = " ".join(processed_patient_symptoms_list)
    print(f"Original input ({user_selected_lang}): '{patient_symptoms_paragraph}'")
    print(f"Translated/Processed English for NLP: '{processed_patient_symptoms_string}'")

    identified_disease_id = 'Unknown'
    identified_disease_display_en = 'Unknown' # Keep English display name for internal use
    suggested_medicines_en = []
    response_message_en = "I couldn't identify a specific disease based on your symptoms. Please try rephrasing or provide more details, or consult a doctor."

    try:
        if tfidf_vectorizer is None or not disease_symptom_vectors:
            return jsonify({
                'disease': 'N/A',
                'medicines': [],
                'message': translate_text('Chatbot data is not loaded. Please try again later or contact support.', user_selected_lang, 'en'),
                'disclaimer': translate_text(disclaimer_message_en, user_selected_lang, 'en')
            }), 500

        if not processed_patient_symptoms_string:
            return jsonify({
                'disease': 'N/A',
                'medicines': [],
                'message': translate_text('Please provide more descriptive symptoms. Your input did not contain enough recognizable words.', user_selected_lang, 'en'),
                'disclaimer': translate_text(disclaimer_message_en, user_selected_lang, 'en')
            }), 400

        patient_symptoms_vector = tfidf_vectorizer.transform([processed_patient_symptoms_string])

        best_match_disease_id = None
        best_match_disease_display_en = None
        max_similarity_score = -1.0
        
        SIMILARITY_THRESHOLD = 0.2

        for disease_data_entry in disease_symptom_vectors:
            disease_id = disease_data_entry['disease_id']
            disease_display_en = disease_data_entry['disease_display']
            disease_vector = disease_data_entry['vector']

            similarity = cosine_similarity(patient_symptoms_vector, disease_vector)[0][0]

            if similarity > max_similarity_score and similarity >= SIMILARITY_THRESHOLD:
                max_similarity_score = similarity
                best_match_disease_id = disease_id
                best_match_disease_display_en = disease_display_en
                print(f"Found better match: {best_match_disease_display_en} (ID: {best_match_disease_id}) with similarity {max_similarity_score:.4f}")

        if best_match_disease_id:
            identified_disease_id = best_match_disease_id
            identified_disease_display_en = best_match_disease_display_en
            response_message_en = f"Based on your symptoms, you might have: **{identified_disease_display_en.title()}** (Confidence: {max_similarity_score:.2f})."

            medicines_doc_ref = db.collection(DISEASES_MEDICINES_COLLECTION).document(identified_disease_id)
            medicines_doc = medicines_doc_ref.get()

            if medicines_doc.exists:
                medicines_data = medicines_doc.to_dict()
                suggested_medicines_en = [m.title() for m in medicines_data.get('medicines', [])]
                if suggested_medicines_en:
                    response_message_en += "\n\nSuggested medicines (informational only):"
                    for med in suggested_medicines_en:
                        response_message_en += f"\n- {med}"
                else:
                    response_message_en += "\n\nI don't have specific medicine suggestions for this condition in my database."
            else:
                response_message_en += "\n\nI don't have specific medicine suggestions for this condition in my database."
        else:
            print("No disease identified with sufficient similarity score.")
            response_message_en = "I couldn't identify a specific disease based on your symptoms. Please try rephrasing or provide more details, or consult a doctor."

    except Exception as e:
        print(f"An error occurred during chatbot processing: {e}")
        response_message_en = "An error occurred while processing your request. Please try again later."

    # Translate the final response message and disclaimer back to the user's selected language
    final_response_message = translate_text(response_message_en, user_selected_lang, 'en')
    final_disclaimer = translate_text(disclaimer_message_en, user_selected_lang, 'en')
    
    # Translate identified disease display name back
    identified_disease_display_translated = translate_text(identified_disease_display_en, user_selected_lang, 'en')
    
    # Translate suggested medicine names back (if any)
    suggested_medicines_translated = [
        translate_text(med_name_en, user_selected_lang, 'en')
        for med_name_en in suggested_medicines_en
    ]

    return jsonify({
        'disease': identified_disease_display_translated.title(),
        'medicines': suggested_medicines_translated,
        'message': final_response_message,
        'disclaimer': final_disclaimer
    })


# --- ENDPOINT: Get Medicine Details ---
@app.route('/get_medicine_details', methods=['POST'])
def get_medicine_details():
    """
    Fetches detailed information for a specific medicine, handling multilingual input/output.
    """
    data = request.get_json()
    medicine_name_input = data.get('medicineName', '').strip()
    user_selected_lang = data.get('language', 'en')

    disclaimer_message_en = 'This chatbot provides general information and is not a substitute for professional medical advice. Always consult a qualified healthcare professional for diagnosis and treatment.'

    if not medicine_name_input:
        return jsonify({
            'medicineName': 'N/A',
            'composition': 'N/A',
            'uses': 'N/A',
            'sideEffects': 'N/A',
            'manufacturer': 'N/A',
            'message': translate_text('Please provide a medicine name to get details.', user_selected_lang, 'en'),
            'disclaimer': translate_text(disclaimer_message_en, user_selected_lang, 'en')
        }), 400

    # Translate input to English if not already English for ID lookup (IDs should ideally be English/standardized)
    input_for_lookup_en = medicine_name_input
    if user_selected_lang not in ['en', 'eng']:
        input_for_lookup_en = translate_text(medicine_name_input, 'en', user_selected_lang)
        if not input_for_lookup_en:
             return jsonify({
                'medicineName': 'N/A', 'composition': 'N/A', 'uses': 'N/A', 'sideEffects': 'N/A', 'manufacturer': 'N/A',
                'message': translate_text('Could not translate medicine name. Please try again.', user_selected_lang, 'en'),
                'disclaimer': translate_text(disclaimer_message_en, user_selected_lang, 'en')
            }), 500

    medicine_id_for_lookup = preprocess_medicine_name(input_for_lookup_en) # ID is lang-independent, from English text
    print(f"Original medicine input ({user_selected_lang}): '{medicine_name_input}'")
    print(f"Processed English ID for lookup: '{medicine_id_for_lookup}'")

    medicine_details_en = {}
    response_message_en = ""

    try:
        medicine_doc_ref = db.collection(MEDICINE_DETAILS_COLLECTION).document(medicine_id_for_lookup)
        medicine_doc = medicine_doc_ref.get()

        if medicine_doc.exists:
            medicine_details_en = medicine_doc.to_dict()
            
            # Construct English response message using English data
            response_message_en = f"Here are the details for **{medicine_details_en.get('medicineNameRaw', 'N/A').title()}**:"
            response_message_en += f"\n\n**Composition:** {medicine_details_en.get('composition', 'N/A')}"
            response_message_en += f"\n**Uses:** {medicine_details_en.get('uses', 'N/A')}"
            response_message_en += f"\n**Side Effects:** {medicine_details_en.get('sideEffects', 'N/A')}"
            response_message_en += f"\n**Manufacturer:** {medicine_details_en.get('manufacturer', 'N/A')}"
        else:
            print(f"Medicine '{medicine_name_input}' (ID: '{medicine_id_for_lookup}') not found in English database.")
            response_message_en = f"Sorry, I could not find details for '{medicine_name_input}'. Please check the spelling or try another medicine."

    except Exception as e:
        print(f"An error occurred while fetching medicine details: {e}")
        response_message_en = "An error occurred while processing your request for medicine details. Please try again later."

    # Translate the final response elements back to the user's selected language
    final_response_message = translate_text(response_message_en, user_selected_lang, 'en')
    final_disclaimer = translate_text(disclaimer_message_en, user_selected_lang, 'en')

    # Translate individual fields for the JSON response
    translated_medicine_name = translate_text(medicine_details_en.get('medicineNameRaw', 'N/A'), user_selected_lang, 'en')
    translated_composition = translate_text(medicine_details_en.get('composition', 'N/A'), user_selected_lang, 'en')
    translated_uses = translate_text(medicine_details_en.get('uses', 'N/A'), user_selected_lang, 'en')
    translated_side_effects = translate_text(medicine_details_en.get('sideEffects', 'N/A'), user_selected_lang, 'en')
    translated_manufacturer = translate_text(medicine_details_en.get('manufacturer', 'N/A'), user_selected_lang, 'en')


    return jsonify({
        'medicineName': translated_medicine_name.title(),
        'composition': translated_composition,
        'uses': translated_uses,
        'sideEffects': translated_side_effects,
        'manufacturer': translated_manufacturer,
        'message': final_response_message,
        'disclaimer': final_disclaimer
    })

# --- Run the Flask app ---
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)