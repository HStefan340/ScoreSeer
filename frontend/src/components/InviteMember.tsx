import { useState } from 'react';
import { apiGet, apiPost } from '../api/client';
import { useAuth } from '../api/AuthContext';
import type { UserSearchResult } from '../types';
import './InviteMember.css'

function InviteMember({ groupId }: {groupId: string})
{
    const { token, user } = useAuth();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState< UserSearchResult[] >([]);
    const [message, setMessage] = useState< string | null >(null);

    // Search by username
    async function searchUsers()
    {
        if(query.trim().length < 2)
        {
            setMessage('Type at least 2 characters.');
            return;
        }

        setMessage(null);
        try{
            const data = await apiGet< UserSearchResult[] >(
                `/users/search?q=${encodeURIComponent(query)}`,
                token ?? undefined
            );

            // Exclude the current user form the results
            const filtered = data.filter((u) => u.id !== user?.id);
            setResults(filtered);
            if(filtered.length === 0) setMessage('No users found.')
        }
        catch{
            setMessage('Search failed.');
        }
    }

    // Send an invitation to a user
    async function invite(receiverId: number)
    {
        try{
            await apiPost(
                `/groups/invitations`,
                { groupId: Number(groupId), receiverId },
                token ?? undefined
            );

            setMessage('Invitation sent.');
            setResults([]); // clear results after inviting
            setQuery('');
        }
        catch{
            setMessage('Could not send invitation (already a member or already invited).')
        }
    }

    return(
        <div className = "invite-member">
            <h2 className = "inivte-title"> Invite a player </h2>

            <div className = "invite-search">
                <input
                    type = "text"
                    className = "invite-input"
                    placeholder = "Search username..."
                    value = {query}
                    onChange = {(e) => setQuery(e.target.value)}
                />
                <button className = "invite-search-btn" onClick = {searchUsers}> Search </button>
            </div>

            {message && <p className = "invite-message"> {message} </p>}

            {results.length > 0 && (
                <ul className = "invite-results">
                    {results.map((u) => (
                        <li key = {u.id} className = "invite-result">
                            <span className = "invite-result-name"> {u.username} </span>
                            <button className = "invite-result-btn" onClick = {() => invite(u.id)}> Invite </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default InviteMember;