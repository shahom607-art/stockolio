'use server';

import { connectToDatabase } from '@/database/mongoose';
import { Portfolio } from '@/database/models/portfolio.model';
import { revalidatePath } from 'next/cache';
import { auth } from '../better-auth/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getStocksDetails } from '@/lib/actions/finnhub.actions';

export const addPortfolioItem = async (symbol: string, quantity: number) => {
    try {
        if (!symbol || quantity <= 0) {
            return { success: false, error: 'Invalid symbol or quantity' };
        }

        await connectToDatabase();

        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user) redirect('/sign-in');

        const upperSymbol = symbol.toUpperCase().trim();

        // Fetch current price to use as the buy price
        const stockData = await getStocksDetails(upperSymbol);
        if (!stockData || !stockData.currentPrice) {
            return { success: false, error: "We couldn't fetch market data for this symbol. This is typically because it's an international stock outside the US market, which isn't supported on our free data tier." };
        }

        const newBuyPrice = stockData.currentPrice;
        const newQty = Number(quantity);

        const existingItem = await Portfolio.findOne({
            userId: session.user.id,
            symbol: upperSymbol,
        });

        if (existingItem) {
            const oldQty = existingItem.quantity;
            const oldBuyPrice = existingItem.avgBuyPrice;

            const totalQty = oldQty + newQty;
            const avgBuyPrice = ((oldBuyPrice * oldQty) + (newBuyPrice * newQty)) / totalQty;

            existingItem.quantity = totalQty;
            existingItem.avgBuyPrice = avgBuyPrice;
            existingItem.updatedAt = new Date();

            await existingItem.save();
        } else {
            const newItem = new Portfolio({
                userId: session.user.id,
                symbol: upperSymbol,
                company: stockData.company || upperSymbol,
                quantity: newQty,
                avgBuyPrice: newBuyPrice,
                updatedAt: new Date(),
            });
            await newItem.save();
        }

        revalidatePath('/game');
        return { success: true };
    } catch (error) {
        console.error('Error adding to portfolio:', error);
        return { success: false, error: 'Failed to add stock to portfolio' };
    }
};

export const getPortfolioWithData = async () => {
    try {
        await connectToDatabase();

        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user) redirect('/sign-in');

        const portfolio = await Portfolio.find({ userId: session.user.id }).sort({ updatedAt: -1 }).lean();

        if (portfolio.length === 0) return [];

        const portfolioWithData = await Promise.all(
            portfolio.map(async (item) => {
                const stockData = await getStocksDetails(item.symbol);
                const currentPrice = stockData?.currentPrice || item.avgBuyPrice;

                const totalInvestment = item.avgBuyPrice * item.quantity;
                const currentValue = currentPrice * item.quantity;
                const profitLoss = currentValue - totalInvestment;
                const profitPercent = totalInvestment > 0 ? (profitLoss / totalInvestment) * 100 : 0;

                return {
                    id: item._id.toString(),
                    symbol: item.symbol,
                    company: item.company,
                    quantity: item.quantity,
                    avgBuyPrice: item.avgBuyPrice,
                    realizedProfit: item.realizedProfit || 0,
                    currentPrice: currentPrice,
                    totalInvestment: totalInvestment,
                    currentValue: currentValue,
                    profitLoss: profitLoss,
                    profitPercent: profitPercent,
                    updatedAt: item.updatedAt,
                };
            })
        );

        return JSON.parse(JSON.stringify(portfolioWithData));
    } catch (error) {
        console.error('Error loading portfolio:', error);
        throw new Error('Failed to fetch portfolio');
    }
};

export const sellPortfolioItem = async (symbol: string, sellQty: number) => {
    try {
        if (!symbol || sellQty <= 0) {
            return { success: false, error: 'Invalid symbol or quantity' };
        }

        await connectToDatabase();

        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user) redirect('/sign-in');

        const upperSymbol = symbol.toUpperCase().trim();

        const existingItem = await Portfolio.findOne({
            userId: session.user.id,
            symbol: upperSymbol,
        });

        if (!existingItem) {
            return { success: false, error: 'Portfolio item not found' };
        }

        if (sellQty > existingItem.quantity) {
            return { success: false, error: 'Cannot sell more shares than you own' };
        }

        const stockData = await getStocksDetails(upperSymbol);
        if (!stockData || !stockData.currentPrice) {
            return { success: false, error: "Failed to fetch current market price for selling." };
        }

        const currentPrice = stockData.currentPrice;

        const profitPerShare = currentPrice - existingItem.avgBuyPrice;
        const totalRealizedProfit = profitPerShare * sellQty;

        existingItem.quantity -= sellQty;
        existingItem.realizedProfit = (existingItem.realizedProfit || 0) + totalRealizedProfit;
        existingItem.updatedAt = new Date();

        await existingItem.save();

        revalidatePath('/game');
        return { success: true };
    } catch (error) {
        console.error('Error selling portfolio item:', error);
        return { success: false, error: 'Failed to sell stock' };
    }
};

export const removePortfolioItem = async (symbol: string) => {
    try {
        await connectToDatabase();

        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user) redirect('/sign-in');

        await Portfolio.deleteOne({
            userId: session.user.id,
            symbol: symbol.toUpperCase(),
        });

        revalidatePath('/game');
        return { success: true };
    } catch (error) {
        console.error('Error removing from portfolio:', error);
        return { success: false, error: 'Failed to remove stock from portfolio' };
    }
};
