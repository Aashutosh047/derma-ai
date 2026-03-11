import { motion } from "framer-motion";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { QuestionnaireData } from "@/types/assessment";

interface QuestionnaireFormProps {
  data: QuestionnaireData;
  onChange: (data: QuestionnaireData) => void;
}

export function QuestionnaireForm({ data, onChange }: QuestionnaireFormProps) {
  const handleChange = <K extends keyof QuestionnaireData>(field: K, value: QuestionnaireData[K]) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8"
    >
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-foreground mb-2">Health Questionnaire</h3>
        <p className="text-muted-foreground">Help us understand your hair health better</p>
      </div>
      
      {/* Hair Fall Severity */}
      <div className="space-y-3">
        <Label className="text-base font-semibold">How would you rate your hair fall severity?</Label>
        <RadioGroup
          value={data.hairFallSeverity}
          onValueChange={(value) => handleChange("hairFallSeverity", value as QuestionnaireData["hairFallSeverity"])}
          className="flex flex-wrap gap-4"
        >
          {[
            { value: "low", label: "Low (minimal shedding)" },
            { value: "medium", label: "Medium (noticeable)" },
            { value: "high", label: "High (significant)" },
          ].map((option) => (
            <div key={option.value} className="flex items-center space-x-2">
              <RadioGroupItem value={option.value} id={`hairfall-${option.value}`} />
              <Label htmlFor={`hairfall-${option.value}`} className="font-normal cursor-pointer">
                {option.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>
      
      {/* Family History */}
      <div className="space-y-3">
        <Label className="text-base font-semibold">Do you have a family history of hair loss?</Label>
        <RadioGroup
          value={data.familyHistory}
          onValueChange={(value) => handleChange("familyHistory", value as QuestionnaireData["familyHistory"])}
          className="flex gap-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="yes" id="family-yes" />
            <Label htmlFor="family-yes" className="font-normal cursor-pointer">Yes</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="no" id="family-no" />
            <Label htmlFor="family-no" className="font-normal cursor-pointer">No</Label>
          </div>
        </RadioGroup>
      </div>
      
      {/* Stress Level */}
      <div className="space-y-3">
        <Label className="text-base font-semibold">What is your current stress level?</Label>
        <RadioGroup
          value={data.stressLevel}
          onValueChange={(value) => handleChange("stressLevel", value as QuestionnaireData["stressLevel"])}
          className="flex flex-wrap gap-4"
        >
          {[
            { value: "low", label: "Low" },
            { value: "moderate", label: "Moderate" },
            { value: "high", label: "High" },
          ].map((option) => (
            <div key={option.value} className="flex items-center space-x-2">
              <RadioGroupItem value={option.value} id={`stress-${option.value}`} />
              <Label htmlFor={`stress-${option.value}`} className="font-normal cursor-pointer">
                {option.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>
      
      {/* Diet Quality */}
      <div className="space-y-3">
        <Label className="text-base font-semibold">How would you rate your diet quality?</Label>
        <Select 
          value={data.dietQuality} 
          onValueChange={(value) => handleChange("dietQuality", value as QuestionnaireData["dietQuality"])}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select diet quality" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="poor">Poor (irregular meals, low nutrients)</SelectItem>
            <SelectItem value="average">Average (somewhat balanced)</SelectItem>
            <SelectItem value="good">Good (balanced, regular meals)</SelectItem>
            <SelectItem value="excellent">Excellent (nutrient-rich, well-planned)</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {/* Sleep Duration */}
      <div className="space-y-3">
        <Label className="text-base font-semibold">How many hours do you sleep on average?</Label>
        <Select 
          value={data.sleepDuration} 
          onValueChange={(value) => handleChange("sleepDuration", value as QuestionnaireData["sleepDuration"])}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select sleep duration" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="less_than_5">Less than 5 hours</SelectItem>
            <SelectItem value="5_to_7">5-7 hours</SelectItem>
            <SelectItem value="7_to_9">7-9 hours</SelectItem>
            <SelectItem value="more_than_9">More than 9 hours</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {/* Scalp Issues */}
      <div className="space-y-3">
        <Label className="text-base font-semibold">Do you experience any scalp issues?</Label>
        <div className="flex flex-wrap gap-6">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="itching"
              checked={data.scalpItching}
              onCheckedChange={(checked) => handleChange("scalpItching", checked === true)}
            />
            <Label htmlFor="itching" className="font-normal cursor-pointer">Itching</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="dandruff"
              checked={data.scalpDandruff}
              onCheckedChange={(checked) => handleChange("scalpDandruff", checked === true)}
            />
            <Label htmlFor="dandruff" className="font-normal cursor-pointer">Dandruff</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="redness"
              checked={data.scalpRedness}
              onCheckedChange={(checked) => handleChange("scalpRedness", checked === true)}
            />
            <Label htmlFor="redness" className="font-normal cursor-pointer">Redness</Label>
          </div>
        </div>
      </div>
      
      {/* Hair Wash Frequency */}
      <div className="space-y-3">
        <Label className="text-base font-semibold">How often do you wash your hair?</Label>
        <Select 
          value={data.hairWashFrequency} 
          onValueChange={(value) => handleChange("hairWashFrequency", value as QuestionnaireData["hairWashFrequency"])}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select frequency" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">Daily</SelectItem>
            <SelectItem value="every_other_day">Every other day</SelectItem>
            <SelectItem value="twice_weekly">Twice a week</SelectItem>
            <SelectItem value="weekly">Once a week</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {/* Hair Care Habits */}
      <div className="space-y-3">
        <Label className="text-base font-semibold">Hair care habits</Label>
        <div className="flex flex-wrap gap-6">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="heat"
              checked={data.useHeatStyling}
              onCheckedChange={(checked) => handleChange("useHeatStyling", checked === true)}
            />
            <Label htmlFor="heat" className="font-normal cursor-pointer">I use heat styling tools regularly</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="chemical"
              checked={data.useChemicalTreatments}
              onCheckedChange={(checked) => handleChange("useChemicalTreatments", checked === true)}
            />
            <Label htmlFor="chemical" className="font-normal cursor-pointer">I use chemical treatments (coloring, perms)</Label>
          </div>
        </div>
      </div>
    </motion.div>
  );
}