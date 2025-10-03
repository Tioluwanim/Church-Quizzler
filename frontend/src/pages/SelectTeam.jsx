import { useEffect, useState } from "react";
import { fetchTeams, fetchCategories, fetchQuestionsByCategory } from "../api";
import { useNavigate, useParams } from "react-router-dom";

function SelectTeam() {
  const { categoryId } = useParams(); 
  const [categories, setCategories] = useState([]);
  const [teams, setTeams] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [selectedTeamId, setSelectedTeamId] = useState(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState(Number(categoryId) || null);

  const navigate = useNavigate();

  // Load categories
  useEffect(() => {
    async function loadCategories() {
      try {
        const catData = await fetchCategories();
        setCategories(catData);
        if (!selectedCategoryId && catData.length > 0) {
          setSelectedCategoryId(Number(catData[0].id));
        }
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      }
    }
    loadCategories();
  }, []);

  // Load teams
  useEffect(() => {
    async function loadTeams() {
      try {
        const teamData = await fetchTeams();
        setTeams(teamData);
      } catch (err) {
        console.error("Failed to fetch teams:", err);
      }
    }
    loadTeams();
  }, []);

  // Load questions for selected category
  useEffect(() => {
    async function loadQuestions() {
      if (!selectedCategoryId) return;
      try {
        const questionData = await fetchQuestionsByCategory(selectedCategoryId);
        setQuestions(questionData);
        setSelectedTeamId(null);
      } catch (err) {
        console.error("Failed to fetch questions:", err);
      }
    }
    loadQuestions();
  }, [selectedCategoryId]);

  const handleSelectTeam = (teamId) => {
    setSelectedTeamId(Number(teamId));
  };

  const handleSelectQuestion = (questionId) => {
    if (!selectedTeamId) return;
    navigate(`/quiz/${selectedTeamId}/${selectedCategoryId}/${questionId}`);
  };

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white rounded-xl shadow-lg">
      <h1 className="text-2xl font-bold mb-6 text-center">🎯 Select Team & Question</h1>

      {/* Categories */}
      <div className="flex flex-wrap justify-center gap-3 mb-6">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategoryId(Number(cat.id))}
            className={`px-4 py-2 rounded-full font-semibold transition ${
              selectedCategoryId === cat.id
                ? "bg-yellow-400 text-purple-800"
                : "bg-purple-600 text-white hover:bg-purple-700"
            }`}
          >
            {cat.name || cat.category_name || `Category ${cat.id}`}
          </button>
        ))}
      </div>

      {/* Teams */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {teams.map((team) => (
          <div key={team.id} className="text-center">
            <div
              onClick={() => handleSelectTeam(team.id)}
              className={`p-4 rounded-2xl font-bold text-white cursor-pointer shadow-lg transition transform hover:scale-105 ${
                selectedTeamId === team.id ? "ring-4 ring-yellow-400" : ""
              }`}
              style={{ backgroundColor: team.color || "#6A0DAD" }}
            >
              {team.name || `Team ${team.id}`}
            </div>

            {/* Question buttons for selected team */}
            {selectedTeamId === team.id && questions.length > 0 && (
              <div className="mt-3 flex flex-wrap justify-center gap-2">
                {questions.map((q, idx) => {
                  // ✅ Check global answered questions for this category
                  const answeredKey = `answered_${selectedCategoryId}`;
                  const answered = JSON.parse(localStorage.getItem(answeredKey) || "[]");
                  const alreadyAnswered = answered.includes(q.id);

                  return (
                    <button
                      key={q.id}
                      onClick={() => !alreadyAnswered && handleSelectQuestion(q.id)}
                      disabled={alreadyAnswered}
                      className={`px-4 py-2 rounded-lg font-bold transition ${
                        alreadyAnswered
                          ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                          : "bg-yellow-400 text-purple-800 hover:bg-yellow-500"
                      }`}
                    >
                      Q{idx + 1}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      {selectedCategoryId && questions.length === 0 && (
        <p className="text-center mt-4 text-gray-500">No questions available for this category.</p>
      )}
    </div>
  );
}

export default SelectTeam;
