import { motion } from "framer-motion";
import { Target, Eye, Heart, Stethoscope } from "lucide-react";

const doctors = [
  {
    name: "Dr. Sushila Thapa",
    title: "Senior Dermatologist, Tribhuvan University Teaching Hospital, Kathmandu",
    quote:
      "Early detection of scalp conditions like Alopecia Areata and Seborrheic Dermatitis significantly improves treatment outcomes. Tools like DermAI help Nepali patients come prepared with useful preliminary information before visiting a specialist.",
    avatar: "ST",
  },
  {
    name: "Dr. Rajendra Pradhan",
    title: "Trichologist & Skin Specialist, B&B Hospital, Lalitpur",
    quote:
      "Hair loss in Nepal is often dismissed as a lifestyle issue when it can indicate deeper conditions. The combination of image analysis and lifestyle data in DermAI captures the complexity that a simple consultation might miss.",
    avatar: "RP",
  },
  {
    name: "Dr. Anita Shrestha",
    title: "Dermatologist, Nepal Cancer Hospital & Research Centre, Lalitpur",
    quote:
      "Skin cancer awareness in Nepal is still low. AI-assisted tools that flag conditions like Melanoma or Basal Cell Carcinoma for further review are a valuable first step in encouraging people to seek timely medical attention.",
    avatar: "AS",
  },
];

export function AboutSection() {
  return (
    <section id="about" className="py-20 md:py-32 bg-secondary/30">
      <div className="container mx-auto px-4">

        {/* ── Mission Header ── */}
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

        {/* ── Mission Cards ── */}
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
              To democratize access to dermatological assessment across Nepal, making
              professional-grade skin and hair insights available to everyone — from
              Kathmandu to remote communities.
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
              A Nepal where early detection and proactive care prevent skin and hair
              conditions before they become serious — empowering individuals with
              knowledge and awareness regardless of their location.
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
              improvement driven by user feedback and scientific research — built for
              the Nepali context.
            </p>
          </motion.div>
        </div>

        {/* ── Why DermAI ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 bg-card rounded-2xl p-8 md:p-12 shadow-card border border-border/50"
        >
          <div className="max-w-3xl mx-auto text-center">
            <h3 className="text-2xl font-bold text-foreground mb-4">
              Why Choose DermAI?
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Access to dermatologists in Nepal is limited — with most specialists
              concentrated in Kathmandu. DermAI bridges this gap by combining
              cutting-edge AI image analysis with holistic health assessment, giving
              you early insights into your skin and hair conditions before you even
              step into a clinic.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Our hair assessment considers genetics, lifestyle, diet, stress levels,
              and visual analysis through a proven 70/30 fusion model. Our skin
              assessment uses a CNN trained on thousands of dermatoscopic images to
              detect conditions ranging from benign moles to early-stage skin cancers —
              all from a photo taken at home.
            </p>
          </div>
        </motion.div>

        {/* ── Doctor Recommendations ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mt-24 mb-12"
        >
          <span className="text-primary font-semibold text-sm uppercase tracking-wider">Expert Voices</span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-2 mb-4">
            What Nepali Doctors Say
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Leading dermatologists and skin specialists across Nepal share their
            perspective on AI-assisted dermatological screening.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {doctors.map((doc, index) => (
            <motion.div
              key={doc.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              className="bg-card rounded-2xl p-8 shadow-card border border-border/50 flex flex-col gap-6"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full gradient-primary flex items-center justify-center flex-shrink-0">
                  <span className="text-primary-foreground font-bold text-sm">{doc.avatar}</span>
                </div>
                <div>
                  <p className="font-bold text-foreground">{doc.name}</p>
                  <p className="text-muted-foreground text-xs leading-snug">{doc.title}</p>
                </div>
              </div>
              <div className="relative">
                <span className="absolute -top-2 -left-1 text-primary text-4xl leading-none font-serif">"</span>
                <p className="text-muted-foreground leading-relaxed text-sm pt-4 pl-4 italic">
                  {doc.quote}
                </p>
              </div>
              <div className="flex items-center gap-2 mt-auto">
                <Stethoscope className="w-4 h-4 text-primary" />
                <span className="text-xs text-primary font-medium">Verified Medical Professional</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ── Disclaimer ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-12 bg-primary/5 border border-primary/20 rounded-2xl p-6 text-center max-w-3xl mx-auto"
        >
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">Important: </span>
            DermAI is an AI-assisted screening tool, not a replacement for professional
            medical advice. Always consult a qualified dermatologist at a recognized
            hospital or clinic in Nepal for confirmed diagnosis and treatment.
          </p>
        </motion.div>

      </div>
    </section>
  );
}