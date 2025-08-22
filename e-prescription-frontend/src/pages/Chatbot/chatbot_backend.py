import firebase_admin
from firebase_admin import credentials, firestore
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import nltk
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer
import re
import os
import random
import io
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from google.cloud import translate_v3 as translate
from google.cloud import texttospeech

# Set GOOGLE_APPLICATION_CREDENTIALS environment variable
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = "./API_keys/medisl-ed07f-ac08c7412b31.json"

# Ensure NLTK data is available
try:
    nltk.data.find('corpora/stopwords')
    nltk.data.find('corpora/wordnet')
    nltk.data.find('tokenizers/punkt')
except LookupError:
    print("NLTK data not found (LookupError). Attempting to download necessary NLTK data...")
    nltk.download('punkt')
    nltk.download('stopwords')
    nltk.download('wordnet')
    nltk.download('omw-1.4')
except Exception as e:
    print(f"An unexpected error occurred during NLTK data check: {e}")
    print('''Please try running 'python -c "import nltk; nltk.download('all')"'' in your terminal.''')

# --- Configuration ---
SERVICE_ACCOUNT_KEY_PATH = './API_keys/medisl-ed07f-firebase-adminsdk-fbsvc-d2764a2e96.json'
SYMPTOMS_DISEASES_COLLECTION = 'diseases_symptoms'
DISEASES_MEDICINES_COLLECTION = 'diseases_medicines'
MEDICINE_DETAILS_COLLECTION = 'medicine_details'
HEALTH_TIPS_COLLECTION = 'health_tips'

# --- Initialize Flask App ---
app = Flask(__name__)
CORS(app)

# --- Initialize Firebase Admin SDK ---
try:
    cred = credentials.Certificate(SERVICE_ACCOUNT_KEY_PATH)
    if not firebase_admin._apps:
        firebase_admin.initialize_app(cred)
    db = firestore.client()
    print("Firebase Admin SDK initialized successfully.")
except Exception as e:
    print(f"Error initializing Firebase: {e}")
    print("Please ensure 'serviceAccountKey.json' is in the correct path and is valid.")
    exit()

# --- Initialize Google Translate Client ---
PROJECT_ID = "medisl-ed07f"
translate_client = translate.TranslationServiceClient()
parent = f"projects/{PROJECT_ID}/locations/global"
print(f"Google Translate Client initialized for Project ID: {PROJECT_ID}")

# --- Initialize Google Cloud Text-to-Speech Client ---
tts_client = texttospeech.TextToSpeechClient()
print("Google Cloud Text-to-Speech Client initialized successfully.")

# --- Initialize NLP tools ---
lemmatizer = WordNetLemmatizer()
stop_words = set(stopwords.words('english'))

# --- GLOBAL VARIABLES FOR TF-IDF ---
tfidf_vectorizer = None
disease_symptom_vectors = []

# --- NEW GLOBAL: Synonym and phrase mapping for symptoms ---
SYMPTOM_SYNONYM_MAP = {
    'sore joint': 'joint_pain',
    'aching joint': 'joint_pain',
    'high fever': 'high_fever',
    'stomach ache': 'abdominal_pain',
    'backache': 'back_pain',
    'stomach pain': 'abdominal_pain',
    'joint ache': 'joint_pain',
    'feverish': 'fever',
    'fatigued': 'fatigue'
}

# --- NEW GLOBAL: Manual weights for symptoms to prioritize unique ones ---
SYMPTOM_WEIGHTS = {
    'joint_pain': 1.5,
    'swelling': 1.8,
    'high_fever': 0.8,
    'chills': 1.2,
    'vomiting': 1.2,
    'nausea': 0.9,
    'yellowish_skin': 2.0,
    'abdominal_pain': 1.3,
    'muscle_pain': 1.1,
    'back_pain': 1.0,
    'headache': 0.8,
    'fatigue': 1.0
}

# --- NEW GLOBAL: TTS Language Configuration ---
TTS_LANG_CONFIG = {
    'en': {'language_code': 'en-US', 'voice_name': 'en-US-Standard-C'},
    'si': {'language_code': 'si-LK', 'voice_name': 'si-LK-Standard-A'},
    'ta': {'language_code': 'ta-IN', 'voice_name': 'ta-IN-Standard-A'},
    'default': {'language_code': 'en-US', 'voice_name': 'en-US-Standard-C'},
}

# --- NLP Preprocessing Function for Symptoms ---
def preprocess_text(text):
    text = text.lower()
    for synonym, standard_term in SYMPTOM_SYNONYM_MAP.items():
        text = text.replace(synonym, standard_term)
    text = re.sub(r'[^a-z\s]', '', text)
    tokens = nltk.word_tokenize(text)
    filtered_tokens = [
        lemmatizer.lemmatize(word) for word in tokens
        if word not in stop_words and len(word) > 1
    ]
    return filtered_tokens

# --- Helper Function: Preprocess Medicine Names for Lookup ---
def preprocess_medicine_name(name):
    name = name.lower()
    name = re.sub(r'[^a-z0-9]+', '_', name)
    name = name.strip('_')
    return name

# --- Google Translate Helper Function ---
def translate_text(text, target_language_code, source_language_code=None):
    if not text:
        return ""
    
    if source_language_code and target_language_code == source_language_code:
        return text
    
    if target_language_code in ['en', 'eng'] and source_language_code in ['en', 'eng']:
        return text

    try:
        request_params = {
            "parent": parent,
            "contents": [text],
            "mime_type": "text/plain",
            "target_language_code": target_language_code,
        }
        if source_language_code:
            request_params["source_language_code"] = source_language_code

        response = translate_client.translate_text(request=request_params)
        
        if response.translations:
            detected_lang = response.translations[0].detected_language_code or 'auto'
            print(f"Translated '{text[:30]}...' from {detected_lang} to {target_language_code}: '{response.translations[0].translated_text[:30]}...'")
            return response.translations[0].translated_text
        return text
    except Exception as e:
        print(f"Translation Error for text '{text[:50]}...': {e}")
        return text

# --- Function to load and vectorize symptoms from Firestore ---
def load_and_vectorize_symptoms_data():
    global tfidf_vectorizer, disease_symptom_vectors
    print("\n--- Loading and Vectorizing English Symptoms Data for Chatbot ---")
    try:
        diseases_ref = db.collection(SYMPTOMS_DISEASES_COLLECTION)
        all_diseases_docs = diseases_ref.stream()

        corpus = []
        disease_data_for_vectorization = []

        for doc in all_diseases_docs:
            disease_data = doc.to_dict()
            disease_id = disease_data.get('diseaseNameId')
            disease_display = disease_data.get('diseaseNameDisplay')
            db_symptoms = disease_data.get('symptoms', [])

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

        tfidf_vectorizer = TfidfVectorizer()
        tfidf_matrix = tfidf_vectorizer.fit_transform(corpus)

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
        pass

load_and_vectorize_symptoms_data()

# --- Chatbot Endpoint for Disease Diagnosis ---
@app.route('/chat', methods=['POST'])
def chat():
    data = request.get_json()
    patient_symptoms_paragraph = data.get('symptoms', '').strip()
    user_selected_lang = data.get('language', 'en') 

    disclaimer_message_en = 'This chatbot provides general information and is not a substitute for professional medical advice. Always consult a qualified healthcare professional for diagnosis and treatment.'

    if not patient_symptoms_paragraph:
        return jsonify({
            'disease': 'N/A',
            'medicines': [],
            'message': translate_text('Please provide your symptoms to get a suggestion.', user_selected_lang, 'en'),
            'disclaimer': translate_text(disclaimer_message_en, user_selected_lang, 'en')
        }), 400

    input_text_for_nlp = patient_symptoms_paragraph
    if user_selected_lang not in ['en', 'eng']:
        input_text_for_nlp = translate_text(patient_symptoms_paragraph, 'en', user_selected_lang)
        if not input_text_for_nlp:
            return jsonify({
                'disease': 'N/A',
                'medicines': [],
                'message': translate_text('Could not translate your symptoms. Please try again.', user_selected_lang, 'en'),
                'disclaimer': translate_text(disclaimer_message_en, user_selected_lang, 'en')
            }), 500

    processed_patient_symptoms_list = preprocess_text(input_text_for_nlp)
    processed_patient_symptoms_string = " ".join(processed_patient_symptoms_list)
    print(f"Original input ({user_selected_lang}): '{patient_symptoms_paragraph}'")
    print(f"Translated/Processed English for NLP: '{processed_patient_symptoms_string}'")

    identified_disease_id = 'Unknown'
    identified_disease_display_en = 'Unknown'
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

        # Transform patient symptoms into a TF-IDF vector
        patient_symptoms_vector = tfidf_vectorizer.transform([processed_patient_symptoms_string])

        # Apply manual weights to the patient's symptom vector
        weighted_patient_vector = patient_symptoms_vector.copy()
        feature_names = tfidf_vectorizer.get_feature_names_out()

        for i, feature in enumerate(feature_names):
            weight = SYMPTOM_WEIGHTS.get(feature, 1.0)
            if weight != 1.0:
                weighted_patient_vector.data[weighted_patient_vector.indices == i] *= weight

        best_match_disease_id = None
        best_match_disease_display_en = None
        max_similarity_score = -1.0
        
        # Lower the threshold to make the matching more lenient
        SIMILARITY_THRESHOLD = 0.1 

        for disease_data_entry in disease_symptom_vectors:
            disease_id = disease_data_entry['disease_id']
            disease_display_en = disease_data_entry['disease_display']
            disease_vector = disease_data_entry['vector']

            similarity = cosine_similarity(weighted_patient_vector, disease_vector)[0][0]

            # Print scores for debugging purposes
            if similarity > 0:
                print(f"Checking for {disease_display_en}: Similarity Score = {similarity:.4f}")

            if similarity > max_similarity_score and similarity >= SIMILARITY_THRESHOLD:
                max_similarity_score = similarity
                best_match_disease_id = disease_id
                best_match_disease_display_en = disease_display_en
                print(f"Found better match: {best_match_disease_display_en} (ID: {best_match_disease_id}) with similarity {max_similarity_score:.4f}")

        if best_match_disease_id:
            identified_disease_id = best_match_disease_id
            identified_disease_display_en = best_match_disease_display_en

            # --- UPDATED CODE ---
            # Calculate the percentage and format the response message
            confidence_percentage = round(max_similarity_score * 100)
            response_message_en = f"Based on your symptoms, you might have: {identified_disease_display_en.title()} (Confidence: {confidence_percentage}%)."

            medicines_doc_ref = db.collection(DISEASES_MEDICINES_COLLECTION).document(identified_disease_id)
            medicines_doc = medicines_doc_ref.get()

            if medicines_doc.exists:
                medicines_data = medicines_doc.to_dict()
                suggested_medicines_en = [m.title() for m in medicines_data.get('medicines', [])]
                if suggested_medicines_en:
                    # MODIFIED TO USE "AND" INSTEAD OF NEWLINES
                    medicines_list_text = ', and '.join(suggested_medicines_en)
                    response_message_en += f" Suggested medicines (informational only): {medicines_list_text}"
                else:
                    response_message_en += " I don't have specific medicine suggestions for this condition in my database."
            else:
                response_message_en += " I don't have specific medicine suggestions for this condition in my database."
        else:
            print("No disease identified with sufficient similarity score.")
            response_message_en = "I couldn't identify a specific disease based on your symptoms. Please try rephrasing or provide more details, or consult a doctor."

    except Exception as e:
        print(f"An error occurred during chatbot processing: {e}")
        response_message_en = "An error occurred while processing your request. Please try again later."

    final_response_message = translate_text(response_message_en, user_selected_lang, 'en')
    final_disclaimer = translate_text(disclaimer_message_en, user_selected_lang, 'en')
    
    identified_disease_display_translated = translate_text(identified_disease_display_en, user_selected_lang, 'en')
    
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

    input_for_lookup_en = medicine_name_input
    if user_selected_lang not in ['en', 'eng']:
        input_for_lookup_en = translate_text(medicine_name_input, 'en', user_selected_lang)
        if not input_for_lookup_en:
             return jsonify({
                 'medicineName': 'N/A', 'composition': 'N/A', 'uses': 'N/A', 'sideEffects': 'N/A', 'manufacturer': 'N/A',
                 'message': translate_text('Could not translate medicine name. Please try again.', user_selected_lang, 'en'),
                 'disclaimer': translate_text(disclaimer_message_en, user_selected_lang, 'en')
                }), 500

    medicine_id_for_lookup = preprocess_medicine_name(input_for_lookup_en)
    print(f"Original medicine input ({user_selected_lang}): '{medicine_name_input}'")
    print(f"Processed English ID for lookup: '{medicine_id_for_lookup}'")

    medicine_details_en = {}
    response_message_en = ""

    try:
        medicine_doc_ref = db.collection(MEDICINE_DETAILS_COLLECTION).document(medicine_id_for_lookup)
        medicine_doc = medicine_doc_ref.get()

        if medicine_doc.exists:
            medicine_details_en = medicine_doc.to_dict()
            
            # UPDATED CODE: Removed bold markdown and replaced newlines with periods
            medicine_name = medicine_details_en.get('medicineNameRaw', 'N/A').title()
            composition = medicine_details_en.get('composition', 'N/A')
            uses = medicine_details_en.get('uses', 'N/A')
            side_effects = medicine_details_en.get('sideEffects', 'N/A')
            manufacturer = medicine_details_en.get('manufacturer', 'N/A')

            response_message_en = (
                f"Here are the details for {medicine_name}: "
                f"Composition: {composition}. "
                f"Uses: {uses}. "
                f"Side Effects: {side_effects}. "
                f"Manufacturer: {manufacturer}."
            )
        else:
            print(f"Medicine '{medicine_name_input}' (ID: '{medicine_id_for_lookup}') not found in English database.")
            response_message_en = f"Sorry, I could not find details for '{medicine_name_input}'. Please check the spelling or try another medicine."

    except Exception as e:
        print(f"An error occurred while fetching medicine details: {e}")
        response_message_en = "An error occurred while processing your request for medicine details. Please try again later."

    final_response_message = translate_text(response_message_en, user_selected_lang, 'en')
    final_disclaimer = translate_text(disclaimer_message_en, user_selected_lang, 'en')

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


# --- ENDPOINT: Get Health Tip ---
@app.route('/get_health_tip', methods=['POST'])
def get_health_tip():
    data = request.get_json()
    user_selected_lang = data.get('language', 'en')

    disclaimer_message_en = 'This chatbot provides general information and is not a substitute for professional medical advice. Always consult a qualified healthcare professional for diagnosis and treatment.'

    try:
        health_tips_ref = db.collection(HEALTH_TIPS_COLLECTION)
        all_tips_docs = health_tips_ref.stream()
        
        tips = []
        for doc in all_tips_docs:
            tips.append(doc.to_dict())
        
        if not tips:
            return jsonify({
                'tip_message': translate_text('No health tips available at the moment.', user_selected_lang, 'en'),
                'message': translate_text('No health tips available at the moment.', user_selected_lang, 'en'),
                'disclaimer': translate_text(disclaimer_message_en, user_selected_lang, 'en')
            }), 404

        selected_tip = random.choice(tips)
        
        tip_message_key = f'tip_{user_selected_lang}'
        
        tip_content_en = selected_tip.get('tip_en', 'No tip content available in English.')
        
        tip_content_translated = selected_tip.get(tip_message_key)
        if not tip_content_translated:
            tip_content_translated = translate_text(tip_content_en, user_selected_lang, 'en')
        
        if not tip_content_translated:
            tip_content_translated = "Error: Could not retrieve health tip."

        return jsonify({
            'tip_message': tip_content_translated,
            'message': tip_content_translated,
            'disclaimer': translate_text(disclaimer_message_en, user_selected_lang, 'en')
        })

    except Exception as e:
        print(f"Error fetching health tip: {e}")
        return jsonify({
            'tip_message': translate_text('An error occurred while fetching health tips.', user_selected_lang, 'en'),
            'message': translate_text('An error occurred while fetching health tips.', user_selected_lang, 'en'),
            'disclaimer': translate_text(disclaimer_message_en, user_selected_lang, 'en')
        }), 500

# --- NEW: Google Cloud TTS Endpoint ---
@app.route('/synthesize_speech', methods=['POST'])
def synthesize_speech():
    data = request.get_json()
    text = data.get('text')
    language_code = data.get('lang', 'en')

    print(f"\n--- TTS Request ---")
    print(f"Received text for TTS: '{text[:100]}...'")
    print(f"Received language code from frontend: '{language_code}'")

    if not text:
        print("Error: No text provided for speech synthesis.")
        return jsonify({"error": "No text provided for speech synthesis."}), 400

    tts_config = TTS_LANG_CONFIG.get(language_code, TTS_LANG_CONFIG['default'])
    
    tts_language_code = tts_config['language_code']
    voice_name = tts_config.get('voice_name')
    
    print(f"Mapped TTS language code: '{tts_language_code}'")
    print(f"Selected voice name for TTS: '{voice_name or 'Default (Google-chosen)'}'")

    synthesis_input = texttospeech.SynthesisInput(text=text)
    voice = texttospeech.VoiceSelectionParams(
        language_code=tts_language_code,
        name=voice_name,
        ssml_gender=texttospeech.SsmlVoiceGender.NEUTRAL
    )
    audio_config = texttospeech.AudioConfig(
        audio_encoding=texttospeech.AudioEncoding.MP3
    )

    try:
        response = tts_client.synthesize_speech(
            input=synthesis_input, voice=voice, audio_config=audio_config
        )
        print("TTS synthesis successful. Sending audio.")

        return send_file(
            io.BytesIO(response.audio_content),
            mimetype='audio/mpeg',
            as_attachment=False
        )

    except Exception as e:
        app.logger.error(f"Google Cloud...")

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)