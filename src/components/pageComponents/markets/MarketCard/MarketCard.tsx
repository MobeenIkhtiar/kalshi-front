import React from 'react';
import Button from '@components/reusable/Button';

interface MarketCardProps {
    question: string;
    category: string;
    price: string;
    roi: string;
    volume: string;
    probability: string;
    sentiment: 'Bullish' | 'Bearish';
    onViewDetails?: () => void;
    onToggleFavorite?: () => void;
    isFavorite?: boolean;
}

const MarketCard: React.FC<MarketCardProps> = ({
    question,
    category,
    price,
    roi,
    volume,
    probability,
    sentiment,
    onViewDetails,
    onToggleFavorite,
    isFavorite = false
}) => {
    return (
        <div className="p-4 rounded-lg border border-gray-600 transition-all duration-200 hover:border-gray-500" 
        style={{
            background: 'linear-gradient(292.88deg, #0B0E19 0%, #1C1F2A 95.47%)'
        }}>
            {/* Question + Category Tag Row */}
            <div className="flex items-start justify-between mb-4">
                <h3 className="text-white text-sm font-medium leading-relaxed mr-4">
                    {question}
                </h3>
                <span
                    className="px-3 py-1 rounded-full whitespace-nowrap"
                    style={{
                        border: '1px solid rgba(75, 174, 82, 1)',
                        color: 'rgba(75, 174, 82, 1)',
                        fontFamily: 'Jost, sans-serif',
                        fontWeight: 400,
                        fontStyle: 'normal',
                        fontSize: '16px',
                        borderRadius: '8px',
                        lineHeight: '130%',
                        letterSpacing: '0%'
                    }}
                >
                    {category}
                </span>
            </div>
            
            {/* Metrics */}
            <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <p className="text-gray-400 text-xs mb-1">Price</p>
                    <p className="text-white font-semibold">{price}</p>
                </div>
                <div>
                    <p className="text-gray-400 text-xs mb-1">ROI</p>
                    <p className="text-green-400 font-semibold">{roi}</p>
                </div>
                <div>
                    <p className="text-gray-400 text-xs mb-1">Volume</p>
                    <p className="text-white font-semibold">{volume}</p>
                </div>
                <div>
                    <p className="text-gray-400 text-xs mb-1">Probability</p>
                    <p className="text-white font-semibold">{probability}</p>
                </div>
            </div>
            
            {/* Sentiment */}
            <div className="flex items-center mb-4">
                <div className={`w-2 h-2 rounded-full mr-2 ${
                    sentiment === 'Bullish' ? 'bg-green-400' : 'bg-red-400'
                }`}></div>
                <span className="text-white text-sm font-medium">{sentiment}</span>
                {sentiment === 'Bullish' && (
                    <svg className="w-4 h-4 text-green-400 ml-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                )}
            </div>
            
            {/* Actions */}
            <div className="flex items-center justify-between">
                <Button 
                    onClick={onViewDetails}
                    size="sm"
                    className="flex-1 mr-2"
                >
                    View Details
                </Button>
                <button
                    onClick={onToggleFavorite}
                    className="p-2 hover:bg-gray-700 rounded-lg transition-colors cursor-pointer"
                >
                    <svg 
                        className={`w-5 h-5 ${isFavorite ? 'text-yellow-400 fill-current' : 'text-gray-400'}`} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default MarketCard;
