import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import TeamSetup from "./pages/TeamSetup";
import QuizPage from "./pages/QuizPage";
import Scoreboard from "./pages/Scoreboard";
import ReviewPage from "./pages/ReviewPage";

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        {/* Navbar */}
        <nav className="bg-purple-800 text-white p-4 flex justify-between items-center shadow-lg">
          <h1 className="text-2xl font-bold tracking-wide">Anglican Quiz</h1>
          <div className="flex gap-6 text-lg">
            <Link to="/" className="hover:text-yellow-300 transition">Setup</Link>
            <Link to="/quiz" className="hover:text-yellow-300 transition">Quiz</Link>
            <Link to="/review" className="hover:text-yellow-300 transition">Review</Link>
            <Link to="/scoreboard" className="hover:text-yellow-300 transition">Scoreboard</Link>
          </div>
        </nav>

        {/* Page Content */}
        <main className="flex-1 p-6 bg-gradient-to-b from-yellow-50 to-purple-50">
          <Routes>
            <Route path="/" element={<TeamSetup />} />
            <Route path="/quiz" element={<QuizPage />} />
            <Route path="/review" element={<ReviewPage />} /> 
            <Route path="/scoreboard" element={<Scoreboard />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
