import './HomePage.css'

function HomePage()
{
    return(
        <div className = "home-page">
            <section className = "home-hero">
                <h1> Welcome to ScoreSeer </h1>
                <p> Predict football scores, earn points, and compete with your friends. </p>
            </section>

            <section className = "home-section">
                <h2> How scoring works ? </h2>
                <ul>
                    <li><strong> 3 points </strong> - you predicted the exact score ( for example you predicted 2-1 and it ended 2-1 )</li>
                    <li><strong> 1 point </strong> - you got the outcome right but not the exact score ( you predicted 2-1, it ended 3-0 - both outcomes: home team wins )</li>
                    <li><strong> 0 points </strong> - you got the outcome wrong </li>
                </ul>
            </section>

            <section className = " home-section">
                <h2> How to make a prediction ? </h2>
                <ol>
                    <li> Go to the <strong> "Matches" </strong> page. </li>
                    <li> Find an upcoming match and enter your predicted score. </li>
                    <li> Press <strong> "Predict" </strong>, you can edit you prediction any time befor kick-off. </li>
                    <li> Once the match is finished, points are added automatically. </li>
                </ol>
            </section>

            <section className = "home-section">
                <h2> Groups &amp; leaderboard </h2>
                <ul>
                    <li> Create a group from the <strong> "Groups" </strong> page - you will get an invite code and become its owner. </li>
                    <li> Invite friends by searching their username and sending them an invitation. </li>
                    <li> Received an invitation ? Check the <strong> "Invitations" </strong> page to accept or decline it </li>
                    <li> each group has its own <strong> LEADERBOARD </strong> ranking members by their points </li>
                </ul>
            </section>

            <section className = "home-section">
                <h2> Following leagues </h2>
                <p>
                    On the <strong> "Leagues" </strong> page you can follow the leagues you care about.
                    Then, on the <strong> "Matches" </strong> page switch to <strong> "My leagues only" </strong> to see just 
                    the matches from the leagues you follow.
                </p>
            </section>
        </div>
    );
}

export default HomePage
