export interface Match{
    id: number;
    league: string;
    homeTeam: string;
    awayTeam: string;
    kickoffAt: string;
    status: string;
    homeScore: number | null;
    awayScore: number| null;
}

export interface User{
    id: number;
    email: string;
    username: string;
}