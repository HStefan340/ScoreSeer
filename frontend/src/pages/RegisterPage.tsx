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
            <h1>Sign Up</h1>
            <form className = "auth-form" onSubmit = {handleSubmit}>
                <div>
                    <input type = "email" placeholder = "Email" value = {email}
                    onChange = {(e) => setEmail(e.target.value)} required />
                </div>
                <div>
                    <input type = "text" placeholder = "Username" value = {username}
                    onChange = {(e) => setUsername(e.target.value)} required />
                </div>
                <div>
                    <input type = "password" placeholder = "Password" value = {password}
                    onChange = {(e) => setPassword(e.target.value)} required />
                </div>
                {error && <p className = "auth-error"> {error} </p>}
                <button type = "submit">Sign Up</button>
            </form>
            <p className = "auth-switch">
                Already have an acoount? <Link to = "/login">Log In</Link>
            </p>
        </div>
    );
}

export default RegisterPage;