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
import { useState } from "react";


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
  const [menuOpen, setMenuOpen] = useState(false);

  return(
    <nav className = "nav">
      <Link to = "/" className = "nav-logo">
        <span className = "nav-logo-mark"></span>
        <span className = "nav-logo-text"> SCORESEER </span>
      </Link>

      {/* Navigation button (shows only non mobile) */}
      <button
        className = "nav-button"
        onClick = {() => setMenuOpen(!menuOpen)}
        aria-label = "Menu"
        >
          <span></span><span></span><span></span>
      </button>

      {/* Links + right side - toggled open on mobile */}
      <div className = {`nav-collapse ${menuOpen ? 'nav-open' : '' }`}>
        <div className = "nav-links">
          <NavLink to = "/" end className = "nav-link" onClick = {() => setMenuOpen(false)}> Home </NavLink>
          <NavLink to = "/matches" className = "nav-link" onClick = {() => setMenuOpen(false)}> Matches </NavLink>
          <NavLink to = "/groups" className = "nav-link" onClick = {() => setMenuOpen(false)}> Groups </NavLink>
          <NavLink to = "/invitations" className = "nav-link" onClick = {() => setMenuOpen(false)}> Invitations </NavLink>
          <NavLink to = "/my-predictions" className = "nav-link" onClick = {() => setMenuOpen(false)}> My Predictions </NavLink>
          <NavLink to = "/leagues" className = "nav-link" onClick = {() => setMenuOpen(false)}> Leagues </NavLink>
        </div>
        <div className = "nav-right">
          <span className = "nav-greeting"> Hi, {user?.username} </span>
          <button className = "nav-logout" onClick = {logout}> Log Out </button>
        </div>
      </div>
    </nav>
  );
}

function PublicNav()
{
  return (
    <nav className = "nav nav-public">
      <Link to = "/" className = "nav-logo"> 
        <span className = "nav-logo-mark"></span>
        <span className = "nav-logo-text"> SCORESEER</span>
      </Link>

      <div className = "nav-public-links">
        <NavLink to = "/login" className = "nav-link"> Log In </NavLink>
        <NavLink to = "/register" className = "nav-link"> Sign Up </NavLink>
      </div>
    </nav>
  );
}

export default App;