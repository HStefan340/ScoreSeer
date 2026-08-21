import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { useAuth } from "./api/AuthContext";
import HomePage from "./pages/HomePage";
import MatchesPage from "./pages/MatchesPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import './App.css';

function App() 
{
  return(
    <BrowserRouter>

    <Navigation />
    {/* Route definitions */}
    <Routes>
      <Route path = "/" element = {<HomePage />} />
      <Route path = "/matches" element = {<MatchesPage />} />
      <Route path = "/login" element = {<LoginPage />} />
      <Route path = "/register" element = {<RegisterPage />} />
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
      <Link to = "/">Home</Link> | <Link to = "matches">Matches</Link>
      {user ? (
        <>
        {' | '}<span>Hi, {user.username}</span>
        {' | '}<button onClick = {logout}>LogOut</button>
        </>
      ) : (
        <>
        {' | '}<Link to = "/login">LogIn</Link>
        {' | '}<Link to = "/register">Register</Link>
        </>
      )}
    </nav>
  );
}

export default App;