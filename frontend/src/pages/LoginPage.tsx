import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { apiPost } from "../api/client";
import { useAuth } from "../api/AuthContext";
import type { User } from "../types";
import "./LoginPage.css"

// The API returns a token + basic user info
interface LoginResponse
{
    token: string;
    user: User;
}

function LoginPage()
{
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const { login } = useAuth();
    const navigate = useNavigate();

    async function handleSubmit(e: React.FormEvent)
    {
        e.preventDefault();
        setError(null);
        try{
            const data = await apiPost<LoginResponse>('/auth/login', { email, password });
            login(data.token, data.user);
            navigate('/');// redirect to Home page after login
        }
        catch{
            setError('Invalid email or password.');
        }
    }

    return (
        <div className = "auth-page">
            <div className = "auth-col">
                <div className = "auth-kicker"> WELCOME BACK </div>
                <h1 className = "auth-title"> LOG IN </h1>

                <form onSubmit = {handleSubmit}>
                    <div className = "auth-filed">
                        <div className = "auth-label"> Email </div>
                        <input
                            type = "email"
                            className = "auth-input"
                            placeholder = "email@example.com"
                            value = {email}
                            onChange = {(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className = "auth-field">
                        <div className = "auth-label"> Password </div>
                        <input
                            type = "password"
                            className = "auth-input"
                            placeholder = "your password"
                            value = {password}
                            onChange = {(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button type = "submit" className = "auth-submit"> Log In </button>
                    {error && <p className = "auth-error"> {error} </p>}
                </form>

                <p className = "auth-switch">
                    You don't have an account? <Link to = "/register"> Sign Up </Link>
                </p>
            </div>
        </div>
    );
}

export default LoginPage;