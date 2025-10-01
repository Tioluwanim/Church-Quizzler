import { useEffect, useState } from "react";
import { fetchTeams, fetchQuestionsByCategory } from "../api";
import { useNavigate, useParams } from "react-router-dom";

function SelectTeam() {
  const { categoryId } = useParams(); // ✅ get categoryId from URL params
  const [teams, setTeams] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [selectedTeamId, setSelectedTeamId] = useState(null);
  const navigate = useNavigate();

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
    setSelectedTeamId(teamId); // show questions for this team
  };

  const handleSelectQuestion = (questionId) => {
    navigate(`/quiz/${selectedTeamId}/${categoryId}/${questionId}`);
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-xl shadow">
      <h1 className="text-2xl font-bold mb-4 text-center">🎯 Select Team</h1>
      {teams.length === 0 && <p>No teams available.</p>}

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {teams.map((team) => (
          <div key={team.id} className="text-center">
            <div
              className="p-3 rounded-lg text-white font-bold cursor-pointer hover:scale-105 transition"
              style={{ backgroundColor: team.color }}
              onClick={() => handleSelectTeam(team.id)}
            >
              {team.name}
            </div>

            {/* Show question numbers only for selected team */}
            {selectedTeamId === team.id && questions.length > 0 && (
              <div className="mt-2 flex flex-wrap justify-center gap-2">
                {questions.map((q, idx) => (
                  <button
                    key={q.id}
                    onClick={() => handleSelectQuestion(q.id)}
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
