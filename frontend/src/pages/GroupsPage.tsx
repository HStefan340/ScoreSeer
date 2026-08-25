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
        <div>
            <h1>My Groups</h1>

            {/* Create group form */}
            <div className = "create-group">
                <input
                    type = "text"
                    placeholder = "New group name"
                    value = {newName}
                    onChange = {(e) => setNewName(e.target.value)}
                />
                <button onClick = {createGroup} >Create Group</button>
                {message && <span> {message} </span>}
            </div>

            {/* List of groups */}
            {groups.length === 0 ? (
                <p>You're not part of any group</p>
            ) : (
                groups.map((group) => (
                    <div key = {group.id} className = "group-card">
                        <strong> {group.name} </strong>
                        <span> - {group.memberCount} member(s) - your role in this group: {group.role}</span>
                        <div>Invite code: <code> {group.inviteCode} </code></div>
                        <Link to = {`/groups/${group.id}`}> View leaderboard </Link>
                    </div>
                ))
            )}
        </div>
    );
}

export default GroupsPage;