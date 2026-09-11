// Generate a consistent color frm a team name (for the logo square)
 export function teamColor(name: string): string 
{
    let hash = 0;
    for(let i = 0; i < name.length; i++)
    {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }

    const hue = Math.abs(hash) %360;
    return `hsl(${hue}, 55%, 42%)`;
}

// Get initials for the logo (first 3 letters, uppercase)
export function teamInitials(name: string): string
{
    return name.slice(0, 3).toUpperCase();
}