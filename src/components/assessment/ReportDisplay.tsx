import { motion } from "framer-motion";
import {
  AlertTriangle,
  CheckCircle,
  AlertCircle,
  Heart,
  TrendingUp,
  Lightbulb,
  Activity,
  Brain,
  BarChart3,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { HairHealthReport, UploadedImage, imageLabels } from "@/types/assessment";
import { downloadHairReportPDF } from "@/lib/pdfGenerator";

interface ReportDisplayProps {
  report: HairHealthReport;
  images: UploadedImage[];
  onReset: () => void;
}

export function ReportDisplay({ report, images, onReset }: ReportDisplayProps) {
  const getRiskColor = (level: string) => {
    switch (level) {
      case "low":    return "text-green-600 bg-green-100";
      case "medium": return "text-yellow-600 bg-yellow-100";
      case "high":   return "text-red-600 bg-red-100";
      default:       return "text-muted-foreground bg-secondary";
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case "low":    return <CheckCircle className="w-6 h-6" />;
      case "medium": return <AlertCircle className="w-6 h-6" />;
      case "high":   return <AlertTriangle className="w-6 h-6" />;
      default:       return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="text-center">
        <h3 className="text-2xl font-bold text-foreground mb-2">
          Your Hair Health Report
        </h3>
        <p className="text-muted-foreground">
          Generated on {report.generatedAt.toLocaleDateString()}
        </p>
      </div>

      {/* ── AI PREDICTION ── */}
      {report.predictedClass && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-primary/10 via-primary/5 to-background rounded-2xl p-6 shadow-lg border-2 border-primary/20"
        >
          <h4 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            AI Scalp Condition Analysis
          </h4>

          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Predicted Condition</p>
                <p className="text-2xl font-bold text-foreground">{report.predictedClass}</p>
              </div>
              {report.predictedProbability !== undefined && (
                <div className="text-right">
                  <p className="text-sm text-muted-foreground mb-1">Confidence</p>
                  <p className="text-3xl font-bold text-primary">
                    {(report.predictedProbability * 100).toFixed(1)}%
                  </p>
                </div>
              )}
            </div>

            {report.predictedProbability !== undefined && (
              <div className="relative h-3 bg-secondary rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${report.predictedProbability * 100}%` }}
                  transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
                  className="absolute left-0 top-0 h-full bg-gradient-to-r from-primary to-primary/70 rounded-full"
                />
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* ── ALL PREDICTIONS ── */}
      {report.allPredictions && report.allPredictions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card rounded-2xl p-6 shadow-card border border-border/50"
        >
          <h4 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            All Condition Probabilities
          </h4>

          <div className="space-y-3">
            {report.allPredictions.slice(0, 5).map((pred, index) => (
              <motion.div
                key={pred.disease}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">{pred.disease}</span>
                  <span className="text-sm font-bold text-primary">
                    {(pred.probability * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="relative h-2 bg-secondary rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pred.probability * 100}%` }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: 0.5 + index * 0.1 }}
                    className={`absolute left-0 top-0 h-full rounded-full ${
                      index === 0
                        ? "bg-gradient-to-r from-primary to-primary/70"
                        : "bg-gradient-to-r from-primary/60 to-primary/30"
                    }`}
                  />
                </div>
              </motion.div>
            ))}
          </div>
          {report.allPredictions.length > 5 && (
            <p className="text-xs text-muted-foreground mt-4 text-center">
              Showing top 5 of {report.allPredictions.length} conditions analyzed
            </p>
          )}
        </motion.div>
      )}

      {/* ── RISK LEVEL ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-card rounded-2xl p-6 shadow-card border border-border/50"
      >
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-foreground">Overall Risk Level</h4>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${getRiskColor(report.overallRiskLevel)}`}>
            {getRiskIcon(report.overallRiskLevel)}
            <span className="font-semibold capitalize">{report.overallRiskLevel}</span>
          </div>
        </div>

        <div className="relative h-4 bg-secondary rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${report.riskScore}%` }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.5 }}
            className={`absolute left-0 top-0 h-full rounded-full ${
              report.riskScore >= 50 ? "bg-red-500"
              : report.riskScore >= 25 ? "bg-yellow-500"
              : "bg-green-500"
            }`}
          />
        </div>
        <p className="text-sm text-muted-foreground mt-2">Risk Score: {report.riskScore}/100</p>
      </motion.div>

      {/* ── UPLOADED IMAGES ── */}
      {images.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-card rounded-2xl p-6 shadow-card border border-border/50"
        >
          <h4 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Heart className="w-5 h-5 text-primary" />
            Submitted Images
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {images.map((image) => (
              <div key={image.id} className="space-y-2">
                <img
                  src={image.preview}
                  alt={imageLabels[image.label]}
                  className="w-full aspect-square object-cover rounded-xl border-2 border-border"
                />
                <p className="text-xs text-center text-muted-foreground">{imageLabels[image.label]}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ── LIFESTYLE IMPACT ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-card rounded-2xl p-6 shadow-card border border-border/50"
      >
        <h4 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          Lifestyle Impact Assessment
        </h4>
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${
          report.lifestyleImpact === "significant" ? "bg-red-100 text-red-600"
          : report.lifestyleImpact === "moderate" ? "bg-yellow-100 text-yellow-600"
          : "bg-green-100 text-green-600"
        }`}>
          <span className="font-medium capitalize">{report.lifestyleImpact} Impact</span>
        </div>

        {report.scalpHealthWarning && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
              <p className="text-sm text-yellow-800">
                <strong>Scalp Health Warning:</strong> Multiple scalp issues detected. Consider consulting a dermatologist.
              </p>
            </div>
          </div>
        )}
      </motion.div>

      {/* ── IDENTIFIED FACTORS ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-card rounded-2xl p-6 shadow-card border border-border/50"
      >
        <h4 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-primary" />
          Identified Factors
        </h4>
        <ul className="space-y-2">
          {report.possibleCauses.map((cause, index) => (
            <motion.li
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 + index * 0.05 }}
              className="flex items-start gap-3"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-2" />
              <span className="text-muted-foreground">{cause}</span>
            </motion.li>
          ))}
        </ul>
      </motion.div>

      {/* ── RECOMMENDATIONS ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="bg-card rounded-2xl p-6 shadow-card border border-border/50"
      >
        <h4 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-primary" />
          Recommendations
        </h4>
        <ul className="space-y-3">
          {report.recommendations.map((rec, index) => (
            <motion.li
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.9 + index * 0.05 }}
              className="flex items-start gap-3 p-3 bg-secondary/30 rounded-xl"
            >
              <span className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold shrink-0">
                {index + 1}
              </span>
              <span className="text-foreground">{rec}</span>
            </motion.li>
          ))}
        </ul>
      </motion.div>

      {/* ── DISCLAIMER ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="bg-secondary/50 rounded-xl p-4 border border-border/50"
      >
        <p className="text-sm text-muted-foreground text-center">
          <strong>Disclaimer:</strong> This report is AI-assisted and provides general guidance only.
          It is not a substitute for professional medical advice. Please consult a dermatologist for
          accurate diagnosis and treatment.
        </p>
      </motion.div>

      {/* ── ACTION BUTTONS ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1 }}
        className="flex flex-col sm:flex-row gap-3 justify-center"
      >
        <Button
          size="lg"
          onClick={() => downloadHairReportPDF(report)}
          className="gap-2"
        >
          <Download className="w-4 h-4" />
          Download PDF Report
        </Button>
        <Button variant="outline" size="lg" onClick={onReset}>
          Take Another Assessment
        </Button>
      </motion.div>
    </motion.div>
  );
}