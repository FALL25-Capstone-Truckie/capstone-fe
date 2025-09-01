import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User } from '../types';
import { AUTH_TOKEN_KEY } from '../config';

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string, role?: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check if user is logged in
        const checkAuth = async () => {
            try {
                const token = localStorage.getItem(AUTH_TOKEN_KEY);
                if (!token) {
                    setIsLoading(false);
                    return;
                }

                // In a real app, you would verify the token with your API
                // and get the user role from the token or a separate API call
                const userRole = localStorage.getItem('user_role') || 'customer';

                const userData: User = {
                    id: '1',
                    username: 'demo_user',
                    email: 'demo@example.com',
                    role: userRole as 'admin' | 'customer' | 'staff' | 'driver'
                };

                setUser(userData);
                setIsLoading(false);
            } catch (error) {
                console.error('Authentication check failed:', error);
                localStorage.removeItem(AUTH_TOKEN_KEY);
                localStorage.removeItem('user_role');
                setIsLoading(false);
            }
        };

        checkAuth();
    }, []);

    const login = async (email: string, password: string, role: string = 'customer') => {
        setIsLoading(true);
        try {
            // In a real app, you would call your API
            // For now, we'll just simulate a successful login

            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Simulate a successful login
            const userData: User = {
                id: '1',
                username: 'demo_user',
                email: email,
                role: role as 'admin' | 'customer' | 'staff' | 'driver'
            };

            // Store token and role
            localStorage.setItem(AUTH_TOKEN_KEY, 'demo_token');
            localStorage.setItem('user_role', role);

            setUser(userData);
        } catch (error) {
            console.error('Login failed:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
        localStorage.removeItem(AUTH_TOKEN_KEY);
        localStorage.removeItem('user_role');
        setUser(null);
    };

    const value = {
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}; 