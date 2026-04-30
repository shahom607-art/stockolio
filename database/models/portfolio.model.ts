import { Schema, model, models, type Document, type Model } from 'mongoose';

export interface PortfolioItem extends Document {
    userId: string;
    symbol: string;
    company: string;
    quantity: number;
    avgBuyPrice: number;
    realizedProfit: number;
    updatedAt: Date;
}

const PortfolioSchema = new Schema<PortfolioItem>(
    {
        userId: { type: String, required: true, index: true },
        symbol: { type: String, required: true, uppercase: true, trim: true },
        company: { type: String, required: true, trim: true },
        quantity: { type: Number, required: true, min: 0 },
        avgBuyPrice: { type: Number, required: true, min: 0 },
        realizedProfit: { type: Number, default: 0 },
        updatedAt: { type: Date, default: Date.now },
    },
    { timestamps: false }
);

// Prevent duplicate symbols per user for consolidated positions
PortfolioSchema.index({ userId: 1, symbol: 1 }, { unique: true });

export const Portfolio: Model<PortfolioItem> =
    (models?.Portfolio as Model<PortfolioItem>) || model<PortfolioItem>('Portfolio', PortfolioSchema);
