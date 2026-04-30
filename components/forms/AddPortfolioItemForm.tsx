'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { addPortfolioItem } from '@/lib/actions/portfolio.actions';
import { toast } from 'sonner';
import { Loader2, Plus, Search } from 'lucide-react';
import { searchStocks } from '@/lib/actions/finnhub.actions';
import { useDebounce } from '@/hooks/useDebounce';
import { useEffect, useRef, useCallback } from 'react';

export default function AddPortfolioItemForm() {
    const [symbol, setSymbol] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [quantity, setQuantity] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchResults = useCallback(async () => {
        if (!searchTerm.trim()) {
            setSearchResults([]);
            return;
        }
        setIsSearching(true);
        try {
            const results = await searchStocks(searchTerm.trim());
            setSearchResults(results || []);
        } catch (e) {
            setSearchResults([]);
        } finally {
            setIsSearching(false);
        }
    }, [searchTerm]);

    const debouncedFetch = useDebounce(fetchResults, 300);

    useEffect(() => {
        if (showDropdown) {
            debouncedFetch();
        }
    }, [searchTerm, debouncedFetch, showDropdown]);

    const handleSelectStock = (selectedSymbol: string) => {
        setSymbol(selectedSymbol);
        setSearchTerm(selectedSymbol);
        setShowDropdown(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!symbol) {
            toast.error('Please enter a symbol');
            return;
        }

        const qty = Number(quantity);
        if (isNaN(qty) || qty <= 0) {
            toast.error('Please enter a valid quantity');
            return;
        }

        setIsLoading(true);

        try {
            const res = await addPortfolioItem(symbol, qty);
            
            if (res.success) {
                toast.success(`Successfully added ${qty} shares of ${symbol.toUpperCase()}`);
                setSymbol('');
                setSearchTerm('');
                setQuantity('');
            } else {
                toast.error(res.error || 'Failed to add to portfolio');
            }
        } catch (error) {
            toast.error('An unexpected error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-gray-800/50 border border-gray-700 p-6 rounded-xl shadow-lg mb-8">
            <h2 className="text-xl font-semibold text-gray-100 mb-6">Portfolio Game</h2>
            
            <div className="flex flex-col sm:flex-row gap-4 items-end">
                <div className="flex-1 w-full space-y-2 relative" ref={dropdownRef}>
                    <Label htmlFor="symbol" className="text-gray-300">Stock Symbol</Label>
                    <div className="relative">
                        <Input 
                            id="symbol" 
                            placeholder="e.g. AAPL or Apple" 
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value.toUpperCase());
                                setSymbol(e.target.value.toUpperCase());
                                setShowDropdown(true);
                            }}
                            onFocus={() => setShowDropdown(true)}
                            className="bg-gray-900 border-gray-700 text-gray-100 placeholder:text-gray-500 pl-10"
                            disabled={isLoading}
                            autoComplete="off"
                        />
                        <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-500" />
                    </div>
                    
                    {showDropdown && searchTerm.trim() !== '' && (
                        <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                            {isSearching ? (
                                <div className="p-4 text-center text-gray-400 text-sm flex items-center justify-center">
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Searching...
                                </div>
                            ) : searchResults.length > 0 ? (
                                <ul className="py-1">
                                    {searchResults.map((result, index) => (
                                        <li 
                                            key={`${result.symbol}-${index}`}
                                            onClick={() => handleSelectStock(result.symbol)}
                                            className="px-4 py-2 hover:bg-gray-700 cursor-pointer flex flex-col"
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="font-bold text-gray-200">{result.symbol}</span>
                                                <span className="text-xs text-gray-500">{result.type}</span>
                                            </div>
                                            <span className="text-xs text-gray-400 truncate">{result.name} | {result.exchange}</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="p-4 text-center text-gray-400 text-sm">
                                    No stocks found
                                </div>
                            )}
                        </div>
                    )}
                </div>
                
                <div className="flex-1 w-full space-y-2">
                    <Label htmlFor="quantity" className="text-gray-300">Quantity</Label>
                    <Input 
                        id="quantity" 
                        type="number"
                        min="1"
                        step="any"
                        placeholder="e.g. 10" 
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        className="bg-gray-900 border-gray-700 text-gray-100 placeholder:text-gray-500"
                        disabled={isLoading}
                    />
                </div>
                
                <Button 
                    type="submit" 
                    disabled={isLoading || !symbol || !quantity}
                    className="w-full sm:w-auto bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-semibold"
                >
                    {isLoading ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                        <Plus className="h-4 w-4 mr-2" />
                    )}
                    Add to Portfolio
                </Button>
            </div>
            

        </form>
    );
}
