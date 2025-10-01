import { useEffect, useState } from "react";
import { fetchScoreboard } from "../api";

function Scoreboard() {
  const [scores, setScores] = useState([]);

  const loadScoreboard = async () => {
    const data = await fetchScoreboard();
    setScores(data);
  };

  useEffect(() => {
    loadScoreboard();
    const interval = setInterval(loadScoreboard, 5000);
    return () => clearInterval(interval);
  }, []);

  const getMedalStyle = (index) => {
    if (index === 0) return "bg-yellow-300 font-bold text-purple-900 shadow-lg";
    if (index === 1) return "bg-gray-300 font-bold text-purple-900";
    if (index === 2) return "bg-amber-700 text-white font-bold";
    return "bg-white";
  };

  return (
    <div className="min-h-screen p-4 md:p-12 bg-gradient-to-r from-yellow-50 via-purple-50 to-indigo-100">
      <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 md:mb-8 text-center text-purple-800">
        🏆 Scoreboard
      </h1>
      <ul className="space-y-2 md:space-y-4 max-w-md md:max-w-xl lg:max-w-2xl mx-auto px-2 md:px-0">
        {scores.map((row, idx) => (
          <li
            key={idx}
            className={`flex justify-between px-4 md:px-6 py-3 md:py-4 rounded-lg text-base md:text-xl shadow ${getMedalStyle(idx)}`}
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
