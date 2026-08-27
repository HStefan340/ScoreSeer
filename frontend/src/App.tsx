import { BrowserRouter, Routes, Route, Link, Navigate, NavLink } from "react-router-dom";
import { useAuth } from "./api/AuthContext";
import HomePage from "./pages/HomePage";
import MatchesPage from "./pages/MatchesPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import GroupsPage from "./pages/GroupsPage";
import GroupDetailPage from "./pages/GroupDetailPage";
import InvitationsPage from "./pages/InvitationsPage";
import MyPredictionsPage from "./pages/MyPredictionsPage";
import LeaguesPage from "./pages/LeaguesPage";
import './App.css';
import './components/Navigation.css'


function App() 
{
  const { token } = useAuth();

  // Not logged in: show the public landing page + login / register
  if(!token){
  return(
    <BrowserRouter>

    <PublicNav />
    {/* Route definitions */}
    <Routes>
      <Route path = "/" element = {<HomePage />} />
      <Route path = "/login" element = {<LoginPage />} />
      <Route path = "/register" element = {<RegisterPage />} />
      {/* Any other path redirects to login */}
      <Route path = "*" element = {<Navigate to = "/login" replace />} />
    </Routes>

    </BrowserRouter>
  );
  }

  return(
    <BrowserRouter>

    <Navigation />
    {/* Route definitions */}
    <Routes>
      <Route path = "/" element = {<HomePage />} />
      <Route path = "/matches" element = {<MatchesPage />} />
      <Route path = "/groups" element = {<GroupsPage />} />
      <Route path = "/groups/:id" element = {<GroupDetailPage />} /> 
      <Route path = "/invitations" element = {<InvitationsPage />} /> 
      <Route path = "/my-predictions" element = {<MyPredictionsPage />} /> 
      <Route path = "/leagues" element = {<LeaguesPage />} /> 
      {/* Any unknown path goes home */}
      <Route path = "*" element = {<Navigate to = "/" replace />} />
    </Routes>

    </BrowserRouter>
  );
}

// Navigation bar that changes based on login state
function Navigation()
{
  const { user, logout } = useAuth();

  return(
    <nav className = "nav">
      <Link to = "/" className = "nav-logo">
        <span className = "nav-logo-mark"></span>
        <span className = "nav-logo-text"> SCORESEER </span>
      </Link>

      <div className = "nav-links">
        <NavLink to = "/" end className = "nav-link"> Home </NavLink>
        <NavLink to = "/matches" className = "nav-link"> Matches </NavLink>
        <NavLink to = "/groups" className = "nav-link"> Groups </NavLink>
        <NavLink to = "/invitations" className = "nav-link"> Invitations </NavLink>
        <NavLink to = "/my-predictions" className = "nav-link"> My Predictions </NavLink>
        <NavLink to = "/leagues" className = "nav-link"> Leagues </NavLink>
      </div>

      <div className = "nav-right">
        <span className = "nav-greeting"> Hi, {user?.username} </span>
        <button className = "nav-logout" onClick = {logout}> Log Out </button>
      </div>
    </nav>
  );
}

function PublicNav()
{
  return (
    <nav className = "nav">
      <Link to = "/" className = "nav-logo"> 
        <span className = "nav-logo-mark"></span>
        <span className = "nav-logo-text"> SCORESEER</span>
      </Link>

      <div className = "nav-links">
        <NavLink to = "/login" className = "nav-link"> Log In </NavLink>
        <NavLink to = "/register" className = "nav-link"> Sign Up </NavLink>
      </div>
    </nav>
  );
}

export default App;