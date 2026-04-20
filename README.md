# 🏥 ScanWise AI
### **Next-Generation Multimodal Clinical Intelligence Platform**
> *Unified Diagnostic Reasoning Across Imaging, Laboratories, and EHR Ecosystems.*

[![Platform](https://img.shields.io/badge/Platform-Medical--Grade%20AI-blue.svg?style=for-the-badge)]()
[![Engine](https://img.shields.io/badge/Engine-Gemini%201.5%20Pro-purple.svg?style=for-the-badge)]()
[![Compliance](https://img.shields.io/badge/Compliance-HIPAA%20Aligned-emerald.svg?style=for-the-badge)]()
[![Research](https://img.shields.io/badge/Research-NCISF%202026-orange.svg?style=for-the-badge)]()

---

## 🔬 Research Foundation
**ScanWise AI** is the functional implementation of the research paper:  
*"ScanWise: An AI-Powered Multi-Scan Medical Imaging and Report Interpretation System for Multimodal Clinical Decision Support"* - (NCISF 2026).

The platform implements the **Decision-Level Fusion Architecture** proposed in the study, combining:
*   **Imaging Probability Vectors ($I$):** Derived from DenseNet121 (Chest X-ray) and CNN (Brain MRI) backbones.
*   **Biomarker Deviation Vectors ($B$):** Calculated using the signed normalized deviation formula $b_i = (v_i - mu_i) / \sigma_i$.
*   **Text Embeddings ($R$):** Extracted from clinical reports via BioBERT-based transformers.

---

## 🚀 Core Clinical Modules

### 1. 🔍 Multimodal Diagnostic Engine
The primary diagnostic pipeline for cross-modal reasoning.
*   **Dual-Modality Imaging:** Integrated analysis of Chest X-rays (CheXpert) and Brain MRI (Kaggle MRI) for automated pathology detection.
*   **NLP Biomarker Extraction:** Automated parsing of unstructured lab reports to extract 14+ critical analytes using clinical-domain tokenizers.
*   **Clinical Contradiction Detection:** A rule-based library that flags inconsistencies (e.g., Consolidation detected on X-ray without elevated WBC).

### 2. 🫀 Transplant Intelligence Hub (Mission Control)
A high-fidelity module for organ procurement and matching.
*   **Radar Correlation:** Multi-factor matching visualization comparing Donor/Recipient HLA, ABO, and morphology.
*   **Mission Telemetry:** Real-time tracking of organ transport missions with live event logging and "Cold Chain" monitoring.
*   **CIT Viability Tracking:** Dynamic countdowns for **Cold Ischemia Time** (CIT) based on organ-specific statutory windows.

### 3. 🧠 Clinical Reasoning & Explainability
Bridging the "Black Box" of AI with clinical transparency.
*   **Grad-CAM Saliency Maps:** Visual heatmaps overlaid on scans to show model attention regions (e.g., lung consolidation or tumour mass).
*   **AI Clinical Audit:** Natural language explanations for every match and diagnosis, grounded in the fusion engine's weighted scoring.
*   **Structured Reporting:** Template-based report generation designed to eliminate LLM hallucinations and ensure factual accuracy.

### 4. 📊 Operational Triage Dashboard
*   **Predictive Workload:** Forecasts arrival density and triage pressure using Recharts-driven modeling.
*   **Regional Trauma Mapping:** Real-time grounding via Google Maps to identify nearby Level 1 Trauma Centers.

---

## 🛠 Technical Architecture

| Stack Segment | Technologies |
| :--- | :--- |
| **Frontend Framework** | React 19 (TypeScript, Vite) |
| **AI Reasoning Engine** | Google Gemini 1.5 Pro & Flash |
| **Animation Engine** | Motion (motion/react) |
| **Data Visualization** | Recharts (Radar, Area, Cartesian) |
| **Styling** | Tailwind CSS (Modern Utility-First Design) |
| **Icons** | Lucide-React |

---

## 📑 Agentic Workflow Paradigm

1.  **Ingestion:** Data is de-identified and modality is detected via Gemini Vision.
2.  **Fusion:** The system calculates a composite risk score $S = w1 * I + w2 * \phi(B) + w3 * g(R)$.
3.  **Audit:** The contradiction module checks findings against the clinical rule library.
4.  **Explainability:** Grad-CAM heatmaps are generated for visual verification.
5.  **Action:** A structured clinical report is generated for final human sign-off.

---

## ⚖️ Regulatory & Safety Disclaimer

*ScanWise AI is a Clinical Decision Support (CDS) tool. It is intended to assist healthcare professionals by providing data synthesis and correlation. It does not replace independent clinical judgment or certified medical diagnosis. All transplant allocations must follow national procurement protocols and be verified by a Human Transplant Coordinator.*

---
**Developed by Senior Clinical Engineering Group • v3.0 Node**
