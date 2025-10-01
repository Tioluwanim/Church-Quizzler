import { useEffect, useState } from "react";
import { fetchTeams, fetchQuestionsByCategory } from "../api";
import { useNavigate, useParams } from "react-router-dom";

function SelectTeam() {
  const { categoryId } = useParams(); // get categoryId from URL
  const [teams, setTeams] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [selectedTeamId, setSelectedTeamId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadData() {
      try {
        const teamData = await fetchTeams();
        setTeams(teamData);

        if (categoryId) {
          const questionData = await fetchQuestionsByCategory(categoryId);
          setQuestions(questionData);
        }
      } catch (err) {
        console.error("Failed to load teams or questions:", err);
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
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow">
      <h1 className="text-2xl font-bold mb-6 text-center">🎯 Select Team & Question</h1>

      {teams.length === 0 && <p className="text-center">No teams available.</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {teams.map((team) => (
          <div key={team.id} className="text-center">
            {/* Team Card */}
            <div
              onClick={() => handleSelectTeam(team.id)}
              className={`p-4 rounded-2xl font-bold text-white cursor-pointer shadow-lg transition transform hover:scale-105 ${
                selectedTeamId === team.id ? "ring-4 ring-yellow-400" : ""
              }`}
              style={{ backgroundColor: team.color || "#6A0DAD" }}
            >
              {team.name}
            </div>

            {/* Show question numbers for selected team */}
            {selectedTeamId === team.id && questions.length > 0 && (
              <div className="mt-3 flex flex-wrap justify-center gap-2">
                {questions.map((q, idx) => (
                  <button
                    key={q.id}
                    onClick={() => handleSelectQuestion(q.id)}
                    className="px-4 py-2 bg-yellow-400 text-purple-800 rounded-lg hover:bg-yellow-500 transition"
                  >
                    Q{idx + 1}
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
