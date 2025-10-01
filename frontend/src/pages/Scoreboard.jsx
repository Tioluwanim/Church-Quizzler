import { useEffect, useState } from "react";
import { fetchScoreboard } from "../api";

function Scoreboard() {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadScoreboard = async () => {
    try {
      const data = await fetchScoreboard();
      setScores(data);
    } catch (err) {
      console.error("Error fetching scoreboard:", err);
      alert("Failed to load scoreboard. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadScoreboard();
    const interval = setInterval(loadScoreboard, 5000); // refresh every 5s
    return () => clearInterval(interval);
  }, []);

  // Assign medal styles based on rank
  const getMedalStyle = (index) => {
    if (index === 0) return "bg-yellow-300 font-bold text-purple-900 shadow-lg"; // Gold
    if (index === 1) return "bg-gray-300 font-bold text-purple-900"; // Silver
    if (index === 2) return "bg-amber-700 text-white font-bold"; // Bronze
    return "bg-white"; // Others
  };

  return (
    <div className="min-h-screen p-12 bg-gradient-to-r from-yellow-50 via-purple-50 to-indigo-100 font-serif">
      <h1 className="text-4xl font-bold mb-8 text-center text-purple-800">🏆 Scoreboard</h1>

      {loading ? (
        <p className="text-center text-xl text-gray-500">Loading scores...</p>
      ) : scores.length === 0 ? (
        <p className="text-center text-xl text-gray-500">No scores yet.</p>
      ) : (
        <ul className="space-y-4 max-w-xl mx-auto">
          {scores.map((row, idx) => (
            <li
              key={idx}
              className={`flex justify-between px-6 py-4 rounded-lg text-xl shadow ${getMedalStyle(
                idx
              )}`}
            >
              <span>
                {idx === 0 && "🥇 "}
                {idx === 1 && "🥈 "}
                {idx === 2 && "🥉 "}
                {row.team_name}
              </span>
              <span className="font-bold">{row.total_points} pts</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Scoreboard;
