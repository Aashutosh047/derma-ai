import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { UserDetailsForm } from "./UserDetailsForm";
import { QuestionnaireForm } from "./QuestionnaireForm";
import { ImageUploadForm } from "./ImageUploadForm";
import { ReportDisplay } from "./ReportDisplay";
import { generateReport } from "@/lib/reportGenerator";
import {
  AssessmentData,
  HairHealthReport,
  initialUserDetails,
  initialQuestionnaire,
} from "@/types/assessment";
import { useToast } from "@/hooks/use-toast";

const steps = [
  { id: 1, title: "Your Details", description: "Basic information" },
  { id: 2, title: "Questionnaire", description: "Health & lifestyle" },
  { id: 3, title: "Upload Images", description: "Hair & scalp photos" },
  { id: 4, title: "Your Report", description: "Personalized results" },
];

const API_BASE_URL = "http://localhost:8000";

export function AssessmentSection() {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [report, setReport] = useState<HairHealthReport | null>(null);

  const [data, setData] = useState<AssessmentData>({
    userDetails: initialUserDetails,
    questionnaire: initialQuestionnaire,
    images: [],
  });

  /* -------------------- API CALLS -------------------- */

  const sendUserDetailsToBackend = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/user-details`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.userDetails.name,
          email: data.userDetails.email,
          age: parseInt(data.userDetails.age),
          gender: data.userDetails.gender,
        }),
      });

      if (!res.ok) throw new Error("Failed to save user details");

      toast({ title: "Success", description: "Your details have been saved" });
      return true;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save your details",
        variant: "destructive",
      });
      return false;
    }
  };

  const sendQuestionnaireToBackend = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/questionnaire`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data.questionnaire),
      });

      if (!res.ok) throw new Error("Failed to save questionnaire");

      toast({ title: "Success", description: "Questionnaire submitted" });
      return true;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save questionnaire",
        variant: "destructive",
      });
      return false;
    }
  };

  /**
   * 🔥 IMPORTANT:
   * This RETURNS ML data instead of saving it to React state
   */
  const sendImageToBackend = async () => {
    if (data.images.length === 0) {
      toast({
        title: "No Image",
        description: "Please upload at least one image",
        variant: "destructive",
      });
      return null;
    }

    try {
      const formData = new FormData();
      formData.append("image", data.images[0].file);

      const res = await fetch(`${API_BASE_URL}/upload-image`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Image upload failed");
      }

      const result = await res.json();

      toast({
        title: "Image analyzed",
        description: `Detected: ${result.predicted_class}`,
      });

      return {
        predictedClass: result.predicted_class,
        predictedProbability: result.predicted_probability,
        allClassProbabilities: result.all_class_probabilities,
        allPredictions: result.all_predictions,
      };
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Image upload failed",
        variant: "destructive",
      });
      return null;
    }
  };

  /* -------------------- STEP HANDLER -------------------- */

  const handleNext = async () => {
    if (currentStep === 1) {
      setIsSubmitting(true);
      const success = await sendUserDetailsToBackend();
      setIsSubmitting(false);
      if (success) setCurrentStep(2);
      return;
    }

    if (currentStep === 2) {
      setIsSubmitting(true);
      const success = await sendQuestionnaireToBackend();
      setIsSubmitting(false);
      if (success) setCurrentStep(3);
      return;
    }

    if (currentStep === 3) {
      setIsSubmitting(true);

      const mlData = await sendImageToBackend();
      if (!mlData) {
        setIsSubmitting(false);
        return;
      }

      const baseReport = generateReport(data.questionnaire);

      const finalReport: HairHealthReport = {
        ...baseReport,
        generatedAt: new Date(),
        ...mlData, // ✅ ML DATA MERGED HERE (FIX)
      };

      console.log("FINAL REPORT:", finalReport);

      setReport(finalReport);
      setIsSubmitting(false);
      setCurrentStep(4);
    }
  };

  const handleBack = () => setCurrentStep((p) => p - 1);

  const handleReset = () => {
    setData({
      userDetails: initialUserDetails,
      questionnaire: initialQuestionnaire,
      images: [],
    });
    setReport(null);
    setCurrentStep(1);
  };

  /* -------------------- UI -------------------- */

  return (
    <section id="assessment" className="py-20 md:py-32 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto bg-card rounded-2xl p-6 md:p-10 shadow-card border">
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
                    <p className="text-xs mt-2 text-center text-muted-foreground">
                      {step.title}
                    </p>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`h-1 flex-1 mx-2 ${
                        currentStep > step.id ? "bg-primary" : "bg-secondary"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          <AnimatePresence mode="wait">
            {currentStep === 1 && (
              <UserDetailsForm
                data={data.userDetails}
                onChange={(userDetails) =>
                  setData({ ...data, userDetails })
                }
              />
            )}

            {currentStep === 2 && (
              <QuestionnaireForm
                data={data.questionnaire}
                onChange={(questionnaire) =>
                  setData({ ...data, questionnaire })
                }
              />
            )}

            {currentStep === 3 && (
              <ImageUploadForm
                images={data.images}
                onChange={(images) => setData({ ...data, images })}
              />
            )}

            {currentStep === 4 && report && (
              <ReportDisplay
                report={report}
                images={data.images}
                onReset={handleReset}
              />
            )}
          </AnimatePresence>

          {currentStep < 4 && (
            <div className="flex justify-between mt-8 pt-6 border-t">
              <Button
                variant="ghost"
                onClick={handleBack}
                disabled={currentStep === 1 || isSubmitting}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>

              <Button
                onClick={handleNext}
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? "Processing..."
                  : currentStep === 3
                  ? "Generate Report"
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
