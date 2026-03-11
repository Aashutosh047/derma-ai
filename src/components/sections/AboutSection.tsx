import { motion } from "framer-motion";
import { Target, Eye, Heart } from "lucide-react";

export function AboutSection() {
  return (
    <section id="about" className="py-20 md:py-32 bg-secondary/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-primary font-semibold text-sm uppercase tracking-wider">About Us</span>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mt-2 mb-4">
            Our Mission
          </h2>
        </motion.div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-card rounded-2xl p-8 shadow-card border border-border/50 text-center"
          >
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <Target className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-4">Our Goal</h3>
            <p className="text-muted-foreground leading-relaxed">
              To democratize access to hair health assessment, making professional-grade 
              insights available to everyone from the comfort of their home.
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-card rounded-2xl p-8 shadow-card border border-border/50 text-center"
          >
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <Eye className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-4">Our Vision</h3>
            <p className="text-muted-foreground leading-relaxed">
              A world where early detection and proactive care prevent hair health issues 
              before they become serious, empowering individuals with knowledge.
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-card rounded-2xl p-8 shadow-card border border-border/50 text-center"
          >
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <Heart className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-4">Our Values</h3>
            <p className="text-muted-foreground leading-relaxed">
              Privacy-first approach, evidence-based recommendations, and continuous 
              improvement driven by user feedback and scientific research.
            </p>
          </motion.div>
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 bg-card rounded-2xl p-8 md:p-12 shadow-card border border-border/50"
        >
          <div className="max-w-3xl mx-auto text-center">
            <h3 className="text-2xl font-bold text-foreground mb-4">
              Why Choose HairHealth?
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Hair health is often overlooked until problems become visible. Our platform 
              combines cutting-edge technology with holistic health assessment to give you 
              early insights into your hair and scalp condition. Whether you're experiencing 
              hair fall, scalp issues, or just want to maintain healthy hair, we're here to help.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Our assessment considers multiple factors including genetics, lifestyle, diet, 
              stress levels, and visual analysis to provide you with a comprehensive understanding 
              of your hair health status and personalized recommendations for improvement.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
