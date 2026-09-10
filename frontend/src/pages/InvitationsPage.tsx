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
        <div className = "invitations-page">
            <div className = "invitations-header">
                <h1 className = "invitations-tile"> INVITATIONS </h1>

                {invitations.length > 0 && (
                    <span className = "invitations-count"> {invitations.length} </span>
                )}
            </div>

            {message && <p className = "invitations-message"> {message} </p>}

            {loading ? (
                <p className = "invitations-status"> Loading invitations... </p>
            ) : invitations.length === 0 ? (
                <p className = "invitation-status"> No pending invitations </p>
            ) : ( 
                <div className = "invitations-list">
                    {invitations.map((inv) => (
                        <div key = {inv.id} className = "invitation-card">
                            <div className = "invitation-info">
                                <span className = "invitation-logo">
                                    {inv.groupName.slice(0, 2).toUpperCase()}
                                </span>
                                <div>
                                    <div className = "invitation-group"> {inv.groupName} </div>
                                    <div className = "invitation-form">
                                        Invited by <span className = "invitation-sender"> {inv.senderUsername} </span>
                                    </div>
                                </div>
                            </div>

                            <div className = "invitation-actions">
                                <button className = "inv-accept" onClick = {() => respond(inv.id, true)}> Accept </button>
                                <button className = "inv-decline" onClick = {() => respond(inv.id, false)}> Decline </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default InvitationsPage;