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
      setOverall(overallData);

      // Load per-category scores
      const catScores = {};
      for (const c of cats) {
        catScores[c.id] = await fetchScoreboardByCategory(c.id);
      }
      setPerCategory(catScores);
    }
    load();
  }, []);

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-2xl shadow-lg">
      <h1 className="text-2xl font-bold mb-6">🏆 Scoreboard</h1>

      {categories.map((cat) => (
        <div key={cat.id} className="mb-6">
          <h2 className="text-xl font-semibold mb-2">{cat.name} Scores</h2>
          <ul className="bg-gray-100 rounded-lg p-4">
            {perCategory[cat.id]?.map((t) => (
              <li key={t.team_id} className="flex justify-between border-b py-1">
                <span>{t.team_name}</span>
                <span className="font-bold">{t.points}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}

      <h2 className="text-xl font-semibold mt-6 mb-2">🏅 Final Scores</h2>
      <ul className="bg-yellow-100 rounded-lg p-4">
        {overall.map((t) => (
          <li key={t.team_id} className="flex justify-between border-b py-1">
            <span>{t.team_name}</span>
            <span className="font-bold">{t.total_points}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Scoreboard;
