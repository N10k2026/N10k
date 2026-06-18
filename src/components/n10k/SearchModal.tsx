'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Search, X, Clock, ArrowRight } from 'lucide-react';
import { useCartStore, Product } from '@/lib/store';
import { Badge } from '@/components/ui/badge';
import { parseStoredStringArray } from '@/lib/product-utils';
import { useFocusTrap } from '@/hooks/use-focus-trap';

const RECENT_SEARCHES_KEY = 'n10k-recent-searches';
const MAX_RECENT = 5;

export default function SearchModal() {
  const isSearchOpen = useCartStore((state) => state.isSearchOpen);
  const setSearchOpen = useCartStore((state) => state.setSearchOpen);
  const products = useCartStore((state) => state.products);
  const setSelectedProduct = useCartStore((state) => state.setSelectedProduct);
  const setDetailOpen = useCartStore((state) => state.setDetailOpen);

  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const dialogRef = useFocusTrap(isSearchOpen, () => setSearchOpen(false));

  // Debounce search input (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
      setSelectedIndex(-1);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  // Load recent searches from localStorage (lazy initializer)
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      return parseStoredStringArray(localStorage.getItem(RECENT_SEARCHES_KEY));
    } catch {
      return [];
    }
  });

  // Reset query state when the modal opens so each search session starts fresh.
  // This is a legitimate "sync external state (store) → local state" use case,
  // so the set-state-in-effect rule is intentionally disabled here.
  useEffect(() => {
    if (isSearchOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setQuery('');
      setDebouncedQuery('');
      setSelectedIndex(-1);
    }
  }, [isSearchOpen]);

  useEffect(() => {
    if (isSearchOpen && inputRef.current) {
      const focusTimer = setTimeout(() => inputRef.current?.focus(), 100);
      return () => clearTimeout(focusTimer);
    }
  }, [isSearchOpen]);

  // Close on Escape key — focus trap also handles Escape
  useEffect(() => {
    if (isSearchOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isSearchOpen]);

  // Legacy escape listener kept for backdrop consistency
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isSearchOpen) {
        setSearchOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen, setSearchOpen]);

  // Search logic — client-side filtering
  const searchResults = useMemo(() => {
    if (!debouncedQuery.trim()) return [];
    const q = debouncedQuery.toLowerCase().trim();
    return products.filter((p: Product) =>
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.colors.some((c) => c.name.toLowerCase().includes(q))
    ).slice(0, 8);
  }, [debouncedQuery, products]);

  // Save to recent searches
  const saveRecentSearch = useCallback((term: string) => {
    try {
      const existing = parseStoredStringArray(localStorage.getItem(RECENT_SEARCHES_KEY));
      const updated = [term, ...existing.filter((s) => s !== term)].slice(0, MAX_RECENT);
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
      setRecentSearches(updated);
    } catch {
      // Ignore storage errors
    }
  }, []);

  // Remove recent search
  const removeRecentSearch = useCallback((term: string) => {
    try {
      const existing = parseStoredStringArray(localStorage.getItem(RECENT_SEARCHES_KEY));
      const updated = existing.filter((s) => s !== term);
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
      setRecentSearches(updated);
    } catch {
      // Ignore storage errors
    }
  }, []);

  // Select product
  const handleSelectProduct = useCallback((_product: Product) => {
    setSearchOpen(false);
    if (debouncedQuery.trim()) {
      saveRecentSearch(debouncedQuery.trim());
    }
  }, [setSearchOpen, saveRecentSearch, debouncedQuery]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    const hasQuery = debouncedQuery.trim().length > 0;
    const totalItems = hasQuery ? searchResults.length : recentSearches.length;

    if (totalItems === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < totalItems - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : totalItems - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex < 0) return;
      if (hasQuery && searchResults.length > 0) {
        handleSelectProduct(searchResults[selectedIndex]);
      } else if (!hasQuery && recentSearches.length > 0) {
        setQuery(recentSearches[selectedIndex]);
        setDebouncedQuery(recentSearches[selectedIndex]);
      }
    }
  };

  // Highlight matching text
  const highlightText = (text: string, highlight: string) => {
    if (!highlight.trim()) return text;
    const escaped = highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escaped})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) =>
      part.toLowerCase() === highlight.toLowerCase() ? (
        <mark key={i} className="bg-[#E30613]/30 text-foreground rounded px-0.5">{part}</mark>
      ) : (
        part
      )
    );
  };

  // Scroll selected item into view
  useEffect(() => {
    if (selectedIndex >= 0 && resultsRef.current) {
      const items = resultsRef.current.querySelectorAll('[data-search-item]');
      if (items[selectedIndex]) {
        items[selectedIndex].scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  if (!isSearchOpen) return null;

  return (
    <div className="fixed inset-0 z-[60]" role="presentation">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in"
        onClick={() => setSearchOpen(false)}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        ref={dialogRef as React.RefObject<HTMLDivElement>}
        role="dialog"
        aria-modal="true"
        aria-labelledby="search-modal-title"
        className="relative z-10 max-w-2xl mx-auto mt-[10vh] px-4 animate-slide-up"
      >
        <h2 id="search-modal-title" className="sr-only">Buscar productos</h2>
        <div className="bg-card/98 backdrop-blur-2xl border border-border rounded-2xl shadow-2xl shadow-black/60 overflow-hidden">
          {/* Search Input */}
          <div className="relative border-b border-border">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" aria-hidden="true" />
            <input
              ref={inputRef}
              id="search-input"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Buscar productos, categorías, colores..."
              aria-label="Buscar productos, categorías o colores"
              className="w-full pl-12 pr-12 py-5 bg-transparent text-foreground text-base font-montserrat-medium placeholder:text-muted-foreground/60 focus:outline-none"
              autoComplete="off"
            />
            <button
              onClick={() => setSearchOpen(false)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              aria-label="Cerrar búsqueda"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Results / Recent Searches */}
          <div ref={resultsRef} className="max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
            {/* Search Results */}
            {debouncedQuery.trim() && searchResults.length > 0 && (
              <div className="py-2">
                <p className="px-4 py-2 text-[10px] font-montserrat-bold tracking-[0.15em] text-muted-foreground uppercase">
                  {searchResults.length} resultado{searchResults.length > 1 ? 's' : ''}
                </p>
                {searchResults.map((product, index) => (
                  <button
                    key={product.id}
                    data-search-item
                    onClick={() => handleSelectProduct(product)}
                    className={`w-full flex items-center gap-4 px-4 py-3 transition-colors duration-200 cursor-pointer text-left ${
                      selectedIndex === index
                        ? 'bg-[#E30613]/10'
                        : 'hover:bg-accent/10'
                    }`}
                  >
                    <img
                      src={product.images[0] || product.image}
                      alt={product.name}
                      className="w-14 h-14 rounded-xl object-cover shrink-0 border border-border/50"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-foreground text-sm font-montserrat-extrabold truncate">
                        {highlightText(product.name, debouncedQuery)}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge className="bg-[#E30613]/15 text-[#E30613] text-[9px] font-montserrat-bold px-1.5 py-0 rounded-md border-0">
                          {highlightText(product.category, debouncedQuery)}
                        </Badge>
                        {product.isNew && (
                          <span className="text-[9px] font-montserrat-bold text-green-500 uppercase">Nuevo</span>
                        )}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[#E30613] text-sm font-montserrat-extrabold">${product.price.toFixed(2)}</p>
                      {product.originalPrice && (
                        <p className="text-muted-foreground/50 text-[10px] line-through">${product.originalPrice.toFixed(2)}</p>
                      )}
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground/30 shrink-0" />
                  </button>
                ))}
              </div>
            )}

            {/* No results */}
            {debouncedQuery.trim() && searchResults.length === 0 && (
              <div className="py-12 text-center">
                <Search className="h-10 w-10 text-muted-foreground/20 mx-auto mb-3" />
                <p className="text-muted-foreground text-sm font-montserrat-medium">No se encontraron resultados para</p>
                <p className="text-foreground text-sm font-montserrat-bold mt-1">&ldquo;{debouncedQuery}&rdquo;</p>
                <p className="text-muted-foreground/50 text-xs font-montserrat-medium mt-2">
                  Intenta buscar por nombre, categoría o color
                </p>
              </div>
            )}

            {/* Recent Searches (shown when no query) */}
            {!debouncedQuery.trim() && recentSearches.length > 0 && (
              <div className="py-2">
                <p className="px-4 py-2 text-[10px] font-montserrat-bold tracking-[0.15em] text-muted-foreground uppercase">
                  Búsquedas recientes
                </p>
                {recentSearches.map((term, index) => (
                  <div
                    key={term}
                    data-search-item
                    className={`flex items-center gap-3 px-4 py-2.5 transition-colors duration-200 ${
                      selectedIndex === index
                        ? 'bg-[#E30613]/10'
                        : 'hover:bg-accent/10'
                    }`}
                  >
                    <Clock className="h-4 w-4 text-muted-foreground/40 shrink-0" />
                    <button
                      onClick={() => {
                        setQuery(term);
                        setDebouncedQuery(term);
                      }}
                      className="flex-1 text-left text-sm text-foreground font-montserrat-medium cursor-pointer hover:text-[#E30613] transition-colors"
                    >
                      {term}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeRecentSearch(term);
                      }}
                      className="text-muted-foreground/40 hover:text-foreground transition-colors cursor-pointer"
                      aria-label={`Eliminar búsqueda: ${term}`}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Empty state when no recent searches */}
            {!debouncedQuery.trim() && recentSearches.length === 0 && (
              <div className="py-10 text-center">
                <Search className="h-8 w-8 text-muted-foreground/20 mx-auto mb-2" />
                <p className="text-muted-foreground/60 text-sm font-montserrat-medium">
                  Escribe para buscar productos
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
