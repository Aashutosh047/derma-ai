import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { ArrowRight, Star, Clock, Shield, CheckCircle, Loader2 } from "lucide-react";

const DOCTORS = [
  {
    id: "AK01",
    token: "DERM-AK01",
    name: "Dr. Aashutosh Khadka",
    specialty: "Hair & Scalp Specialist",
    experience: "8 years",
    rating: 4.9,
    reviews: 124,
    fee: 500,
    available: true,
    whatsapp: "9779800000001",
    bio: "Expert in hair loss, alopecia, scalp infections, and trichology. Trained at TUTH with advanced certification in dermatoscopy.",
    tags: ["Hair Loss", "Alopecia", "Scalp Care", "Trichology"],
    emoji: "🧴",
    gradient: "from-emerald-500 to-teal-600",
    light: "from-emerald-50 to-teal-50",
    border: "border-emerald-200",
  },
  {
    id: "AM02",
    token: "DERM-AM02",
    name: "Dr. Milan Karki",
    specialty: "Skin Cancer Specialist",
    experience: "11 years",
    rating: 4.8,
    reviews: 98,
    fee: 500,
    available: true,
    whatsapp: "9779800000002",
    bio: "Specialist in early detection and management of melanoma, BCC, and precancerous lesions. Fellowship trained in onco-dermatology.",
    tags: ["Melanoma", "Skin Cancer", "Dermoscopy", "Lesion Removal"],
    emoji: "🔬",
    gradient: "from-blue-500 to-indigo-600",
    light: "from-blue-50 to-indigo-50",
    border: "border-blue-200",
  },
  {
    id: "AJ03",
    token: "DERM-AJ03",
    name: "Dr. Aashutosh Jha",
    specialty: "General Dermatologist",
    experience: "6 years",
    rating: 4.7,
    reviews: 87,
    fee: 500,
    available: true,
    whatsapp: "9779800000003",
    bio: "General dermatology including acne, eczema, psoriasis, infections, and cosmetic skin care. Fluent in Nepali, Hindi, and English.",
    tags: ["Acne", "Eczema", "Psoriasis", "Cosmetic"],
    emoji: "🩺",
    gradient: "from-violet-500 to-purple-600",
    light: "from-violet-50 to-purple-50",
    border: "border-violet-200",
  },
];

type PaymentStep = "idle" | "paying" | "processing" | "done";

export default function ConsultDoctor() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<typeof DOCTORS[0] | null>(null);
  const [payStep, setPayStep] = useState<PaymentStep>("idle");
  const [cardNum, setCardNum] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [name, setName] = useState("");
  const [token, setToken] = useState("");

  const openPayment = (doctor: typeof DOCTORS[0]) => {
    setSelected(doctor);
    setPayStep("paying");
    setCardNum(""); setExpiry(""); setCvv(""); setName("");
  };

  const handlePay = async () => {
    if (!name || cardNum.length < 16 || expiry.length < 5 || cvv.length < 3) return;
    setPayStep("processing");
    await new Promise((r) => setTimeout(r, 2200));
    setToken(selected!.token);
    setPayStep("done");
  };

  const closeModal = () => {
    setSelected(null);
    setPayStep("idle");
    setToken("");
  };

  const formatCard = (val: string) =>
    val.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();

  const formatExpiry = (val: string) => {
    const clean = val.replace(/\D/g, "").slice(0, 4);
    return clean.length > 2 ? clean.slice(0, 2) + "/" + clean.slice(2) : clean;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        {/* Hero */}
        <section className="py-20 md:py-28 bg-gradient-to-br from-primary/10 via-background to-secondary/20 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-10 left-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
            <div className="absolute bottom-10 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          </div>
          <div className="container mx-auto px-4 text-center relative">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary font-semibold text-sm rounded-full mb-4 uppercase tracking-wider">
                Online Consultation
              </span>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                Consult a <span className="text-primary">Dermatologist</span>
              </h1>
              <p className="text-muted-foreground text-lg max-w-xl mx-auto mb-8">
                Book a session with our certified dermatologists. Get your token and connect directly via WhatsApp.
              </p>
              <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
                {[["⚡", "Instant Booking"], ["🔒", "Secure Payment"], ["💬", "WhatsApp Consult"], ["🇳🇵", "Nepal Based"]].map(([icon, label]) => (
                  <span key={label} className="flex items-center gap-1.5 font-medium">{icon} {label}</span>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-12 bg-secondary/20 border-y border-border/50">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap justify-center gap-2 md:gap-0 items-center max-w-3xl mx-auto">
              {[
                ["1", "Choose a Doctor", "Pick your specialist"],
                ["→", "", ""],
                ["2", "Pay Rs. 500", "Secure dummy payment"],
                ["→", "", ""],
                ["3", "Get Your Token", "Unique session code"],
                ["→", "", ""],
                ["4", "Enter Room", "Start WhatsApp chat"],
              ].map(([step, title, desc], i) =>
                step === "→" ? (
                  <ArrowRight key={i} className="w-5 h-5 text-muted-foreground mx-2 hidden md:block" />
                ) : (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-3 bg-card rounded-xl px-4 py-3 border border-border/50 shadow-sm"
                  >
                    <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shrink-0">
                      {step}
                    </span>
                    <div>
                      <p className="font-semibold text-sm text-foreground">{title}</p>
                      <p className="text-xs text-muted-foreground">{desc}</p>
                    </div>
                  </motion.div>
                )
              )}
            </div>
          </div>
        </section>

        {/* Doctor Cards */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-2">Our Specialists</h2>
              <p className="text-muted-foreground">All doctors are certified dermatologists based in Nepal</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {DOCTORS.map((doc, i) => (
                <motion.div
                  key={doc.id}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.15 }}
                  className={`bg-card rounded-2xl border ${doc.border} overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300`}
                >
                  {/* Card top */}
                  <div className={`bg-gradient-to-br ${doc.light} p-6 text-center`}>
                    <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${doc.gradient} flex items-center justify-center text-4xl mx-auto mb-3 shadow-lg`}>
                      {doc.emoji}
                    </div>
                    <h3 className="font-bold text-foreground text-lg">{doc.name}</h3>
                    <p className="text-primary font-medium text-sm mt-0.5">{doc.specialty}</p>
                    <div className="flex items-center justify-center gap-1 mt-2">
                      <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-semibold">{doc.rating}</span>
                      <span className="text-xs text-muted-foreground">({doc.reviews} reviews)</span>
                    </div>
                  </div>

                  {/* Card body */}
                  <div className="p-5 space-y-4">
                    <p className="text-sm text-muted-foreground leading-relaxed">{doc.bio}</p>

                    <div className="flex flex-wrap gap-1.5">
                      {doc.tags.map((tag) => (
                        <span key={tag} className="px-2 py-0.5 bg-secondary text-xs rounded-full text-muted-foreground font-medium">
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between text-sm pt-1">
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="w-3.5 h-3.5" /> {doc.experience} exp.
                      </span>
                      <span className="flex items-center gap-1 text-green-600 font-medium">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        Available
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-border/50">
                      <div>
                        <p className="text-xs text-muted-foreground">Consultation fee</p>
                        <p className="text-xl font-bold text-foreground">Rs. {doc.fee}</p>
                      </div>
                      <Button onClick={() => openPayment(doc)} className="gap-1.5">
                        Book Now <ArrowRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Enter Room CTA */}
        <section className="py-12 bg-secondary/20 border-t border-border/50">
          <div className="container mx-auto px-4 text-center">
            <h3 className="text-xl font-bold text-foreground mb-2">Already have a token?</h3>
            <p className="text-muted-foreground mb-6 text-sm">Enter your session token to open your WhatsApp consultation room.</p>
            <Button variant="outline" size="lg" onClick={() => navigate("/consult/room")} className="gap-2">
              Enter Consultation Room <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </section>
      </main>

      {/* Payment Modal */}
      <AnimatePresence>
        {selected && payStep !== "idle" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && payStep !== "processing" && closeModal()}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              className="bg-card rounded-2xl shadow-2xl w-full max-w-md border border-border overflow-hidden"
            >
              {/* Modal Header */}
              <div className={`bg-gradient-to-br ${selected.light} p-5 border-b border-border/50`}>
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${selected.gradient} flex items-center justify-center text-2xl shadow`}>
                    {selected.emoji}
                  </div>
                  <div>
                    <p className="font-bold text-foreground">{selected.name}</p>
                    <p className="text-sm text-primary">{selected.specialty}</p>
                  </div>
                  <div className="ml-auto text-right">
                    <p className="text-xs text-muted-foreground">Total</p>
                    <p className="text-xl font-bold text-foreground">Rs. {selected.fee}</p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                {/* PAYMENT FORM */}
                {payStep === "paying" && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                      <Shield className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-muted-foreground">Secure dummy payment — no real charge</span>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Cardholder Name</label>
                      <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Full Name"
                        className="w-full mt-1.5 px-4 py-2.5 rounded-xl border border-border bg-secondary/30 text-sm outline-none focus:border-primary transition-colors"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Card Number</label>
                      <input
                        value={cardNum}
                        onChange={(e) => setCardNum(formatCard(e.target.value))}
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                        className="w-full mt-1.5 px-4 py-2.5 rounded-xl border border-border bg-secondary/30 text-sm outline-none focus:border-primary transition-colors font-mono"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Expiry</label>
                        <input
                          value={expiry}
                          onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                          placeholder="MM/YY"
                          maxLength={5}
                          className="w-full mt-1.5 px-4 py-2.5 rounded-xl border border-border bg-secondary/30 text-sm outline-none focus:border-primary transition-colors font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">CVV</label>
                        <input
                          value={cvv}
                          onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 3))}
                          placeholder="123"
                          maxLength={3}
                          className="w-full mt-1.5 px-4 py-2.5 rounded-xl border border-border bg-secondary/30 text-sm outline-none focus:border-primary transition-colors font-mono"
                        />
                      </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                      <Button variant="ghost" onClick={closeModal} className="flex-1">Cancel</Button>
                      <Button
                        onClick={handlePay}
                        disabled={!name || cardNum.length < 19 || expiry.length < 5 || cvv.length < 3}
                        className="flex-1 gap-2"
                      >
                        Pay Rs. {selected.fee}
                      </Button>
                    </div>
                  </div>
                )}

                {/* PROCESSING */}
                {payStep === "processing" && (
                  <div className="py-8 text-center space-y-4">
                    <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto" />
                    <p className="font-semibold text-foreground">Processing Payment...</p>
                    <p className="text-sm text-muted-foreground">Please wait, do not close this window.</p>
                  </div>
                )}

                {/* SUCCESS + TOKEN */}
                {payStep === "done" && (
                  <div className="py-4 text-center space-y-5">
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200 }}>
                      <CheckCircle className="w-14 h-14 text-green-500 mx-auto" />
                    </motion.div>
                    <div>
                      <p className="font-bold text-foreground text-lg">Payment Successful!</p>
                      <p className="text-sm text-muted-foreground mt-1">Your consultation token is</p>
                    </div>

                    <div className="bg-primary/10 border-2 border-primary/30 rounded-2xl p-5">
                      <p className="text-3xl font-bold tracking-widest text-primary font-mono">{token}</p>
                      <p className="text-xs text-muted-foreground mt-2">Save this token — you'll need it to enter the room</p>
                    </div>

                    <div className="bg-secondary/50 rounded-xl p-3 text-left text-sm space-y-1">
                      <p className="font-semibold text-foreground">📋 Next steps:</p>
                      <p className="text-muted-foreground">1. Note down your token above</p>
                      <p className="text-muted-foreground">2. Click "Enter Room" and enter your token</p>
                      <p className="text-muted-foreground">3. Connect with {selected.name} on WhatsApp</p>
                    </div>

                    <div className="flex gap-3">
                      <Button variant="outline" onClick={closeModal} className="flex-1">Close</Button>
                      <Button onClick={() => { closeModal(); navigate("/consult/room"); }} className="flex-1 gap-1.5">
                        Enter Room <ArrowRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}