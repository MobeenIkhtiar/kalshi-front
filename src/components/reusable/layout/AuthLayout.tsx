import React, { type JSX } from 'react';
import type { layoutPropsInterface } from '@utils/interfaces';

const AuthLayout: React.FC<layoutPropsInterface> = ({ children }): JSX.Element => {
    return (
        <div className="min-h-screen w-full flex items-center justify-center" style={{ backgroundColor: '#050811' }}>
            {/* Background Pattern */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-500/10 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
            </div>

            {/* Main Content */}
            <div className="relative z-10 w-full max-w-xl mx-auto px-6">
                {/* Auth Form Container */}
                <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 shadow-2xl">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default AuthLayout;
