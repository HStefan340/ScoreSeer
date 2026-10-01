import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { User } from "../types";
import { setUnauthorizedHandler } from "./client";

// The shape od what auth context porvides
interface AuthContextType{
    user: User | null;
    token: string | null;
    login: (token: string, user: User) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Reads the expiry time (exp, in seconds) fron the JWT payload
function isTokenExpired(token: string): boolean
{
    try
    {
        const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
        const data = JSON.parse(atob(payload));
        return typeof data.exp === 'number' && data.exp * 1000 < Date.now();
    }
    catch
    {
        return true; // unreadable token is treates as expired
    }
}

export function AuthProvider({ children }: { children: ReactNode }) 
{
    // Initialize from localStorage, drop the session if the stored token has expired
    const [token, setToken] = useState<string | null>(() => {
        const stored = localStorage.getItem('token');
        if(stored && isTokenExpired(stored))
        {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            return null;
        }

        return stored;
    });

    const [user, setUser] = useState<User | null>(() => {
        const stored = localStorage.getItem('user');
        return stored ? JSON.parse(stored) : null;
    });

    // Called after a successful login: store token and user
    function login(newToken: string, newUser: User)
    {
        setToken(newToken);
        setUser(newUser);
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(newUser));
    }

    // Clear everything on logout
    function logout()
    {
        setToken(null);
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }

    // Register what happens when the API reports an expired session
    useEffect(() => {
        setUnauthorizedHandler(() => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            sessionStorage.setItem('sessionExpired', '1');
            window.location.replace('/login');
        });
        return () => setUnauthorizedHandler(null);
    }, []);

    return(
        <AuthContext.Provider value = {{ user, token, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

// Convenince hook to use the auth context anywhere
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth()
{
    const context = useContext(AuthContext);

    if(!context) throw new Error('useAuth must be used within AuthProvider');

    return(context);
}