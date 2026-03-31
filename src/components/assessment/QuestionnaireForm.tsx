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
          className="flex flex-wrap gap-3"
        >
          {[
            { value: "low",    label: "Low (minimal shedding)" },
            { value: "medium", label: "Medium (noticeable)" },
            { value: "high",   label: "High (significant)" },
          ].map((option) => (
            <div key={option.value}>
              <RadioGroupItem value={option.value} id={`hairfall-${option.value}`} className="sr-only peer" />
              <Label
                htmlFor={`hairfall-${option.value}`}
                className="cursor-pointer px-4 py-2 rounded-lg border text-sm font-medium transition-all
                  border-border bg-secondary/50 text-muted-foreground
                  peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-primary-foreground peer-data-[state=checked]:border-primary
                  hover:border-primary/50"
              >
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
          className="flex gap-3"
        >
          {[{ value: "yes", label: "Yes" }, { value: "no", label: "No" }].map((option) => (
            <div key={option.value}>
              <RadioGroupItem value={option.value} id={`family-${option.value}`} className="sr-only peer" />
              <Label
                htmlFor={`family-${option.value}`}
                className="cursor-pointer px-4 py-2 rounded-lg border text-sm font-medium transition-all
                  border-border bg-secondary/50 text-muted-foreground
                  peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-primary-foreground peer-data-[state=checked]:border-primary
                  hover:border-primary/50"
              >
                {option.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      {/* Stress Level */}
      <div className="space-y-3">
        <Label className="text-base font-semibold">What is your current stress level?</Label>
        <RadioGroup
          value={data.stressLevel}
          onValueChange={(value) => handleChange("stressLevel", value as QuestionnaireData["stressLevel"])}
          className="flex flex-wrap gap-3"
        >
          {[{ value: "low", label: "Low" }, { value: "moderate", label: "Moderate" }, { value: "high", label: "High" }].map((option) => (
            <div key={option.value}>
              <RadioGroupItem value={option.value} id={`stress-${option.value}`} className="sr-only peer" />
              <Label
                htmlFor={`stress-${option.value}`}
                className="cursor-pointer px-4 py-2 rounded-lg border text-sm font-medium transition-all
                  border-border bg-secondary/50 text-muted-foreground
                  peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-primary-foreground peer-data-[state=checked]:border-primary
                  hover:border-primary/50"
              >
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
          <SelectTrigger className="rounded-xl border-border bg-secondary/30 focus:border-primary">
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
          <SelectTrigger className="rounded-xl border-border bg-secondary/30 focus:border-primary">
            <SelectValue placeholder="Select sleep duration" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="less_than_5">Less than 5 hours</SelectItem>
            <SelectItem value="5_to_7">5–7 hours</SelectItem>
            <SelectItem value="7_to_9">7–9 hours</SelectItem>
            <SelectItem value="more_than_9">More than 9 hours</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Scalp Issues */}
      <div className="space-y-3">
        <Label className="text-base font-semibold">Do you experience any scalp issues?</Label>
        <div className="flex flex-wrap gap-3">
          {[
            { id: "itching",  field: "scalpItching"  as const, label: "Itching" },
            { id: "dandruff", field: "scalpDandruff" as const, label: "Dandruff" },
            { id: "redness",  field: "scalpRedness"  as const, label: "Redness" },
          ].map((item) => (
            <div key={item.id}>
              <Checkbox
                id={item.id}
                checked={data[item.field]}
                onCheckedChange={(checked) => handleChange(item.field, checked === true)}
                className="sr-only peer"
              />
              <Label
                htmlFor={item.id}
                className="cursor-pointer px-4 py-2 rounded-lg border text-sm font-medium transition-all
                  border-border bg-secondary/50 text-muted-foreground
                  peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-primary-foreground peer-data-[state=checked]:border-primary
                  hover:border-primary/50"
              >
                {item.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Hair Wash Frequency */}
      <div className="space-y-3">
        <Label className="text-base font-semibold">How often do you wash your hair?</Label>
        <Select
          value={data.hairWashFrequency}
          onValueChange={(value) => handleChange("hairWashFrequency", value as QuestionnaireData["hairWashFrequency"])}
        >
          <SelectTrigger className="rounded-xl border-border bg-secondary/30 focus:border-primary">
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
        <div className="flex flex-wrap gap-3">
          {[
            { id: "heat",     field: "useHeatStyling"       as const, label: "Heat styling tools" },
            { id: "chemical", field: "useChemicalTreatments" as const, label: "Chemical treatments (coloring, perms)" },
          ].map((item) => (
            <div key={item.id}>
              <Checkbox
                id={item.id}
                checked={data[item.field]}
                onCheckedChange={(checked) => handleChange(item.field, checked === true)}
                className="sr-only peer"
              />
              <Label
                htmlFor={item.id}
                className="cursor-pointer px-4 py-2 rounded-lg border text-sm font-medium transition-all
                  border-border bg-secondary/50 text-muted-foreground
                  peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-primary-foreground peer-data-[state=checked]:border-primary
                  hover:border-primary/50"
              >
                {item.label}
              </Label>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}