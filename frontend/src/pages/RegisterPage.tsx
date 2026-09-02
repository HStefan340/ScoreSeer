import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { apiPost } from "../api/client";
import "./RegisterPage.css"

function RegisterPage()
{
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>)
    {
        e.preventDefault();
        setError(null);
        try{
            await apiPost('/auth/register', { email, username, password });
            navigate('/login'); // after registering go to login
        }
        catch{
            setError('Registration failed. Email or username may be taken.');
        }
    }

    return(
        <div className = "auth-page">
            <div className = "auth-col">
                <div className = "auth-kicker"> JOIN THE GAME </div>
                <h1 className = "auth-title"> SIGN UP </h1>

                <form onSubmit = {handleSubmit}>
                    <div className = "auth-field">
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
                        <div className = "auth-label"> Username </div>
                        <input
                            type = "text"
                            className = "auth-input"
                            placeholder = "Choose a username"
                            value = {username}
                            onChange = {(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>

                    <div className = "auth-field">
                        <div className = "auth-label"> Password </div>
                        <input
                            type = "password"
                            className = "auth-input"
                            placeholder = "Choose a password"
                            value = {password}
                            onChange = {(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button type = "submit" className = "auth-submit"> Create Account </button>
                    {error && <p className = "auth-error"> {error} </p>}
                </form>

                <p className = "auth-switch">
                    Already have an account? <Link to = "/login"> Log In </Link>
                </p>
                
            </div>
        </div>
    );
}

export default RegisterPage;