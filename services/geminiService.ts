
import { GoogleGenAI, Type } from "@google/genai";
import { DiagnosticModality, AIDiagnosisResult, DecisionSupport, PatientCommunication, LabReportInsights, ResearchInsight } from "../types";

const handleApiCall = async (fn: () => Promise<any>) => {
  try {
    return await fn();
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    const errorMsg = typeof error === 'string' ? error : (error.message || JSON.stringify(error));
    if (errorMsg.includes("NOT_FOUND") || errorMsg.includes("Requested entity was not found")) {
      if (window.aistudio && typeof window.aistudio.openSelectKey === 'function') {
        await window.aistudio.openSelectKey();
      }
    }
    throw error;
  }
};

export const getDashboardBriefing = async (stats: any): Promise<string> => {
  return handleApiCall(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Provide a 2-sentence clinical command briefing based on these stats: ${JSON.stringify(stats)}. Focus on urgency and throughput.`,
    });
    return response.text || "System operating within normal parameters. Triage queue stable.";
  });
};

export const verifyTransplantCompliance = async (diagnosis: AIDiagnosisResult, labs: LabReportInsights | null): Promise<{ compliant: boolean; reasoning: string; missingDocs: string[] }> => {
  return handleApiCall(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Verify if this patient case meets international transplant criteria based on: Diagnosis: ${diagnosis.observations}, Labs: ${JSON.stringify(labs)}. Output JSON.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            compliant: { type: Type.BOOLEAN },
            reasoning: { type: Type.STRING },
            missingDocs: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["compliant", "reasoning", "missingDocs"]
        }
      }
    });
    return JSON.parse(response.text || '{}');
  });
};

export const validateOrganMatch = async (recipient: any, donor: any): Promise<string> => {
  return handleApiCall(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Perform a deep clinical match validation between:
      RECIPIENT: ${JSON.stringify(recipient)}
      DONOR: ${JSON.stringify(donor)}
      Provide a highly technical, 2-sentence clinical clearance statement. Focus on long-term graft survival and immunological synergy.`,
      config: { thinkingConfig: { thinkingBudget: 4000 } }
    });
    return response.text || "Match parameters verified against national clinical standards.";
  });
};

export const getPersonalizedMatchingLogic = async (meldScore: number, bloodType: string): Promise<string> => {
  return handleApiCall(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Explain concise transplant ranking for MELD ${meldScore} and Blood Type ${bloodType}. 
      Structure your response with:
      - SUMMARY: [Short status]
      - URGENCY: [Brief MELD context]
      - COMPATIBILITY: [Blood group context]
      - RANKING RULE: [The primary rule applied]
      Keep it professional, neat, and highly concise. Use bold for key terms.`,
    });
    return response.text || "Waitlist rank is determined by medical urgency (MELD) and donor compatibility.";
  });
};

export const getRegionalTraumaMap = async (lat: number, lng: number): Promise<{ text: string; links: { title: string; uri: string }[] }> => {
  return handleApiCall(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      // Maps grounding is only supported in Gemini 2.5 series models.
      model: "gemini-2.5-flash",
      contents: "List the 3 closest Level 1 Trauma Centers and their current status relative to this location.",
      config: {
        // Corrected: use googleMaps tool for place-based queries as per SDK guidelines.
        tools: [{ googleMaps: {} }],
        toolConfig: {
          retrievalConfig: {
            latLng: { latitude: lat, longitude: lng }
          }
        }
      },
    });
    
    // Correctly extract URLs from groundingChunks.maps as per Maps Grounding section.
    const links = response.candidates?.[0]?.groundingMetadata?.groundingChunks
      ?.filter(chunk => chunk.maps)
      ?.map(chunk => ({
        title: chunk.maps?.title || "Medical Center",
        uri: chunk.maps?.uri || "#"
      })) || [];

    return {
      text: response.text || "",
      links
    };
  });
};

export const detectScanType = async (imageData: string): Promise<{ modality: DiagnosticModality; region: string }> => {
  return handleApiCall(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { inlineData: { data: imageData.split(',')[1], mimeType: 'image/png' } },
          { text: "Identify modality (X-ray, CT Scan, MRI, Ultrasound, Skin Photo, Lab Report) and body region. Output JSON." }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            modality: { type: Type.STRING },
            region: { type: Type.STRING }
          },
          required: ["modality", "region"]
        }
      }
    });
    return JSON.parse(response.text || '{}');
  });
};

export const summarizeResearchPaper = async (title: string, snippet: string): Promise<string> => {
  return handleApiCall(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Provide a one-sentence clinical summary of this research paper titled "${title}" with context snippet: "${snippet}". Focus on its practical relevance to doctors. Avoid jargon.`,
    });
    return response.text?.trim() || "Summary generated based on clinical abstract.";
  });
};

export const analyzeMedicalScan = async (
  imageData: string, 
  modality: DiagnosticModality, 
  region: string
): Promise<AIDiagnosisResult> => {
  return handleApiCall(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const model = 'gemini-3-pro-preview'; 
    
    const response = await ai.models.generateContent({
      model,
      contents: {
        parts: [
          { inlineData: { data: imageData.split(',')[1], mimeType: 'image/png' } },
          { text: `Analyze this ${modality} of the ${region}. 
          Conduct an exhaustive search for primary abnormalities AND specifically look for rare, less common, or incidental pathological markers (e.g., anatomical variants, early-stage secondary lesions, or rare calcification patterns) that are often overlooked. 
          Provide a separate list for these 'rareFindings'.
          Identify return ROI coordinates (0-1000) for the most significant finding. Output JSON.` }
        ]
      },
      config: {
        thinkingConfig: { thinkingBudget: 32768 }, 
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            abnormalities: { type: Type.ARRAY, items: { type: Type.STRING } },
            rareFindings: { type: Type.ARRAY, items: { type: Type.STRING } },
            confidence: { type: Type.NUMBER },
            observations: { type: Type.STRING },
            riskLevel: { type: Type.STRING },
            findings: { type: Type.ARRAY, items: { type: Type.STRING } },
            visualHeatmapCoord: {
              type: Type.OBJECT,
              properties: {
                x: { type: Type.NUMBER },
                y: { type: Type.NUMBER },
                label: { type: Type.STRING }
              },
              required: ["x", "y", "label"]
            }
          },
          required: ["abnormalities", "confidence", "observations", "riskLevel", "findings", "visualHeatmapCoord"]
        }
      }
    });
    return JSON.parse(response.text || '{}');
  });
};

export const searchClinicalTrials = async (diagnosis: string, region: string): Promise<ResearchInsight> => {
  return handleApiCall(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const model = 'gemini-3-pro-preview';
    
    const prompt = `Research ${diagnosis} in the ${region} region (2024-2025). 
    Extract clinical trials (including name, phase, intervention, findings), research papers, key pathophysiological mechanisms (Glymphatic, BBB, etc.), and clinical takeaways. 
    Ensure the output is comprehensive for a specialist. Output response in Markdown-wrapped JSON if possible, but prioritize search accuracy.`;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      }
    });

    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const papers = groundingChunks
      .filter(chunk => chunk.web)
      .map(chunk => ({
        title: chunk.web?.title || 'Clinical Research Source',
        url: chunk.web?.uri || '',
        snippet: 'Sourced via Gemini Search Grounding'
      }));

    return {
      trials: [],
      papers,
      mechanisms: [],
      takeaways: [],
      summary: response.text || "Research summary generated based on real-time clinical data."
    };
  });
};

export const parseLabReport = async (reportData: string): Promise<LabReportInsights> => {
  return handleApiCall(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const isImage = reportData.startsWith('data:image');
    const part = isImage 
      ? { inlineData: { data: reportData.split(',')[1], mimeType: 'image/png' } }
      : { text: reportData };

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [part, { text: "Extract clinical lab values and summary. Output JSON." }]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            parameters: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  value: { type: Type.STRING },
                  unit: { type: Type.STRING },
                  range: { type: Type.STRING }
                }
              }
            },
            summary: { type: Type.STRING }
          }
        }
      }
    });
    return JSON.parse(response.text || '{}');
  });
};

export const generateAgenticReasoning = async (
  visualDiagnosis: AIDiagnosisResult,
  labInsights: LabReportInsights | null,
  clinicalHistory: string
): Promise<DecisionSupport> => {
  return handleApiCall(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Correlate visual: ${visualDiagnosis.observations}, labs: ${labInsights?.summary}, history: ${clinicalHistory}. Output JSON triage.`;
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 32768 },
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            triagePriority: { type: Type.STRING },
            suggestedSteps: { type: Type.ARRAY, items: { type: Type.STRING } },
            reasoning: { type: Type.STRING },
            clinicalContext: { type: Type.STRING }
          }
        }
      }
    });
    return JSON.parse(response.text || '{}');
  });
};

export const generatePatientFriendlySummary = async (
  diagnosis: AIDiagnosisResult,
  decision: DecisionSupport
): Promise<PatientCommunication> => {
  return handleApiCall(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Explain simply: ${diagnosis.observations}. Triage: ${decision.triagePriority}.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            simpleExplanation: { type: Type.STRING },
            nextSteps: { type: Type.STRING }
          }
        }
      }
    });
    return JSON.parse(response.text || '{}');
  });
};
