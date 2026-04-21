'use client';

import React, { useMemo, useState } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import {
    addToWatchlist,
    removeFromWatchlist,
} from '@/lib/actions/watchlist.actions';
import { Star, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const WatchlistButton = ({
                             symbol,
                             company,
                             isInWatchlist,
                             showTrashIcon = false,
                             type = 'button',
                             onWatchlistChange,
                         }: WatchlistButtonProps) => {
    const [added, setAdded] = useState<boolean>(!!isInWatchlist);

    const label = useMemo(() => {
        if (type === 'icon') return '';
        return added ? 'Remove from Watchlist' : 'Add to Watchlist';
    }, [added, type]);

    const toggleWatchlist = async () => {
        try {
            const result = added
                ? await removeFromWatchlist(symbol)
                : await addToWatchlist(symbol, company);

            if (result?.success) {
                toast.success(
                    added ? 'Removed from Watchlist' : 'Added to Watchlist',
                    {
                        description: `${company} ${
                            added ? 'removed from' : 'added to'
                        } your watchlist`,
                    }
                );

                onWatchlistChange?.(symbol, !added);
            } else {
                throw new Error('Something went wrong');
            }
        } catch (error) {
            setAdded((prev) => !prev);

            toast.error('Action failed', {
                description: 'Please try again',
            });
        }
    };

    const debouncedToggle = useDebounce(toggleWatchlist, 300);

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();

        setAdded((prev) => !prev);
        debouncedToggle();
    };

    if (type === 'icon') {
        return (
            <button
                title={
                    added
                        ? `Remove ${symbol} from watchlist`
                        : `Add ${symbol} to watchlist`
                }
                aria-label={
                    added
                        ? `Remove ${symbol} from watchlist`
                        : `Add ${symbol} to watchlist`
                }
                className={`watchlist-icon-btn ${
                    added ? 'watchlist-icon-added' : ''
                }`}
                onClick={handleClick}
            >
                <Star fill={added ? 'currentColor' : 'none'} />
            </button>
        );
    }

    return (
        <button
            className={`watchlist-btn ${added ? 'watchlist-remove' : ''}`}
            onClick={handleClick}
        >
            {showTrashIcon && added && <Trash2 className="w-5 h-5 mr-2" />}
            <span>{label}</span>
        </button>
    );
};

export default WatchlistButton;