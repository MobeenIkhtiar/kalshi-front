import React from 'react';

interface InputProps {
    placeholder?: string;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    className?: string;
    inputClassName?: string;
    type?: string;
    icon?: React.ReactNode;
    name?: string;
    required?: boolean;
}

const Input: React.FC<InputProps> = ({ 
    placeholder, 
    value, 
    onChange, 
    className = '', 
    inputClassName = '',
    type = 'text',
    icon,
    name,
    required = false
}) => {
    return (
        <div className={`relative ${className}`}>
            {icon && (
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    {icon}
                </div>
            )}
            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                autoComplete="off"
                className={`w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 ${icon ? 'pl-10' : ''} ${inputClassName}`}
            />
        </div>
    );
};

export default Input;
