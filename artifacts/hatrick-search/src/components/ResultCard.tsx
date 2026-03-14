import { motion } from "framer-motion";
import { Bookmark, ExternalLink, Calendar, Check } from "lucide-react";
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
  const queryClient = useQueryClient();
  
  const saveMutation = useSaveItem({
    mutation: {
      onSuccess: () => {
        setSaved(true);
        queryClient.invalidateQueries({ queryKey: getGetSavedItemsQueryKey() });
        setTimeout(() => setSaved(false), 2000); // Reset icon after 2s
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="block group"
    >
      <div className="glass-card h-full rounded-2xl overflow-hidden flex flex-col relative">
        
        {/* Glow effect on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-secondary/0 group-hover:from-primary/10 group-hover:to-secondary/10 transition-all duration-500 z-0 pointer-events-none" />

        {result.imageUrl && (
          <div className="h-40 w-full overflow-hidden relative z-10">
            <img 
              src={result.imageUrl} 
              alt={result.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
          </div>
        )}

        <div className="p-5 flex flex-col flex-1 relative z-10">
          <div className="flex justify-between items-start gap-4 mb-3">
            <h3 className="font-display font-bold text-xl leading-tight group-hover:text-primary transition-colors line-clamp-2">
              {result.title}
            </h3>
            
            <button
              onClick={handleSave}
              className={`shrink-0 p-2 rounded-xl border backdrop-blur-md transition-all ${
                saved 
                  ? "bg-green-500/20 border-green-500/30 text-green-400" 
                  : "bg-white/5 border-white/10 hover:bg-primary/20 hover:border-primary/30 hover:text-primary text-muted-foreground"
              }`}
              title="Save Card"
            >
              {saved ? <Check className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
            </button>
          </div>

          <p className="text-muted-foreground text-sm line-clamp-3 mb-4 flex-1">
            {result.snippet}
          </p>

          <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-1 bg-white/5 rounded-lg text-foreground/80 border border-white/5 shadow-inner">
                {result.source}
              </span>
              {result.publishedAt && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {result.publishedAt}
                </span>
              )}
            </div>
            <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-secondary transition-colors" />
          </div>
        </div>
      </div>
    </motion.a>
  );
}
