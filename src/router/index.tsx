import { createBrowserRouter } from 'react-router-dom';
import Layout from '@components/reusable/layout/Layout';
import AuthLayout from '@components/reusable/layout/AuthLayout';
import ProtectedRoute from '@components/reusable/ProtectedRoute';
import Markets from '@pages/Markets';
import Portfolio from '@pages/Portfolio';
import AIAssistant from '@pages/AIAssistant';
import Watchlist from '@pages/Watchlist';
import Settings from '@pages/Settings';
import Landing from '@pages/Landing';
import Help from '@pages/Help';
import { Login, Signup } from '@pages/Auth';

export const router = createBrowserRouter([
    // Authentication Routes
    {
        path: '/login',
        element: <AuthLayout><Login /></AuthLayout>,
    },
    {
        path: '/signup',
        element: <AuthLayout><Signup /></AuthLayout>,
    },
    // Public Landing (full-bleed, not using AuthLayout)
    {
        path: '/',
        element: <Landing />,
    },
    // Auth pages
    {
        path: '/markets',
        element: (
            <ProtectedRoute>
                <Layout><Markets /></Layout>
            </ProtectedRoute>
        ),
    },
    {
        path: '/portfolio',
        element: (
            <ProtectedRoute>
                <Layout><Portfolio /></Layout>
            </ProtectedRoute>
        ),
    },
    {
        path: '/ai-assistant',
        element: (
            <ProtectedRoute>
                <Layout><AIAssistant /></Layout>
            </ProtectedRoute>
        ),
    },
    {
        path: '/watchlist',
        element: (
            <ProtectedRoute>
                <Layout><Watchlist /></Layout>
            </ProtectedRoute>
        ),
    },
    {
        path: '/settings',
        element: (
            <ProtectedRoute>
                <Layout><Settings /></Layout>
            </ProtectedRoute>
        ),
    },
    {
        path: '/help',
        element: (
            <ProtectedRoute>
                <Layout><Help /></Layout>
            </ProtectedRoute>
        ),
    },
    {
        path: '*',
        element: (
            <ProtectedRoute>
                <Layout>
                    <div className="p-6 text-center">
                        <h1 className="text-4xl font-bold text-white mb-4">404</h1>
                        <p className="text-gray-400 text-lg">Page not found</p>
                    </div>
                </Layout>
            </ProtectedRoute>
        ),
    },
]);
