
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Heart, 
  Activity, 
  Scale, 
  CheckCircle2, 
  MapPin,
  ChevronRight,
  Database,
  ArrowRight,
  ShieldCheck,
  Dna,
  Loader2, 
  Shield,
  FileSignature,
  Truck,
  PackageCheck,
  Stethoscope as StethoscopeIcon,
  FileSearch,
  CheckCircle,
  ArrowDown,
  ArrowRightLeft,
  RefreshCcw,
  Play,
  Gavel,
  Info,
  BookOpen,
  ClipboardList,
  Users,
  Scale as ScaleIcon,
  TrendingUp,
  Wind,
  Plus,
  Zap,
  UserCheck,
  Building2,
  Clock,
  ArrowUpRight,
  Timer,
  Globe,
  AlertCircle,
  Sparkles,
  BrainCircuit,
  AlertTriangle,
  ChevronDown,
  MoveUp,
  Award,
  Search,
  Box,
  FastForward,
  Layers,
  Fingerprint,
  Radio,
  Eye,
  Microscope,
  Info as InfoIcon,
  Target,
  Trophy,
  ShieldAlert,
  Server,
  Lock,
  Cpu,
  CloudUpload,
  Terminal,
  Scan,
  ShieldX,
  FileBadge,
  GitCommit,
  Network,
  Stethoscope,
  TerminalSquare,
  Binary,
  GitBranch,
  Calculator,
  Plane,
  Radar,
  Navigation,
  Key,
  Smartphone,
  Map as MapIcon,
  Briefcase,
  PlayCircle,
  BarChart3,
  Flame,
  ThermometerSnowflake,
  ShieldQuestion
} from 'lucide-react';
import { MedicalScan, AIDiagnosisResult, LabReportInsights } from '../types';
import { verifyTransplantCompliance, getPersonalizedMatchingLogic, validateOrganMatch } from '../services/geminiService';

// Defining deployment steps for matching phase progress tracking
const DEPLOYMENT_STEPS = [
  "Secure Portal Access",
  "Serology Cross-match",
  "Morphology Alignment",
  "HLA Marker Audit",
  "Logistics Routing",
  "Global Registry Sync"
];

interface Profile {
  id: string;
  name?: string;
  age: number;
  bloodType: string;
  hlaMatch?: string;
  medicalUrgency: number; // 0-100 (e.g., MELD/LAS)
  location: string;
  waitTime: number; // days
  organType?: string;
  bodySize?: 'Small' | 'Medium' | 'Large' | 'N/A';
}

interface DonorMatch {
  id: string;
  organType: string;
  donorType: 'Deceased' | 'Living';
  location: string;
  bloodType: string;
  bodySize: 'Small' | 'Medium' | 'Large' | 'N/A';
  viabilityWindow: number; // hours (Max CIT)
  distance: number; // kilometers
  compatibilityScore: number;
  status: 'Available' | 'Procuring' | 'In-Transit' | 'Matched';
  donorProfile: Profile;
}

interface FlowStep {
  id: string;
  label: string;
  desc: string;
  icon: any;
  criteria: string;
  detailedLogic: string;
  parameters: string[];
}

const ORGANS: { 
  id: string; 
  label: string; 
  icon: any; 
  priorityMetric: string; 
  color: string; 
  bg: string; 
  rules: string; 
  citRange: string;
  maxCitHours: number;
  flowSteps: FlowStep[] 
}[] = [
  { 
    id: 'heart', 
    label: 'Heart', 
    icon: Heart, 
    priorityMetric: 'Status 1A', 
    color: 'text-rose-500', 
    bg: 'bg-rose-500/10', 
    rules: 'Priority to Status 1A (highest urgency) within 800 km.',
    citRange: '4-6 Hours',
    maxCitHours: 6,
    flowSteps: [
      { id: 'h1', label: 'Clinical Urgency', desc: 'Classification from Status 1A to 6.', icon: Activity, criteria: 'Mechanical Support (ECMO/VAD)', detailedLogic: 'Patients on life-support or requiring high-dose inotropes are prioritized into Status 1A or 1B. Lower statuses are reserved for stable waitlisted patients.', parameters: ['ECMO Support', 'VAD Complications', 'Inotrope Dosage'] },
      { id: 'h2', label: 'ABO Serology', desc: 'Primary immunological compatibility.', icon: Dna, criteria: 'Identical > Compatible', detailedLogic: 'Identical blood type matches are prioritized first. Compatible matches (e.g., O to A) are processed if no identical match exists in the current urgency tier.', parameters: ['Cross-match Negative', 'Blood Group ID', 'Antibody Panel'] },
      { id: 'h3', label: 'Geographic Zone', desc: 'Proximity mapping for transport.', icon: MapPin, criteria: 'Transit Time < 4h', detailedLogic: 'Heart viability decreases rapidly due to high metabolism. CIT strictly capped at 6h.', parameters: ['Flight Time', 'Ground Support', 'Distance Radius'] },
      { id: 'h4', label: 'Registry Duration', desc: 'Standard wait-time tie-breaker.', icon: Clock, criteria: 'Standardized Days Listed', detailedLogic: 'If urgency, ABO, and geography are tied, the recipient with the most accumulated wait time at their current status level is prioritized.', parameters: ['Start Date', 'Status Stability', 'Tie-breaker Logic'] }
    ]
  },
  { 
    id: 'liver', 
    label: 'Liver', 
    icon: Activity, 
    priorityMetric: 'MELD Score', 
    color: 'text-amber-500', 
    bg: 'bg-amber-500/10', 
    rules: 'Matches based on MELD (Model for End-Stage Liver Disease) and geography.',
    citRange: '6-10 Hours',
    maxCitHours: 10,
    flowSteps: [
      { id: 'l1', label: 'MELD-Na Score', desc: 'Predictive 3-month mortality calculation.', icon: TrendingUp, criteria: 'Bilirubin/INR/Sodium/Cr', detailedLogic: 'MELD (Model for End-Stage Liver Disease) uses laboratory values to estimate the risk of death. Scores range from 6 to 40.', parameters: ['Creatinine Level', 'INR Ratio', 'Sodium Match'] },
      { id: 'l2', label: 'Exception Points', desc: 'Boosts for specific clinical diagnoses.', icon: Award, criteria: 'HCC / Cholangiocarcinoma', detailedLogic: 'Patients with certain conditions like Hepatocellular Carcinoma (HCC) receive additional points to account for cancer progression risk not captured by MELD.', parameters: ['Milan Criteria', 'Tumor Size', 'Clinical Review'] },
      { id: 'l3', label: 'Acutes Priority', desc: 'Immediate allocation for Status 1A.', icon: Zap, criteria: 'Fulminant Liver Failure', detailedLogic: 'Status 1A recipients bypass the MELD waitlist. CIT > 7h increases post-transplant complication risk.', parameters: ['Encephalopathy', 'ICU Status', 'Survival Benefit'] },
      { id: 'l4', label: 'Wait Time Logic', desc: 'Duration used only for tie-breaking.', icon: Clock, criteria: 'Days at Current MELD', detailedLogic: 'Wait time is no longer a primary driver but acts as the final tie-breaker for recipients with identical MELD scores.', parameters: ['Re-certification Date', 'Cumulative Days', 'Regional Rank'] }
    ]
  },
  { 
    id: 'kidney', 
    label: 'Kidney', 
    icon: Zap, 
    priorityMetric: 'EPTS / KDPI', 
    color: 'text-emerald-500', 
    bg: 'bg-emerald-500/10', 
    rules: 'Longevity matching: Young donors to young recipients (EPTS).',
    citRange: '24-72 Hours',
    maxCitHours: 72,
    flowSteps: [
      { id: 'k1', label: 'HLA Match', desc: 'DNA marker correlation.', icon: Fingerprint, criteria: 'Zero-Mismatch Priority', detailedLogic: 'Patients with a perfect HLA match (6 out of 6 markers) are prioritized nationally before any other logic is applied.', parameters: ['A/B/DR Antigens', 'PRA %', 'Cross-match Result'] },
      { id: 'k2', label: 'Longevity Path', desc: 'Matching graft life to recipient life.', icon: FastForward, criteria: 'EPTS vs KDPI Correlation', detailedLogic: 'The Estimated Post-Transplant Survival (EPTS) score maps to KDPI. Kidneys are resilient but 4-8+ hours CIT impacts delayed function.', parameters: ['Age Factor', 'Diabetes Status', 'Prior Transplant'] },
      { id: 'k3', label: 'Pediatric Status', desc: 'Global priority for minors.', icon: Users, criteria: 'Age < 18 at Listing', detailedLogic: 'Pediatric recipients receive significant priority points to ensure development and long-term health stability.', parameters: ['Growth Retardation', 'Educational Impact', 'Status Boost'] },
      { id: 'k4', label: 'Dialysis Time', desc: 'Wait time starts from first dialysis.', icon: Clock, criteria: 'Days on Dialysis', detailedLogic: 'Unique to Kidney allocation, wait time begins on the date the patient started regular maintenance dialysis, even if before listing.', parameters: ['Start Date', 'Listing Lag', 'Graft Failure Date'] }
    ]
  },
  { 
    id: 'lung', 
    label: 'Lung', 
    icon: Wind, 
    priorityMetric: 'LAS Score', 
    color: 'text-blue-500', 
    bg: 'bg-blue-500/10', 
    rules: 'Lung Allocation Score (LAS) weighs survival benefit vs urgency.',
    citRange: '4-6 Hours',
    maxCitHours: 6,
    flowSteps: [
      { id: 'lu1', label: 'LAS Matrix', desc: 'Waitlist urgency vs post-transplant survival.', icon: Scale, criteria: 'Survival Benefit Balance', detailedLogic: 'LAS balances the risk of dying on the waitlist against the probability of long-term success after transplant.', parameters: ['FVC %', 'O2 Requirement', 'CO2 Pressure'] },
      { id: 'lu2', label: 'Blood Match', desc: 'Strict serological compatibility.', icon: Dna, criteria: 'Primary Cross-match', detailedLogic: 'ABO compatibility is essential. CIT strictly capped at 6h for optimal lung function.', parameters: ['ABO Group', 'Antibody Screen', 'Viral Status'] },
      { id: 'lu3', label: 'Anatomical Sizing', desc: 'Morphometric volume matching.', icon: Box, criteria: 'Height/Weight Ratio', detailedLogic: 'Lungs must physically fit the chest cavity. Calculated Lung Volume is matched between donor and recipient height.', parameters: ['pTLC Match', 'Height Index', 'Chest Diameter'] },
      { id: 'lu4', label: 'Ischemia Window', desc: 'Distance and logistics audit.', icon: Truck, criteria: 'Transport Time < 6h', detailedLogic: 'Lungs are highly sensitive to cold ischemia. Priority is given to local nodes to ensure minimal transit damage.', parameters: ['Flight Logistics', 'Procurement Start', 'Transit Path'] }
    ]
  },
  { 
    id: 'pancreas', 
    label: 'Pancreas', 
    icon: Database, 
    priorityMetric: 'Wait Time', 
    color: 'text-purple-500', 
    bg: 'bg-purple-500/10', 
    rules: 'Priority by distance and wait time for Type 1 Diabetics.',
    citRange: '12-18 Hours',
    maxCitHours: 18,
    flowSteps: [
      { id: 'p1', label: 'ABO Identity', desc: 'Strict blood type matching.', icon: Dna, criteria: 'Group O restricted', detailedLogic: 'Pancreas allocation heavily weighs ABO identity to ensure survival and reduce surgical risk in Type 1 diabetic patients.', parameters: ['Blood Type O Priority', 'Cross-match Result'] },
      { id: 'p2', label: 'Donor Age', desc: 'Ideal for younger recipients.', icon: Target, criteria: 'Body Mass Index', detailedLogic: 'Donors under age 50 with a BMI under 30 are preferred. CIT should be kept under 12h for best outcomes.', parameters: ['Donor BMI Index', 'Donor Age Cap'] },
      { id: 'p3', label: 'Wait Time', desc: 'Primary allocation driver.', icon: Clock, criteria: 'Standard FIFO', detailedLogic: 'Pancreas allocation follows a primarily time-based queue within local and regional distribution nodes.', parameters: ['Dialysis Start Date', 'Listing Duration'] }
    ]
  },
  { 
    id: 'intestine', 
    label: 'Intestine', 
    icon: Layers, 
    priorityMetric: 'Status 1', 
    color: 'text-indigo-500', 
    bg: 'bg-indigo-500/10', 
    rules: 'Priority for TPN failure or life-threatening complications.',
    citRange: '4-6 Hours',
    maxCitHours: 6,
    flowSteps: [
      { id: 'i1', label: 'Status 1', desc: 'TPN failure or severe risk.', icon: ShieldAlert, criteria: 'Life Threatening', detailedLogic: 'Recipients with TPN failure or severe infections receive Status 1 priority. CIT window is extremely narrow (4-6h).', parameters: ['Liver Failure', 'Catheter Sepsis'] },
      { id: 'i2', label: 'Weight Range', desc: 'Close weight match (±25%).', icon: Scale, criteria: 'Abdominal Volume', detailedLogic: 'The intestinal graft must fit the abdominal cavity. Donor-recipient weight matching is strictly controlled.', parameters: ['Body Weight Index', 'Abdominal Girth'] },
      { id: 'i3', label: 'Proximity', desc: 'High sensitivity to ischemia.', icon: MapPin, criteria: 'Local Recovery Only', detailedLogic: 'Due to extreme ischemia sensitivity, intestinal grafts are prioritized for local recovery teams.', parameters: ['Cold Ischemia Time', 'Logistics Radius'] }
    ]
  },
  { 
    id: 'cornea', 
    label: 'Cornea', 
    icon: Eye, 
    priorityMetric: 'FIFO', 
    color: 'text-slate-400', 
    bg: 'bg-slate-500/10', 
    rules: 'Matched via local Eye Banks, usually First-In First-Out (FIFO).',
    citRange: 'Tissue Storage',
    maxCitHours: 168, // 7 days standard for cool storage
    flowSteps: [
      { id: 'c1', label: 'Bank Local', desc: 'Local recovery bank primary.', icon: Building2, criteria: 'Local Distribution', detailedLogic: 'Corneas are distributed by local Eye Banks. Tissue is resilient compared to solid organs.', parameters: ['Eye Bank Node', 'Inventory Status'] },
      { id: 'c2', label: 'Wait Time', desc: 'First-come first-served logic.', icon: Clock, criteria: 'Registration Date', detailedLogic: 'Allocation follows a strict First-In First-Out (FIFO) queue based on the clinical registration date.', parameters: ['Queue Position', 'Registration ID'] },
      { id: 'c3', label: 'Clinical Match', desc: 'Standard anatomical match.', icon: CheckCircle, criteria: 'Tissue Integrity', detailedLogic: 'Matching focus is on endothelial cell count and structural integrity.', parameters: ['Cell Count', 'Tissue Grade'] }
    ]
  },
];

const TransplantModule: React.FC<{
  activeScan: MedicalScan | null;
  labInsights: LabReportInsights | null;
  diagnosis: AIDiagnosisResult | null;
}> = ({ activeScan, labInsights, diagnosis }) => {
  const [activeTab, setActiveTab] = useState<'network' | 'matching' | 'protocols' | 'audit' | 'tracking'>('network');
  const [networkFilter, setNetworkFilter] = useState<'donors' | 'recipients'>('donors');
  const [selectedOrgan, setSelectedOrgan] = useState(ORGANS[1]); // Default Liver
  const [selectedMatch, setSelectedMatch] = useState<DonorMatch | null>(null);
  const [isExplaining, setIsExplaining] = useState(false);
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [isCheckingCompliance, setIsCheckingCompliance] = useState(false);
  const [complianceResult, setComplianceResult] = useState<any>(null);

  const [isFinalizing, setIsFinalizing] = useState(false);
  const [deploymentStep, setDeploymentStep] = useState(0);
  const [deploymentComplete, setDeploymentComplete] = useState(false);
  const [currentActionLog, setCurrentActionLog] = useState<string>('Initializing clinical handshake...');
  const [finalClinicalAudit, setFinalClinicalAudit] = useState<string | null>(null);
  
  // Transport Simulation State
  const [simulationActive, setSimulationActive] = useState(false);
  const [currentSimStep, setCurrentSimStep] = useState(0);
  const [missionProgress, setMissionProgress] = useState(0);
  const [ischemiaTimer, setIschemiaTimer] = useState("12:00:00");

  // Interactive Flowchart State
  const [activeFlowId, setActiveFlowId] = useState<string>(selectedOrgan.flowSteps[0].id);

  const recipientProfile: Profile = useMemo(() => {
    let extractedBloodType = 'A+';
    if (labInsights) {
      const bloodParam = labInsights.parameters.find(p => 
        p.name.toLowerCase().includes('blood group') || 
        p.name.toLowerCase().includes('abo')
      );
      if (bloodParam) extractedBloodType = bloodParam.value;
    }

    return {
      id: activeScan?.patientId || 'REC-8821',
      name: 'Active Patient',
      age: 45,
      bloodType: extractedBloodType,
      hlaMatch: 'A2, B8, DR3',
      medicalUrgency: diagnosis?.riskLevel === 'High' ? 32 : (diagnosis?.riskLevel === 'Medium' ? 18 : 12),
      location: 'Central General Hospital',
      waitTime: 142,
      bodySize: 'Medium'
    };
  }, [activeScan, diagnosis, labInsights]);

  const donorNetwork: DonorMatch[] = useMemo(() => [
    // LIVER
    { id: 'D-LIV-01', organType: 'liver', donorType: 'Deceased', location: 'Metropolis Trauma', bloodType: recipientProfile.bloodType, bodySize: 'Medium', viabilityWindow: 10, distance: 68, compatibilityScore: 94, status: 'Available', donorProfile: { id: 'DP-01', age: 24, bloodType: recipientProfile.bloodType, medicalUrgency: 0, location: 'Metropolis', waitTime: 0 } },
    { id: 'D-LIV-02', organType: 'liver', donorType: 'Deceased', location: 'Westside Med', bloodType: 'O+', bodySize: 'Large', viabilityWindow: 8, distance: 177, compatibilityScore: 78, status: 'Available', donorProfile: { id: 'DP-02', age: 52, bloodType: 'O+', medicalUrgency: 0, location: 'Westside', waitTime: 0 } },
    { id: 'D-LIV-03', organType: 'liver', donorType: 'Deceased', location: 'Coastal Trauma Center', bloodType: 'A-', bodySize: 'Small', viabilityWindow: 10, distance: 346, compatibilityScore: 88, status: 'Available', donorProfile: { id: 'DP-03', age: 31, bloodType: 'A-', medicalUrgency: 0, location: 'Coastal', waitTime: 0 } },
    
    // HEART
    { id: 'D-HRT-01', organType: 'heart', donorType: 'Deceased', location: 'South Regional', bloodType: 'A+', bodySize: 'Medium', viabilityWindow: 4, distance: 24, compatibilityScore: 99, status: 'Available', donorProfile: { id: 'DP-04', age: 19, bloodType: 'A+', medicalUrgency: 0, location: 'South', waitTime: 0 } },
    { id: 'D-HRT-02', organType: 'heart', donorType: 'Deceased', location: 'Mountain Health', bloodType: 'O-', bodySize: 'Medium', viabilityWindow: 4, distance: 137, compatibilityScore: 92, status: 'Available', donorProfile: { id: 'DP-05', age: 44, bloodType: 'O-', medicalUrgency: 0, location: 'Mountain', waitTime: 0 } },
    { id: 'D-HRT-03', organType: 'heart', donorType: 'Deceased', location: 'Northeast General', bloodType: 'B+', bodySize: 'Large', viabilityWindow: 5, distance: 225, compatibilityScore: 85, status: 'Available', donorProfile: { id: 'DP-06', age: 28, bloodType: 'B+', medicalUrgency: 0, location: 'Northeast', waitTime: 0 } },
    
    // KIDNEY
    { id: 'D-KID-01', organType: 'kidney', donorType: 'Living', location: 'City Clinic', bloodType: 'B-', bodySize: 'Small', viabilityWindow: 48, distance: 8, compatibilityScore: 88, status: 'Available', donorProfile: { id: 'DP-07', age: 31, bloodType: 'B-', medicalUrgency: 0, location: 'City', waitTime: 0 } },
    { id: 'D-KID-02', organType: 'kidney', donorType: 'Deceased', location: 'County Memorial', bloodType: 'A+', bodySize: 'Medium', viabilityWindow: 36, distance: 48, compatibilityScore: 95, status: 'Available', donorProfile: { id: 'DP-08', age: 52, bloodType: 'A+', medicalUrgency: 0, location: 'County', waitTime: 0 } },
    { id: 'D-KID-03', organType: 'kidney', donorType: 'Living', location: 'Highland Specialty', bloodType: 'O+', bodySize: 'Large', viabilityWindow: 72, distance: 19, compatibilityScore: 91, status: 'Available', donorProfile: { id: 'DP-09', age: 22, bloodType: 'O+', medicalUrgency: 0, location: 'Highland', waitTime: 0 } },
    
    // LUNG
    { id: 'D-LNG-01', organType: 'lung', donorType: 'Deceased', location: 'Lakeside Hosp', bloodType: 'A+', bodySize: 'Medium', viabilityWindow: 6, distance: 142, compatibilityScore: 92, status: 'Available', donorProfile: { id: 'DP-10', age: 28, bloodType: 'A+', medicalUrgency: 0, location: 'Lakeside', waitTime: 0 } },
    { id: 'D-LNG-02', organType: 'lung', donorType: 'Deceased', location: 'Crosstown Med', bloodType: 'O+', bodySize: 'Small', viabilityWindow: 5, distance: 40, compatibilityScore: 96, status: 'Available', donorProfile: { id: 'DP-11', age: 35, bloodType: 'O+', medicalUrgency: 0, location: 'Crosstown', waitTime: 0 } },
    { id: 'D-LNG-03', organType: 'lung', donorType: 'Deceased', location: 'Southern Skies Med', bloodType: 'AB-', bodySize: 'Large', viabilityWindow: 6, distance: 249, compatibilityScore: 82, status: 'Available', donorProfile: { id: 'DP-12', age: 42, bloodType: 'AB-', medicalUrgency: 0, location: 'Southern Skies', waitTime: 0 } },
    
    // PANCREAS
    { id: 'D-PAN-01', organType: 'pancreas', donorType: 'Deceased', location: 'North Side Med', bloodType: 'A+', bodySize: 'Medium', viabilityWindow: 12, distance: 48, compatibilityScore: 95, status: 'Available', donorProfile: { id: 'DP-P01', age: 32, bloodType: 'A+', medicalUrgency: 0, location: 'North', waitTime: 0 } },
    { id: 'D-PAN-02', organType: 'pancreas', donorType: 'Deceased', location: 'East Gen', bloodType: 'B+', bodySize: 'Large', viabilityWindow: 14, distance: 105, compatibilityScore: 82, status: 'Available', donorProfile: { id: 'DP-P02', age: 44, bloodType: 'B+', medicalUrgency: 0, location: 'East', waitTime: 0 } },
    { id: 'D-PAN-03', organType: 'pancreas', donorType: 'Living', location: 'Metropolis Specialized', bloodType: 'O+', bodySize: 'Medium', viabilityWindow: 15, distance: 24, compatibilityScore: 88, status: 'Available', donorProfile: { id: 'DP-P03', age: 29, bloodType: 'O+', medicalUrgency: 0, location: 'Metropolis', waitTime: 0 } },
    
    // INTESTINE
    { id: 'D-INT-01', organType: 'intestine', donorType: 'Deceased', location: 'Mercy Trauma', bloodType: 'O+', bodySize: 'Small', viabilityWindow: 5, distance: 35, compatibilityScore: 91, status: 'Available', donorProfile: { id: 'DP-I01', age: 25, bloodType: 'O+', medicalUrgency: 0, location: 'Mercy', waitTime: 0 } },
    { id: 'D-INT-02', organType: 'intestine', donorType: 'Deceased', location: 'Community Heart', bloodType: 'A-', bodySize: 'Medium', viabilityWindow: 4, distance: 72, compatibilityScore: 76, status: 'Available', donorProfile: { id: 'DP-I02', age: 48, bloodType: 'A-', medicalUrgency: 0, location: 'Community', waitTime: 0 } },
    { id: 'D-INT-03', organType: 'intestine', donorType: 'Deceased', location: 'Central Trauma Node', bloodType: 'B+', bodySize: 'Medium', viabilityWindow: 6, distance: 16, compatibilityScore: 98, status: 'Available', donorProfile: { id: 'DP-I03', age: 21, bloodType: 'B+', medicalUrgency: 0, location: 'Central', waitTime: 0 } },
    
    // CORNEA
    { id: 'D-COR-01', organType: 'cornea', donorType: 'Deceased', location: 'Local Eye Bank A', bloodType: 'N/A', bodySize: 'N/A', viabilityWindow: 168, distance: 8, compatibilityScore: 100, status: 'Available', donorProfile: { id: 'DP-C01', age: 62, bloodType: 'N/A', medicalUrgency: 0, location: 'Local', waitTime: 0 } },
    { id: 'D-COR-02', organType: 'cornea', donorType: 'Deceased', location: 'Regional Tissue Bank', bloodType: 'N/A', bodySize: 'N/A', viabilityWindow: 144, distance: 64, compatibilityScore: 100, status: 'Available', donorProfile: { id: 'DP-C02', age: 55, bloodType: 'N/A', medicalUrgency: 0, location: 'Regional', waitTime: 0 } },
    { id: 'D-COR-03', organType: 'cornea', donorType: 'Deceased', location: 'State Donor Node', bloodType: 'N/A', bodySize: 'N/A', viabilityWindow: 120, distance: 193, compatibilityScore: 100, status: 'Available', donorProfile: { id: 'DP-C03', age: 41, bloodType: 'N/A', medicalUrgency: 0, location: 'State', waitTime: 0 } },
  ], [recipientProfile.bloodType]);

  const globalWaitlist: Profile[] = useMemo(() => [
    // LIVER
    { id: 'R-LIV-01', name: 'John Doe', age: 52, bloodType: 'A+', hlaMatch: 'A2, B8, DR3', medicalUrgency: 38, location: 'St. Jude Center', waitTime: 412, organType: 'liver' },
    { id: recipientProfile.id, name: 'Current Case', age: recipientProfile.age, bloodType: recipientProfile.bloodType, hlaMatch: recipientProfile.hlaMatch, medicalUrgency: recipientProfile.medicalUrgency, location: recipientProfile.location, waitTime: recipientProfile.waitTime, organType: 'liver' },
    { id: 'R-LIV-03', name: 'Frank Miller', age: 61, bloodType: 'O+', hlaMatch: 'A1, B8, DR11', medicalUrgency: 28, location: 'City Memorial', waitTime: 820, organType: 'liver' },

    // HEART
    { id: 'R-HRT-01', name: 'Maria Garcia', age: 29, bloodType: 'O-', hlaMatch: 'A1, B44, DR4', medicalUrgency: 40, location: 'Mayo Clinic', waitTime: 88, organType: 'heart' },
    { id: 'R-HRT-02', name: 'James Wilson', age: 55, bloodType: 'A+', hlaMatch: 'A3, B7, DR15', medicalUrgency: 35, location: 'Texas Heart Inst', waitTime: 215, organType: 'heart' },
    { id: 'R-HRT-03', name: 'Linda Chen', age: 34, bloodType: 'B-', hlaMatch: 'A2, B27, DR4', medicalUrgency: 42, location: 'Cleveland Clinic', waitTime: 45, organType: 'heart' },

    // KIDNEY
    { id: 'R-KID-01', name: 'Sarah Miller', age: 24, bloodType: 'O+', hlaMatch: 'A1, B8, DR17', medicalUrgency: 48, location: 'Chicago Gen', waitTime: 120, organType: 'kidney' },
    { id: 'R-KID-02', name: 'David Smith', age: 47, bloodType: 'A-', hlaMatch: 'A2, B44, DR1', medicalUrgency: 52, location: 'Boston Medical', waitTime: 1460, organType: 'kidney' },
    { id: 'R-KID-03', name: 'Elena Petrova', age: 38, bloodType: 'AB+', hlaMatch: 'A24, B7, DR13', medicalUrgency: 31, location: 'Cedars-Sinai', waitTime: 590, organType: 'kidney' },

    // LUNG
    { id: 'R-LNG-01', name: 'Ahmed Khan', age: 52, bloodType: 'B+', hlaMatch: 'A3, B8, DR1', medicalUrgency: 68, location: 'UCLA Health', waitTime: 310, organType: 'lung' },
    { id: 'R-LNG-02', name: 'Sophie Dupont', age: 28, bloodType: 'O-', hlaMatch: 'A1, B44, DR4', medicalUrgency: 72, location: 'Duke Lung Center', waitTime: 140, organType: 'lung' },
    { id: 'R-LNG-03', name: 'Michael O\'Brien', age: 65, bloodType: 'A+', hlaMatch: 'A2, B27, DR7', medicalUrgency: 55, location: 'Presbyterian Hosp', waitTime: 850, organType: 'lung' },

    // PANCREAS
    { id: 'R-PAN-01', name: 'Robert Chen', age: 41, bloodType: 'A+', hlaMatch: 'A3, B7, DR15', medicalUrgency: 15, location: 'Stanford Med', waitTime: 210, organType: 'pancreas' },
    { id: 'R-PAN-02', name: 'Alice Wong', age: 33, bloodType: 'O+', hlaMatch: 'A1, B8, DR3', medicalUrgency: 12, location: 'UCSF Health', waitTime: 95, organType: 'pancreas' },
    { id: 'R-PAN-03', name: 'Thomas Wright', age: 58, bloodType: 'B-', hlaMatch: 'A2, B44, DR4', medicalUrgency: 22, location: 'Mayo Clinic', waitTime: 550, organType: 'pancreas' },
    
    // INTESTINE
    { id: 'R-INT-01', name: 'Sophie Laurent', age: 6, bloodType: 'O+', hlaMatch: 'A1, B1, DR1', medicalUrgency: 85, location: 'Children\'s Hosp', waitTime: 340, organType: 'intestine' },
    { id: 'R-INT-02', name: 'Mark Evans', age: 45, bloodType: 'A+', hlaMatch: 'A2, B8, DR3', medicalUrgency: 92, location: 'Mount Sinai', waitTime: 12, organType: 'intestine' },
    { id: 'R-INT-03', name: 'Elena Rossi', age: 29, bloodType: 'AB-', hlaMatch: 'A24, B51, DR11', medicalUrgency: 78, location: 'Mass Gen', waitTime: 180, organType: 'intestine' },
    
    // CORNEA
    { id: 'R-COR-01', name: 'Harold Brooks', age: 72, bloodType: 'N/A', hlaMatch: 'N/A', medicalUrgency: 10, location: 'Eye & Ear Inf', waitTime: 65, organType: 'cornea' },
    { id: 'R-COR-02', name: 'Linda Kim', age: 31, bloodType: 'N/A', hlaMatch: 'N/A', medicalUrgency: 5, location: 'Bascom Palmer', waitTime: 12, organType: 'cornea' },
    { id: 'R-COR-03', name: 'George Vance', age: 50, bloodType: 'N/A', hlaMatch: 'N/A', medicalUrgency: 8, location: 'Wills Eye', waitTime: 42, organType: 'cornea' },
  ].sort((a, b) => b.medicalUrgency - a.medicalUrgency), [recipientProfile]);

  // Scarcity Data Calculation
  const scarcityMetrics = useMemo(() => {
    return ORGANS.map(organ => {
      const donors = donorNetwork.filter(d => d.organType === organ.id).length;
      const recipients = globalWaitlist.filter(r => r.organType === organ.id).length;
      const scarcityIndex = recipients / (donors || 0.1); 
      const ratio = Math.min((scarcityIndex / 10) * 100, 100); 
      
      return {
        id: organ.id,
        label: organ.label,
        donors,
        recipients,
        ratio,
        severity: scarcityIndex > 5 ? 'critical' : scarcityIndex > 2 ? 'high' : 'stable'
      };
    });
  }, [donorNetwork, globalWaitlist]);

  const filteredDonors = donorNetwork.filter(d => d.organType === selectedOrgan.id);
  const filteredRecipients = globalWaitlist.filter(r => r.organType === selectedOrgan.id);

  const activeStepData = useMemo(() => 
    selectedOrgan.flowSteps.find(s => s.id === activeFlowId) || selectedOrgan.flowSteps[0]
  , [activeFlowId, selectedOrgan]);

  useEffect(() => {
    setActiveFlowId(selectedOrgan.flowSteps[0].id);
  }, [selectedOrgan]);

  const handleExplainLogic = async (match: DonorMatch) => {
    setIsExplaining(true);
    try {
      const explanation = await getPersonalizedMatchingLogic(recipientProfile.medicalUrgency, recipientProfile.bloodType);
      setAiExplanation(explanation);
    } catch (e) {
      console.error(e);
    } finally {
      setIsExplaining(false);
    }
  };

  const startFinalization = async () => {
    if (!selectedMatch) return;
    setIsFinalizing(true);
    setDeploymentComplete(false);
    setDeploymentStep(0);
    setFinalClinicalAudit(null);
    
    const logs = [
      "Accessing Secure OPTN National Portal... Handshake OK.",
      `CROSS-MATCH: Recipient [${recipientProfile.bloodType}] / Donor [${selectedMatch.bloodType}] - COMPATIBLE`,
      `MORPHOLOGY: Recipient [${recipientProfile.bodySize}] / Donor [${selectedMatch.bodySize}] - ALIGNED`,
      `HLA CORRELATION: Common markers detected. Graft survival probability: 88%.`,
      `LOGISTICS: Central Gen -> ${selectedMatch.location}. ETA 52 mins. Window secured.`,
      "Synchronizing match globally. UNOS Node updated. Transaction ID: TX-" + Math.floor(Math.random()*100000)
    ];

    // Iterating through deployment steps defined in DEPLOYMENT_STEPS
    for (let i = 1; i <= DEPLOYMENT_STEPS.length; i++) {
      setDeploymentStep(i);
      setCurrentActionLog(logs[i-1]);
      if (i === 4) {
        try {
          const audit = await validateOrganMatch(recipientProfile, selectedMatch);
          setFinalClinicalAudit(audit);
        } catch (e) { console.error(e); }
      }
      const delay = 1400 + Math.random() * 800;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    setDeploymentComplete(true);
  };

  const runMissionSimulation = async () => {
    setSimulationActive(true);
    setCurrentSimStep(0);
    setMissionProgress(0);
    
    // Set initial timer based on organ's max CIT
    const maxH = selectedOrgan.maxCitHours;
    setIschemiaTimer(`${maxH.toString().padStart(2, '0')}:00:00`);

    const steps = 4;
    for (let i = 1; i <= steps; i++) {
      setCurrentSimStep(i);
      const startProgress = (i - 1) * 25;
      const endProgress = i * 25;
      for (let p = startProgress; p <= endProgress; p += 2) {
        setMissionProgress(p);
        await new Promise(r => setTimeout(r, 80));
      }
      
      // Update Ischemia Timer simulation - aggressive countdown for visual impact
      setIschemiaTimer(prev => {
        const parts = prev.split(':');
        let h = parseInt(parts[0]);
        let m = parseInt(parts[1]);
        m = (m - 15);
        if (m < 0) { h -= 1; m = 45; }
        return `${Math.max(0, h).toString().padStart(2, '0')}:${Math.max(0, m).toString().padStart(2, '0')}:00`;
      });
      await new Promise(r => setTimeout(r, 1000));
    }
  };

  const resetMatchState = () => {
    setIsFinalizing(false);
    setDeploymentStep(0);
    setDeploymentComplete(false);
    setSelectedMatch(null);
    setAiExplanation(null);
    setActiveTab('network');
    setSimulationActive(false);
    setCurrentSimStep(0);
    setMissionProgress(0);
    setIschemiaTimer("12:00:00");
  };

  const runCompliance = async () => {
    if (!diagnosis) return;
    setIsCheckingCompliance(true);
    try {
      const result = await verifyTransplantCompliance(diagnosis, labInsights);
      setComplianceResult(result);
    } catch (e) { console.error(e); } finally { setIsCheckingCompliance(false); }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-1000 pb-20 no-scrollbar">
      {/* Header */}
      <div className="bg-[#16191F] border border-white/5 p-10 rounded-[48px] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-5 scale-150 rotate-12">
          <Fingerprint className="w-64 h-64 text-rose-500" />
        </div>
        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-10">
          <div className="space-y-4">
            <div className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/20 px-4 py-1.5 rounded-full w-fit">
              <ShieldCheck className="w-4 h-4 text-rose-500" />
              <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Federal Registry v4.0</span>
            </div>
            <h2 className="text-5xl font-black tracking-tighter text-white">Transplant <span className="text-rose-500">Intelligence</span></h2>
            <p className="text-slate-400 font-medium max-w-xl text-lg leading-relaxed">Multimodal donor-recipient correlation and statutory allocation governance.</p>
          </div>
          <div className="flex items-center gap-4">
             <div className="bg-slate-900 border border-white/5 p-6 rounded-3xl text-center shadow-inner">
                <p className="text-[10px] font-black text-slate-600 uppercase mb-1">Blood Group</p>
                <p className="text-3xl font-black text-white">{recipientProfile.bloodType}</p>
             </div>
             <div className="bg-slate-900 border border-white/5 p-6 rounded-3xl text-center shadow-inner">
                <p className="text-[10px] font-black text-slate-600 uppercase mb-1">MELD/Urgency</p>
                <p className="text-3xl font-black text-rose-500">{recipientProfile.medicalUrgency}</p>
             </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-col md:flex-row items-center gap-6 justify-between max-w-6xl mx-auto">
        <div className="flex items-center gap-2 bg-[#16191F] border border-white/5 p-1.5 rounded-3xl shadow-xl no-scrollbar overflow-x-hidden">
          {[
            { id: 'network', label: 'Registry', icon: Globe },
            { id: 'matching', label: 'Match Engine', icon: ArrowRightLeft },
            { id: 'protocols', label: 'Allocation', icon: Gavel },
            { id: 'audit', label: 'Compliance', icon: Shield },
            { id: 'tracking', label: 'Tracking', icon: Radar },
          ].map(t => (
            <button
              key={t.id}
              disabled={isFinalizing && t.id !== 'tracking'}
              onClick={() => setActiveTab(t.id as any)}
              className={`whitespace-nowrap flex items-center justify-center gap-3 py-3 px-6 rounded-2xl text-[10px] font-black uppercase transition-all ${
                activeTab === t.id ? 'bg-rose-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'
              } ${isFinalizing && t.id !== 'tracking' ? 'opacity-30 cursor-not-allowed' : ''}`}
            >
              <t.icon className="w-4 h-4" /> {t.label}
            </button>
          ))}
        </div>
        
        {activeTab === 'network' && !isFinalizing && (
          <div className="flex items-center p-1 bg-slate-900 border border-white/5 rounded-2xl shadow-lg">
            <button onClick={() => setNetworkFilter('donors')} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${networkFilter === 'donors' ? 'bg-blue-600 text-white' : 'text-slate-500'}`}>Donors</button>
            <button onClick={() => setNetworkFilter('recipients')} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${networkFilter === 'recipients' ? 'bg-amber-600 text-white' : 'text-slate-500'}`}>Recipients</button>
          </div>
        )}
      </div>

      <div className="min-h-[600px]">
        {activeTab === 'network' && (
          <div className="space-y-10 animate-in slide-in-from-bottom-8 duration-700">
            {/* Scarcity Heatmap - 3 Cases Per Row */}
            <div className="bg-[#16191F] border border-white/5 p-10 rounded-[48px] shadow-2xl">
               <div className="flex items-center justify-between mb-8">
                  <div className="space-y-1">
                     <h3 className="text-xl font-black text-white flex items-center gap-3"><Flame className="w-5 h-5 text-rose-500" /> Waitlist Scarcity Index</h3>
                     <p className="text-slate-500 text-xs font-medium">Real-time Supply (Donors) vs Demand (Recipients) across all modalities.</p>
                  </div>
                  <div className="flex items-center gap-4">
                     <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-rose-500"></div><span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Critical</span></div>
                     <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-amber-500"></div><span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">High</span></div>
                     <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500"></div><span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Stable</span></div>
                  </div>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {scarcityMetrics.map((item) => (
                    <div key={item.id} className="bg-slate-900/50 border border-white/5 p-6 rounded-[32px] space-y-4 hover:border-white/10 transition-all">
                       <div className="flex items-center justify-between">
                          <p className="text-sm font-black text-slate-300 uppercase tracking-widest">{item.label}</p>
                          <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase ${
                            item.severity === 'critical' ? 'bg-rose-500/20 text-rose-500' : 
                            item.severity === 'high' ? 'bg-amber-500/20 text-amber-500' : 'bg-emerald-500/20 text-emerald-400'
                          }`}>
                             {item.severity}
                          </span>
                       </div>
                       <div className="flex items-end justify-between">
                          <div className="space-y-0.5">
                             <p className="text-2xl font-black text-white">{item.recipients}<span className="text-slate-600 text-xs ml-1">rec.</span></p>
                             <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Supply: {item.donors} donors</p>
                          </div>
                          <div className="w-12 h-12 relative flex items-center justify-center">
                             <svg className="w-full h-full -rotate-90">
                                <circle cx="24" cy="24" r="20" fill="none" stroke="currentColor" strokeWidth="4" className="text-slate-800" />
                                <circle cx="24" cy="24" r="20" fill="none" stroke="currentColor" strokeWidth="4" 
                                  strokeDasharray={126} 
                                  strokeDashoffset={126 - (126 * item.ratio / 100)} 
                                  className={item.severity === 'critical' ? 'text-rose-500' : item.severity === 'high' ? 'text-amber-500' : 'text-emerald-500'} 
                                />
                             </svg>
                             <div className="absolute text-[8px] font-black text-white">{(item.ratio / 10).toFixed(1)}x</div>
                          </div>
                       </div>
                       <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                          <div className={`h-full transition-all duration-1000 ${
                            item.severity === 'critical' ? 'bg-rose-500' : 
                            item.severity === 'high' ? 'bg-amber-500' : 'bg-emerald-500'
                          }`} style={{ width: `${item.ratio}%` }}></div>
                       </div>
                    </div>
                  ))}
               </div>
            </div>

            {/* Organ Tabs - No Scrollbar & Wrapping */}
            <div className="flex flex-wrap gap-4 items-center justify-center">
              {ORGANS.map(organ => (
                <button
                  key={organ.id}
                  onClick={() => setSelectedOrgan(organ)}
                  className={`p-6 w-32 h-32 rounded-[32px] border transition-all flex flex-col items-center justify-center gap-3 group relative overflow-hidden shrink-0 ${
                    selectedOrgan.id === organ.id ? 'bg-[#16191F] border-rose-500 shadow-2xl ring-2 ring-rose-500/20' : 'bg-[#16191F] border-white/5 hover:border-white/20'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${organ.bg} ${organ.color}`}>
                    <organ.icon className="w-5 h-5" />
                  </div>
                  <p className={`text-[10px] font-black uppercase text-center ${selectedOrgan.id === organ.id ? 'text-white' : 'text-slate-600'}`}>{organ.label}</p>
                </button>
              ))}
            </div>

            {/* Registry List - 3 Cases Per Row */}
            <div className="bg-[#16191F] border border-white/5 p-12 rounded-[48px] shadow-2xl space-y-10">
               <div className="flex items-center justify-between">
                 <h3 className="text-3xl font-black text-white">{selectedOrgan.label} {networkFilter === 'donors' ? 'Registry' : 'Waitlist'}</h3>
                 <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-slate-900 px-4 py-2 rounded-xl border border-white/5 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div> Local Node Alpha
                 </span>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                 {networkFilter === 'donors' ? (
                   filteredDonors.length > 0 ? filteredDonors.map(donor => (
                     <div key={donor.id} className="bg-slate-900/50 border border-white/5 p-8 rounded-[40px] flex flex-col gap-8 group hover:border-rose-500/30 transition-all shadow-xl">
                        <div className="flex items-center justify-between">
                           <div className="w-14 h-14 bg-blue-600/10 text-blue-500 rounded-2xl flex items-center justify-center border border-blue-500/20 shadow-lg"><UserCheck className="w-7 h-7" /></div>
                           <div className="text-right">
                              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Match Score</p>
                              <p className="text-2xl font-black text-blue-500">{donor.compatibilityScore}%</p>
                           </div>
                        </div>
                        <div className="space-y-4 flex-1">
                           <p className="text-xl font-black text-white truncate">{donor.location}</p>
                           <div className="grid grid-cols-2 gap-4">
                              <div className="bg-black/20 p-4 rounded-2xl border border-white/5">
                                 <p className="text-[8px] font-black text-slate-500 uppercase mb-1">Blood Group</p>
                                 <p className="text-xs font-bold text-white">{donor.bloodType}</p>
                              </div>
                              <div className="bg-black/20 p-4 rounded-2xl border border-white/5">
                                 <p className="text-[8px] font-black text-slate-500 uppercase mb-1">CIT Window</p>
                                 <p className="text-xs font-bold text-white">{donor.viabilityWindow}h Max</p>
                              </div>
                           </div>
                           <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2"><MapPin className="w-3 h-3" /> {donor.distance} km away</p>
                        </div>
                        <button onClick={() => { setSelectedMatch(donor); setActiveTab('matching'); }} className="w-full bg-white text-slate-950 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-rose-500 hover:text-white transition-all shadow-xl">Engage Matching</button>
                     </div>
                   )) : (
                     <div className="col-span-full py-20 text-center text-slate-500 font-bold uppercase tracking-widest bg-slate-900/30 rounded-[40px] border border-white/5 border-dashed">
                        No active {selectedOrgan.label} donors in local node
                     </div>
                   )
                 ) : (
                   filteredRecipients.map(rec => (
                      <div key={rec.id} className="bg-slate-900/50 border border-white/5 p-8 rounded-[40px] flex flex-col gap-8 group shadow-xl">
                        <div className="flex items-center justify-between">
                           <div className="w-14 h-14 bg-amber-600/10 text-amber-500 rounded-2xl flex items-center justify-center border border-amber-500/20 shadow-lg"><Users className="w-7 h-7" /></div>
                           <div className="text-right">
                              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{selectedOrgan.priorityMetric}</p>
                              <p className="text-3xl font-black text-amber-500">{rec.medicalUrgency}</p>
                           </div>
                        </div>
                        <div className="space-y-4 flex-1">
                           <div className="flex items-center gap-3">
                              <p className="text-xl font-black text-white truncate">{rec.name}</p>
                              {rec.id === recipientProfile.id && <span className="px-2 py-0.5 bg-blue-500 text-white text-[8px] font-black uppercase rounded-full animate-pulse">Active</span>}
                           </div>
                           <div className="grid grid-cols-2 gap-4">
                              <div className="bg-black/20 p-4 rounded-2xl border border-white/5">
                                 <p className="text-[8px] font-black text-slate-500 uppercase mb-1">Wait Time</p>
                                 <p className="text-xs font-bold text-white">{rec.waitTime} Days</p>
                              </div>
                              <div className="bg-black/20 p-4 rounded-2xl border border-white/5">
                                 <p className="text-[8px] font-black text-slate-500 uppercase mb-1">HLA</p>
                                 <p className="text-xs font-bold text-white truncate">{rec.hlaMatch}</p>
                              </div>
                           </div>
                           <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2"><Building2 className="w-3 h-3" /> {rec.location}</p>
                        </div>
                      </div>
                   ))
                 )}
               </div>
            </div>
          </div>
        )}

        {activeTab === 'matching' && (
          <div className="animate-in fade-in zoom-in-95 duration-700">
            {isFinalizing ? (
              <div className="bg-[#16191F] border border-cyan-500/20 p-12 rounded-[64px] shadow-3xl max-w-5xl mx-auto space-y-12 relative overflow-hidden ring-4 ring-cyan-500/5">
                <div className="absolute top-0 right-0 p-12 opacity-5 -rotate-12 scale-150"><Terminal className="w-64 h-64 text-cyan-500" /></div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 relative z-10">
                   <div className="space-y-10">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-cyan-600/10 rounded-2xl flex items-center justify-center border border-cyan-500/20"><Scan className="w-7 h-7 text-cyan-500 animate-pulse" /></div>
                        <div>
                           <h3 className="text-4xl font-black tracking-tight text-white">Sync Console</h3>
                           <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Verification Node: 0xFD22-A</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                         {[{ label: 'Identity Protocol', check: 'Authenticated', active: deploymentStep >= 1, val1: 'REC-ID-8821', val2: 'DON-ID-4421' }, { label: 'ABO Serology', check: 'Compatible', active: deploymentStep >= 2, val1: recipientProfile.bloodType, val2: selectedMatch?.bloodType }, { label: 'Morphology', check: 'Sync OK', active: deploymentStep >= 3, val1: recipientProfile.bodySize, val2: selectedMatch?.bodySize }, { label: 'HLA Markers', check: 'Verified', active: deploymentStep >= 4, val1: 'Match Index', val2: '94%' }, { label: 'Logistics', check: 'Routed', active: deploymentStep >= 5, val1: 'Central Hosp', val2: selectedMatch?.location }].map((row, i) => (
                           <div key={i} className={`p-5 rounded-3xl border transition-all duration-700 flex items-center justify-between ${row.active ? 'bg-cyan-500/10 border-cyan-500/30' : 'bg-slate-900 border-white/5 opacity-30'}`}>
                              <div className="space-y-1">
                                 <p className="text-[8px] font-black text-cyan-500 uppercase">{row.label}</p>
                                 <p className="text-sm font-bold text-white tracking-wide">{row.val1} ↔ {row.val2}</p>
                              </div>
                              <div className="text-right">
                                 {row.active ? <><span className="text-emerald-500 text-[10px] font-black uppercase">{row.check}</span> <CheckCircle className="w-3.5 h-3.5 text-emerald-500 inline ml-2" /></> : <span className="text-slate-600 text-[10px] font-black uppercase">Pending</span>}
                              </div>
                           </div>
                         ))}
                      </div>
                   </div>
                   <div className="space-y-10 border-l border-white/5 pl-12">
                      <div className="bg-slate-900/80 rounded-[40px] border border-white/10 p-8 font-mono text-[11px] h-64 overflow-hidden relative shadow-inner">
                         <div className="space-y-2 text-cyan-500">
                            <p><span className="opacity-40">[{new Date().toLocaleTimeString()}]</span> SYS: Initiating recursive audit...</p>
                            {deploymentStep > 0 && <p className="text-emerald-500">>> {currentActionLog}</p>}
                            {deploymentStep > 3 && finalClinicalAudit && (
                              <div className="mt-4 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-100 animate-in fade-in">
                                 <p className="text-[8px] font-black uppercase text-emerald-500 mb-2">Final Clinical Clearance (Gemini 3 Pro)</p>
                                 <p className="italic leading-relaxed">"{finalClinicalAudit}"</p>
                              </div>
                            )}
                         </div>
                      </div>
                      <div className="space-y-6">
                         {/* Correctly referencing DEPLOYMENT_STEPS constant to calculate progress */}
                         <div className="flex items-center justify-between mb-2"><span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Progress</span><span className="text-xl font-black text-cyan-500">{Math.round((deploymentStep/DEPLOYMENT_STEPS.length)*100)}%</span></div>
                         <div className="h-3 bg-slate-900 rounded-full overflow-hidden border border-white/5"><div className="h-full bg-cyan-500 transition-all duration-700 ease-out shadow-[0_0_15px_rgba(6,182,212,0.6)]" style={{ width: `${(deploymentStep/DEPLOYMENT_STEPS.length)*100}%` }}></div></div>
                      </div>
                      {deploymentComplete && (
                        <div className="pt-8 border-t border-white/5 animate-in slide-in-from-bottom-4 flex flex-col items-center space-y-6">
                           <div className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-[32px] flex items-center gap-6 w-full">
                              <div className="w-16 h-16 bg-emerald-500 text-white rounded-3xl flex items-center justify-center shadow-xl"><FileBadge className="w-8 h-8" /></div>
                              <div><p className="text-lg font-black text-white leading-tight">Match Certified</p><p className="text-xs text-emerald-500 font-bold uppercase tracking-widest">Logistics Ready</p></div>
                           </div>
                           <button onClick={() => setActiveTab('tracking')} className="w-full py-5 bg-white text-slate-950 rounded-3xl font-black text-lg shadow-2xl hover:scale-105 active:scale-95 transition-all">Proceed to Tracking</button>
                        </div>
                      )}
                   </div>
                </div>
              </div>
            ) : selectedMatch ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
                <div className="space-y-8">
                  <div className="bg-[#16191F] border border-white/5 p-12 rounded-[60px] shadow-2xl space-y-12 ring-1 ring-white/5">
                     <div className="flex items-center justify-between">
                        <h3 className="text-2xl font-black flex items-center gap-3 text-white"><Scale className="w-7 h-7 text-rose-500" /> Comparison</h3>
                        <div className="px-4 py-2 bg-rose-500/10 text-rose-500 text-[10px] font-black uppercase tracking-widest rounded-xl">Node: {selectedMatch.id}</div>
                     </div>
                     <div className="grid grid-cols-2 gap-10 relative">
                        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10"><div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center border border-white/10 backdrop-blur-xl shadow-2xl"><ArrowRightLeft className="w-8 h-8 text-blue-500" /></div></div>
                        <div className="space-y-6">
                           <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-4">Recipient</p>
                           {[{ l: 'ABO', v: recipientProfile.bloodType }, { l: 'Size', v: recipientProfile.bodySize }, { l: 'MELD', v: recipientProfile.medicalUrgency }].map(s => (
                             <div key={s.l} className="bg-slate-900/50 p-6 rounded-3xl border border-white/5"><p className="text-[8px] font-black text-slate-500 uppercase mb-1">{s.l}</p><p className="text-xl font-bold text-white">{s.v}</p></div>
                           ))}
                        </div>
                        <div className="space-y-6 text-right">
                           <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-4">Donor</p>
                           {[{ l: 'ABO', v: selectedMatch.bloodType }, { l: 'Size', v: selectedMatch.bodySize }, { l: 'CIT Max', v: `${selectedMatch.viabilityWindow}h` }].map(s => (
                             <div key={s.l} className="bg-slate-900/50 p-6 rounded-3xl border border-white/5"><p className="text-[8px] font-black text-slate-500 uppercase mb-1">{s.l}</p><p className="text-xl font-bold text-white">{s.v}</p></div>
                           ))}
                        </div>
                     </div>
                     <div className="pt-12 border-t border-white/5 space-y-4">
                        <div className="flex items-center justify-between text-white"><span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Compatibility</span><span className="text-5xl font-black text-rose-500 tracking-tighter">{selectedMatch.compatibilityScore}%</span></div>
                        <div className="h-3 bg-slate-900 rounded-full overflow-hidden"><div className="h-full bg-rose-500 transition-all duration-1000" style={{ width: `${selectedMatch.compatibilityScore}%` }}></div></div>
                     </div>

                     {/* CIT Clinical Warning Panel */}
                     <div className="p-6 bg-amber-500/10 border border-amber-500/20 rounded-[32px] flex items-start gap-4">
                        <ThermometerSnowflake className="w-6 h-6 text-amber-500 shrink-0" />
                        <div>
                           <p className="text-[10px] font-black uppercase text-amber-500 tracking-widest mb-1">Cold Ischemia Warning</p>
                           <p className="text-xs text-slate-300 font-medium">Predicted transit + procurement: <span className="text-white font-bold">2.4h</span>. Within optimal window for {selectedOrgan.label} ({selectedOrgan.citRange}).</p>
                        </div>
                     </div>
                  </div>
                </div>
                <div className="space-y-10 flex flex-col justify-between">
                   <div className="bg-[#16191F] border border-white/5 p-12 rounded-[60px] shadow-2xl flex-1 flex flex-col justify-center">
                      <div className="space-y-8 relative z-10">
                         <h4 className="text-xl font-black flex items-center gap-3 text-white"><BrainCircuit className="w-6 h-6 text-blue-500" /> AI Correlation</h4>
                         {aiExplanation ? <div className="bg-white/5 p-8 rounded-[40px] border border-white/10"><p className="text-lg font-medium text-slate-200 leading-relaxed italic">"{aiExplanation}"</p></div> : <div className="border-2 border-dashed border-white/5 rounded-[40px] p-16 flex flex-col items-center justify-center text-center space-y-6"><button onClick={() => handleExplainLogic(selectedMatch)} className="bg-blue-600/10 text-blue-400 px-8 py-4 rounded-2xl font-black text-[10px] uppercase transition-all flex items-center gap-3">{isExplaining ? <Loader2 className="w-4 h-4 animate-spin" /> : <Microscope className="w-4 h-4" />} Request AI Audit</button></div>}
                      </div>
                   </div>
                   <div className="space-y-4 pt-10">
                      <button onClick={startFinalization} className="w-full py-6 bg-white text-slate-950 rounded-[32px] font-black text-xl shadow-3xl hover:bg-blue-50 transition-all active:scale-95 flex items-center justify-center gap-4">Confirm Selection <ArrowRight className="w-6 h-6" /></button>
                      <button onClick={() => setSelectedMatch(null)} className="w-full py-4 text-slate-600 font-black text-[10px] uppercase hover:text-white transition-colors">Abort</button>
                   </div>
                </div>
              </div>
            ) : (
              <div className="p-20 text-center text-slate-500 font-bold uppercase tracking-widest bg-[#16191F] rounded-[48px] border border-white/5 shadow-2xl">
                 Select a donor from the registry to initiate Match Engine.
              </div>
            )}
          </div>
        )}

        {activeTab === 'tracking' && (
          <div className="animate-in zoom-in-95 duration-700 space-y-12 pb-20">
             {!selectedMatch ? (
               <div className="bg-[#16191F] border border-white/5 p-20 rounded-[64px] shadow-3xl text-center space-y-8 flex flex-col items-center">
                  <Radar className="w-20 h-20 text-slate-800 animate-pulse" />
                  <p className="text-2xl font-black text-slate-400">No active transport missions detected.</p>
                  <button onClick={() => setActiveTab('network')} className="bg-rose-600 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest">Find a Match First</button>
               </div>
             ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                  <div className="lg:col-span-8 bg-[#16191F] border-2 border-amber-500/20 p-12 rounded-[64px] shadow-3xl relative overflow-hidden ring-4 ring-amber-500/5">
                    <div className="absolute top-0 right-0 p-16 opacity-5 -rotate-12 scale-150"><Radar className="w-64 h-64 text-amber-500" /></div>
                    
                    <div className="relative z-10 flex flex-col gap-16">
                       <div className="space-y-10">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                             <div className="flex items-center gap-6">
                               <div className="w-20 h-20 bg-amber-500 text-slate-950 rounded-3xl flex items-center justify-center shadow-2xl shadow-amber-500/20"><Plane className="w-10 h-10" /></div>
                               <div>
                                  <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 px-4 py-1 rounded-full text-[10px] font-black text-amber-500 uppercase tracking-widest mb-2">Active Mission: TSX-882</div>
                                  <h2 className="text-5xl font-black text-white tracking-tighter">Transport Plan</h2>
                               </div>
                             </div>
                             {!simulationActive ? (
                                <button 
                                  onClick={runMissionSimulation}
                                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-3 transition-all shadow-xl shadow-amber-500/20 active:scale-95"
                                >
                                  <PlayCircle className="w-5 h-5" /> Launch Mission Simulation
                                </button>
                             ) : (
                                <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 px-6 py-3 rounded-2xl">
                                   <Activity className="w-5 h-5 text-emerald-500 animate-pulse" />
                                   <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">In-Progress Data Stream</span>
                                </div>
                             )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             <div className="bg-slate-900 border border-white/5 p-8 rounded-[40px] space-y-6 group">
                                <div className="flex items-center justify-between">
                                   <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Asset Assignment</p>
                                   <p className="text-amber-500 font-black text-xs uppercase">Priority 1</p>
                                </div>
                                <div className="flex items-center gap-6">
                                   <div className="w-14 h-14 bg-slate-800 rounded-2xl flex items-center justify-center border border-white/5 group-hover:scale-110 transition-transform">{selectedMatch.distance > 160 ? <Plane className="w-7 h-7 text-blue-400" /> : <Wind className="w-7 h-7 text-emerald-400" />}</div>
                                   <div>
                                      <p className="text-xl font-black text-white">{selectedMatch.distance > 160 ? 'Citation CJ4 Jet' : 'Eurocopter EC135'}</p>
                                      <p className="text-xs text-slate-500 font-medium">LifeFlight Air Logistics #44</p>
                                   </div>
                                </div>
                             </div>
                             <div className="bg-slate-900 border border-white/5 p-8 rounded-[40px] space-y-6">
                                <div className="flex items-center justify-between">
                                   <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Cold Ischemia Time (Remaining)</p>
                                   <Timer className="w-4 h-4 text-rose-500 animate-pulse" />
                                </div>
                                <div>
                                   <p className="text-3xl font-black text-white">{ischemiaTimer}</p>
                                   <div className="h-2 bg-slate-800 rounded-full mt-3 overflow-hidden border border-white/5">
                                      <div className="h-full bg-gradient-to-r from-rose-500 to-amber-500 transition-all duration-1000" style={{ width: `${85 - missionProgress/4}%` }}></div>
                                   </div>
                                </div>
                             </div>
                          </div>

                          <div className="space-y-6">
                             <div className="flex items-center justify-between">
                                <h3 className="text-lg font-black text-white uppercase tracking-widest flex items-center gap-3"><Navigation className="w-5 h-5 text-blue-500" /> Logistics Chain</h3>
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Mission Progress: {Math.round(missionProgress)}%</span>
                             </div>
                             <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden border border-white/5 mb-8">
                                <div className="h-full bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.5)] transition-all duration-700" style={{ width: `${missionProgress}%` }}></div>
                             </div>
                             <div className="relative pl-8 space-y-10">
                                <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-slate-800"></div>
                                {[
                                  { id: 1, label: 'Organ Recovery', time: '+15M', desc: 'Surgical procurement team deployment.', icon: Target },
                                  { id: 2, label: 'Packaging', time: '+45M', desc: 'OCS TransMedics hypothermic stabilization.', icon: PackageCheck },
                                  { id: 3, label: 'In-Air Transit', time: '+1H 20M', desc: 'Aerial bridge to Central Node.', icon: Plane },
                                  { id: 4, label: 'Recipient OR Link', time: '+2H 10M', desc: 'Final surgical handoff.', icon: StethoscopeIcon },
                                ].map((step) => {
                                   const isComplete = currentSimStep > step.id;
                                   const isActive = currentSimStep === step.id;
                                   return (
                                      <div key={step.id} className="relative group/step">
                                         <div className={`absolute -left-[27px] top-1 w-3.5 h-3.5 rounded-full border-2 border-slate-900 transition-all duration-500 ${
                                            isComplete ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 
                                            isActive ? 'bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.8)] scale-125' : 'bg-slate-700'
                                         }`}></div>
                                         <div className="flex items-center justify-between">
                                            <div>
                                               <div className="flex items-center gap-2">
                                                  <p className={`text-sm font-black uppercase tracking-widest transition-colors ${isActive || isComplete ? 'text-white' : 'text-slate-600'}`}>{step.label}</p>
                                                  {isActive && <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>}
                                                  {isComplete && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
                                               </div>
                                               <p className="text-xs text-slate-500 font-medium group-hover/step:text-slate-400 transition-colors">{step.desc}</p>
                                            </div>
                                            <p className={`text-[10px] font-black uppercase tracking-widest ${isActive ? 'text-amber-500' : 'text-slate-500'}`}>{step.time}</p>
                                         </div>
                                      </div>
                                   );
                                })}
                             </div>
                          </div>
                       </div>
                    </div>
                  </div>

                  <div className="lg:col-span-4 space-y-10">
                    <div className="bg-[#16191F] border border-white/5 p-10 rounded-[48px] shadow-2xl space-y-10">
                       <div className="flex items-center gap-3">
                          <ThermometerSnowflake className="w-8 h-8 text-blue-500" />
                          <h3 className="text-2xl font-black text-white">CIT Reference</h3>
                       </div>
                       
                       <div className="space-y-6">
                          <div className="bg-slate-900/80 p-6 rounded-3xl border border-white/5 space-y-4">
                             <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Organ Specific Limits</p>
                             <div className="space-y-3">
                                {[
                                  { l: 'Heart', v: '4-6 Hours', risk: 'Rapid Damage' },
                                  { l: 'Liver', v: '6-10 Hours', risk: '>7h High Complication' },
                                  { l: 'Kidney', v: '24-72 Hours', risk: 'Resilient (Perfusion)' },
                                  { l: 'Lungs', v: '4-6 Hours', risk: 'Ischemic Window' },
                                ].map((o, idx) => (
                                  <div key={idx} className="flex items-center justify-between group">
                                     <span className="text-xs font-bold text-slate-200 group-hover:text-blue-400 transition-colors">{o.l}</span>
                                     <div className="text-right">
                                        <p className="text-[10px] font-black text-white">{o.v}</p>
                                        <p className="text-[8px] font-medium text-slate-500 uppercase">{o.risk}</p>
                                     </div>
                                  </div>
                                ))}
                             </div>
                          </div>

                          <div className="bg-rose-500/5 border border-rose-500/20 p-6 rounded-3xl space-y-4">
                             <div className="flex items-center gap-3"><ShieldAlert className="w-4 h-4 text-rose-500" /><p className="text-[10px] font-black uppercase text-rose-500">Ischemic Risks</p></div>
                             <ul className="space-y-2">
                                {['Delayed Graft Function (DGF)', 'Biliary Complications', 'Reduced Post-Op Survival'].map((r, idx) => (
                                  <li key={idx} className="text-[10px] font-medium text-slate-400 flex items-center gap-2">
                                     <div className="w-1 h-1 rounded-full bg-rose-500"></div> {r}
                                  </li>
                                ))}
                             </ul>
                          </div>

                          <div className="bg-blue-600/5 border border-blue-500/20 p-6 rounded-3xl space-y-4">
                             <div className="flex items-center gap-3"><ShieldQuestion className="w-4 h-4 text-blue-500" /><p className="text-[10px] font-black uppercase text-blue-500">Primary Factors</p></div>
                             <div className="space-y-4">
                                <div>
                                   <p className="text-[9px] font-black text-white uppercase mb-1">Metabolic Demand</p>
                                   <p className="text-[9px] text-slate-500 leading-tight">High activity organs (Heart) require significantly shorter allowable times.</p>
                                </div>
                                <div>
                                   <p className="text-[9px] font-black text-white uppercase mb-1">Preservation Method</p>
                                   <p className="text-[9px] text-slate-500 leading-tight">Perfusion pumps can extend the viable window, specifically for resilient kidneys.</p>
                                </div>
                                <div>
                                   <p className="text-[9px] font-black text-white uppercase mb-1">Donor Age</p>
                                   <p className="text-[9px] text-slate-500 leading-tight">Donors &gt;60 years often require significantly shorter CIT (&lt;8 hours) for function.</p>
                                </div>
                             </div>
                          </div>
                       </div>
                       
                       <button 
                         onClick={resetMatchState}
                         className="w-full py-6 bg-white text-slate-950 rounded-[32px] font-black text-xl shadow-3xl hover:bg-amber-50 transition-all active:scale-95 flex items-center justify-center gap-4"
                       >
                         Confirm Dispatch & Log <ArrowRight className="w-6 h-6" />
                       </button>
                    </div>
                  </div>
                </div>
             )}
          </div>
        )}

        {activeTab === 'protocols' && (
          <div className="animate-in slide-in-from-left-8 duration-700 space-y-12">
             <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* ADVANCED FLOWCHART SECTION */}
                <div className="lg:col-span-5 space-y-8">
                   <div className="bg-[#16191F] border border-white/5 p-10 rounded-[56px] shadow-3xl relative overflow-hidden flex flex-col h-full">
                      <div className="absolute top-0 right-0 p-12 opacity-[0.03] scale-150 -z-0"><Binary className="w-64 h-64 text-blue-500" /></div>
                      <div className="relative z-10 w-full space-y-10">
                         <div className="space-y-2">
                            <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 px-4 py-1.5 rounded-full text-blue-400 text-[9px] font-black uppercase tracking-widest">
                               <GitBranch className="w-3.5 h-3.5" /> Statutory Logic Path
                            </div>
                            <h3 className="text-3xl font-black text-white">{selectedOrgan.label} Allocation Flow</h3>
                            <p className="text-slate-500 text-xs font-medium leading-relaxed">Interactive visualization of federal ranking algorithms.</p>
                         </div>

                         <div className="space-y-2 relative">
                            {selectedOrgan.flowSteps.map((step, idx) => (
                               <div key={step.id} className="relative">
                                  <button 
                                    onClick={() => setActiveFlowId(step.id)}
                                    className={`w-full flex items-start gap-6 group relative z-10 p-5 rounded-[28px] border transition-all duration-500 text-left ${
                                      activeFlowId === step.id 
                                        ? 'bg-blue-600/10 border-blue-500/50 shadow-2xl' 
                                        : 'bg-slate-900/30 border-white/5 hover:border-white/10'
                                    }`}
                                  >
                                     <div className="flex flex-col items-center shrink-0">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-all duration-700 ${
                                          activeFlowId === step.id ? 'bg-blue-600 border-blue-400 text-white shadow-[0_0_20px_rgba(59,130,246,0.5)]' : 'bg-slate-800 border-white/10 text-slate-500'
                                        }`}>
                                           <step.icon className="w-6 h-6" />
                                        </div>
                                     </div>
                                     <div className="flex-1">
                                        <div className="flex items-center justify-between mb-1">
                                           <p className={`text-xs font-black uppercase tracking-widest ${activeFlowId === step.id ? 'text-white' : 'text-slate-400'}`}>{step.label}</p>
                                           {activeFlowId === step.id && <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>}
                                        </div>
                                        <p className="text-[10px] text-slate-500 font-medium leading-tight">{step.desc}</p>
                                     </div>
                                  </button>
                                  {idx !== selectedOrgan.flowSteps.length - 1 && (
                                     <div className="flex justify-center h-4 py-1">
                                        <div className="w-[1px] h-full bg-gradient-to-b from-blue-500/50 to-transparent"></div>
                                     </div>
                                  )}
                               </div>
                            ))}
                         </div>

                         {/* PARAMETER DETAILS DRAWER */}
                         <div className="bg-slate-900/80 border border-white/5 p-8 rounded-[40px] space-y-6 shadow-inner animate-in slide-in-from-bottom-4">
                            <div className="flex items-center gap-3">
                               <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-400 border border-blue-500/20"><Calculator className="w-5 h-5" /></div>
                               <h4 className="text-sm font-black text-white uppercase tracking-widest">Logic Breakdown</h4>
                            </div>
                            <p className="text-[11px] text-slate-400 leading-relaxed font-medium italic border-l-2 border-blue-500/30 pl-4">
                               "{activeStepData.detailedLogic}"
                            </p>
                            <div className="grid grid-cols-1 gap-2">
                               {activeStepData.parameters.map((param, i) => (
                                  <div key={i} className="flex items-center gap-3 bg-[#16191F] px-4 py-2.5 rounded-xl border border-white/5">
                                     <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.8)]"></div>
                                     <span className="text-[9px] font-black text-slate-200 uppercase tracking-widest">{param}</span>
                                  </div>
                               ))}
                            </div>
                         </div>
                      </div>
                   </div>
                </div>

                {/* WAITLIST SECTION */}
                <div className="lg:col-span-7 space-y-8">
                   <div className="bg-[#16191F] border border-white/5 p-12 rounded-[56px] shadow-2xl relative overflow-hidden flex flex-col">
                      <div className="relative z-10 space-y-12">
                         <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                            <div className="space-y-2">
                               <h3 className="text-4xl font-black text-white tracking-tight">Active Queue</h3>
                               <p className="text-slate-400 text-lg font-medium leading-tight">Ranked recipients in regional node.</p>
                            </div>
                            <div className="flex items-center gap-4">
                               <div className="bg-rose-500/10 border border-rose-500/20 px-5 py-2.5 rounded-2xl flex items-center gap-3">
                                  <Clock className="w-4 h-4 text-rose-500" />
                                  <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Wait Time Audit Active</span>
                               </div>
                               <div className="px-5 py-2.5 bg-blue-500/10 border border-blue-500/20 rounded-2xl text-[10px] font-black text-blue-400 uppercase tracking-widest">
                                  Protocol v4.2
                               </div>
                            </div>
                         </div>
                         
                         <div className="space-y-4">
                            {filteredRecipients.map((rec, i) => (
                              <div key={rec.id} className={`p-8 rounded-[40px] border flex items-center justify-between transition-all duration-700 ${rec.id === recipientProfile.id ? 'bg-blue-600 border-blue-500 shadow-3xl scale-[1.03] z-20' : 'bg-slate-900 border-white/5 grayscale-[0.6] opacity-60'}`}>
                                 <div className="flex items-center gap-10">
                                    <div className="relative">
                                       <span className={`text-4xl font-black tracking-tighter w-14 block text-center ${rec.id === recipientProfile.id ? 'text-white' : 'text-slate-800'}`}>#{i+1}</span>
                                       {rec.id === recipientProfile.id && <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full animate-ping"></div>}
                                    </div>
                                    <div className="space-y-1 text-left">
                                       <p className="text-xl font-black text-white">{rec.name}</p>
                                       <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest">
                                          <span className={rec.id === recipientProfile.id ? 'text-blue-100' : 'text-slate-500'}>{rec.location}</span>
                                          <span className="w-1 h-1 rounded-full bg-white/20"></span>
                                          <span className={rec.id === recipientProfile.id ? 'text-white' : 'text-slate-400'}>{rec.waitTime} Days Listed</span>
                                       </div>
                                    </div>
                                 </div>
                                 <div className="text-right flex items-center gap-12">
                                    <div className="space-y-1">
                                       <p className={`text-[9px] font-black uppercase tracking-wider ${rec.id === recipientProfile.id ? 'text-blue-200' : 'text-slate-600'}`}>{selectedOrgan.priorityMetric}</p>
                                       <p className={`text-4xl font-black tracking-tighter text-white`}>{rec.medicalUrgency}</p>
                                    </div>
                                    {rec.id === recipientProfile.id ? (
                                       <div className="w-14 h-14 bg-white text-blue-600 rounded-3xl flex items-center justify-center animate-bounce shadow-2xl"><MoveUp className="w-7 h-7" /></div>
                                    ) : (
                                       <div className="w-14 h-14 bg-slate-800 text-slate-600 rounded-3xl flex items-center justify-center border border-white/5"><Activity className="w-7 h-7" /></div>
                                    )}
                                 </div>
                              </div>
                            ))}
                         </div>

                         <div className="bg-slate-900/50 p-8 rounded-[40px] border border-white/5 border-dashed text-center">
                            <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em]">End of Regional Procurement Node Queue</p>
                         </div>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        )}

        {activeTab === 'audit' && (
           <div className="max-w-4xl mx-auto space-y-12 text-center">
              <div className="space-y-4">
                <h3 className="text-5xl font-black tracking-tighter text-white">Compliance Node</h3>
                <p className="text-slate-500 text-lg font-medium max-w-xl mx-auto">Real-time statutory verification against federal procurement laws.</p>
              </div>
              {!complianceResult ? (
                <div className="bg-[#16191F] border border-white/5 p-20 rounded-[64px] shadow-3xl space-y-10 flex flex-col items-center">
                   <div className="w-24 h-24 bg-rose-500/10 rounded-[32px] flex items-center justify-center border border-rose-500/20 shadow-2xl"><FileSignature className="w-12 h-12 text-rose-500" /></div>
                   <p className="text-2xl font-black text-slate-300 max-w-sm">Awaiting Statutory Data Sweep...</p>
                   <button onClick={runCompliance} disabled={isCheckingCompliance || !diagnosis} className="bg-white text-slate-950 px-16 py-6 rounded-3xl font-black text-xl flex items-center gap-4 hover:scale-105 active:scale-95 transition-all shadow-2xl disabled:opacity-30">
                     {isCheckingCompliance ? <Loader2 className="w-6 h-6 animate-spin" /> : <ShieldCheck className="w-6 h-6" />} Run Compliance Audit
                   </button>
                </div>
              ) : (
                <div className="bg-[#16191F] border border-white/5 p-12 rounded-[60px] text-left space-y-10 shadow-3xl animate-in fade-in slide-in-from-top-4">
                   <div className={`p-10 rounded-[40px] border flex items-center justify-between ${complianceResult.compliant ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-rose-500/5 border-rose-500/20'}`}>
                      <div className="flex items-center gap-8">
                         <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${complianceResult.compliant ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>{complianceResult.compliant ? <CheckCircle2 className="w-8 h-8" /> : <AlertCircle className="w-8 h-8" />}</div>
                         <div><p className="text-[10px] font-black text-slate-500 uppercase mb-1">Outcome</p><p className="text-3xl font-black text-white">{complianceResult.compliant ? 'Regulatory PASS' : 'Validation Warning'}</p></div>
                      </div>
                      <button onClick={() => setComplianceResult(null)} className="w-12 h-12 hover:bg-white/5 rounded-2xl flex items-center justify-center border border-white/5 transition-all"><RefreshCcw className="w-5 h-5 text-slate-600" /></button>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                      <div className="space-y-6"><h4 className="text-[10px] font-black uppercase text-slate-600 tracking-widest">Legal Analysis</h4><p className="text-slate-300 text-lg font-medium italic leading-relaxed">"{complianceResult.reasoning}"</p></div>
                      <div className="space-y-6"><h4 className="text-[10px] font-black uppercase text-slate-600 tracking-widest">Deficiency Log</h4><div className="space-y-4">{complianceResult.missingDocs.length > 0 ? complianceResult.missingDocs.map((d: string, i: number) => <div key={i} className="flex items-center gap-4 p-5 bg-slate-900/50 border border-rose-500/20 rounded-2xl text-xs font-black text-rose-500"><AlertTriangle className="w-4 h-4 shrink-0" /> {d}</div>) : <div className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-3xl text-xs font-black text-emerald-400 flex items-center gap-4"><CheckCircle2 className="w-5 h-5 shrink-0" /> Integrity verified. All criteria met.</div>}</div></div>
                   </div>
                </div>
              )}
           </div>
        )}
      </div>

      {/* Footer Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 pt-12 border-t border-white/5">
        {[
          { label: 'Active Node Donors', value: donorNetwork.length, icon: UserCheck, color: 'text-blue-500' },
          { label: 'Waitlist Global', value: globalWaitlist.length, icon: Users, color: 'text-amber-500' },
          { label: 'Protocol Sync', value: '99.9%', icon: ShieldCheck, color: 'text-rose-500' },
          { label: 'Node Latency', value: '0.4s', icon: Zap, color: 'text-emerald-500' },
        ].map((s, i) => (
          <div key={i} className="bg-[#16191F] border border-white/5 p-8 rounded-[32px] flex items-center justify-between shadow-xl">
             <div className="space-y-1"><p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{s.label}</p><p className="text-3xl font-black text-white">{s.value}</p></div>
             <div className={`w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center ${s.color}`}><s.icon className="w-6 h-6" /></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TransplantModule;
