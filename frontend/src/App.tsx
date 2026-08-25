import { BrowserRouter, Routes, Route, Link, Navigate } from "react-router-dom";
import { useAuth } from "./api/AuthContext";
import HomePage from "./pages/HomePage";
import MatchesPage from "./pages/MatchesPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import GroupsPage from "./pages/GroupsPage";
import GroupDetailPage from "./pages/GroupDetailPage";
import InvitationsPage from "./pages/InvitationsPage";
import MyPredictionsPage from "./pages/MyPredictionsPage";
import './App.css';


function App() 
{
  const { token } = useAuth();

  // Not logged in: only show login / register
  if(!token){
  return(
    <BrowserRouter>

    {/* Route definitions */}
    <Routes>
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
    <nav>
      <Link to = "/">Home</Link> | <Link to = "/matches">Matches</Link> | <Link to = "/groups">Groups</Link> | <Link to = "/invitations">Invitations</Link> | <Link to = "/my-predictions">My Predictions</Link>
      {' | '}<span>Hi, {user?.username}</span>
      {' | '}<button onClick = {logout}>LogOut</button>
    </nav>
  );
}

export default App;