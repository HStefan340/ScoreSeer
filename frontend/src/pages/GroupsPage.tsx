import { useEffect, useState, useCallback } from 'react';
import { apiGet, apiPost } from '../api/client';
import { useAuth } from '../api/AuthContext';
import type { Group } from '../types';
import './GroupsPage.css';
import { Link } from 'react-router-dom';

function GroupsPage()
{
    const { token } = useAuth();
    const [groups, setGroups] = useState< Group[] >([]);
    const [newName, setNewName] = useState('');
    const [message, setMessage] = useState< string | null >(null);

    // Load user's groups
    const loadGroups = useCallback(() =>
    {
        apiGet< Group[] >('/groups/mine', token ?? undefined)
            .then(setGroups)
            .catch(() => setMessage('Could not load groups.'));
    }, [token])

    useEffect(() =>
    {
        loadGroups();
    }, [loadGroups]);

    // Create a new group
    async function createGroup()
    {
        if(newName.trim() === '')
        {
            setMessage('Enter a group name.');
            return;
        }

        try{
            await apiPost('/groups', { name: newName }, token ?? undefined);
            setNewName('');
            setMessage('Group created,');
            loadGroups(); // Refresh the list
        }
        catch{
            setMessage('Could not create the group.');
        }
    }

    return (
        <div className = "groups-page">
            <div className = "groups-kicker"> COMPETE WITH FRIENDS </div>
            <h1 className = "groups-title"> MY GROUPS </h1>

            {/* Create group row */}
            <div className = "create-group"> 
                <input
                    type = "text"
                    className = "create-group-input"
                    placeholder = "New group name"
                    value = {newName}
                    onChange={(e) => setNewName(e.target.value)}
                />
                <button className = "create-group-btn" onClick = {createGroup}> Create Group </button>
            </div>

            {message && <p className = "groups-message"> {message} </p>}

            {/* List of groups */}
            {groups.length === 0 ? (
                <p className = "groups-empty"> You're not part of any group yet. </p>
            ) :(
                <div className = "groups-list">
                    {groups.map((group) => (
                        <div key = {group.id} className = "group-card">
                            <div className = "group-card-info">
                                <div className = "group-card-head">
                                    <span className = "group-name"> {group.name} </span>
                                    <span className = {`group-role ${group.role === 'owner' ? 'group-role-owner' : 'group-role-member' }`}> {group.role.toUpperCase()} </span>
                                </div>
                                <div className = "group-card-meta">
                                    <span> {group.memberCount} member(s) </span>
                                    <span className = "group-invite">INVITE CODE 
                                        <span className = "group-invite-code"> {group.inviteCode} </span>
                                    </span>
                                </div>
                            </div>
                            <Link to = {`/groups/${group.id}`} className = "group-view-btn"> VIEW LEADERBOARD → </Link>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default GroupsPage;