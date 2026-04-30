import { Metadata } from 'next';
import { getPortfolioWithData } from '@/lib/actions/portfolio.actions';
import AddPortfolioItemForm from '@/components/forms/AddPortfolioItemForm';
import PortfolioTable from '@/components/PortfolioTable';

export const metadata: Metadata = {
    title: 'Portfolio Game | Stockolio',
    description: 'Portfolio game to practice trading strategies.',
};

export default async function GameModePage() {
    const portfolioItems = await getPortfolioWithData();

    return (
        <div className="flex-1 w-full p-4 md:p-6 lg:p-8 max-w-7xl mx-auto min-h-screen">
            <div className="mb-8">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-100 tracking-tight">
                    Portfolio Game
                </h1>
                <p className="text-gray-400 mt-2">
                    Practice trading without risking real money. Add stocks to your virtual portfolio and track their live profit and loss.
                </p>
            </div>

            <AddPortfolioItemForm />

            <div className="mt-8">
                <h2 className="text-2xl font-semibold text-gray-100 mb-6">Your Positions</h2>
                <PortfolioTable items={portfolioItems} />
            </div>
        </div>
    );
}
