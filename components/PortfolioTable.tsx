'use client';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { formatPrice, formatChangePercent, getChangeColorClass } from '@/lib/utils';
import { removePortfolioItem, sellPortfolioItem } from '@/lib/actions/portfolio.actions';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from 'sonner';
import { useState } from 'react';
import { Loader2, Trash2, TrendingUp, TrendingDown, MinusCircle } from 'lucide-react';
import Link from 'next/link';

interface PortfolioItemData {
    id: string;
    symbol: string;
    company: string;
    quantity: number;
    avgBuyPrice: number;
    currentPrice: number;
    totalInvestment: number;
    currentValue: number;
    profitLoss: number;
    profitPercent: number;
    realizedProfit: number;
    updatedAt: string;
}

export default function PortfolioTable({ items }: { items: PortfolioItemData[] }) {
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [sellingItem, setSellingItem] = useState<PortfolioItemData | null>(null);
    const [sellQuantity, setSellQuantity] = useState<string>('');
    const [isSelling, setIsSelling] = useState(false);

    const handleDelete = async (symbol: string) => {
        setDeletingId(symbol);
        try {
            const res = await removePortfolioItem(symbol);
            if (res.success) {
                toast.success(`Removed ${symbol} from portfolio`);
            } else {
                toast.error(res.error || 'Failed to remove from portfolio');
            }
        } catch (error) {
            toast.error('An unexpected error occurred');
        } finally {
            setDeletingId(null);
        }
    };

    const handleSellSubmit = async () => {
        if (!sellingItem) return;
        const qty = parseFloat(sellQuantity);
        if (isNaN(qty) || qty <= 0 || qty > sellingItem.quantity) {
            toast.error('Invalid sell quantity');
            return;
        }
        setIsSelling(true);
        try {
            const res = await sellPortfolioItem(sellingItem.symbol, qty);
            if (res.success) {
                toast.success(`Sold ${qty} shares of ${sellingItem.symbol}`);
                setSellingItem(null);
                setSellQuantity('');
            } else {
                toast.error(res.error || 'Failed to sell');
            }
        } catch (error) {
            toast.error('An unexpected error occurred');
        } finally {
            setIsSelling(false);
        }
    };

    const activeItems = items.filter(item => item.quantity > 0);
    const closedItems = items.filter(item => item.quantity === 0);

    const totalInvestment = activeItems.reduce((sum, item) => sum + item.totalInvestment, 0);
    const totalCurrentValue = activeItems.reduce((sum, item) => sum + item.currentValue, 0);
    const totalUnrealizedProfit = totalCurrentValue - totalInvestment;
    const totalRealizedProfit = items.reduce((sum, item) => sum + item.realizedProfit, 0);
    const totalProfitLoss = totalUnrealizedProfit + totalRealizedProfit;
    const totalProfitPercent = totalInvestment > 0 ? (totalUnrealizedProfit / totalInvestment) * 100 : 0;

    if (!items || items.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 bg-gray-800/20 border border-gray-700/50 rounded-xl border-dashed">
                <h3 className="text-xl font-medium text-gray-200 mb-2">Portfolio is empty</h3>
                <p className="text-gray-500 text-center max-w-sm">
                    Use the form above to add your first mock stock trade and start tracking your simulated portfolio.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gray-800/40 border border-gray-700 p-5 rounded-xl">
                    <p className="text-sm text-gray-400 mb-1">Total Value</p>
                    <p className="text-2xl font-bold text-gray-100">{formatPrice(totalCurrentValue)}</p>
                </div>
                <div className="bg-gray-800/40 border border-gray-700 p-5 rounded-xl">
                    <p className="text-sm text-gray-400 mb-1">Total Investment</p>
                    <p className="text-2xl font-bold text-gray-100">{formatPrice(totalInvestment)}</p>
                </div>
                <div className="bg-gray-800/40 border border-gray-700 p-5 rounded-xl">
                    <p className="text-sm text-gray-400 mb-1">Total Net Profit/Loss</p>
                    <div className="flex items-center gap-2">
                        <p className={`text-2xl font-bold ${getChangeColorClass(totalProfitLoss)}`}>
                            {totalProfitLoss > 0 ? '+' : ''}{formatPrice(totalProfitLoss)}
                        </p>
                    </div>
                </div>
                <div className="bg-gray-800/40 border border-gray-700 p-5 rounded-xl">
                    <p className="text-sm text-gray-400 mb-1">Live Portfolio Return</p>
                    <div className="flex items-center gap-2">
                        {totalProfitPercent > 0 ? (
                            <TrendingUp className="h-5 w-5 text-[#0FEDBE]" />
                        ) : totalProfitPercent < 0 ? (
                            <TrendingDown className="h-5 w-5 text-red-500" />
                        ) : null}
                        <p className={`text-2xl font-bold ${getChangeColorClass(totalProfitPercent)}`}>
                            {formatChangePercent(totalProfitPercent)}
                        </p>
                    </div>
                </div>
            </div>

            <div className="rounded-xl border border-gray-700 bg-gray-800/30 overflow-hidden">
                <Table>
                    <TableHeader className="bg-gray-800/50">
                        <TableRow className="border-gray-700 hover:bg-transparent">
                            <TableHead className="text-gray-400 font-medium">Asset</TableHead>
                            <TableHead className="text-gray-400 font-medium text-right">Qty</TableHead>
                            <TableHead className="text-gray-400 font-medium text-right">Avg Buy Price</TableHead>
                            <TableHead className="text-gray-400 font-medium text-right">Current Price</TableHead>
                            <TableHead className="text-gray-400 font-medium text-right">Total Value</TableHead>
                            <TableHead className="text-gray-400 font-medium text-right">Live P&L</TableHead>
                            <TableHead className="text-gray-400 font-medium text-right">Realized P&L</TableHead>
                            <TableHead className="text-gray-400 font-medium text-center">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {activeItems.length === 0 ? (
                            <TableRow className="border-gray-700/50 hover:bg-gray-800/50 transition-colors">
                                <TableCell colSpan={8} className="text-center text-gray-500 py-8">
                                    No active positions.
                                </TableCell>
                            </TableRow>
                        ) : activeItems.map((item) => (
                            <TableRow key={item.id} className="border-gray-700/50 hover:bg-gray-800/50 transition-colors">
                                <TableCell>
                                    <Link href={`/stocks/${item.symbol}`} className="flex flex-col group">
                                        <span className="font-bold text-gray-200 group-hover:text-yellow-500 transition-colors">
                                            {item.symbol}
                                        </span>
                                        <span className="text-xs text-gray-500 truncate max-w-[150px]">
                                            {item.company}
                                        </span>
                                    </Link>
                                </TableCell>
                                <TableCell className="text-right font-medium text-gray-300">
                                    {item.quantity.toLocaleString(undefined, { maximumFractionDigits: 4 })}
                                </TableCell>
                                <TableCell className="text-right text-gray-300">
                                    {formatPrice(item.avgBuyPrice)}
                                </TableCell>
                                <TableCell className="text-right font-medium text-gray-200">
                                    {formatPrice(item.currentPrice)}
                                </TableCell>
                                <TableCell className="text-right font-semibold text-gray-100">
                                    {formatPrice(item.currentValue)}
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex flex-col items-end">
                                        <span className={`font-semibold ${getChangeColorClass(item.profitLoss)}`}>
                                            {item.profitLoss > 0 ? '+' : ''}{formatPrice(item.profitLoss)}
                                        </span>
                                        <span className={`text-xs ${getChangeColorClass(item.profitPercent)}`}>
                                            {formatChangePercent(item.profitPercent)}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-right">
                                    <span className={`font-semibold ${getChangeColorClass(item.realizedProfit)}`}>
                                        {item.realizedProfit > 0 ? '+' : ''}{formatPrice(item.realizedProfit)}
                                    </span>
                                </TableCell>
                                <TableCell className="text-center flex justify-center items-center gap-1">
                                    <Button
                                        size="sm"
                                        onClick={() => setSellingItem(item)}
                                        className="bg-red-500 hover:bg-red-600 text-gray-900 font-semibold h-8 px-3"
                                        title="Sell Shares"
                                    >
                                        Sell
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleDelete(item.symbol)}
                                        disabled={deletingId === item.symbol}
                                        className="text-gray-500 hover:text-red-500 hover:bg-red-500/10"
                                        title="Delete Trade History"
                                    >
                                        {deletingId === item.symbol ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <Trash2 className="h-4 w-4" />
                                        )}
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {closedItems.length > 0 && (
                <div className="mt-8 space-y-4">
                    <h3 className="text-lg font-semibold text-gray-200">Closed Trades / History</h3>
                    <div className="rounded-xl border border-gray-700 bg-gray-800/30 overflow-hidden">
                        <Table>
                            <TableHeader className="bg-gray-800/50">
                                <TableRow className="border-gray-700 hover:bg-transparent">
                                    <TableHead className="text-gray-400 font-medium">Asset</TableHead>
                                    <TableHead className="text-gray-400 font-medium text-right">Realized P&L</TableHead>
                                    <TableHead className="text-gray-400 font-medium text-center">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {closedItems.map((item) => (
                                    <TableRow key={item.id} className="border-gray-700/50 hover:bg-gray-800/50 transition-colors">
                                        <TableCell>
                                            <Link href={`/stocks/${item.symbol}`} className="flex flex-col group">
                                                <span className="font-bold text-gray-200 group-hover:text-yellow-500 transition-colors">
                                                    {item.symbol}
                                                </span>
                                                <span className="text-xs text-gray-500 truncate max-w-[150px]">
                                                    {item.company}
                                                </span>
                                            </Link>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <span className={`font-semibold ${getChangeColorClass(item.realizedProfit)}`}>
                                                {item.realizedProfit > 0 ? '+' : ''}{formatPrice(item.realizedProfit)}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDelete(item.symbol)}
                                                disabled={deletingId === item.symbol}
                                                className="text-gray-500 hover:text-red-500 hover:bg-red-500/10"
                                                title="Delete Trade History"
                                            >
                                                {deletingId === item.symbol ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <Trash2 className="h-4 w-4" />
                                                )}
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            )}

            <Dialog open={!!sellingItem} onOpenChange={(open) => !open && setSellingItem(null)}>
                <DialogContent className="bg-gray-900 border-gray-700 text-gray-200 sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Sell {sellingItem?.symbol}</DialogTitle>
                        <DialogDescription className="text-gray-400">
                            You currently own {sellingItem?.quantity} shares of {sellingItem?.company}.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="sellQty">Quantity to Sell</Label>
                            <Input
                                id="sellQty"
                                type="number"
                                placeholder="0"
                                min="0.0001"
                                step="any"
                                max={sellingItem?.quantity}
                                value={sellQuantity}
                                onChange={(e) => setSellQuantity(e.target.value)}
                                className="bg-gray-800 border-gray-700 text-gray-200"
                            />
                        </div>
                        {parseFloat(sellQuantity) > 0 && sellingItem && (
                            <div className="bg-gray-800 p-3 rounded-lg text-sm space-y-1">
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Current Price:</span>
                                    <span>{formatPrice(sellingItem.currentPrice)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Estimated Value:</span>
                                    <span>{formatPrice(sellingItem.currentPrice * parseFloat(sellQuantity))}</span>
                                </div>
                                <div className="flex justify-between font-semibold">
                                    <span className="text-gray-400">Estimated Realized P&L:</span>
                                    <span className={getChangeColorClass((sellingItem.currentPrice - sellingItem.avgBuyPrice) * parseFloat(sellQuantity))}>
                                        {((sellingItem.currentPrice - sellingItem.avgBuyPrice) * parseFloat(sellQuantity)) > 0 ? '+' : ''}
                                        {formatPrice((sellingItem.currentPrice - sellingItem.avgBuyPrice) * parseFloat(sellQuantity))}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button
                            variant="ghost"
                            onClick={() => setSellingItem(null)}
                            className="hover:bg-gray-800 hover:text-gray-200"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSellSubmit}
                            disabled={isSelling || !sellQuantity || isNaN(parseFloat(sellQuantity)) || parseFloat(sellQuantity) <= 0 || parseFloat(sellQuantity) > (sellingItem?.quantity || 0)}
                            className="bg-yellow-500 hover:bg-yellow-400 text-gray-900"
                        >
                            {isSelling && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Confirm Sell
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
