import { motion } from "framer-motion";
import { Camera, ClipboardList, Home, Brain, Microscope, ShieldCheck } from "lucide-react";

const features = [
  {
    icon: Camera,
    title: "AI Image Analysis",
    description: "Upload photos of your hair, scalp, or skin for comprehensive visual assessment. Our CNN models identify patterns and detect potential conditions with high accuracy.",
  },
  {
    icon: Brain,
    title: "Multimodal Fusion",
    description: "For hair assessments, we combine visual CNN analysis with lifestyle questionnaire data using a 70/30 fusion model for a more accurate diagnosis.",
  },
  {
    icon: Microscope,
    title: "Dual Assessment Modes",
    description: "Choose between a full Hair Health Test (image + questionnaire) or a quick Skin Analysis Test (image only) — each powered by its own specialized AI model.",
  },
  {
    icon: ClipboardList,
    title: "Interactive Questionnaire",
    description: "Answer targeted questions about your lifestyle, habits, and symptoms to help our hair model understand your unique situation beyond what the image shows.",
  },
  {
    icon: Home,
    title: "At-home Accessibility",
    description: "No clinic visits needed. Complete the entire assessment from the comfort of your home, anytime you want, on any device.",
  },
  {
    icon: ShieldCheck,
    title: "Private & Secure",
    description: "Your images and health data are processed securely and never stored permanently. Your privacy is our priority at every step of the assessment.",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 md:py-32 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-primary font-semibold text-sm uppercase tracking-wider">Features</span>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mt-2 mb-4">
            Comprehensive Skin & Hair Assessment
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Our multi-faceted approach combines visual AI analysis with lifestyle factors
            to provide you with accurate, actionable dermatological insights.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group relative bg-card rounded-2xl p-8 shadow-card hover:shadow-lg transition-all duration-300 border border-border/50"
            >
              <div className="w-14 h-14 rounded-xl gradient-primary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <feature.icon className="w-7 h-7 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}