import { useEffect, useState, useCallback } from 'react';
import { apiGet, apiPost } from '../api/client';
import { useAuth } from '../api/AuthContext';
import type { ReceivedInvitation } from '../types';
import './InvitationsPage.css';

function InvitationsPage()
{
    const { token } = useAuth();
    const [invitations, setInvitations] = useState< ReceivedInvitation[] >([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState< string | null >(null);

    const loadInvitations = useCallback(() =>
    {
        apiGet< ReceivedInvitation[] >('/groups/invitations/received', token ?? undefined)
            .then((data) => 
            {
                setInvitations(data);
                setLoading(false);
            })
            .catch(() => 
            {
                setMessage('Could not load invitations.');
                setLoading(false);
            });
    }, [token]);

    useEffect(() => 
    {
        loadInvitations();
    }, [loadInvitations]);

    async function respond(invitationId: number, accept: boolean)
    {
        try{
            await apiPost(
                `/groups/invitations/${invitationId}/respond?accept=${accept}`,
                {},
                token ?? undefined
            );

            setMessage(accept ? 'Invitation accepted!' : 'Invitation declined!');
            loadInvitations();
        }
        catch{
            setMessage('Could not respond to the invitation.')
        }
    }

    return (
        <div className = "invitation-page">
            <h1>Invitations</h1>
            {message && <p> { message} </p>}

            {loading ? (
                <p>Loading invitations...</p>
            ) : invitations.length === 0 ? (
                <p>No pending invitations.</p>
            ) : (
                invitations.map((inv) => (
                <div key = {inv.id} className = "invitation-card">
                        <span>
                            <strong> {inv.senderUsername} </strong> invited you to{' '}
                            <strong> {inv.groupName} </strong>
                        </span>
                    <div>
                        <button onClick = {() => respond(inv.id, true)}> Accept </button>
                        <button onClick = {() => respond(inv.id, false)}> Decline </button>
                    </div>
                </div>
                ))
            )}
        </div>
    );
}

export default InvitationsPage;