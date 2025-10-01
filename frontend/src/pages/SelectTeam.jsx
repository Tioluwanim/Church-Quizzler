import { useEffect, useState } from "react";
import { fetchTeams, fetchQuestions } from "../api";
import { useNavigate, useParams } from "react-router-dom";

function SelectTeam() {
  const { categoryId } = useParams();
  const [teams, setTeams] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadTeamsAndQuestions() {
      try {
        const teamData = await fetchTeams();
        setTeams(teamData);

        // Store all team IDs in localStorage for tracking
        if (!localStorage.getItem("all_teams")) {
          localStorage.setItem(
            "all_teams",
            JSON.stringify(teamData.map((t) => t.id))
          );
        }

        // Fetch questions for this category
        const questionData = await fetchQuestions(categoryId);
        setQuestions(questionData);
      } catch (err) {
        console.error("Failed to load teams or questions:", err);
      } finally {
        setLoading(false);
      }
    }
    if (categoryId) {
      loadTeamsAndQuestions();
    }
  }, [categoryId]);

  // Navigate to QuizPage for selected team & question
  const handleSelectTeam = (teamId, questionId) => {
    if (!teamId || !questionId) return;
    navigate(`/quiz/${teamId}/${categoryId}/${questionId}`);
  };

  if (loading) return <p className="text-center mt-10">Loading...</p>;
  if (!categoryId) return <p className="text-center mt-10 text-red-600">Invalid category!</p>;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow">
      <h1 className="text-2xl font-bold mb-6 text-center">
        🎯 Select Team & Question
      </h1>

      {teams.length === 0 ? (
        <p className="text-center text-gray-500">No teams found.</p>
      ) : (
        teams.map((team) => (
          <div key={team.id} className="mb-6">
            <div className="p-3 bg-purple-600 text-white rounded-lg text-center font-semibold">
              {team.name}
            </div>

            {/* Question numbers */}
            <div className="mt-2 flex flex-wrap justify-center gap-2">
              {questions.length === 0 ? (
                <p className="text-gray-500">No questions available.</p>
              ) : (
                questions.map((q, idx) => (
                  <button
                    key={q.id}
                    onClick={() => handleSelectTeam(team.id, q.id)}
                    className="px-3 py-1 bg-yellow-400 text-purple-800 rounded hover:bg-yellow-500 transition"
                  >
                    {idx + 1}
                  </button>
                ))
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default SelectTeam;
