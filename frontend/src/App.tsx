import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import HomePage from "./pages/HomePage";
import MatchesPage from "./pages/MatchesPage";
import './App.css';

function App() {
  return(
    <BrowserRouter>
    {/* Simple navigation bar */}
    <nav>
      <Link to = "/">Home</Link> | <Link to = "/matches">Matches</Link>
    </nav>

    {/* Route definitions */}
    <Routes>
      <Route path = "/" element = {<HomePage />} />
      <Route path = "/matches" element = {<MatchesPage />} />
    </Routes>

    </BrowserRouter>
  );
}

export default App;