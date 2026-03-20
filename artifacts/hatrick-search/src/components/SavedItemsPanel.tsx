import { motion, AnimatePresence } from "framer-motion";
import { X, ExternalLink, Trash2, Loader2, Sparkles, Clock, Globe, ArrowUpRight } from "lucide-react";
import { useGetSavedItems, useDeleteSavedItem, getGetSavedItemsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

interface SavedItemsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SavedItemsPanel({ isOpen, onClose }: SavedItemsPanelProps) {
  const queryClient = useQueryClient();
  const { data: savedItems, isLoading } = useGetSavedItems();
  const deleteMutation = useDeleteSavedItem({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetSavedItemsQueryKey() });
      }
    }
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop with intense blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/40 backdrop-blur-md z-40"
          />

          {/* Side Panel with Glassmorphism */}
          <motion.div
            initial={{ x: "100%", opacity: 0.5 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0.5 }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 h-full w-full max-w-lg bg-card/80 backdrop-blur-3xl border-l border-white/5 shadow-[0_0_100px_rgba(0,0,0,0.5)] z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-8 border-b border-white/5">
              <div className="flex flex-col">
                <h2 className="text-2xl font-display font-bold flex items-center gap-2.5 text-foreground">
                  <Clock className="w-6 h-6 text-primary" />
                  Watch Later
                </h2>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-[0.2em] mt-1">
                  Your curated insights
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2.5 hover:bg-white/10 rounded-2xl transition-all text-muted-foreground hover:text-foreground border border-white/5 hover:border-white/10"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-full space-y-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
                    <Loader2 className="w-10 h-10 animate-spin text-primary relative z-10" />
                  </div>
                  <p className="text-muted-foreground animate-pulse text-sm font-medium">Retrieving archives...</p>
                </div>
              ) : !savedItems || savedItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 blur-3xl opacity-50 rounded-full" />
                    <div className="w-24 h-24 rounded-[2.5rem] bg-white/5 border border-white/10 flex items-center justify-center relative z-10 shadow-inner">
                      <Sparkles className="w-10 h-10 text-muted-foreground/40" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xl font-display font-bold text-foreground">Nothing saved yet</p>
                    <p className="text-muted-foreground text-sm max-w-[240px] leading-relaxed">
                      Cards you save will appear here for you to watch and explore later.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {savedItems.map((item, idx) => (
                    <motion.div
                      layout
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: idx * 0.05 }}
                      key={item.id}
                      className="group relative"
                    >
                      <div className="glass-card rounded-[2rem] overflow-hidden border border-white/5 hover:border-primary/30 transition-all duration-500 shadow-lg hover:shadow-primary/10">
                        {item.imageUrl && (
                          <div className="h-32 w-full overflow-hidden relative">
                            <img 
                              src={item.imageUrl} 
                              alt={item.title} 
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                              loading="lazy"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-black/20" />
                          </div>
                        )}
                        <div className="p-6">
                          <div className="flex justify-between items-start gap-3 mb-3">
                            <a 
                              href={item.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="font-display font-bold text-lg hover:text-primary transition-colors line-clamp-2 leading-tight flex-1 pr-2"
                            >
                              {item.title}
                            </a>
                            <button
                              onClick={() => deleteMutation.mutate({ id: item.id })}
                              disabled={deleteMutation.isPending}
                              className="p-2.5 text-muted-foreground hover:text-white hover:bg-destructive/80 border border-white/5 hover:border-destructive/50 rounded-2xl transition-all shadow-sm"
                              title="Remove from collection"
                            >
                              {deleteMutation.isPending && deleteMutation.variables?.id === item.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                          
                          <p className="text-xs text-muted-foreground/80 leading-relaxed line-clamp-2 mb-5 font-medium">
                            {item.snippet}
                          </p>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center">
                                <Globe className="w-3 h-3 text-secondary" />
                              </div>
                              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                {item.source}
                              </span>
                            </div>
                            <a 
                              href={item.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all hover:gap-2.5 active:scale-95 shadow-sm"
                            >
                              Open Insight <ArrowUpRight className="w-3 h-3" />
                            </a>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Footer with summary */}
            {savedItems && savedItems.length > 0 && (
              <div className="p-8 border-t border-white/5 bg-white/[0.02]">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Total Items</span>
                  <span className="font-bold text-foreground bg-white/5 px-3 py-1 rounded-full border border-white/10 uppercase tracking-widest">
                    {savedItems.length} Saved
                  </span>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
