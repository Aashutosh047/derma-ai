import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Download } from "lucide-react";
import { UserDetailsForm } from "./UserDetailsForm";
import { ImageUploadForm } from "./ImageUploadForm";
import { useToast } from "@/hooks/use-toast";
import { UploadedImage } from "@/types/assessment";
import { downloadSkinReportPDF } from "@/lib/pdfGenerator";

const steps = [
  { id: 1, title: "Your Details",  description: "Basic information" },
  { id: 2, title: "Questionnaire", description: "Skin risk factors" },
  { id: 3, title: "Upload Image",  description: "Skin lesion photo" },
  { id: 4, title: "Your Report",   description: "AI analysis results" },
];

const API_BASE_URL = "http://localhost:8000";

const SKIN_CONDITIONS: Record<string, { severity: "benign" | "malignant" | "precancerous" | "normal"; description: string }> = {
  "Melanocytic nevi":              { severity: "benign",       description: "Common moles. Usually harmless but monitor for changes in size, shape or color." },
  "Melanoma":                      { severity: "malignant",    description: "A serious form of skin cancer. Requires immediate consultation with a dermatologist." },
  "Benign keratosis-like lesions": { severity: "benign",       description: "Non-cancerous skin growths. Generally harmless but can resemble other conditions." },
  "Basal cell carcinoma":          { severity: "malignant",    description: "The most common skin cancer. Rarely spreads but needs prompt medical treatment." },
  "Actinic keratoses":             { severity: "precancerous", description: "Rough, scaly patches caused by sun damage. Can develop into skin cancer if untreated." },
  "Vascular lesions":              { severity: "benign",       description: "Abnormalities of blood vessels in the skin. Usually benign and may not require treatment." },
  "Dermatofibroma":                { severity: "benign",       description: "Harmless skin growths. Usually no treatment needed unless causing discomfort." },
  "Normal":                        { severity: "normal",       description: "No significant skin condition detected in the image." },
};

const severityColors = {
  normal:       { bg: "bg-green-50",  border: "border-green-200",  badge: "bg-green-100 text-green-700",   dot: "bg-green-500" },
  benign:       { bg: "bg-blue-50",   border: "border-blue-200",   badge: "bg-blue-100 text-blue-700",     dot: "bg-blue-500" },
  precancerous: { bg: "bg-yellow-50", border: "border-yellow-200", badge: "bg-yellow-100 text-yellow-700", dot: "bg-yellow-500" },
  malignant:    { bg: "bg-red-50",    border: "border-red-200",    badge: "bg-red-100 text-red-700",       dot: "bg-red-500" },
};

interface SkinQuestionnaire {
  sunExposure: string;
  familyHistorySkin: string;
  skinTone: string;
  ageGroup: string;
  lesionChange: boolean;
  itchingBleeding: boolean;
  moleCount: string;
  sunburnHistory: boolean;
  chemicalExposure: boolean;
  skinInjury: boolean;
  lesionDuration: string;
}

const initialQuestionnaire: SkinQuestionnaire = {
  sunExposure: "moderate",
  familyHistorySkin: "no",
  skinTone: "medium",
  ageGroup: "under_30",
  lesionChange: false,
  itchingBleeding: false,
  moleCount: "few",
  sunburnHistory: false,
  chemicalExposure: false,
  skinInjury: false,
  lesionDuration: "recent",
};

interface SkinReport {
  predictedClass: string;
  confidence: number;
  severity: string;
  allPredictions: Array<{ disease: string; probability: number }>;
  fusionResult?: any;
  user: { name: string; age: string; gender: string };
  generatedAt: Date;
}

interface SkinAssessmentSectionProps {
  onReportReady?: (report: any) => void;
}

// ── Questionnaire Form Component ──
function SkinQuestionnaireForm({ data, onChange }: { data: SkinQuestionnaire; onChange: (d: SkinQuestionnaire) => void }) {
  const select = (field: keyof SkinQuestionnaire, value: string) =>
    onChange({ ...data, [field]: value });
  const toggle = (field: keyof SkinQuestionnaire) =>
    onChange({ ...data, [field]: !data[field as keyof SkinQuestionnaire] });

  const SelectRow = ({ label, field, options }: { label: string; field: keyof SkinQuestionnaire; options: { value: string; label: string }[] }) => (
    <div>
      <label className="text-sm font-medium text-foreground block mb-1.5">{label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => select(field, opt.value)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
              data[field] === opt.value
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-secondary/50 text-muted-foreground border-border hover:border-primary/50"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );

  const ToggleRow = ({ label, field, hint }: { label: string; field: keyof SkinQuestionnaire; hint?: string }) => (
    <div className="flex items-center justify-between py-2 border-b border-border/50">
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      </div>
      <button
        type="button"
        onClick={() => toggle(field)}
        className={`w-12 h-6 rounded-full transition-all relative ${data[field] ? "bg-primary" : "bg-secondary"}`}
      >
        <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${data[field] ? "left-6" : "left-0.5"}`} />
      </button>
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-sm text-blue-800">
        <strong>📋 About this questionnaire:</strong> These questions help our AI assess your skin cancer risk factors and complement the image analysis for a more accurate result.
      </div>

      <SelectRow label="How much sun exposure do you get daily?" field="sunExposure"
        options={[{ value: "low", label: "Low" }, { value: "moderate", label: "Moderate" }, { value: "high", label: "High" }]} />

      <SelectRow label="What is your skin tone?" field="skinTone"
        options={[{ value: "dark", label: "Dark" }, { value: "medium", label: "Medium" }, { value: "fair", label: "Fair" }, { value: "very_fair", label: "Very Fair" }]} />

      <SelectRow label="Age group" field="ageGroup"
        options={[{ value: "under_30", label: "Under 30" }, { value: "30_to_50", label: "30–50" }, { value: "above_50", label: "Above 50" }]} />

      <SelectRow label="How long have you had this lesion?" field="lesionDuration"
        options={[{ value: "recent", label: "Recently appeared" }, { value: "months", label: "Several months" }, { value: "years", label: "Years" }]} />

      <SelectRow label="Number of moles on your body" field="moleCount"
        options={[{ value: "few", label: "Few (< 10)" }, { value: "moderate", label: "Moderate (10–50)" }, { value: "many", label: "Many (50+)" }]} />

      <SelectRow label="Family history of skin cancer?" field="familyHistorySkin"
        options={[{ value: "no", label: "No" }, { value: "yes", label: "Yes" }]} />

      <div className="space-y-1 pt-2">
        <p className="text-sm font-semibold text-foreground mb-2">Symptoms & History</p>
        <ToggleRow label="Has the lesion changed recently?" field="lesionChange" hint="Change in size, color, or shape" />
        <ToggleRow label="Itching or bleeding from the lesion?" field="itchingBleeding" />
        <ToggleRow label="History of severe sunburns?" field="sunburnHistory" />
        <ToggleRow label="Exposure to chemicals or radiation?" field="chemicalExposure" />
        <ToggleRow label="Skin injury at the lesion site?" field="skinInjury" hint="Trauma, insect bite, or wound" />
      </div>
    </motion.div>
  );
}

export function SkinAssessmentSection({ onReportReady }: SkinAssessmentSectionProps) {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [report, setReport] = useState<SkinReport | null>(null);

  const [userDetails, setUserDetails] = useState({ name: "", email: "", age: "", gender: "" });
  const [questionnaire, setQuestionnaire] = useState<SkinQuestionnaire>(initialQuestionnaire);
  const [images, setImages] = useState<UploadedImage[]>([]);

  /* ── API CALLS ── */
  const sendUserDetails = async () => {
    const age = parseInt(userDetails.age);
    if (!userDetails.name || !userDetails.email || isNaN(age) || !userDetails.gender) {
      toast({ title: "Missing fields", description: "Please fill in all fields before continuing.", variant: "destructive" });
      return false;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/user-details`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: userDetails.name, email: userDetails.email, age, gender: userDetails.gender }),
      });
      if (!res.ok) throw new Error();
      toast({ title: "Success", description: "Your details have been saved" });
      return true;
    } catch {
      toast({ title: "Error", description: "Failed to save your details", variant: "destructive" });
      return false;
    }
  };

  const sendSkinQuestionnaire = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/skin/questionnaire`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(questionnaire),
      });
      if (!res.ok) throw new Error();
      toast({ title: "Questionnaire submitted", description: "Risk factors recorded" });
      return true;
    } catch {
      toast({ title: "Error", description: "Failed to submit questionnaire", variant: "destructive" });
      return false;
    }
  };

  const sendImageAndGetFusion = async () => {
    if (images.length === 0) {
      toast({ title: "No Image", description: "Please upload a skin image", variant: "destructive" });
      return null;
    }
    try {
      const formData = new FormData();
      formData.append("image", images[0].file);
      const res = await fetch(`${API_BASE_URL}/skin/upload-image`, { method: "POST", body: formData });
      if (!res.ok) throw new Error("Image upload failed");
      const imageResult = await res.json();
      toast({ title: "Image analyzed", description: `Detected: ${imageResult.predicted_class}` });

      // Fetch fusion result
      const fusionRes = await fetch(`${API_BASE_URL}/skin/get-diagnosis`);
      const fusionData = fusionRes.ok ? await fusionRes.json() : null;

      return { imageResult, fusionResult: fusionData?.fusion_result ?? null };
    } catch (error) {
      toast({ title: "Error", description: error instanceof Error ? error.message : "Image upload failed", variant: "destructive" });
      return null;
    }
  };

  /* ── STEP HANDLER ── */
  const handleNext = async () => {
    if (currentStep === 1) {
      setIsSubmitting(true);
      const ok = await sendUserDetails();
      setIsSubmitting(false);
      if (ok) setCurrentStep(2);
      return;
    }
    if (currentStep === 2) {
      setIsSubmitting(true);
      const ok = await sendSkinQuestionnaire();
      setIsSubmitting(false);
      if (ok) setCurrentStep(3);
      return;
    }
    if (currentStep === 3) {
      setIsSubmitting(true);
      const result = await sendImageAndGetFusion();
      if (!result) { setIsSubmitting(false); return; }

      const { imageResult, fusionResult } = result;
      const finalReport: SkinReport = {
        predictedClass: imageResult.predicted_class,
        confidence:     imageResult.confidence,
        severity:       imageResult.severity,
        allPredictions: imageResult.all_predictions,
        fusionResult,
        user: { name: userDetails.name, age: userDetails.age, gender: userDetails.gender },
        generatedAt: new Date(),
      };

      setReport(finalReport);
      onReportReady?.({ ...finalReport, cnn_result: imageResult });
      setIsSubmitting(false);
      setCurrentStep(4);
    }
  };

  const handleBack = () => setCurrentStep((p) => p - 1);
  const handleReset = () => {
    setUserDetails({ name: "", email: "", age: "", gender: "" });
    setQuestionnaire(initialQuestionnaire);
    setImages([]);
    setReport(null);
    setCurrentStep(1);
  };

  /* ── REPORT DISPLAY ── */
  const SkinReportDisplay = () => {
    if (!report) return null;
    const condition = SKIN_CONDITIONS[report.predictedClass] ?? { severity: "benign", description: "Condition detected. Please consult a dermatologist." };
    const colors = severityColors[condition.severity];
    const fusion = report.fusionResult;

    // Use fusion primary if available, else fall back to CNN
    const displayClass = fusion?.primary_diagnosis?.disease ?? report.predictedClass;
    const displayConf  = fusion?.primary_diagnosis?.probability ?? report.confidence;
    const displaySev   = fusion?.primary_diagnosis?.severity ?? condition.severity;
    const displayCond  = SKIN_CONDITIONS[displayClass] ?? condition;
    const displayColors = severityColors[displayCond.severity] ?? colors;

    const top5 = (fusion?.all_fused_predictions ?? report.allPredictions).slice(0, 5);

    return (
      <div className="space-y-6">
        <div className="text-center">
          <p className="text-muted-foreground text-sm">Report generated for</p>
          <h3 className="text-2xl font-bold text-foreground">{report.user.name}</h3>
          <p className="text-muted-foreground text-sm">{report.user.gender} · Age {report.user.age} · {new Date(report.generatedAt).toLocaleDateString()}</p>
        </div>

        {/* Primary Result */}
        <div className={`rounded-2xl p-6 border ${displayColors.bg} ${displayColors.border}`}>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">
                {fusion ? "Fusion Model Detection (70% Image + 30% Questionnaire)" : "CNN Detection"}
              </p>
              <h4 className="text-2xl font-bold text-foreground">{displayClass}</h4>
              <p className="text-muted-foreground text-sm mt-2 max-w-md">{displayCond.description}</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${displayColors.badge}`}>
                {displaySev}
              </span>
              <span className="text-2xl font-bold text-foreground">{(displayConf * 100).toFixed(1)}%</span>
              <p className="text-xs text-muted-foreground">confidence</p>
            </div>
          </div>
        </div>

        {/* Clinical Summary from fusion */}
        {fusion?.clinical_summary && (
          <div className="bg-secondary/40 rounded-xl p-4 border border-border/50">
            <p className="text-sm font-semibold text-foreground mb-1">Clinical Summary</p>
            <p className="text-sm text-muted-foreground">{fusion.clinical_summary}</p>
          </div>
        )}

        {/* Warning */}
        {(displayCond.severity === "malignant" || displayCond.severity === "precancerous") && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex gap-3">
            <span className="text-red-500 text-xl">⚠️</span>
            <div>
              <p className="font-semibold text-red-700 text-sm">Urgent: Please See a Doctor</p>
              <p className="text-red-600 text-sm mt-1">
                This result indicates a condition requiring professional medical evaluation.
                Please visit: TUTH Kathmandu, B&B Hospital Lalitpur, or Nepal Cancer Hospital.
              </p>
            </div>
          </div>
        )}

        {/* All Predictions */}
        <div className="bg-card rounded-xl border p-5">
          <h5 className="font-semibold text-foreground mb-4">
            {fusion ? "All Fused Probabilities" : "All Detected Probabilities"}
          </h5>
          <div className="space-y-3">
            {top5.map((pred: any, i: number) => (
              <div key={pred.disease}>
                <div className="flex justify-between text-sm mb-1">
                  <span className={`font-medium ${i === 0 ? "text-foreground" : "text-muted-foreground"}`}>{pred.disease}</span>
                  <span className={`font-semibold ${i === 0 ? "text-primary" : "text-muted-foreground"}`}>
                    {(pred.probability * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${i === 0 ? "bg-primary" : "bg-muted-foreground/30"}`}
                    style={{ width: `${pred.probability * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Disclaimer */}
        <div className="bg-secondary/50 rounded-xl p-4 text-center">
          <p className="text-xs text-muted-foreground">
            <strong>Disclaimer:</strong> This AI screening tool is not a substitute for professional medical diagnosis.
            Always consult a qualified dermatologist for confirmed diagnosis and treatment.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button className="flex-1 gap-2" onClick={() => downloadSkinReportPDF(report)}>
            <Download className="w-4 h-4" /> Download PDF Report
          </Button>
          <Button onClick={handleReset} variant="outline" className="flex-1">
            Start New Skin Assessment
          </Button>
        </div>
      </div>
    );
  };

  /* ── UI ── */
  return (
    <section id="skin-assessment" className="py-20 md:py-32 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto bg-card rounded-2xl p-6 md:p-10 shadow-card border">
          <div className="text-center mb-8">
            <span className="text-primary font-semibold text-sm uppercase tracking-wider">AI-Powered</span>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mt-2">🔬 Skin Analysis Test</h2>
            <p className="text-muted-foreground mt-2 text-sm">
              Answer a few questions and upload a skin photo. Our multimodal AI combines both for accurate screening.
            </p>
          </div>

          {/* Step Indicators */}
          <div className="mb-8">
            <div className="flex justify-between items-center">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                      currentStep >= step.id ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                    }`}>{step.id}</div>
                    <p className="text-xs mt-2 text-center text-muted-foreground">{step.title}</p>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`h-1 flex-1 mx-2 ${currentStep > step.id ? "bg-primary" : "bg-secondary"}`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          <AnimatePresence mode="wait">
            {currentStep === 1 && <UserDetailsForm data={userDetails} onChange={setUserDetails} />}
            {currentStep === 2 && <SkinQuestionnaireForm data={questionnaire} onChange={setQuestionnaire} />}
            {currentStep === 3 && (
              <div className="space-y-4">
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-800">
                  <strong>📸 Photo Tips:</strong> Use a well-lit, close-up photo of the skin area. Avoid blurry images.
                </div>
                <ImageUploadForm images={images} onChange={setImages} />
              </div>
            )}
            {currentStep === 4 && <SkinReportDisplay />}
          </AnimatePresence>

          {currentStep < 4 && (
            <div className="flex justify-between mt-8 pt-6 border-t">
              <Button variant="ghost" onClick={handleBack} disabled={currentStep === 1 || isSubmitting}>
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
              </Button>
              <Button type="button" onClick={handleNext} disabled={isSubmitting}>
                {isSubmitting ? "Processing..." : currentStep === 3 ? "Analyze Skin" : "Next"}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}