import { motion } from "framer-motion";
import { Bookmark, ExternalLink, Calendar, Check, Clock, Globe } from "lucide-react";
import { useState } from "react";
import { useSaveItem, getGetSavedItemsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import type { SearchResult } from "@workspace/api-client-react";

interface ResultCardProps {
  result: SearchResult;
  index: number;
}

export function ResultCard({ result, index }: ResultCardProps) {
  const [saved, setSaved] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const queryClient = useQueryClient();
  
  const saveMutation = useSaveItem({
    mutation: {
      onSuccess: () => {
        setSaved(true);
        queryClient.invalidateQueries({ queryKey: getGetSavedItemsQueryKey() });
        setTimeout(() => setSaved(false), 2000);
      }
    }
  });

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!saved && !saveMutation.isPending) {
      saveMutation.mutate({ data: result });
    }
  };

  return (
    <motion.a
      href={result.url}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: [0.23, 1, 0.32, 1] }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="block group perspective-1000"
    >
      <div className="glass-card h-full rounded-3xl overflow-hidden flex flex-col relative border border-white/5 group-hover:border-primary/30 transition-all duration-500 shadow-xl group-hover:shadow-primary/20">
        
        {/* Animated Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

        {/* Image Section with Interactive Effects */}
        <div className="h-48 w-full overflow-hidden relative z-10">
          {result.imageUrl ? (
            <motion.img 
              src={result.imageUrl} 
              alt={result.title}
              animate={{ scale: isHovered ? 1.1 : 1 }}
              transition={{ duration: 1.5, ease: "circOut" }}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-muted/50 to-muted flex items-center justify-center">
              <Globe className="w-12 h-12 text-muted-foreground/30 animate-pulse" />
            </div>
          )}
          
          {/* Subtle overlay gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-black/20" />
          
          {/* Source Badge on Image */}
          <div className="absolute top-4 left-4 z-20">
            <span className="px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-[10px] font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              {result.source}
            </span>
          </div>

          {/* Save Button Overlay */}
          <button
            onClick={handleSave}
            className={`absolute top-4 right-4 z-20 p-2.5 rounded-2xl backdrop-blur-xl border transition-all duration-300 transform ${
              saved 
                ? "bg-green-500 border-green-400 text-white scale-110 shadow-lg shadow-green-500/50" 
                : "bg-white/10 border-white/20 hover:bg-white/20 hover:scale-110 text-white"
            }`}
            title="Watch later"
          >
            {saved ? <Check className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
          </button>
        </div>

        {/* Content Section */}
        <div className="p-6 flex flex-col flex-1 relative z-10">
          <div className="mb-3">
            <h3 className="font-display font-bold text-lg md:text-xl leading-tight text-foreground transition-colors line-clamp-2 mb-2 group-hover:text-primary">
              {result.title}
            </h3>
            
            <div className="flex items-center gap-3 text-[11px] text-muted-foreground font-medium">
              <div className="flex items-center gap-1.5">
                <Globe className="w-3 h-3 text-primary" />
                <span>{result.source}</span>
              </div>
              {result.publishedAt && (
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3 h-3 text-secondary" />
                  <span>{result.publishedAt}</span>
                </div>
              )}
            </div>
          </div>

          <p className="text-muted-foreground/80 text-sm leading-relaxed line-clamp-3 mb-6 flex-1">
            {result.snippet}
          </p>

          <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
            <span className="text-primary text-xs font-bold uppercase tracking-widest flex items-center gap-2 group-hover:gap-3 transition-all">
              Read Insight <ExternalLink className="w-3 h-3" />
            </span>
            <div className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <Search className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
          </div>
        </div>
      </div>
    </motion.a>
  );
}
