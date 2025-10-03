import { useEffect, useState } from "react";
import { fetchScoreboard, fetchCategories, fetchScoreboardByCategory } from "../api";

function Scoreboard() {
  const [categories, setCategories] = useState([]);
  const [overall, setOverall] = useState([]);
  const [perCategory, setPerCategory] = useState({});

  useEffect(() => {
    async function load() {
      const cats = await fetchCategories();
      setCategories(cats);

      const overallData = await fetchScoreboard();
      // ✅ sort overall by total_points descending
      setOverall(overallData.sort((a, b) => b.total_points - a.total_points));

      // Load per-category scores
      const catScores = {};
      for (const c of cats) {
        let scores = await fetchScoreboardByCategory(c.name); // ✅ use category name
        // ✅ sort scores descending
        scores = scores.sort((a, b) => b.points - a.points);
        catScores[c.id] = scores;
      }
      setPerCategory(catScores);
    }
    load();
  }, []);

  // helper for medals 🏅
  const getMedal = (index) => {
    if (index === 0) return "🥇";
    if (index === 1) return "🥈";
    if (index === 2) return "🥉";
    return `${index + 1}.`;
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-2xl shadow-lg">
      <h1 className="text-2xl font-bold mb-6">🏆 Scoreboard</h1>

      {categories.map((cat) => (
        <div key={cat.id} className="mb-6">
          <h2 className="text-xl font-semibold mb-2">{cat.name} Scores</h2>
          <ul className="bg-gray-100 rounded-lg p-4">
            {perCategory[cat.id]?.map((t, index) => (
              <li
                key={t.team_id}
                className="flex justify-between border-b py-1 font-medium"
              >
                <span>
                  {getMedal(index)} {t.team_name}
                </span>
                <span className="font-bold">{t.points}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}

      <h2 className="text-xl font-semibold mt-6 mb-2">🏅 Final Scores</h2>
      <ul className="bg-yellow-100 rounded-lg p-4">
        {overall.map((t, index) => (
          <li
            key={t.team_id}
            className="flex justify-between border-b py-1 font-medium"
          >
            <span>
              {getMedal(index)} {t.team_name}
            </span>
            <span className="font-bold">{t.total_points}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Scoreboard;
