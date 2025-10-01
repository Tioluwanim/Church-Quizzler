import { BrowserRouter as Router, Routes, Route, NavLink } from "react-router-dom";
import TeamSetup from "./pages/TeamSetup";
import QuizPage from "./pages/QuizPage";
import Scoreboard from "./pages/Scoreboard";
import ReviewPage from "./pages/ReviewPage";

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        {/* Navbar */}
        <nav className="bg-purple-800 text-white p-4 flex flex-col md:flex-row justify-between items-center shadow-lg">
          <h1 className="text-2xl font-bold tracking-wide mb-2 md:mb-0">
            Oke-Osun Anglican Girls & Ladies Guild Quiz Competition
          </h1>
          <div className="flex flex-wrap gap-4 md:gap-6 text-lg justify-center">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `transition hover:text-yellow-300 ${isActive ? "text-yellow-300 font-semibold" : ""}`
              }
            >
              Setup
            </NavLink>
            <NavLink
              to="/quiz"
              className={({ isActive }) =>
                `transition hover:text-yellow-300 ${isActive ? "text-yellow-300 font-semibold" : ""}`
              }
            >
              Quiz
            </NavLink>
            <NavLink
              to="/review"
              className={({ isActive }) =>
                `transition hover:text-yellow-300 ${isActive ? "text-yellow-300 font-semibold" : ""}`
              }
            >
              Review
            </NavLink>
            <NavLink
              to="/scoreboard"
              className={({ isActive }) =>
                `transition hover:text-yellow-300 ${isActive ? "text-yellow-300 font-semibold" : ""}`
              }
            >
              Scoreboard
            </NavLink>
          </div>
        </nav>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-6 bg-gradient-to-b from-yellow-50 to-purple-50">
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
