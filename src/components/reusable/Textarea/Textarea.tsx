import React from 'react';

interface TextareaProps {
    placeholder?: string;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    className?: string;
    rows?: number;
}

const Textarea: React.FC<TextareaProps> = ({ 
    placeholder, 
    value, 
    onChange, 
    className = '', 
    rows = 4 
}) => {
    return (
        <textarea
            rows={rows}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className={`w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none ${className}`}
        />
    );
};

export default Textarea;
