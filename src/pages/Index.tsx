import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/sections/HeroSection";
import { FeaturesSection } from "@/components/sections/FeaturesSection";
import { AssessmentSection } from "@/components/assessment/AssessmentSection";
import { SkinAssessmentSection } from "@/components/assessment/SkinAssessmentSection";
import { AboutSection } from "@/components/sections/AboutSection";
import { ContactSection } from "@/components/sections/ContactSection";

interface IndexProps {
  onReportReady?: (report: any) => void;
}

const Index = ({ onReportReady }: IndexProps) => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <FeaturesSection />
        <AssessmentSection onReportReady={onReportReady} />
        <SkinAssessmentSection onReportReady={onReportReady} />
        <AboutSection />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;