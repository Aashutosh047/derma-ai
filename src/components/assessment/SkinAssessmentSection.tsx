import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { UserDetailsForm } from "./UserDetailsForm";
import { ImageUploadForm } from "./ImageUploadForm";
import { useToast } from "@/hooks/use-toast";
import { UploadedImage } from "@/types/assessment";

const steps = [
  { id: 1, title: "Your Details", description: "Basic information" },
  { id: 2, title: "Upload Image", description: "Skin lesion photo" },
  { id: 3, title: "Your Report", description: "AI analysis results" },
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
  normal:       { bg: "bg-green-50",  border: "border-green-200",  badge: "bg-green-100 text-green-700",  dot: "bg-green-500" },
  benign:       { bg: "bg-blue-50",   border: "border-blue-200",   badge: "bg-blue-100 text-blue-700",    dot: "bg-blue-500" },
  precancerous: { bg: "bg-yellow-50", border: "border-yellow-200", badge: "bg-yellow-100 text-yellow-700", dot: "bg-yellow-500" },
  malignant:    { bg: "bg-red-50",    border: "border-red-200",    badge: "bg-red-100 text-red-700",      dot: "bg-red-500" },
};

interface SkinReport {
  predictedClass: string;
  confidence: number;
  allPredictions: Array<{ disease: string; probability: number }>;
  user: { name: string; age: string; gender: string };
  generatedAt: Date;
}

interface SkinAssessmentSectionProps {
  onReportReady?: (report: any) => void;
}

export function SkinAssessmentSection({ onReportReady }: SkinAssessmentSectionProps) {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [report, setReport] = useState<SkinReport | null>(null);

  const [userDetails, setUserDetails] = useState({
    name: "", email: "", age: "", gender: "",
  });
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
        method: "POST",
        headers: { "Content-Type": "application/json" },
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

  const sendImageToBackend = async () => {
    if (images.length === 0) {
      toast({ title: "No Image", description: "Please upload a skin image", variant: "destructive" });
      return null;
    }
    try {
      const formData = new FormData();
      formData.append("image", images[0].file);

      const res = await fetch(`${API_BASE_URL}/skin/upload-image`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Image upload failed");
      }

      const result = await res.json();
      toast({ title: "Image analyzed", description: `Detected: ${result.predicted_class}` });

      return {
        predictedClass: result.predicted_class,
        confidence: result.confidence,
        allPredictions: result.all_predictions,
      };
    } catch (error) {
      toast({ title: "Error", description: error instanceof Error ? error.message : "Image upload failed", variant: "destructive" });
      return null;
    }
  };

  /* ── STEP HANDLER ── */

  const handleNext = async () => {
    if (currentStep === 1) {
      setIsSubmitting(true);
      const success = await sendUserDetails();
      setIsSubmitting(false);
      if (success) setCurrentStep(2);
      return;
    }

    if (currentStep === 2) {
      setIsSubmitting(true);
      const result = await sendImageToBackend();
      if (!result) { setIsSubmitting(false); return; }

      const finalReport: SkinReport = {
        ...result,
        user: { name: userDetails.name, age: userDetails.age, gender: userDetails.gender },
        generatedAt: new Date(),
      };

      setReport(finalReport);
      onReportReady?.({ ...finalReport, cnn_result: result });
      setIsSubmitting(false);
      setCurrentStep(3);
    }
  };

  const handleBack = () => setCurrentStep((p) => p - 1);

  const handleReset = () => {
    setUserDetails({ name: "", email: "", age: "", gender: "" });
    setImages([]);
    setReport(null);
    setCurrentStep(1);
  };

  /* ── REPORT DISPLAY ── */

  const SkinReportDisplay = () => {
    if (!report) return null;
    const condition = SKIN_CONDITIONS[report.predictedClass] ?? { severity: "benign", description: "Condition detected. Please consult a dermatologist." };
    const colors = severityColors[condition.severity];
    const top5 = report.allPredictions.slice(0, 5);

    return (
      <div className="space-y-6">
        <div className="text-center">
          <p className="text-muted-foreground text-sm">Report generated for</p>
          <h3 className="text-2xl font-bold text-foreground">{report.user.name}</h3>
          <p className="text-muted-foreground text-sm">{report.user.gender} · Age {report.user.age} · {new Date(report.generatedAt).toLocaleDateString()}</p>
        </div>

        {/* Primary Result */}
        <div className={`rounded-2xl p-6 border ${colors.bg} ${colors.border}`}>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Primary Detection</p>
              <h4 className="text-2xl font-bold text-foreground">{report.predictedClass}</h4>
              <p className="text-muted-foreground text-sm mt-2 max-w-md">{condition.description}</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${colors.badge}`}>
                {condition.severity}
              </span>
              <span className="text-2xl font-bold text-foreground">
                {(report.confidence * 100).toFixed(1)}%
              </span>
              <p className="text-xs text-muted-foreground">confidence</p>
            </div>
          </div>
        </div>

        {/* Warning for serious conditions */}
        {(condition.severity === "malignant" || condition.severity === "precancerous") && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex gap-3">
            <span className="text-red-500 text-xl">⚠️</span>
            <div>
              <p className="font-semibold text-red-700 text-sm">Urgent: Please See a Doctor</p>
              <p className="text-red-600 text-sm mt-1">
                This result indicates a condition that requires professional medical evaluation.
                Please visit a dermatologist at a recognized hospital in Nepal as soon as possible.
                Suggested: TUTH Kathmandu, B&B Hospital Lalitpur, or Nepal Cancer Hospital.
              </p>
            </div>
          </div>
        )}

        {/* All Predictions */}
        <div className="bg-card rounded-xl border p-5">
          <h5 className="font-semibold text-foreground mb-4">All Detected Probabilities</h5>
          <div className="space-y-3">
            {top5.map((pred, i) => (
              <div key={pred.disease}>
                <div className="flex justify-between text-sm mb-1">
                  <span className={`font-medium ${i === 0 ? "text-foreground" : "text-muted-foreground"}`}>
                    {pred.disease}
                  </span>
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

        <Button onClick={handleReset} variant="outline" className="w-full">
          Start New Skin Assessment
        </Button>
      </div>
    );
  };

  /* ── UI ── */

  return (
    <section id="skin-assessment" className="py-20 md:py-32 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto bg-card rounded-2xl p-6 md:p-10 shadow-card border">

          {/* Section Header */}
          <div className="text-center mb-8">
            <span className="text-primary font-semibold text-sm uppercase tracking-wider">AI-Powered</span>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mt-2">🔬 Skin Analysis Test</h2>
            <p className="text-muted-foreground mt-2 text-sm">
              Upload a close-up photo of your skin lesion. Our CNN model will screen for 7 dermatoscopic conditions.
            </p>
          </div>

          {/* Step Indicators */}
          <div className="mb-8">
            <div className="flex justify-between items-center">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                        currentStep >= step.id
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-muted-foreground"
                      }`}
                    >
                      {step.id}
                    </div>
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
            {currentStep === 1 && (
              <UserDetailsForm
                data={userDetails}
                onChange={setUserDetails}
              />
            )}

            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-800">
                  <strong>📸 Photo Tips:</strong> Use a well-lit, close-up photo of the skin area.
                  Avoid blurry images. The clearer the photo, the more accurate the analysis.
                </div>
                <ImageUploadForm
                  images={images}
                  onChange={setImages}
                />
              </div>
            )}

            {currentStep === 3 && <SkinReportDisplay />}
          </AnimatePresence>

          {currentStep < 3 && (
            <div className="flex justify-between mt-8 pt-6 border-t">
              <Button
                variant="ghost"
                onClick={handleBack}
                disabled={currentStep === 1 || isSubmitting}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>

              <Button onClick={handleNext} disabled={isSubmitting}>
                {isSubmitting
                  ? "Analyzing..."
                  : currentStep === 2
                  ? "Analyze Skin"
                  : "Next"}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}