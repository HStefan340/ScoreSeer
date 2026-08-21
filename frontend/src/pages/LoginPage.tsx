import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { apiPost } from "../api/client";
import { useAuth } from "../api/AuthContext";
import type { User } from "../types";

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
        <div>
            <h1>LogIn</h1>
            <form onSubmit = {handleSubmit}>
                <div>
                    <input type = "email" placeholder = "Email" value = {email}
                    onChange = {(e) => setEmail(e.target.value)} required />
                </div>
                <div>
                    <input type = "password" placeholder = "Password" value = {password}
                    onChange = {(e) => setPassword(e.target.value)} required />
                </div>
                {error && <p style ={{ color: 'red' }}> {error} </p>}
                <button type = "submit">LogIn</button>
            </form>
            <p>
                You don't have an account? <Link to = "/register">SignUp</Link>
            </p>
        </div>
    );
}

export default LoginPage;