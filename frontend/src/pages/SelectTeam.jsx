import { useEffect, useState } from "react";
import { fetchTeams, fetchQuestionsByCategory } from "../api";
import { useNavigate, useSearchParams } from "react-router-dom";

function SelectTeam() {
  const [teams, setTeams] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [selectedTeamId, setSelectedTeamId] = useState(null);
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

  const handleSelectTeam = (teamId) => {
    // toggle selected team
    setSelectedTeamId(selectedTeamId === teamId ? null : teamId);
  };

  const handleSelectQuestion = (teamId, questionId) => {
    navigate(`/quiz/${teamId}/${categoryId}/${questionId}`);
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-xl shadow">
      <h1 className="text-2xl font-bold mb-4 text-center">🎯 Select Team & Question</h1>
      {teams.length === 0 && <p>No teams available.</p>}

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {teams.map((team) => (
          <div key={team.id} className="text-center">
            <div
              onClick={() => handleSelectTeam(team.id)}
              className={`p-3 rounded-lg text-white font-bold cursor-pointer transition transform hover:scale-105 ${
                selectedTeamId === team.id ? "ring-4 ring-yellow-400" : ""
              }`}
              style={{ backgroundColor: team.color || "#6A0DAD" }}
            >
              {team.name}
            </div>

            {selectedTeamId === team.id && questions.length > 0 && (
              <div className="mt-2 flex flex-wrap justify-center gap-2">
                {questions.map((q, idx) => (
                  <button
                    key={q.id}
                    onClick={() => handleSelectQuestion(team.id, q.id)}
                    className="px-3 py-1 bg-yellow-400 text-purple-800 rounded hover:bg-yellow-500 transition"
                  >
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
