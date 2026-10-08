import React, { useEffect, useState } from "react";
import { apiGet, apiPost, ApiError } from "../api/client";
import { useAuth } from "../api/AuthContext";
import type { User } from "../types";
import "./LoginPage.css";

// Same rule as the backend
const USERNAME_RE = /^[A-Za-z0-9_]{3,20}$/;

interface AvailabilityResult
{
    name: string;
    available: boolean;
}

interface ChooseUsernameResponse
{
    token: string;
    user: User;
}

function ChooseUsernamePage()
{
    const { token, login, logout } = useAuth();
    const [username, setUsername] = useState('');
    const [result, setResult] = useState< AvailabilityResult | null >(null);
    const [error, setError] = useState< string | null>(null);

    const name = username.trim();
    const isValidFormat = USERNAME_RE.test(name);

    // Ask the backend about availability 400 ms after the user stops trying
    useEffect(() => {
        if(!isValidFormat) return;

        let cancelled = false;
        const timer = setTimeout(() => {
            apiGet<{ available: boolean }>(`/auth/username-available?username=${encodeURIComponent(name)}`)
                .then((data) => {
                    if(!cancelled) setResult({ name, available: data.available });
                })
                .catch(() => {
                    // Availability is checked again on submit, so a failed check is not fatal
                })
        }, 400);

        return () => {
            cancelled = true;
            clearTimeout(timer);
        };
    }, [name, isValidFormat])

    // Status ahown under input, derived from the current text and the last result
    let status: 'empty' | 'invalid' | 'checking' | 'available' | 'taken';
    if(name === '') status = 'empty';
    else if(!isValidFormat) status = 'invalid';
    else if(result?.name !== name) status = 'checking';
    else status = result.available ? 'available' : 'taken';

    async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>)
    {
        e.preventDefault();
        setError(null);
        if(status !== 'available') return;

        try{
            const data = await apiPost<ChooseUsernameResponse>('/auth/username', { username: name }, token ?? undefined);
            login(data.token, data.user); // needsUsername is now false: the full app opens
        }
        catch(err){
            if(err instanceof ApiError && err.status === 409)
                setError(err.message);
            else if(err instanceof ApiError && err.status === 429)
                setError('Too many attempts. Please wait a minute and try again.');
            else
                setError('Could not save the username. Please try again.');
        }
    }

    return(
        <div className = "auth-page">
            <div className = "auth-col">
                <div className = "auth-kicker"> ONE LAST STEP </div>
                <h1 className = "auth-title"> PICK A NAME </h1>

                <form onSubmit = {handleSubmit}>
                    <div className = "auth-field">
                        <div className = "auth-label"> Username </div>
                        <input
                            type = "text"
                            className = "auth-input"
                            placeholder = "Choose a username"
                            value = {username}
                            onChange = {(e) => setUsername(e.target.value)}
                            autoFocus
                        />

                        {status === 'empty' && <p className = "auth-hint"> 3-20 characters: letters, digits or _. Visible to other players. </p>}
                        {status === 'invalid' && <p className = "auth-field-error"> 3-20 characters: letters, digits or _. </p>}
                        {status === 'checking' && <p className = "auth-hint"> Checking availability... </p>}
                        {status === 'available' && <p className = "auth-available"> Available </p>}
                        {status === 'taken' && <p className = "auth-field-error"> This username is already taken. </p>}
                    </div>

                    <button type = "submit" className = "auth-submit" disabled = {status !== 'available'}> Continue </button>
                    {error && < p className = "auth-error"> {error} </p>}
                </form>

                <p className = "auth-switch">
                    Not you? <button type = "button" className = "auth-link-button" onClick = {logout}> Log out </button>
                </p>
            </div>
        </div>
    );
}

export default ChooseUsernamePage;