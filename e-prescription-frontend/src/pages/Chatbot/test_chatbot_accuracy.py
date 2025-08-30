# -- Got help chatgpt to write sript


import pytest
import requests
import csv

# URL for point to Flask app.
BASE_URL = "http://127.0.0.1:5000"

def load_test_data():
    """Loads test data from a CSV file."""
    test_cases = []
    with open('test_data.csv', mode='r', encoding='utf-8') as file:
        reader = csv.DictReader(file)
        for row in reader:
            test_cases.append(row)
    return test_cases

def test_chatbot_accuracy():
    test_cases = load_test_data()
    total_tests = len(test_cases)
    correct_diagnoses = 0
    test_results = []
    
    print("\n--- Running Chatbot Accuracy Test ---\n")
    
    for i, case in enumerate(test_cases):
        symptoms = case['symptoms_input']
        expected_disease = case['expected_disease']
        payload = {'symptoms': symptoms, 'language': 'en'}
        
        try:
            response = requests.post(f"{BASE_URL}/chat", json=payload)
            response.raise_for_status()
            result = response.json()
            
            identified_disease = result.get('disease', 'N/A').strip().title()
            
            print(f"Test {i+1}/{total_tests}: '{symptoms}'")
            print(f"  Expected: '{expected_disease}'")
            print(f"  Got:      '{identified_disease}'")
            result_status = "PASS" if identified_disease == expected_disease else "FAIL"
            if result_status == "PASS":
                correct_diagnoses += 1
            
            test_results.append({
                'test_number': i + 1,
                'symptoms_input': symptoms,
                'expected_disease': expected_disease,
                'identified_disease': identified_disease,
                'result': result_status
            })
            
            print(f"  Result: {result_status}")
            
        except requests.exceptions.RequestException as e:
            print(f"Error connecting to the API: {e}")
            pytest.fail(f"Could not connect to the API: {e}")
    accuracy = (correct_diagnoses / total_tests) * 100 if total_tests > 0 else 0 #Accuracy percentage
    
    report_content = "--- Chatbot Accuracy Test Report ---\n\n"
    report_content += "Test Case Details:\n\n"
    for result in test_results:
        report_content += f"Test {result['test_number']}:\n"
        report_content += f"  Symptoms: {result['symptoms_input']}\n"
        report_content += f"  Expected: {result['expected_disease']}\n"
        report_content += f"  Identified: {result['identified_disease']}\n"
        report_content += f"  Result: {result['result']}\n\n"

    report_content += "\n--- Test Summary ---\n"
    report_content += f"Total Test Cases: {total_tests}\n"
    report_content += f"Correct Diagnoses: {correct_diagnoses}\n"
    report_content += f"Accuracy Score: {accuracy:.2f}%\n"

    print(report_content)
    
    assert accuracy >= 60, f"Accuracy is {accuracy:.2f}%, which is below the 60% threshold."
    
    with open('accuracy_result.txt', 'w') as f:
        f.write(report_content)
    print("\nFull test report has been saved to 'accuracy_result.txt'.")