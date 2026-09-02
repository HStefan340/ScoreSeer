import './HomePage.css'

function HomePage()
{
    return(
        <div className = "home-page">
            {/* Hero section */}
            <div className = "home-kicker"> PREDICT · EARN · COMPETE </div>
            <h1 className = "home-title"> WELCOME TO<br />SCORESEER </h1>
            <p className = "home-lead"> Predict football scores, earn points, and compete with your friends. </p>

            {/* Scoring rules - 3 columns */}
            <div className = "home-scoring">
                <div className = "score-cell">
                    <div className = "score-num score-num-cyan"> 3 </div>
                    <div className = "score-label"> Points · Exact Score </div>
                    <div className = "score-desc"> You predicted the exact score — e.g. you called 2-1 and it ended 2-1. </div>
                </div>

                <div className = "score-cell">
                    <div className = "score-num score-num-red"> 1 </div>
                    <div className = "score-label"> Point · Correct Outcome </div>
                    <div className = "score-desc"> You predicted the correct outcome, but the score was wrong — you said 2-1, it ended 3-0 (home wins). </div>
                </div>

                <div className = "score-cell">
                    <div className = "score-num score-num-gray"> 0 </div>
                    <div className = "score-label"> Points · Wrong Outcome </div>
                    <div className = "score-desc"> You predicted the wrong outcome — you said 2-1, it ended 0-3 (away wins). </div>
                </div>
            </div>

            {/* Two-column guides */}
            <div className = "home-guides"> 
                <div className = "guide-col guide-col-border">
                    <div className = "guide-title"> HOW TO MAKE A PREDICTION </div>
                    <div className = "guide-step"><span className = "guide-num"> 1 </span><span> Go to the <b>Matches</b> page. </span> </div>
                    <div className = "guide-step"><span className = "guide-num"> 2 </span><span> Find an upcoming match and enter your predicted score. </span> </div>
                    <div className = "guide-step"><span className = "guide-num"> 3 </span><span> Press <b>Predict</b> — edit any time before kick-off. </span> </div>
                    <div className = "guide-step"><span className = "guide-num"> 4 </span><span> When the match ends, points are added automatically. </span> </div>
                </div>

                <div className = "guide-col">
                    <div className = "guide-title"> GROUPS &amp; LEADERBOARD </div>
                    <div className="guide-step"><span className="guide-dot"></span><span> Create a group from <b>Groups</b> — you get an invite code and become owner. </span></div>
                    <div className="guide-step"><span className="guide-dot"></span><span> Invite friends by searching their username. </span></div>
                    <div className="guide-step"><span className="guide-dot"></span><span> Check <b>Invitations</b> to accept or decline. </span></div>
                    <div className="guide-step"><span className="guide-dot"></span><span> Each group has its own leaderboard ranking members by points. </span></div>
                </div>
            </div>

            {/* Leagues section */}
            <div className = "home-leagues">
                <div className = "guide-title"> FOLLOWING LEAGUES </div>
                <p className = "home-leagues-text">
                    On the <b>Leagues</b> page, follow the leagues you care about. Then on <b>Matches</b> switch to <b>My leagues only</b> to see just the matches from the leagues you follow.
                </p>
            </div>
        </div>
    );
}

export default HomePage
