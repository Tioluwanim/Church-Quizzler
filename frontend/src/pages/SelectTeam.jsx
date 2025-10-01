import { useEffect, useState } from "react";
import { fetchTeams } from "../api";
import { useNavigate, useParams } from "react-router-dom";

function SelectTeam() {
  const [teams, setTeams] = useState([]);
  const { categoryId } = useParams(); // category passed from SelectQuizPage
  const navigate = useNavigate();

  useEffect(() => {
    loadTeams();
  }, []);

  const loadTeams = async () => {
    const data = await fetchTeams();
    setTeams(data);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow">
      <h1 className="text-2xl font-bold mb-4">🎯 Select Team to Answer</h1>
      <div className="grid gap-4">
        {teams.map((team) => (
          <button
            key={team.id}
            onClick={() => navigate(`/quiz/${team.id}/${categoryId}`)}
            className="p-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
          >
            {team.name}
          </button>
        ))}
      </div>
    </div>
  );
}

export default SelectTeam;
