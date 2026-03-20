import { useState, FormEvent, useEffect } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Sparkles, Hexagon, Loader2, Clock, Globe, ArrowRight, BookOpen } from "lucide-react";
import { useSearch, useGetSavedItems } from "@workspace/api-client-react";
import { AiAnswerBox } from "@/components/AiAnswerBox";
import { ResultCard } from "@/components/ResultCard";
import { SavedItemsPanel } from "@/components/SavedItemsPanel";

export function Home() {
  const [location, setLocation] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const initialQuery = searchParams.get("q") || "";
  
  const [query, setQuery] = useState(initialQuery);
  const [isSavedPanelOpen, setIsSavedPanelOpen] = useState(false);

  // Sync state when URL changes
  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  const { data: searchResults, isLoading, isError } = useSearch(
    { q: initialQuery },
    { query: { enabled: !!initialQuery, retry: false } }
  );

  const { data: savedItems } = useGetSavedItems();

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setLocation(`/?q=${encodeURIComponent(query.trim())}`);
    } else {
      setLocation(`/`);
    }
  };

  const isHome = !initialQuery;

  return (
    <div className="min-h-screen bg-background relative selection:bg-primary/30 selection:text-primary-foreground overflow-x-hidden">
      
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/10 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Universal Header */}
      <AnimatePresence>
        {!isHome && (
          <motion.header 
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="sticky top-0 z-30 bg-background/40 backdrop-blur-2xl border-b border-white/5 shadow-2xl"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-6">
              <div 
                className="flex items-center gap-3 cursor-pointer group"
                onClick={() => setLocation("/")}
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg group-hover:shadow-primary/50 transition-all transform group-hover:rotate-12">
                  <Hexagon className="w-6 h-6 text-white" />
                </div>
                <span className="font-display font-black text-xl hidden md:block tracking-tighter uppercase">Hatrick</span>
              </div>

              <form onSubmit={handleSearch} className="flex-1 max-w-2xl relative group">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                </div>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Dive deeper..."
                  className="w-full bg-white/5 border border-white/10 text-foreground rounded-2xl pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:bg-white/10 transition-all shadow-inner text-lg font-medium"
                />
              </form>

              <button
                onClick={() => setIsSavedPanelOpen(true)}
                className="relative p-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all text-muted-foreground hover:text-foreground group shadow-sm hover:border-primary/30"
              >
                <Clock className="w-6 h-6 group-hover:rotate-6 transition-transform" />
                {savedItems && savedItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-white text-[10px] font-black flex items-center justify-center rounded-lg shadow-lg animate-bounce">
                    {savedItems.length}
                  </span>
                )}
              </button>
            </div>
          </motion.header>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className={`relative z-10 ${isHome ? 'flex flex-col items-center justify-center min-h-screen px-4 pb-20' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12'}`}>
        
        {isHome ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-4xl text-center"
          >
            <div className="mb-12 flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/40 blur-[100px] rounded-full animate-pulse" />
                <motion.div 
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  className="w-32 h-32 rounded-3xl bg-gradient-to-br from-primary via-primary/80 to-secondary flex items-center justify-center shadow-[0_20px_50px_rgba(var(--primary-rgb),0.3)] relative z-10 border border-white/20 cursor-pointer"
                >
                  <Hexagon className="w-16 h-16 text-white" />
                </motion.div>
                <div className="absolute -bottom-4 -right-4 w-12 h-12 bg-card rounded-2xl border border-white/10 flex items-center justify-center shadow-2xl z-20">
                  <Sparkles className="w-6 h-6 text-secondary animate-pulse" />
                </div>
              </div>
            </div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <h1 className="text-6xl sm:text-8xl md:text-9xl font-black font-display text-gradient mb-6 tracking-tight drop-shadow-2xl">
                Hatrick
              </h1>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
                <span className="text-muted-foreground uppercase tracking-[0.4em] text-[10px] sm:text-xs font-black bg-white/5 px-4 py-1.5 rounded-full border border-white/5">
                  The Intelligence Engine
                </span>
                <div className="hidden sm:block w-2 h-2 rounded-full bg-primary/40" />
                <span className="text-muted-foreground uppercase tracking-[0.4em] text-[10px] sm:text-xs font-black bg-white/5 px-4 py-1.5 rounded-full border border-white/5">
                  Powered by Harsha
                </span>
              </div>
            </motion.div>

            <form onSubmit={handleSearch} className="relative group max-w-2xl mx-auto mb-12">
              <div className="absolute -inset-1.5 bg-gradient-to-r from-primary via-secondary to-primary rounded-3xl blur opacity-20 group-focus-within:opacity-40 transition duration-700 animate-gradient-x"></div>
              <div className="relative flex items-center bg-card/50 backdrop-blur-3xl rounded-3xl border border-white/10 shadow-3xl p-3 pl-8">
                <Search className="h-7 w-7 text-muted-foreground mr-4 group-focus-within:text-primary transition-colors" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="What are you looking for?"
                  className="w-full bg-transparent text-xl md:text-2xl text-foreground placeholder:text-muted-foreground/40 focus:outline-none py-4 font-medium"
                  autoFocus
                />
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={!query.trim()}
                  className="bg-gradient-to-r from-primary to-secondary text-white px-10 py-4 rounded-2xl font-black shadow-2xl hover:shadow-primary/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all uppercase tracking-widest text-xs sm:text-sm flex items-center gap-2"
                >
                  Search <ArrowRight className="w-5 h-5" />
                </motion.button>
              </div>
            </form>

            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={() => setIsSavedPanelOpen(true)}
                className="flex items-center gap-3 text-sm text-foreground hover:text-white transition-all bg-white/5 hover:bg-white/10 px-6 py-3 rounded-2xl border border-white/5 hover:border-primary/40 font-bold uppercase tracking-widest shadow-lg"
              >
                <Clock className="w-4 h-4 text-primary" />
                Watch Later Collection
                {savedItems && savedItems.length > 0 && (
                  <span className="bg-primary/20 text-primary px-3 py-0.5 rounded-lg text-[10px] font-black ml-1">
                    {savedItems.length}
                  </span>
                )}
              </button>
              
              <div className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/5 border border-white/5 text-[10px] uppercase tracking-widest font-black text-muted-foreground/60">
                <Globe className="w-4 h-4" />
                Connected to Global APIs
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="w-full space-y-12">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-48 space-y-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/20 blur-[60px] rounded-full animate-ping" />
                  <div className="w-20 h-20 rounded-3xl bg-card border border-white/10 flex items-center justify-center relative z-10">
                    <Loader2 className="w-10 h-10 animate-spin text-primary" />
                  </div>
                </div>
                <div className="text-center space-y-2">
                  <p className="text-2xl font-display font-bold text-foreground">Synthesizing intelligence</p>
                  <p className="text-muted-foreground text-sm font-medium animate-pulse">Querying global news networks & data streams...</p>
                </div>
              </div>
            ) : isError ? (
              <div className="glass-panel p-12 rounded-[3rem] text-center max-w-2xl mx-auto mt-12 border-destructive/20 shadow-2xl">
                <div className="w-16 h-16 bg-destructive/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Sparkles className="w-8 h-8 text-destructive" />
                </div>
                <p className="text-2xl font-display font-bold text-foreground mb-4">Connection interrupted</p>
                <p className="text-muted-foreground leading-relaxed">The data streams are currently unstable. Please verify your query or try again in a few moments.</p>
                <button 
                  onClick={() => setLocation("/")}
                  className="mt-8 px-8 py-3 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 font-bold text-xs uppercase tracking-widest transition-all"
                >
                  Return Home
                </button>
              </div>
            ) : searchResults ? (
              <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out">
                <AiAnswerBox answer={searchResults.aiAnswer} />
                
                <section>
                  <div className="flex flex-col sm:flex-row items-baseline justify-between gap-4 mb-10 border-b border-white/5 pb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                        <BookOpen className="w-6 h-6 text-primary" />
                      </div>
                      <h3 className="text-3xl font-display font-black tracking-tight">
                        Insights Stream
                      </h3>
                    </div>
                    <p className="text-muted-foreground font-medium flex items-center gap-2">
                      Showing results for <span className="text-foreground font-bold underline decoration-primary/40 underline-offset-4">"{searchResults.query}"</span>
                    </p>
                  </div>
                  
                  {searchResults.results.length === 0 ? (
                    <div className="text-center py-32 bg-white/5 rounded-[3rem] border border-white/5 border-dashed">
                      <p className="text-muted-foreground font-medium text-lg">No cards found in current data streams.</p>
                      <p className="text-sm text-muted-foreground/60 mt-1">Try broadening your search query.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {searchResults.results.map((result, index) => (
                        <ResultCard key={`${result.url}-${index}`} result={result} index={index} />
                      ))}
                    </div>
                  )}
                </section>
              </div>
            ) : null}
          </div>
        )}
      </main>

      <SavedItemsPanel 
        isOpen={isSavedPanelOpen} 
        onClose={() => setIsSavedPanelOpen(false)} 
      />
      
      {/* Decorative footer code */}
      <footer className={`py-12 border-t border-white/5 mt-auto relative z-10 ${isHome ? 'hidden' : 'block'}`}>
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-muted-foreground text-xs font-black uppercase tracking-[0.4em]">
            &copy; 2026 Hatrick Search Engine &bull; Designed by Harsha
          </p>
        </div>
      </footer>
    </div>
  );
}
