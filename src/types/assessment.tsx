// src/types/assessment.tsx

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

export interface FusionPrediction {
  disease: string;
  probability: number;
  confidence?: string;
  image_contribution?: number;
  questionnaire_contribution?: number;
}

export interface FusionResult {
  primary_diagnosis: FusionPrediction;
  all_fused_predictions: FusionPrediction[];
  questionnaire_role: "boost" | "alternative" | "weak_support" | string;
  clinical_summary: string;
  model_details: {
    questionnaire_top_prediction: FusionPrediction;
    [key: string]: any;
  };
}

export interface HairHealthReport {
  generatedAt: Date;
  overallRiskLevel: "low" | "medium" | "high";
  riskScore: number;
  lifestyleImpact: "minimal" | "moderate" | "significant";
  scalpHealthWarning: boolean;
  possibleCauses: string[];
  recommendations: string[];

  // ML Prediction fields
  predictedClass?: string;
  predictedProbability?: number;
  allClassProbabilities?: number[];
  allPredictions?: Array<{
    disease: string;
    probability: number;
  }>;

  // Fusion result from /get-diagnosis
  fusion_result?: FusionResult;

  // User info for chat bubble personalisation
  user?: {
    name: string;
    age: string;
    gender: string;
  };
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