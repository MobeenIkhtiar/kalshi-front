import React from 'react';

interface ButtonProps {
    children: React.ReactNode;
    onClick?: () => void;
    className?: string;
    variant?: 'primary' | 'secondary' | 'outline';
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
    type?: 'button' | 'submit' | 'reset';
}

const Button: React.FC<ButtonProps> = ({ 
    children, 
    onClick, 
    className = '', 
    variant = 'primary',
    size = 'md',
    disabled = false,
    type = 'button'
}) => {
    const baseClasses = 'font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 cursor-pointer';
    
    const variantClasses = {
        primary: 'bg-[#4BAE52] hover:bg-[#3a8a3f] text-white focus:ring-green-500',
        secondary: 'bg-gray-600 hover:bg-gray-700 text-white focus:ring-gray-500',
        outline: 'border border-gray-600 hover:bg-gray-800 text-white focus:ring-gray-500'
    };
    
    const sizeClasses = {
        sm: 'px-3 py-2.5 text-sm',
        md: 'px-4 py-3 text-base',
        lg: 'px-6 py-4 text-lg'
    };
    
    const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : '';
    
    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabledClasses} ${className}`}
        >
            {children}
        </button>
    );
};

export default Button;
