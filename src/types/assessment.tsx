// src/types/assessment.ts

export interface UserDetails {
  name: string;
  email: string;
  age: string;
  gender: string;
}

export interface Questionnaire {
  hairFallSeverity: string;
  familyHistory: string;
  stressLevel: string;
  dietQuality: string;
  sleepDuration: string;
  scalpItching: boolean;
  scalpDandruff: boolean;
  scalpRedness: boolean;
  hairWashFrequency: string;
  useHeatStyling: boolean;
  useChemicalTreatments: boolean;
}

export interface UploadedImage {
  id: string;
  file: File;
  preview: string;
  label: ImageLabel;
}

export type ImageLabel = "front" | "back" | "top" | "sides";

export const imageLabels: Record<ImageLabel, string> = {
  front: "Front View",
  back: "Back View",
  top: "Top View",
  sides: "Side View",
};

export interface HairHealthReport {
  generatedAt: Date;
  overallRiskLevel: "low" | "medium" | "high";
  riskScore: number;
  lifestyleImpact: "minimal" | "moderate" | "significant";
  scalpHealthWarning: boolean;
  possibleCauses: string[];
  recommendations: string[];
  
  // ML Prediction fields - ADDED
  predictedClass?: string;
  predictedProbability?: number;
  allClassProbabilities?: number[];
  allPredictions?: Array<{
    disease: string;
    probability: number;
  }>;
}

export interface AssessmentData {
  userDetails: UserDetails;
  questionnaire: Questionnaire;
  images: UploadedImage[];
}

export const initialUserDetails: UserDetails = {
  name: "",
  email: "",
  age: "",
  gender: "",
};

export const initialQuestionnaire: Questionnaire = {
  hairFallSeverity: "",
  familyHistory: "",
  stressLevel: "",
  dietQuality: "",
  sleepDuration: "",
  scalpItching: false,
  scalpDandruff: false,
  scalpRedness: false,
  hairWashFrequency: "",
  useHeatStyling: false,
  useChemicalTreatments: false,
};