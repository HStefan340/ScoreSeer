export interface Match
{
    id: number;
    league: string;
    homeTeam: string;
    awayTeam: string;
    kickoffAt: string;
    status: string;
    homeScore: number | null;
    awayScore: number| null;
}

export interface User
{
    id: number;
    email: string;
    username: string;
}

export interface Prediction
{
    id: number;
    matchId: number;
    predictedHomeScore: number;
    predictedAwayScore: number;
    pointsAwarded: number | null;
}

export interface Group
{
    id: number;
    name: string;
    inviteCode: string;
    role: string;
    memberCount: number;
}

export interface LeaderboardEntry
{
    id: number;
    username: string;
    totalPoints: number;
    predictionScored: number;
}