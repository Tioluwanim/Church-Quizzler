import { useEffect, useState } from "react";
import { fetchTeams, fetchQuestions } from "../api";
import { useNavigate, useParams } from "react-router-dom";

function SelectTeam() {
  const { categoryId } = useParams();
  const [teams, setTeams] = useState([]);
  const [questions, setQuestions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadTeamsAndQuestions() {
      const teamData = await fetchTeams();
      setTeams(teamData);

      // Store all teams in localStorage if not already
      if (!localStorage.getItem("all_teams")) {
        localStorage.setItem("all_teams", JSON.stringify(teamData.map(t => t.id)));
      }

      const questionData = await fetchQuestions(categoryId);
      setQuestions(questionData);
    }
    loadTeamsAndQuestions();
  }, [categoryId]);

  const handleSelectTeam = (teamId, questionId) => {
    navigate(`/quiz/${teamId}/${categoryId}/${questionId}`);
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-xl shadow">
      <h1 className="text-2xl font-bold mb-4 text-center">🎯 Select Team & Question</h1>

      {/* Teams */}
      <h2 className="text-xl font-semibold mb-2 text-center">Teams:</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
        {teams.map((team) => (
          <div key={team.id} className="text-center">
            <div className="p-3 bg-purple-600 text-white rounded-lg">{team.name}</div>
            {/* Question numbers for this team */}
            <div className="mt-2 flex flex-wrap justify-center gap-2">
              {questions.map((q, idx) => (
                <button
                  key={q.id}
                  onClick={() => handleSelectTeam(team.id, q.id)}
                  className="px-3 py-1 bg-yellow-400 text-purple-800 rounded hover:bg-yellow-500 transition"
                >
                  {idx + 1}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SelectTeam;
