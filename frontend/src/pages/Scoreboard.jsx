import { useEffect, useState } from "react";
import { fetchScoreboard } from "../api";

function Scoreboard() {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadScoreboard();
    const interval = setInterval(loadScoreboard, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadScoreboard = async () => {
    try {
      setLoading(true);
      const data = await fetchScoreboard();
      setScores(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getMedalStyle = (idx) => {
    if (idx === 0) return "bg-yellow-300 text-purple-900 font-bold shadow-lg";
    if (idx === 1) return "bg-gray-300 text-purple-900 font-bold";
    if (idx === 2) return "bg-amber-700 text-white font-bold";
    return "bg-white";
  };

  if (loading) return <p className="text-center mt-8 text-lg">Loading scoreboard...</p>;

  return (
    <div className="max-w-4xl mx-auto p-6 sm:p-12 bg-gradient-to-b from-yellow-50 via-white to-purple-50 rounded-3xl shadow-2xl flex flex-col gap-6 font-serif">
      <h2 className="text-3xl sm:text-4xl font-bold text-purple-800 text-center mb-6">🏆 Scoreboard</h2>
      <ul className="space-y-4">
        {scores.map((row, idx) => (
          <li
            key={idx}
            className={`flex justify-between px-4 py-3 rounded-2xl shadow ${getMedalStyle(idx)}`}
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
    </div>
  );
}

export default Scoreboard;
