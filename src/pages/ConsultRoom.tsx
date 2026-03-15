import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MessageCircle, CheckCircle, XCircle, Lock } from "lucide-react";

const TOKENS: Record<string, { name: string; specialty: string; whatsapp: string; emoji: string; gradient: string; message: string }> = {
  "DERM-AK01": {
    name: "Dr. Aashutosh Khadka",
    specialty: "Hair & Scalp Specialist",
    whatsapp: "9779800000001",
    emoji: "🧴",
    gradient: "from-emerald-500 to-teal-600",
    message: "Hello Dr. Aashutosh Khadka, I have a confirmed consultation. My token is DERM-AK01. I would like to discuss my hair and scalp concerns.",
  },
  "DERM-AM02": {
    name: "Dr. Ayush Malla",
    specialty: "Skin Cancer Specialist",
    whatsapp: "9779800000002",
    emoji: "🔬",
    gradient: "from-blue-500 to-indigo-600",
    message: "Hello Dr. Ayush Malla, I have a confirmed consultation. My token is DERM-AM02. I would like to discuss my skin analysis results.",
  },
  "DERM-AJ03": {
    name: "Dr. Aashutosh Jha",
    specialty: "General Dermatologist",
    whatsapp: "9779800000003",
    emoji: "🩺",
    gradient: "from-violet-500 to-purple-600",
    message: "Hello Dr. Aashutosh Jha, I have a confirmed consultation. My token is DERM-AJ03. I would like to discuss my skin concerns.",
  },
};

type RoomState = "enter" | "valid" | "invalid";

export default function ConsultRoom() {
  const navigate = useNavigate();
  const [tokenInput, setTokenInput] = useState("");
  const [roomState, setRoomState] = useState<RoomState>("enter");
  const [doctor, setDoctor] = useState<typeof TOKENS[string] | null>(null);
  const [shake, setShake] = useState(false);

  const handleEnter = () => {
    const clean = tokenInput.trim().toUpperCase();
    if (TOKENS[clean]) {
      setDoctor(TOKENS[clean]);
      setRoomState("valid");
    } else {
      setRoomState("invalid");
      setShake(true);
      setTimeout(() => { setShake(false); setRoomState("enter"); }, 1500);
    }
  };

  const openWhatsApp = () => {
    if (!doctor) return;
    const encoded = encodeURIComponent(doctor.message);
    window.open(`https://wa.me/${doctor.whatsapp}?text=${encoded}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-lg mx-auto">

            {/* Back button */}
            <button
              onClick={() => navigate("/consult")}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8 text-sm"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Doctors
            </button>

            <AnimatePresence mode="wait">

              {/* ── TOKEN ENTRY ── */}
              {(roomState === "enter" || roomState === "invalid") && (
                <motion.div
                  key="enter"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden"
                >
                  {/* Top banner */}
                  <div className="bg-gradient-to-br from-primary/10 to-secondary/30 p-8 text-center border-b border-border/50">
                    <div className="w-16 h-16 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center mx-auto mb-4">
                      <Lock className="w-7 h-7 text-primary" />
                    </div>
                    <h1 className="text-2xl font-bold text-foreground">Consultation Room</h1>
                    <p className="text-muted-foreground text-sm mt-2">Enter your session token to connect with your doctor</p>
                  </div>

                  <div className="p-8 space-y-5">
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide block mb-2">
                        Session Token
                      </label>
                      <motion.input
                        animate={shake ? { x: [-8, 8, -8, 8, 0] } : {}}
                        transition={{ duration: 0.4 }}
                        value={tokenInput}
                        onChange={(e) => setTokenInput(e.target.value.toUpperCase())}
                        onKeyDown={(e) => e.key === "Enter" && handleEnter()}
                        placeholder="DERM-XXXX"
                        className={`w-full px-5 py-4 rounded-xl border text-center text-xl font-mono font-bold tracking-widest outline-none transition-all ${
                          roomState === "invalid"
                            ? "border-red-400 bg-red-50 text-red-600"
                            : "border-border bg-secondary/30 text-foreground focus:border-primary"
                        }`}
                      />
                      {roomState === "invalid" && (
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-red-500 text-sm mt-2 text-center flex items-center justify-center gap-1.5"
                        >
                          <XCircle className="w-4 h-4" /> Invalid token. Please check and try again.
                        </motion.p>
                      )}
                    </div>

                    <Button onClick={handleEnter} className="w-full" size="lg">
                      Enter Room
                    </Button>

                    <div className="text-center pt-2">
                      <p className="text-xs text-muted-foreground">
                        Don't have a token?{" "}
                        <button onClick={() => navigate("/consult")} className="text-primary font-semibold hover:underline">
                          Book a consultation
                        </button>
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ── VALID TOKEN — ROOM ── */}
              {roomState === "valid" && doctor && (
                <motion.div
                  key="room"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-5"
                >
                  {/* Success banner */}
                  <div className="bg-green-50 border border-green-200 rounded-2xl p-5 flex items-center gap-4">
                    <CheckCircle className="w-8 h-8 text-green-500 shrink-0" />
                    <div>
                      <p className="font-bold text-green-800">Token Verified!</p>
                      <p className="text-sm text-green-600">Your consultation session is confirmed.</p>
                    </div>
                  </div>

                  {/* Doctor card */}
                  <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
                    <div className={`bg-gradient-to-br ${doctor.gradient} p-6 text-center`}>
                      <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-4xl mx-auto mb-3">
                        {doctor.emoji}
                      </div>
                      <h2 className="text-xl font-bold text-white">{doctor.name}</h2>
                      <p className="text-white/80 text-sm mt-0.5">{doctor.specialty}</p>
                    </div>

                    <div className="p-6 space-y-5">
                      <div className="bg-secondary/50 rounded-xl p-4 space-y-2">
                        <p className="text-sm font-semibold text-foreground">📋 Your session token</p>
                        <p className="text-2xl font-bold font-mono tracking-widest text-primary text-center py-2">
                          {tokenInput.trim().toUpperCase()}
                        </p>
                      </div>

                      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800 space-y-1">
                        <p className="font-semibold">💬 How this works:</p>
                        <p>Clicking the button below will open WhatsApp with a pre-filled message to {doctor.name}. The doctor will respond during their consultation hours.</p>
                      </div>

                      <Button
                        onClick={openWhatsApp}
                        size="lg"
                        className="w-full gap-3 bg-[#25D366] hover:bg-[#1ebe5d] text-white text-base py-6"
                      >
                        <MessageCircle className="w-5 h-5" />
                        Open WhatsApp Chat with {doctor.name.split(" ")[1]}
                      </Button>

                      <p className="text-xs text-muted-foreground text-center">
                        WhatsApp will open in a new tab. Make sure you have WhatsApp installed or use WhatsApp Web.
                      </p>

                      <Button
                        variant="ghost"
                        className="w-full"
                        onClick={() => { setRoomState("enter"); setTokenInput(""); setDoctor(null); }}
                      >
                        Use a Different Token
                      </Button>
                    </div>
                  </div>

                  {/* Disclaimer */}
                  <div className="bg-secondary/30 rounded-xl p-4 text-center">
                    <p className="text-xs text-muted-foreground">
                      <strong>Note:</strong> This is an AI-assisted platform. Always follow your doctor's advice.
                      For emergencies, please visit TUTH or B&B Hospital directly.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}