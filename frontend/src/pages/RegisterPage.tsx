import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { apiPost, ApiError } from "../api/client";
import "./RegisterPage.css";
import GoogleButton from "../components/GoogleButton";

// Same rules as the backend RegisterDTO
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const USERNAME_RE = /^[A-Za-z0-9_]{3,20}$/;
const PASSWORD_RE = /^(?=.*\p{L})(?=.*\d).{8,64}$/u;

type FieldErrors = { email?: string; username?: string; password?: string };

function validate(email: string, username: string, password: string): FieldErrors
{
    const errors: FieldErrors = {}
    if(!EMAIL_RE.test(email.trim())) errors.email = 'Enter a valid email address.';
    if(!USERNAME_RE.test(username)) errors.username = '3-20 characters: letters, digits or _';
    if(!PASSWORD_RE.test(password)) errors.password = 'At least 8 characters, with one letter and one digit.';
    return errors;
}

function RegisterPage()
{
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const [fieldErrors, setFieldErrors] = useState< FieldErrors >({});

    async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>)
    {
        e.preventDefault();
        setError(null);

        // Validate in the browser first; stop before calling the API if anything is wrong
        const errors = validate(email, username, password);
        setFieldErrors(errors);
        if(Object.keys(errors).length > 0) return;

        try{
            await apiPost('/auth/register', { email, username, password });
            navigate('/login'); // after registering go to login
        }
        catch(err){
            if(err instanceof ApiError && err.status === 409)
                setError(err.message);   // "Email is already in use." / "Username is already in use."
            else if(err instanceof ApiError && err.status === 429)
                setError('Too many attempts. Please wait a minute and try again.');
            else
                setError('Registration failed. Please check your details and try again.');
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
                        {fieldErrors.email && <p className = "auth-field-error"> {fieldErrors.email} </p>}
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
                        {fieldErrors.username && <p className = "auth-field-error"> {fieldErrors.username} </p>}
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
                        {fieldErrors.password
                                ? <p className = "auth-field-error"> {fieldErrors.password} </p>
                                : <p className = "auth-hint"> At least 8 characters, with one letter and one digit. </p>}
                    </div>

                    <button type = "submit" className = "auth-submit"> Create Account </button>
                    {error && <p className = "auth-error"> {error} </p>}
                </form>

                <div className = "auth-divider"><span> OR </span></div>
                <GoogleButton onError = {setError} />

                <p className = "auth-switch">
                    Already have an account? <Link to = "/login"> Log In </Link>
                </p>
                
            </div>
        </div>
    );
}

export default RegisterPage;