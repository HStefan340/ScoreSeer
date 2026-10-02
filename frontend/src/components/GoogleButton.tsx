import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import { apiPost, ApiError } from '../api/client';
import { useAuth } from '../api/AuthContext';
import type { User } from '../types';

// The API returns a token + basic user info, same as the normal login
interface LoginResponse
{
    token: string;
    user: User
}

// Google sign-in button: reporst problems to the parent page through onError
function GoogleButton({ onError }: { onError: (message: string) => void})
{
    const { login } = useAuth();
    const navigate = useNavigate();

    async function handleSucces(response: CredentialResponse) 
    {
        if(!response.credential)
        {
            onError('Google sign-in failed. Please try again.');
            return;
        }   

        try{
            // Send the Google ID token to the bacjend, which returns ou own JWT
            const data = await apiPost< LoginResponse >('/auth/google', { idToken: response.credential });
            login(data.token, data.user);
            navigate('/');
        }
        catch(err){
            if(err instanceof ApiError && err.status === 409)
                onError(err.message); // email already used by a password account
            else if(err instanceof ApiError && err.status === 429)
                onError('Too many attempts. Please wait a minute and try again.');
            else
                onError('Google sign-in failed. Please try again.')
        }
    }

    // Narrow screens: smaller button so the personalized version (name + email) fits
    const isNarrow = window.innerWidth < 480;

    return(
        <div className = "auth-google">
            <GoogleLogin
                onSuccess = {handleSucces}
                onError = {() => onError('Google sign-in failed. Please try again.')}
                theme = "filled_black"
                shape = "rectangular"
                text = "continue_with"
                size = {isNarrow ? 'medium' : 'large'}
                width = {isNarrow ? undefined : 400}
            />
        </div>
    );
}

export default GoogleButton