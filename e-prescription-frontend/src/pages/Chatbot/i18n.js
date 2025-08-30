// used ai for code enhancement


import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
 
  .use(LanguageDetector)
  .use(initReactI18next)
 
  .init({
    debug: true, 
    fallbackLng: 'en', 
    interpolation: {
      escapeValue: false, 
    },
    resources: {
      en: {
        translation: {
          // General UI messages
          welcomeMessage: "Hello! I'm your MediSL Chatbot. How can I help you today?",
          botName: "MediSL Chatbot",
          provideSymptoms: "Please provide your symptoms.",
          provideMedicineName: "Please provide a medicine name to get details.",
          unknownInput: "I didn't understand that.",
          loadingMessage: "Loading...",
          startChat: "Start Chat",

          // Option Chooser Widget
          getMedicineDetails: "Get Medicine Details",
          diagnoseDisease: "Diagnose Disease by Symptoms",
          getHealthTip: "Get a Health Tip", 
          goBack: "You can type 'restart' to go back to the main menu.",
          initialChoicePrompt: "What would you like to do?",
          
          // Chat modes / Instructions
          symptomsDiagnosisMode: "Okay, please describe your symptoms. For example: 'I have a headache and fever.'",
          medicineDetailsMode: "Great! Please type the full name of the medicine you want to know about (e.g., 'Avastin 400mg Injection').",
          healthTipsMode: "Here's a daily health tip for you!", // NEW
          noHealthTipsFound: "Sorry, I couldn't find any health tips right now. Please try again later.", // NEW
          
          // Backend Response Messages (frontend will display what backend sends, but these are for default text)
          noDiseaseFound: "Sorry, I'm having trouble diagnosing your symptoms right now. Please try again later.",
          noMedicineFound: "Sorry, I couldn't get details for \"{{medicineName}}\". Please try again or check the spelling.",
          genericError: "An error occurred while processing your request. Please try again later.",
          
          
          disclaimer: "This chatbot provides general information and is not a substitute for professional medical advice. Always consult a qualified healthcare professional for diagnosis and treatment."
        },
      },
      // Sinhala translations
      si: {
        translation: {
          welcomeMessage: "ආයුබෝවන්! මම ඔබේ MediSL Chatbot. ඔබට අද මා උදව් කරන්නේ කෙසේද?",
          botName: "MediSL Chatbot",
          provideSymptoms: "කරුණාකර ඔබේ රෝග ලක්ෂණ සඳහන් කරන්න.",
          provideMedicineName: "විස්තර ලබා ගැනීමට ඖෂධ නාමයක් සඳහන් කරන්න.",
          unknownInput: "මට එය තේරුණේ නැහැ.",
          loadingMessage: "පූරණය වෙමින් පවතී...",
          startChat: "චැට් ආරම්භ කරන්න",

          getMedicineDetails: "ඖෂධ විස්තර ලබා ගන්න",
          diagnoseDisease: "රෝග ලක්ෂණ මගින් රෝග විනිශ්චය කරන්න",
          getHealthTip: "සෞඛ්‍ය උපදෙස් ලබා ගන්න", // NEW
          goBack: "ප්‍රධාන මෙනුව වෙත ආපසු යාමට ඔබට 'restart' යැවිය හැක.",
          initialChoicePrompt: "ඔබට කුමක් කිරීමට අවශ්‍යද?",

          symptomsDiagnosisMode: "හොඳයි, කරුණාකර ඔබේ රෝග ලක්ෂණ විස්තර කරන්න. උදාහරණයක් ලෙස: 'මට හිසරදයක් සහ උණක් තිබේ.'",
          medicineDetailsMode: "හොඳයි! කරුණාකර ඔබ දැන ගැනීමට කැමති ඖෂධයේ සම්පූර්ණ නම ටයිප් කරන්න (උදා: 'Avastin 400mg Injection').",
          healthTipsMode: "මෙන්න ඔබට දිනපතා සෞඛ්‍ය උපදෙසක්!", // NEW
          noHealthTipsFound: "කණගාටුයි, මට දැනට කිසිදු සෞඛ්‍ය උපදෙසක් සොයා ගැනීමට නොහැකි විය. කරුණාකර පසුව නැවත උත්සාහ කරන්න.", // NEW

          noDiseaseFound: "කණගාටුයි, මට දැනට ඔබේ රෝග ලක්ෂණ හඳුනා ගැනීමට අපහසුයි. කරුණාකර පසුව නැවත උත්සාහ කරන්න.",
          noMedicineFound: "කණගාටුයි, මට \"{{medicineName}}\" සඳහා විස්තර ලබා ගැනීමට නොහැකි විය. කරුණාකර නැවත උත්සාහ කරන්න හෝ අක්ෂර වින්‍යාසය පරීක්ෂා කරන්න.",
          genericError: "ඔබගේ ඉල්ලීම සැකසීමේදී දෝෂයක් ඇති විය. කරුණාකර පසුව නැවත උත්සාහ කරන්න.",
          
          disclaimer: "මෙම චැට්බෝට් එක සාමාන්‍ය තොරතුරු සපයන අතර වෘත්තීය වෛද්‍ය උපදෙස් සඳහා ආදේශකයක් නොවේ. රෝග විනිශ්චය සහ ප්‍රතිකාර සඳහා සෑම විටම සුදුසුකම් ලත් සෞඛ්‍ය සේවා වෘත්තිකයෙකුගෙන් උපදෙස් ලබා ගන්න."
        },
      },
      // Tamil translations
      ta: {
        translation: {
          welcomeMessage: "வணக்கம்! நான் உங்கள் MediSL சாட்போட். இன்று நான் உங்களுக்கு எப்படி உதவ முடியும்?",
          botName: "MediSL சாட்போட்",
          provideSymptoms: "உங்கள் அறிகுறிகளை வழங்கவும்.",
          provideMedicineName: "விவரங்களைப் பெற மருந்து பெயரை வழங்கவும்.",
          unknownInput: "எனக்கு அது புரியவில்லை.",
          loadingMessage: "ஏற்றப்படுகிறது...",
          startChat: "அரட்டையைத் தொடங்கு",

          getMedicineDetails: "மருந்து விவரங்களைப் பெறு",
          diagnoseDisease: "அறிகுறிகள் மூலம் நோயைக் கண்டறியவும்",
          getHealthTip: "சுகாதார குறிப்பை பெறுங்கள்", // NEW
          goBack: "முக்கிய மெனுவுக்குத் திரும்ப 'restart' எனத் தட்டச்சு செய்யலாம்.",
          initialChoicePrompt: "நீங்கள் என்ன செய்ய விரும்புகிறீர்கள்?",

          symptomsDiagnosisMode: "சரி, உங்கள் அறிகுறிகளை விவரிக்கவும். எடுத்துக்காட்டாக: 'எனக்கு தலைவலி மற்றும் காய்ச்சல் உள்ளது.'",
          medicineDetailsMode: "சிறந்தது! நீங்கள் அறிய விரும்பும் மருந்தின் முழுப் பெயரையும் தட்டச்சு செய்யவும் (எ.கா., 'Avastin 400mg Injection').",
          healthTipsMode: "இதோ உங்களுக்கான ஒரு தினசரி சுகாதார குறிப்பு!", // NEW
          noHealthTipsFound: "மன்னிக்கவும், எனக்கு இப்போதைக்கு எந்த சுகாதார குறிப்புகளும் கிடைக்கவில்லை. தயவுசெய்து பின்னர் மீண்டும் முயற்சிக்கவும்.", // NEW

          noDiseaseFound: "மன்னிக்கவும், உங்கள் அறிகுறிகளைக் கண்டறிவதில் எனக்கு இப்போதைக்கு சிக்கல் உள்ளது. தயவுசெய்து பின்னர் மீண்டும் முயற்சிக்கவும்.",
          noMedicineFound: "மன்னிக்கவும், \"{{medicineName}}\"க்கான விவரங்களைப் பெற முடியவில்லை. தயவுசெயது மீண்டும் முயற்சிக்கவும் அல்லது எழுத்துப்பிழையைச் சரிபார்க்கவும்.",
          genericError: "உங்கள் கோரிக்கையைச் செயலாக்கும்போது பிழை ஏற்பட்டது. தயவுசெய்து பின்னர் மீண்டும் முயற்சிக்கவும்.",
          
          disclaimer: "இந்த சாட்போட் பொதுவான தகவல்களை வழங்குகிறது மற்றும் தொழில்முறை மருத்துவ ஆலோசனைக்கு மாற்றாக இல்லை. நோய் கண்டறிதல் மற்றும் சிகிச்சைக்காக எப்போதும் தகுதிவாய்ந்த சுகாதார நிபுணரை அணுகவும்."
        },
      },
    },
  });

export default i18n;