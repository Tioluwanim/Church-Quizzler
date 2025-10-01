import { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import TeamSetup from "./pages/TeamSetup";
import SelectTeam from "./pages/SelectTeam";
import SelectQuizPage from "./pages/SelectQuizPage";
import QuizPage from "./pages/QuizPage";
import Scoreboard from "./pages/Scoreboard";
import ReviewPage from "./pages/ReviewPage";
import { HiMenu, HiX } from "react-icons/hi";

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleMenu = () => setMenuOpen(!menuOpen);

  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        {/* Navbar */}
        <nav className="bg-purple-800 text-white shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
            <h1 className="text-xl sm:text-2xl font-bold tracking-wide text-center">
              Oke Osun Anglican Diocese Girls & Ladies Guild 2025 Quiz Competition
            </h1>

            {/* Desktop Menu */}
            <div className="hidden md:flex gap-6 text-lg">
              <Link to="/" className="hover:text-yellow-300 transition">Setup</Link>
              <Link to="/select-quiz" className="hover:text-yellow-300 transition">Select Quiz</Link>
              <Link to="/select-team" className="hover:text-yellow-300 transition">Select Team</Link>
              <Link to="/review" className="hover:text-yellow-300 transition">Review</Link>
              <Link to="/scoreboard" className="hover:text-yellow-300 transition">Scoreboard</Link>
            </div>

            {/* Mobile Hamburger */}
            <div className="md:hidden flex items-center">
              <button onClick={toggleMenu}>
                {menuOpen ? <HiX className="w-8 h-8" /> : <HiMenu className="w-8 h-8" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {menuOpen && (
            <div className="md:hidden bg-purple-700 px-4 pt-2 pb-4 flex flex-col gap-2">
              <Link onClick={toggleMenu} to="/" className="hover:text-yellow-300 transition">Setup</Link>
              <Link onClick={toggleMenu} to="/select-quiz" className="hover:text-yellow-300 transition">Select Quiz</Link>
              <Link onClick={toggleMenu} to="/select-team" className="hover:text-yellow-300 transition">Select Team</Link>
              <Link onClick={toggleMenu} to="/review" className="hover:text-yellow-300 transition">Review</Link>
              <Link onClick={toggleMenu} to="/scoreboard" className="hover:text-yellow-300 transition">Scoreboard</Link>
            </div>
          )}
        </nav>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 bg-gradient-to-b from-yellow-50 via-white to-purple-50">
          <Routes>
            <Route path="/" element={<TeamSetup />} />
            <Route path="/select-quiz" element={<SelectQuizPage />} />
            <Route path="/select-team/:categoryId" element={<SelectTeam />} />
            <Route path="/quiz/:teamId/:categoryId" element={<QuizPage />} />
            <Route path="/review" element={<ReviewPage />} />
            <Route path="/scoreboard" element={<Scoreboard />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
