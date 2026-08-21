import { createContext, useContext, useState, type ReactNode } from "react";
import type { User } from "../types";

// The shape od what auth context porvides
interface AuthContextType{
    user: User | null;
    token: string | null;
    login: (token: string, user: User) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) 
{
    // Initialize from localStorage so the session survives page refreshes
    const [token, setToken] = useState<string | null>(() =>
        localStorage.getItem('token')
    );

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