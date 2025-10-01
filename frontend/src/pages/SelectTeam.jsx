import { useEffect, useState } from "react";
import { fetchTeams, fetchQuestionsByCategory } from "../api";
import { useNavigate, useSearchParams } from "react-router-dom";

function SelectTeam() {
  const [teams, setTeams] = useState([]);
  const [questions, setQuestions] = useState([]);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const categoryId = searchParams.get("categoryId");

  useEffect(() => {
    async function loadData() {
      const teamData = await fetchTeams();
      setTeams(teamData);

      if (categoryId) {
        const questionData = await fetchQuestionsByCategory(categoryId);
        setQuestions(questionData);
      }
    }
    loadData();
  }, [categoryId]);

  const handleSelectTeam = (teamId, questionId) => {
    navigate(`/quiz/${teamId}/${categoryId}`);
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-xl shadow">
      <h1 className="text-2xl font-bold mb-4 text-center">🎯 Select Team</h1>
      {teams.length === 0 && <p>No teams available.</p>}

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {teams.map((team) => (
          <div key={team.id} className="text-center">
            <div className="p-3 rounded-lg text-white font-bold" style={{ backgroundColor: team.color }}>
              {team.name}
            </div>
            {questions.length > 0 && (
              <div className="mt-2 flex flex-wrap justify-center gap-2">
                {questions.map((q, idx) => (
                  <button key={q.id} onClick={() => handleSelectTeam(team.id, q.id)}
                    className="px-3 py-1 bg-yellow-400 text-purple-800 rounded hover:bg-yellow-500 transition">
                    {idx + 1}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default SelectTeam;
