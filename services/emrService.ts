
import { EMRPatientRecord, AIDiagnosisResult } from "../types";

const MOCK_EMR_DATABASE: EMRPatientRecord[] = [
  { id: 'PAT-8821', name: 'Arjun Kumar', dob: '1978-05-12', gender: 'Male', history: 'Smoker, hypertension, mild asthma. Resident of Indiranagar.' },
  { id: 'PAT-4102', name: 'Priya Sharma', dob: '1992-11-23', gender: 'Female', history: 'No significant previous history. Referred from Manipal Hospitals.' },
  { id: 'PAT-9912', name: 'Rajesh Iyer', dob: '1955-01-30', gender: 'Male', history: 'Type 2 Diabetes, post-op cardiac stent (2020). Resident of Jayanagar.' },
];

export const fetchEMRPatient = async (patientId: string): Promise<EMRPatientRecord | null> => {
  // Simulating network latency for FHIR API call
  await new Promise(resolve => setTimeout(resolve, 800));
  return MOCK_EMR_DATABASE.find(p => p.id === patientId) || null;
};

export const pushToEHR = async (patientId: string, result: AIDiagnosisResult): Promise<boolean> => {
  // Simulating HL7/FHIR push request
  console.log(`Pushing findings to EHR for ${patientId}...`, result);
  await new Promise(resolve => setTimeout(resolve, 1500));
  return true;
};

export const getEHRConnectionStatus = () => {
  return {
    provider: 'Apollo Health Records',
    status: 'Connected',
    lastSync: new Date().toISOString(),
    endpoint: 'https://fhir.apollo.example.in/api/FHIR/R4/'
  };
};
