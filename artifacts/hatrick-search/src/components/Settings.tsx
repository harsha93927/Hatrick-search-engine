import { useState, useEffect } from "react";
import { Settings as SettingsIcon, X, Save, Brain, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Settings({ isOpen, onClose }: SettingsProps) {
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState("gemini-2.0-flash");

  useEffect(() => {
    const savedKey = localStorage.getItem("jarvis_gemini_api_key") || "";
    const savedModel = localStorage.getItem("jarvis_gemini_model") || "gemini-2.0-flash";
    setApiKey(savedKey);
    setModel(savedModel);
  }, [isOpen]);

  const handleSave = () => {
    localStorage.setItem("jarvis_gemini_api_key", apiKey);
    localStorage.setItem("jarvis_gemini_model", model);
    toast.success("Settings saved successfully", {
      description: "Your Gemini AI configuration has been updated.",
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-background/80 backdrop-blur-2xl border-white/10 shadow-2xl rounded-[2rem]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl font-display font-black tracking-tight">
            <SettingsIcon className="w-6 h-6 text-primary" />
            JARVIS SETTINGS
          </DialogTitle>
          <DialogDescription className="text-muted-foreground font-medium">
            Configure your AI brain and system preferences.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="apiKey" className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                Gemini API Key
              </Label>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] font-bold text-primary hover:underline flex items-center gap-1"
              >
                Get Key <ExternalLinkIcon className="w-3 h-3" />
              </a>
            </div>
            <Input
              id="apiKey"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your Google Gemini API Key"
              className="bg-white/5 border-white/10 rounded-xl focus:ring-primary/40"
            />
            <p className="text-[10px] text-muted-foreground leading-tight flex gap-2">
              <Info className="w-4 h-4 shrink-0 text-primary" />
              Your key is stored locally in your browser and is never sent to our servers, only to the Gemini API.
            </p>
          </div>

          <div className="space-y-4">
            <Label htmlFor="model" className="text-xs font-black uppercase tracking-widest text-muted-foreground">
              Select AI Model
            </Label>
            <select
              id="model"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 appearance-none"
            >
              <option value="gemini-2.0-flash">Gemini 2.0 Flash (Fastest)</option>
              <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
              <option value="gemini-1.5-pro">Gemini 1.5 Pro (Advanced Reasoning)</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-4">
          <Button
            variant="ghost"
            onClick={onClose}
            className="rounded-xl font-bold uppercase tracking-widest text-xs"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="bg-primary hover:bg-primary/90 text-white rounded-xl font-bold uppercase tracking-widest text-xs flex items-center gap-2"
          >
            <Save className="w-4 h-4" /> Save Configuration
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ExternalLinkIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}
