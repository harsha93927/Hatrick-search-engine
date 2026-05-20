import { motion } from "framer-motion";
import { BrainCircuit, Volume2, VolumeX } from "lucide-react";
import { useTTS } from "@/hooks/useTTS";
import { Button } from "./ui/button";

interface AiAnswerBoxProps {
  answer: string;
}

export function AiAnswerBox({ answer }: AiAnswerBoxProps) {
  const { speak, stop, isSpeaking } = useTTS();

  if (!answer) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="mb-8 w-full"
    >
      <div className="animated-gradient-border">
        <div className="glass-panel rounded-2xl p-6 md:p-8 relative overflow-hidden">
          {/* Subtle background glow inside the card */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/10 blur-[80px] rounded-full pointer-events-none" />
          
          <div className="flex items-start gap-4 relative z-10">
            <div className="p-3 bg-primary/20 text-primary rounded-xl shrink-0 border border-primary/30">
              <BrainCircuit className="w-6 h-6" />
            </div>
            
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary uppercase tracking-wider">
                  JARVIS Intelligence
                </h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => isSpeaking ? stop() : speak(answer)}
                  className="h-8 w-8 text-primary hover:text-primary/80 hover:bg-primary/10 rounded-lg"
                >
                  {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </Button>
              </div>
              <div className="prose prose-invert prose-p:leading-relaxed max-w-none text-foreground/90">
                <p>{answer}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
