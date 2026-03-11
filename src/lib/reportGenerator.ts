import { QuestionnaireData, HairHealthReport } from "@/types/assessment";

export function generateReport(questionnaire: QuestionnaireData): HairHealthReport {
  let riskScore = 0;
  const possibleCauses: string[] = [];
  const recommendations: string[] = [];
  
  // Hair fall severity scoring
  if (questionnaire.hairFallSeverity === "high") {
    riskScore += 30;
    possibleCauses.push("Significant hair shedding observed");
  } else if (questionnaire.hairFallSeverity === "medium") {
    riskScore += 15;
    possibleCauses.push("Moderate hair shedding pattern");
  }
  
  // Family history
  if (questionnaire.familyHistory === "yes") {
    riskScore += 20;
    possibleCauses.push("Genetic predisposition (family history of hair loss)");
    recommendations.push("Consider early intervention strategies as genetic factors may be involved");
  }
  
  // Stress level impact
  if (questionnaire.stressLevel === "high") {
    riskScore += 15;
    possibleCauses.push("High stress levels affecting hair health");
    recommendations.push("Practice stress management techniques like meditation, yoga, or regular exercise");
  } else if (questionnaire.stressLevel === "moderate") {
    riskScore += 8;
  }
  
  // Diet quality
  if (questionnaire.dietQuality === "poor") {
    riskScore += 15;
    possibleCauses.push("Nutritional deficiencies from poor diet");
    recommendations.push("Improve diet with protein-rich foods, iron, zinc, and biotin sources");
  } else if (questionnaire.dietQuality === "average") {
    riskScore += 5;
    recommendations.push("Consider adding more nutrient-dense foods for hair health");
  }
  
  // Sleep duration
  if (questionnaire.sleepDuration === "less_than_5") {
    riskScore += 12;
    possibleCauses.push("Insufficient sleep affecting hair growth cycle");
    recommendations.push("Aim for 7-9 hours of quality sleep per night");
  } else if (questionnaire.sleepDuration === "5_to_7") {
    riskScore += 5;
  }
  
  // Scalp conditions
  let scalpIssueCount = 0;
  if (questionnaire.scalpItching) {
    scalpIssueCount++;
    possibleCauses.push("Scalp irritation/itching present");
  }
  if (questionnaire.scalpDandruff) {
    scalpIssueCount++;
    possibleCauses.push("Dandruff condition detected");
  }
  if (questionnaire.scalpRedness) {
    scalpIssueCount++;
    possibleCauses.push("Scalp inflammation/redness observed");
  }
  
  if (scalpIssueCount > 0) {
    riskScore += scalpIssueCount * 8;
    recommendations.push("Consider using a gentle, medicated shampoo for scalp health");
    if (scalpIssueCount >= 2) {
      recommendations.push("Consult a dermatologist for persistent scalp issues");
    }
  }
  
  // Hair care habits
  if (questionnaire.useHeatStyling) {
    riskScore += 5;
    possibleCauses.push("Regular heat styling causing damage");
    recommendations.push("Reduce heat styling frequency and use heat protectant products");
  }
  
  if (questionnaire.useChemicalTreatments) {
    riskScore += 8;
    possibleCauses.push("Chemical treatments weakening hair structure");
    recommendations.push("Space out chemical treatments and use deep conditioning regularly");
  }
  
  // Determine risk level
  let overallRiskLevel: "low" | "medium" | "high";
  if (riskScore >= 50) {
    overallRiskLevel = "high";
  } else if (riskScore >= 25) {
    overallRiskLevel = "medium";
  } else {
    overallRiskLevel = "low";
  }
  
  // Determine lifestyle impact
  const lifestyleFactors = 
    (questionnaire.stressLevel === "high" ? 2 : questionnaire.stressLevel === "moderate" ? 1 : 0) +
    (questionnaire.dietQuality === "poor" ? 2 : questionnaire.dietQuality === "average" ? 1 : 0) +
    (questionnaire.sleepDuration === "less_than_5" ? 2 : questionnaire.sleepDuration === "5_to_7" ? 1 : 0);
  
  let lifestyleImpact: "low" | "moderate" | "significant";
  if (lifestyleFactors >= 4) {
    lifestyleImpact = "significant";
  } else if (lifestyleFactors >= 2) {
    lifestyleImpact = "moderate";
  } else {
    lifestyleImpact = "low";
  }
  
  // General recommendations based on risk level
  if (overallRiskLevel === "low") {
    recommendations.push("Maintain your current healthy habits");
    recommendations.push("Regular scalp massage can promote blood circulation");
  } else if (overallRiskLevel === "medium") {
    recommendations.push("Monitor changes in hair fall patterns over the next few months");
    recommendations.push("Consider a hair health supplement after consulting a healthcare provider");
  } else {
    recommendations.push("Schedule an appointment with a dermatologist or trichologist");
    recommendations.push("Document your hair condition with regular photos for tracking");
  }
  
  return {
    overallRiskLevel,
    riskScore: Math.min(riskScore, 100),
    possibleCauses: possibleCauses.length > 0 ? possibleCauses : ["No significant concerns identified"],
    recommendations,
    lifestyleImpact,
    scalpHealthWarning: scalpIssueCount >= 2,
    generatedAt: new Date(),
  };
}
