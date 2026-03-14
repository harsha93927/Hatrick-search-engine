import { motion, AnimatePresence } from "framer-motion";
import { X, ExternalLink, Trash2, Loader2, Sparkles } from "lucide-react";
import { useGetSavedItems, useDeleteSavedItem, getGetSavedItemsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";

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
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />

          {/* Side Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-card border-l border-border shadow-2xl z-50 flex flex-col"
          >
            <div className="flex items-center justify-between p-6 border-b border-white/5">
              <h2 className="text-xl font-display font-bold flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-secondary" />
                Saved Explorations
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-full transition-colors text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {isLoading ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : savedItems?.length === 0 ? (
                <div className="text-center py-20 text-muted-foreground flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                    <Sparkles className="w-8 h-8 opacity-50" />
                  </div>
                  <p>Your universe is empty.</p>
                  <p className="text-sm mt-1">Save cards to see them here.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {savedItems?.map((item) => (
                    <motion.div
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      key={item.id}
                      className="glass-card rounded-xl overflow-hidden group"
                    >
                      {item.imageUrl && (
                        <div className="h-24 w-full overflow-hidden">
                          <img 
                            src={item.imageUrl} 
                            alt={item.title} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                          />
                        </div>
                      )}
                      <div className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <a 
                            href={item.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="font-semibold text-lg hover:text-primary transition-colors line-clamp-2 leading-tight flex-1 pr-2"
                          >
                            {item.title}
                          </a>
                          <button
                            onClick={() => deleteMutation.mutate({ id: item.id })}
                            disabled={deleteMutation.isPending}
                            className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors shrink-0"
                            title="Remove from saved"
                          >
                            {deleteMutation.isPending && deleteMutation.variables?.id === item.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                        
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                          {item.snippet}
                        </p>
                        
                        <div className="flex items-center justify-between text-xs font-medium text-muted-foreground/80">
                          <span className="px-2 py-1 rounded-md bg-white/5 border border-white/5">
                            {item.source}
                          </span>
                          <a 
                            href={item.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 hover:text-secondary transition-colors"
                          >
                            Visit <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
