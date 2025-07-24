import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { QrReader } from 'react-qr-reader';
import { FaArrowLeft } from 'react-icons/fa';

const QrScanner = () => {
    const navigate = useNavigate();
    const [isScanning, setIsScanning] = useState(true);
    const [scanned, setScanned] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (scanned) {
            const timer = setTimeout(() => {
                navigate(`/pharmacy/issue/${scanned}`);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [scanned, navigate]);

    const handleScan = (result, scanError) => {
        if (result && result.text && !scanned) {
            let prescriptionId;
            try {
                // Attempt to parse the QR code data as a JSON object
                const parsedData = JSON.parse(result.text);
                console.log("QR Code data parsed successfully:", parsedData);
                
                // Extract the prescriptionId from the parsed object
                if (parsedData.prescriptionId) {
                    prescriptionId = parsedData.prescriptionId;
                } else {
                    console.error("Parsed JSON object does not contain a 'prescriptionId'.");
                    setError("Invalid QR code format. 'prescriptionId' not found.");
                    return;
                }

            } catch (jsonError) {
                // If parsing fails, assume the data is a simple prescriptionId string
                console.log("QR Code data is not a JSON object. Assuming it's a direct ID.");
                prescriptionId = result.text;
            }

            console.log('Final Prescription ID for navigation:', prescriptionId);
            setIsScanning(false);
            setScanned(prescriptionId);
        }

        if (scanError) {
            if (scanError.name === 'NotAllowedError') {
                setError("Camera access was denied. Please check your browser's permissions.");
            } else if (scanError.name === 'NotFoundError') {
                setError("No camera found on this device.");
            } else {
                console.error("QR Reader Error:", scanError);
            }
        }
    };

    const handleBack = () => {
        navigate('/pharmacy/dashboard');
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px', fontFamily: 'sans-serif', backgroundColor: '#f0f2f5', minHeight: '100vh' }}>
            <div style={{ width: '100%', maxWidth: '600px', backgroundColor: '#fff', padding: '30px', borderRadius: '10px', boxShadow: '0 6px 18px rgba(0,0,0,0.1)' }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                    <button onClick={handleBack} style={{ background: 'none', border: 'none', fontSize: '1.5em', cursor: 'pointer', color: '#555' }}>
                        <FaArrowLeft />
                    </button>
                    <h2 style={{ margin: 0, marginLeft: '15px', color: '#333' }}>Scan Prescription QR Code</h2>
                </div>
                {scanned ? (
                    <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '1.2em', color: '#28a745', fontWeight: 'bold' }}>
                        Scanning completed. Redirecting...
                    </p>
                ) : (
                    <>
                        <p style={{ textAlign: 'center', color: '#666', marginBottom: '20px' }}>
                            Please point your camera at the QR code on the patient's prescription.
                        </p>
                        <div style={{ width: '100%', height: '400px', border: '3px dashed #007bff', borderRadius: '10px', overflow: 'hidden' }}>
                            <QrReader
                                onResult={handleScan}
                                constraints={{ facingMode: 'environment' }}
                                style={{ width: '100%', height: '100%' }}
                            />
                        </div>
                    </>
                )}
                {error && (
                    <p style={{ color: 'red', textAlign: 'center', marginTop: '20px', fontWeight: 'bold' }}>
                        {error}
                    </p>
                )}
            </div>
        </div>
    );
};

export default QrScanner;