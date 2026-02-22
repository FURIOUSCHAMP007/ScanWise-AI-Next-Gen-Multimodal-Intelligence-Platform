
export enum DiagnosticModality {
  XRAY = 'X-ray',
  CT = 'CT Scan',
  MRI = 'MRI',
  ULTRASOUND = 'Ultrasound',
  SKIN_PHOTO = 'Skin Photo',
  LAB_REPORT = 'Lab Report'
}

export type TriageLevel = 'ROUTINE' | 'PRIORITY' | 'EMERGENCY';

export interface MedicalScan {
  id: string;
  patientId: string;
  modality: DiagnosticModality;
  region: string;
  timestamp: string;
  imageUrl: string;
  reportUrl?: string;
  status: 'ingested' | 'processing' | 'analyzed' | 'finalized';
}

export interface LabReportInsights {
  parameters: { name: string; value: string; unit: string; range: string }[];
  summary: string;
}

export interface AIDiagnosisResult {
  abnormalities: string[];
  rareFindings?: string[];
  confidence: number;
  observations: string;
  riskLevel: 'Low' | 'Medium' | 'High';
  findings: string[];
  visualHeatmapCoord?: { x: number; y: number; label: string };
}

export interface ClinicalTrial {
  title: string;
  phase: string;
  location: string;
  url: string;
  relevance: string;
  intervention: string;
}

export interface ResearchMechanism {
  title: string;
  description: string;
  category: 'Glymphatic' | 'Vascular' | 'Immune' | 'Genetic';
}

export interface ResearchInsight {
  trials: ClinicalTrial[];
  papers: { title: string; url: string; snippet: string }[];
  mechanisms: ResearchMechanism[];
  takeaways: string[];
  summary: string;
}

export interface DecisionSupport {
  triagePriority: TriageLevel;
  suggestedSteps: string[];
  clinicalContext: string;
  reasoning: string;
}

export interface PatientCommunication {
  simpleExplanation: string;
  nextSteps: string;
}

export interface EMRPatientRecord {
  id: string;
  name: string;
  dob: string;
  gender: string;
  history: string;
}

export type AppView = 'home' | 'dashboard' | 'ingestion' | 'analysis' | 'patient' | 'ehr' | 'transplant';
