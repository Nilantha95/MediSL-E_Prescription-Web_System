import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import CryptoJS from 'crypto-js';

// **SECURITY WARNING**: Use the SAME secure key.
const SECRET_KEY = "your-super-secret-key-that-should-be-in-a-secure-place";

// Helper function for decryption
const decryptData = (encryptedData) => {
    if (!encryptedData) return null;
    try {
        const decryptedBytes = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY);
        if (!decryptedBytes) return null;
        const decryptedString = decryptedBytes.toString(CryptoJS.enc.Utf8);
        if (!decryptedString) return null;
        return JSON.parse(decryptedString);
    } catch (error) {
        return null;
    }
};

const PrescriptionView = () => {
    const { prescriptionId } = useParams();
    const navigate = useNavigate();

    const [prescription, setPrescription] = useState(null);
    const [medicines, setMedicines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPrescription = async () => {
            if (!prescriptionId) {
                setError("No prescription ID found in the URL.");
                setLoading(false);
                return;
            }
            const docRef = doc(db, 'prescriptions', prescriptionId);
            try {
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    const decryptedMedications = decryptData(data.medications);
                    if (!decryptedMedications) {
                        setError("Failed to decrypt prescription data.");
                        setLoading(false);
                        return;
                    }
                    setPrescription({ ...data });
                    setMedicines(decryptedMedications);
                } else {
                    setError("Prescription not found.");
                }
            } catch (err) {
                console.error("Error fetching prescription:", err);
                setError("Failed to fetch prescription details. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchPrescription();
    }, [prescriptionId]);

    if (loading) return <div style={{ textAlign: 'center', marginTop: '50px' }}>Loading prescription details...</div>;
    if (error) return <div style={{ color: 'red', textAlign: 'center', marginTop: '50px' }}>{error}</div>;

    return (
        <div style={{ fontFamily: 'sans-serif', padding: '20px' }}>
            <div style={{ maxWidth: '900px', margin: '0 auto', backgroundColor: '#fff', padding: '30px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                <h1 style={{ borderBottom: '1px solid #eee', paddingBottom: '10px' }}>Prescription Details</h1>
                <p><strong>Patient Name:</strong> {prescription?.patientName}</p>
                <p><strong>Doctor:</strong> {prescription?.doctorName}</p>
                <p><strong>Diagnosis:</strong> {prescription?.diagnosis || 'N/A'}</p>
                <p><strong>Status:</strong> {prescription?.status.replace('_', ' ') || 'N/A'}</p>
                
                <h3 style={{ marginTop: '30px', borderBottom: '1px solid #eee', paddingBottom: '5px' }}>Medicines</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                    {medicines.map((med, index) => (
                        <div key={index} style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
                            <p><strong>Name:</strong> {med.name}</p>
                            <p><strong>Dosage:</strong> {med.dosage}</p>
                            <p><strong>Frequency:</strong> {med.frequency}</p>
                            <p><strong>Status:</strong> {med.status || 'Not Issued'}</p>
                        </div>
                    ))}
                </div>

                <h3 style={{ marginTop: '30px', borderBottom: '1px solid #eee', paddingBottom: '5px' }}>Issuance History</h3>
                {prescription?.issueHistory && prescription.issueHistory.length > 0 ? (
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        {prescription.issueHistory.map((entry, index) => (
                            <li key={index} style={{ marginBottom: '15px', padding: '10px', border: '1px solid #eee', borderRadius: '5px' }}>
                                <p><strong>Issued By:</strong> {entry.issuedBy}</p>
                                <p><strong>Issued On:</strong> {entry.issuedAt.toDate().toLocaleDateString()} at {entry.issuedAt.toDate().toLocaleTimeString()}</p>
                                <p><strong>Medicines:</strong> {entry.medicinesIssued.join(', ') || 'None'}</p>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No issuance history found for this prescription.</p>
                )}

                <button onClick={() => navigate('/pharmacy/dashboard')} style={{ marginTop: '20px', padding: '10px 20px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                    Go Back to Dashboard
                </button>
            </div>
        </div>
    );
};

export default PrescriptionView;