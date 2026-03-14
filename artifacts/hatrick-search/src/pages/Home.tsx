import { useState, FormEvent, useEffect } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Search, Sparkles, Hexagon, Loader2, Bookmark as BookmarkIcon } from "lucide-react";
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

  // Sync state when URL changes (e.g. back button)
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
    <div className="min-h-screen bg-background relative selection:bg-primary/30 selection:text-primary-foreground">
      
      {/* Universal Header (only visible on results page) */}
      {!isHome && (
        <motion.header 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-white/5 shadow-sm"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
            <div 
              className="flex items-center gap-2 cursor-pointer group"
              onClick={() => setLocation("/")}
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg group-hover:shadow-primary/50 transition-all">
                <Hexagon className="w-5 h-5 text-white" />
              </div>
              <span className="font-display font-bold text-lg hidden sm:block">Hatrick</span>
            </div>

            <form onSubmit={handleSearch} className="flex-1 max-w-2xl relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              </div>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask the universe..."
                className="w-full bg-white/5 border border-white/10 text-foreground rounded-full pl-11 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all shadow-inner"
              />
            </form>

            <button
              onClick={() => setIsSavedPanelOpen(true)}
              className="relative p-2 rounded-full hover:bg-white/10 transition-colors text-muted-foreground hover:text-foreground"
            >
              <BookmarkIcon className="w-5 h-5" />
              {savedItems && savedItems.length > 0 && (
                <span className="absolute top-0 right-0 w-4 h-4 bg-secondary text-white text-[10px] font-bold flex items-center justify-center rounded-full transform translate-x-1 -translate-y-1 shadow-sm">
                  {savedItems.length}
                </span>
              )}
            </button>
          </div>
        </motion.header>
      )}

      {/* Main Content Area */}
      <main className={`relative z-10 ${isHome ? 'flex flex-col items-center justify-center min-h-screen px-4' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'}`}>
        
        {isHome ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-3xl text-center"
          >
            <div className="mb-8 flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/30 blur-[60px] rounded-full" />
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-2xl relative z-10 border border-white/20">
                  <Hexagon className="w-12 h-12 text-white" />
                </div>
              </div>
            </div>

            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold font-display text-gradient mb-3 drop-shadow-sm">
              Hatrick Search
            </h1>
            <p className="text-muted-foreground uppercase tracking-[0.2em] text-xs sm:text-sm font-semibold mb-12">
              powered by harsha
            </p>

            <form onSubmit={handleSearch} className="relative group max-w-2xl mx-auto">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary to-secondary rounded-full blur opacity-25 group-focus-within:opacity-50 transition duration-500"></div>
              <div className="relative flex items-center bg-card rounded-full border border-white/10 shadow-2xl p-2 pl-6">
                <Search className="h-6 w-6 text-muted-foreground mr-3" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ask anything..."
                  className="w-full bg-transparent text-lg md:text-xl text-foreground placeholder:text-muted-foreground/60 focus:outline-none py-3"
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={!query.trim()}
                  className="bg-gradient-to-r from-primary to-secondary text-white px-8 py-3 rounded-full font-semibold shadow-lg hover:shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:-translate-y-0.5 active:translate-y-0"
                >
                  Search
                </button>
              </div>
            </form>

            {/* Quick access to saved items from home */}
            <div className="mt-12 flex justify-center">
              <button
                onClick={() => setIsSavedPanelOpen(true)}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-secondary transition-colors bg-white/5 hover:bg-white/10 px-4 py-2 rounded-full border border-white/5"
              >
                <BookmarkIcon className="w-4 h-4" />
                View Saved Explorations
                {savedItems && savedItems.length > 0 && (
                  <span className="bg-secondary/20 text-secondary px-2 py-0.5 rounded-full text-xs font-bold ml-1">
                    {savedItems.length}
                  </span>
                )}
              </button>
            </div>
          </motion.div>
        ) : (
          <div className="w-full">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-32 space-y-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
                  <Loader2 className="w-12 h-12 animate-spin text-primary relative z-10" />
                </div>
                <p className="text-muted-foreground font-medium animate-pulse">Synthesizing intelligence...</p>
              </div>
            ) : isError ? (
              <div className="glass-panel p-8 rounded-2xl text-center max-w-2xl mx-auto mt-12 border-destructive/30">
                <p className="text-destructive font-semibold text-lg mb-2">Failed to retrieve data</p>
                <p className="text-muted-foreground">The universe is currently unresponsive. Try adjusting your query.</p>
              </div>
            ) : searchResults ? (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <AiAnswerBox answer={searchResults.aiAnswer} />
                
                <div>
                  <h3 className="text-xl font-display font-bold mb-6 flex items-center gap-2 border-b border-white/5 pb-4">
                    <span className="text-muted-foreground">Sources for</span>
                    <span className="text-foreground">"{searchResults.query}"</span>
                  </h3>
                  
                  {searchResults.results.length === 0 ? (
                    <div className="text-center py-20 text-muted-foreground">
                      No cards found in the data streams.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {searchResults.results.map((result, index) => (
                        <ResultCard key={`${result.url}-${index}`} result={result} index={index} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        )}
      </main>

      <SavedItemsPanel 
        isOpen={isSavedPanelOpen} 
        onClose={() => setIsSavedPanelOpen(false)} 
      />
    </div>
  );
}
