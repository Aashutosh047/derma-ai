import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Shield, Zap, Microscope, Hair } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center gradient-hero overflow-hidden pt-20">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-6"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-medium text-sm">
              <Sparkles className="w-4 h-4" />
              AI-Powered Skin & Hair Analysis
            </span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-tight"
          >
            Understand Your{" "}
            <span className="text-primary">Skin & Hair</span>{" "}
            Like Never Before
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto"
          >
            Get personalized AI-powered insights about your skin and hair conditions.
            Choose your assessment below — simple, private, and actionable.
          </motion.p>

          {/* Two Test Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-stretch justify-center gap-6 mb-8 max-w-2xl mx-auto"
          >
            {/* Hair Test Card */}
            <a
              href="#hair-assessment"
              className="group flex-1 bg-card border border-border/50 hover:border-primary/50 rounded-2xl p-6 shadow-card hover:shadow-lg transition-all duration-300 text-left cursor-pointer"
            >
              <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl">🧴</span>
              </div>
              <h3 className="font-bold text-foreground text-lg mb-2">Hair Health Test</h3>
              <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
                Upload a scalp photo + answer a lifestyle questionnaire. Our fusion model
                analyzes both to detect 10 hair & scalp conditions.
              </p>
              <div className="flex items-center gap-2 text-primary font-semibold text-sm">
                Start Hair Test
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </a>

            {/* Skin Test Card */}
            <a
              href="#skin-assessment"
              className="group flex-1 bg-card border border-border/50 hover:border-primary/50 rounded-2xl p-6 shadow-card hover:shadow-lg transition-all duration-300 text-left cursor-pointer"
            >
              <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl">🔬</span>
              </div>
              <h3 className="font-bold text-foreground text-lg mb-2">Skin Analysis Test</h3>
              <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
                Upload a skin lesion photo. Our CNN model screens for 7 dermatoscopic
                conditions including Melanoma and Basal Cell Carcinoma.
              </p>
              <div className="flex items-center gap-2 text-primary font-semibold text-sm">
                Start Skin Test
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </a>
          </motion.div>

          {/* Learn More */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Button variant="outline" size="lg" asChild>
              <a href="#features">Learn More</a>
            </Button>
          </motion.div>

          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-12 flex flex-wrap items-center justify-center gap-8"
          >
            <div className="flex items-center gap-2 text-muted-foreground">
              <Shield className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium">100% Private</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Zap className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium">Instant Results</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Sparkles className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium">Personalized Report</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Microscope className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium">AI-Powered</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}