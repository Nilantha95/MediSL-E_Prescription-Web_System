// src/pages/Doctor_UIs/ViewPrescription.js
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase'; // Adjust path if necessary

const ViewPrescription = () => {
  const { id } = useParams(); // Get the prescription ID from the URL
  const [prescription, setPrescription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPrescription = async () => {
      if (!id) {
        setError('No prescription ID provided.');
        setLoading(false);
        return;
      }
      try {
        const docRef = doc(db, 'prescriptions', id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setPrescription(docSnap.data());
        } else {
          setError('Prescription not found.');
        }
      } catch (err) {
        console.error("Error fetching prescription:", err);
        setError('Failed to load prescription.');
      } finally {
        setLoading(false);
      }
    };

    fetchPrescription();
  }, [id]);

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '50px' }}>Loading prescription...</div>;
  }

  if (error) {
    return <div style={{ textAlign: 'center', padding: '50px', color: 'red' }}>Error: {error}</div>;
  }

  if (!prescription) {
    return <div style={{ textAlign: 'center', padding: '50px' }}>Prescription not available.</div>;
  }

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '800px', margin: '40px auto', padding: '30px', border: '1px solid #e0e0e0', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)', backgroundColor: '#fff' }}>
      <h2 style={{ textAlign: 'center', color: '#333', marginBottom: '20px' }}>Prescription Details</h2>
      <p><strong>Patient Name:</strong> {prescription.patientName}</p>
      <p><strong>Age:</strong> {prescription.age}</p>
      <p><strong>Gender:</strong> {prescription.gender}</p>
      <p><strong>Diagnosis:</strong> {prescription.diagnosis}</p>
      {/* Display medications */}
      {prescription.medications && prescription.medications.length > 0 && (
        <>
          <h3>Medications:</h3>
          <ul style={{ listStyleType: 'none', padding: 0 }}>
            {prescription.medications.map((med, index) => (
              <li key={index} style={{ marginBottom: '10px', borderBottom: '1px dotted #eee', paddingBottom: '5px' }}>
                <strong>{med.name}</strong> - {med.dosage} ({med.frequency}, {med.duration})
              </li>
            ))}
          </ul>
        </>
      )}
      {/* Display other details as needed */}
      <p style={{ marginTop: '20px', fontSize: '0.9em', color: '#777' }}>
        <em>Prescribed on: {new Date(prescription.createdAt.toDate()).toLocaleString()}</em>
      </p>
    </div>
  );
};

export default ViewPrescription;