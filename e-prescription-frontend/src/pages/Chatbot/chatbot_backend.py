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

# --- NEW IMPORTS FOR SCIKIT-LEARN ---
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# --- GOOGLE TRANSLATE API IMPORTS ---
from google.cloud import translate_v3 as translate
# --- NEW GOOGLE CLOUD TEXT-TO-SPEECH IMPORT ---
from google.cloud import texttospeech

# Set GOOGLE_APPLICATION_CREDENTIALS environment variable or provide path here
# Ensure this path points to your Google Cloud Service Account key for Translation and TTS
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = "./API_keys/medisl-ed07f-ea16636d718e.json"

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
    nltk.download('omw-1.4') # Required for some WordNet functionalities
except Exception as e:
    print(f"An unexpected error occurred during NLTK data check: {e}")
    print("Please try running 'python -c \"import nltk; nltk.download(\'all\')\"' in your terminal.")


# --- Configuration ---
SERVICE_ACCOUNT_KEY_PATH = './API_keys/medisl-ed07f-firebase-adminsdk-fbsvc-ad3fdc406c.json'
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
    if not firebase_admin._apps: # Prevent re-initialization in dev environments
        firebase_admin.initialize_app(cred)
    db = firestore.client()
    print("Firebase Admin SDK initialized successfully.")
except Exception as e:
    print(f"Error initializing Firebase: {e}")
    print("Please ensure 'serviceAccountKey.json' is in the correct path and is valid.")
    exit() # Exit if Firebase initialization fails

# --- Initialize Google Translate Client ---
PROJECT_ID = "medisl-ed07f" 
translate_client = translate.TranslationServiceClient()
parent = f"projects/{PROJECT_ID}/locations/global" # Parent resource for translation
print(f"Google Translate Client initialized for Project ID: {PROJECT_ID}")

# --- NEW: Initialize Google Cloud Text-to-Speech Client ---
tts_client = texttospeech.TextToSpeechClient()
print("Google Cloud Text-to-Speech Client initialized successfully.")

# --- Initialize NLP tools (English only, as we'll translate to English) ---
lemmatizer = WordNetLemmatizer()
stop_words = set(stopwords.words('english'))

# --- GLOBAL VARIABLES FOR TF-IDF (English only) ---
tfidf_vectorizer = None
disease_symptom_vectors = []

# --- NEW GLOBAL: TTS Language Configuration ---
# Map general language codes (from frontend) to Google Cloud TTS specific BCP-47 codes and preferred voices
TTS_LANG_CONFIG = {
    'en': {'language_code': 'en-US', 'voice_name': 'en-US-Standard-C'}, # Example English voice
    'si': {'language_code': 'si-LK', 'voice_name': 'si-LK-Standard-A'}, # Sinhala (Sri Lanka) Standard voice
    'ta': {'language_code': 'ta-IN', 'voice_name': 'ta-IN-Standard-A'}, # Tamil (India) Standard voice
    # Add a 'default' entry for robust lookup if an unsupported language code comes in
    'default': {'language_code': 'en-US', 'voice_name': 'en-US-Standard-C'},
    # For higher quality, consider Wavenet voices if available and enabled for your project:
    # Check available voices: https://cloud.google.com/text-to-speech/docs/voices
    # 'si': {'language_code': 'si-LK', 'voice_name': 'si-LK-Wavenet-A'},
    # 'ta': {'language_code': 'ta-IN', 'voice_name': 'ta-IN-Wavenet-A'},
}


# --- NLP Preprocessing Function for Symptoms (now exclusively English) ---
def preprocess_text(text):
    text = text.lower()
    # Keep only lowercase letters and spaces
    text = re.sub(r'[^a-z\s]', '', text)
    tokens = nltk.word_tokenize(text)
    filtered_tokens = [
        lemmatizer.lemmatize(word) for word in tokens
        if word not in stop_words and len(word) > 1 # Remove stop words and single-character tokens
    ]
    return filtered_tokens

# --- Helper Function: Preprocess Medicine Names for Lookup (IDs should be English/standardized) ---
def preprocess_medicine_name(name):
    name = name.lower()
    # Replace non-alphanumeric characters with underscores
    name = re.sub(r'[^a-z0-9]+', '_', name)
    name = name.strip('_') # Remove leading/trailing underscores
    return name

# --- Google Translate Helper Function ---
def translate_text(text, target_language_code, source_language_code=None):
    if not text:
        return ""
    
    # Avoid unnecessary API calls if source and target are the same, or if already English and targeting English
    if source_language_code and target_language_code == source_language_code:
        return text
    
    if target_language_code in ['en', 'eng'] and source_language_code in ['en', 'eng']:
        return text

    try:
        request_params = {
            "parent": parent,
            "contents": [text],
            "mime_type": "text/plain", # Crucial: specify input type
            "target_language_code": target_language_code,
        }
        if source_language_code: # Only add source_language_code if provided
            request_params["source_language_code"] = source_language_code

        response = translate_client.translate_text(
            request=request_params
        )
        
        if response.translations:
            detected_lang = response.translations[0].detected_language_code or 'auto'
            print(f"Translated '{text[:30]}...' from {detected_lang} to {target_language_code}: '{response.translations[0].translated_text[:30]}...'")
            return response.translations[0].translated_text
        return text # Return original if no translation occurs (e.g., empty response)
    except Exception as e:
        print(f"Translation Error for text '{text[:50]}...': {e}")
        return text # Return original text on error to avoid breaking the flow

# --- Function to load and vectorize symptoms from Firestore (English only) ---
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
            
            if symptoms_string.strip(): # Only add if symptoms string is not empty
                corpus.append(symptoms_string)
                disease_data_for_vectorization.append({
                    'disease_id': disease_id,
                    'disease_display': disease_display
                })

        if not corpus:
            print(f"Warning: No symptom data found in Firestore collection '{SYMPTOMS_DISEASES_COLLECTION}'. Chatbot matching will not work.")
            return

        # Fit TF-IDF Vectorizer on the corpus of all symptoms
        tfidf_vectorizer = TfidfVectorizer()
        tfidf_matrix = tfidf_vectorizer.fit_transform(corpus)

        disease_symptom_vectors = []
        for i, data_entry in enumerate(disease_data_for_vectorization):
            disease_symptom_vectors.append({
                'disease_id': data_entry['disease_id'],
                'disease_display': data_entry['disease_display'],
                'vector': tfidf_matrix[i] # Store the TF-IDF vector for each disease
            })
        print(f"Successfully vectorized {len(disease_symptom_vectors)} unique diseases in English.")

    except Exception as e:
        print(f"Error loading or vectorizing English symptom data: {e}")
        # Continue running the app even if data loading fails, but matching won't work
        pass

# Call this function once when the app starts
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
    # Translate user input to English for NLP processing if not already English
    if user_selected_lang not in ['en', 'eng']:
        input_text_for_nlp = translate_text(patient_symptoms_paragraph, 'en', user_selected_lang)
        if not input_text_for_nlp: # If translation fails, respond accordingly
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
            # This means symptom data failed to load at startup
            return jsonify({
                'disease': 'N/A',
                'medicines': [],
                'message': translate_text('Chatbot data is not loaded. Please try again later or contact support.', user_selected_lang, 'en'),
                'disclaimer': translate_text(disclaimer_message_en, user_selected_lang, 'en')
            }), 500

        if not processed_patient_symptoms_string:
            # After preprocessing, if the string is empty, it means no meaningful symptoms were extracted
            return jsonify({
                'disease': 'N/A',
                'medicines': [],
                'message': translate_text('Please provide more descriptive symptoms. Your input did not contain enough recognizable words.', user_selected_lang, 'en'),
                'disclaimer': translate_text(disclaimer_message_en, user_selected_lang, 'en')
            }), 400

        # Transform patient symptoms into a TF-IDF vector
        patient_symptoms_vector = tfidf_vectorizer.transform([processed_patient_symptoms_string])

        best_match_disease_id = None
        best_match_disease_display_en = None
        max_similarity_score = -1.0
        
        SIMILARITY_THRESHOLD = 0.2 # Threshold to consider a match valid

        # Calculate cosine similarity with all known disease symptom vectors
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

            # Fetch suggested medicines for the identified disease
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
    
    # Translate disease name and medicines for display in UI
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
    # Translate medicine name to English for database lookup if not already English
    if user_selected_lang not in ['en', 'eng']:
        input_for_lookup_en = translate_text(medicine_name_input, 'en', user_selected_lang)
        if not input_for_lookup_en:
             return jsonify({
                 'medicineName': 'N/A', 'composition': 'N/A', 'uses': 'N/A', 'sideEffects': 'N/A', 'manufacturer': 'N/A',
                 'message': translate_text('Could not translate medicine name. Please try again.', user_selected_lang, 'en'),
                 'disclaimer': translate_text(disclaimer_message_en, user_selected_lang, 'en')
                }), 500

    # Preprocess the English medicine name to match Firestore document IDs (e.g., "paracetamol" -> "paracetamol")
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

    # Translate all fetched details and the final message back to the user's selected language
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

# --- NEW ENDPOINT: Get Health Tip ---
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
        
        # Prioritize fetching translated content directly from Firestore if available (e.g., 'tip_si')
        tip_message_key = f'tip_{user_selected_lang}'
        
        tip_content_en = selected_tip.get('tip_en', 'No tip content available in English.')
        
        tip_content_translated = selected_tip.get(tip_message_key)
        # If the specific language field is not found in Firestore, then use Google Translate
        if not tip_content_translated:
            tip_content_translated = translate_text(tip_content_en, user_selected_lang, 'en')
        
        if not tip_content_translated: # Fallback if translation also fails
            tip_content_translated = "Error: Could not retrieve health tip."

        return jsonify({
            'tip_message': tip_content_translated,
            'message': tip_content_translated, # Send the same message for speech synthesis
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
    language_code = data.get('lang', 'en') # Get language from frontend

    print(f"\n--- TTS Request ---") # Debugging print
    print(f"Received text for TTS: '{text[:100]}...'") # Debugging print (truncated for long texts)
    print(f"Received language code from frontend: '{language_code}'") # Debugging print

    if not text:
        print("Error: No text provided for speech synthesis.")
        return jsonify({"error": "No text provided for speech synthesis."}), 400

    # Get TTS configuration based on the language code
    # Default to English if the specific language config is not found
    tts_config = TTS_LANG_CONFIG.get(language_code, TTS_LANG_CONFIG['default']) 
    
    tts_language_code = tts_config['language_code']
    voice_name = tts_config.get('voice_name') # Get voice name, can be None
    
    print(f"Mapped TTS language code: '{tts_language_code}'") # Debugging print
    print(f"Selected voice name for TTS: '{voice_name or 'Default (Google-chosen)'}'") # Debugging print

    # Set the text input to be synthesized
    synthesis_input = texttospeech.SynthesisInput(text=text)

    # Build the voice request
    voice = texttospeech.VoiceSelectionParams(
        language_code=tts_language_code,
        name=voice_name, # This can be None, letting Google Cloud pick a default
        ssml_gender=texttospeech.SsmlVoiceGender.NEUTRAL # Or MALE/FEMALE
    )

    # Select the type of audio file you want returned
    audio_config = texttospeech.AudioConfig(
        audio_encoding=texttospeech.AudioEncoding.MP3
    )

    try:
        # Perform the text-to-speech request on the text input with the selected voice parameters and audio file type
        response = tts_client.synthesize_speech(
            input=synthesis_input, voice=voice, audio_config=audio_config
        )
        print("TTS synthesis successful. Sending audio.") # Debugging print

        # Return the audio content as a response
        return send_file(
            io.BytesIO(response.audio_content),
            mimetype='audio/mpeg',
            as_attachment=False
        )

    except Exception as e:
        app.logger.error(f"Google Cloud TTS error: {e}")
        print(f"Error during speech synthesis: {e}") # Debugging print
        # Provide a more detailed error to the frontend if debug is true
        error_message = f"Failed to synthesize speech: {str(e)}"
        if app.debug: # Only send detailed error in debug mode
            return jsonify({"error": error_message}), 500
        else:
            return jsonify({"error": "Failed to synthesize speech. Please try again later."}), 500

# --- Run the Flask app ---
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)