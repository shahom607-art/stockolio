export const dynamic = 'force-dynamic';

import TradingViewWidget from '@/components/TradingViewWidget';
import WatchlistButton from '@/components/WatchlistButton';
import { WatchlistItem } from '@/database/models/watchlist.model';
import { getStocksDetails } from '@/lib/actions/finnhub.actions';
import { getUserWatchlist } from '@/lib/actions/watchlist.actions';
import {
    SYMBOL_INFO_WIDGET_CONFIG,
    CANDLE_CHART_WIDGET_CONFIG,
    BASELINE_WIDGET_CONFIG,
    TECHNICAL_ANALYSIS_WIDGET_CONFIG,
    COMPANY_PROFILE_WIDGET_CONFIG,
    COMPANY_FINANCIALS_WIDGET_CONFIG,
} from '@/lib/constants';


export default async function StockDetails({ params }: StockDetailsPageProps) {
    const { symbol } = await params;
    const scriptUrl = `https://s3.tradingview.com/external-embedding/embed-widget-`;

    const stockData = await getStocksDetails(symbol.toUpperCase());
    const watchlist = await getUserWatchlist();

    const isInWatchlist = watchlist.some(
        (item: WatchlistItem) => item.symbol === symbol.toUpperCase()
    );

    if (!stockData) {
        return (
            <div className='flex flex-col items-center justify-center min-h-[70vh] text-center px-4'>

                <h1 className='text-3xl md:text-4xl font-bold text-gray-100 mb-4'>
                    Data Unavailable
                </h1>
                <p className='text-gray-400 max-w-lg mb-8 text-lg'>
                    We couldn't fetch market data for <span className="font-semibold text-yellow-500">{symbol}</span>. This is typically because it's an international stock outside the US market, which isn't supported on our free data tier.
                </p>
                <a href="/" className='px-8 py-3 bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-semibold rounded-xl transition-all hover:scale-105 active:scale-95 shadow-lg shadow-yellow-500/20'>
                    Back to Dashboard
                </a>
            </div>
        );
    }

    return (
        <div className='flex min-h-screen p-4 md:p-6 lg:p-8'>
            <section className='grid grid-cols-1 md:grid-cols-2 gap-8 w-full'>
                {/* Left column */}
                <div className='flex flex-col gap-6'>
                    <TradingViewWidget
                        scriptURL={`${scriptUrl}symbol-info.js`}
                        config={SYMBOL_INFO_WIDGET_CONFIG(symbol)}
                        height={170}
                    />

                    <TradingViewWidget
                        scriptURL={`${scriptUrl}advanced-chart.js`}
                        config={CANDLE_CHART_WIDGET_CONFIG(symbol)}
                        className='custom-chart'
                        height={600}
                    />

                    <TradingViewWidget
                        scriptURL={`${scriptUrl}advanced-chart.js`}
                        config={BASELINE_WIDGET_CONFIG(symbol)}
                        className='custom-chart'
                        height={600}
                    />
                </div>

                <div className='flex flex-col gap-6'>
                    <div className='flex items-center justify-between'>
                        <WatchlistButton
                            symbol={symbol}
                            company={stockData.company}
                            isInWatchlist={isInWatchlist}
                            type='button'
                        />
                    </div>

                    <TradingViewWidget
                        scriptURL={`${scriptUrl}technical-analysis.js`}
                        config={TECHNICAL_ANALYSIS_WIDGET_CONFIG(symbol)}
                        height={400}
                    />

                    <TradingViewWidget
                        scriptURL={`${scriptUrl}company-profile.js`}
                        config={COMPANY_PROFILE_WIDGET_CONFIG(symbol)}
                        height={440}
                    />

                    <TradingViewWidget
                        scriptURL={`${scriptUrl}financials.js`}
                        config={COMPANY_FINANCIALS_WIDGET_CONFIG(symbol)}
                        height={464}
                    />
                </div>
            </section>
        </div>
    );
}