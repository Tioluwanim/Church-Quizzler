import { useEffect, useState } from "react";
import { fetchCategories } from "../api";
import { useNavigate } from "react-router-dom";

function SelectQuizPage() {
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      const c = await fetchCategories();
      setCategories(c);
    }
    load();
  }, []);

  const handleSelectCategory = (category) => {
    // Store all teams locally for tracking answered
    if (!localStorage.getItem("all_teams")) localStorage.setItem("all_teams", JSON.stringify([]));
    navigate(`/select-team/${category.id}`);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-2xl shadow-md">
      <h1 className="text-2xl font-bold mb-4 text-center">📚 Select Quiz Session</h1>
      <div className="grid gap-4">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => handleSelectCategory(cat)}
            className="p-4 bg-purple-600 text-white rounded-xl text-center hover:bg-purple-700 transition"
          >
            {cat.name}
          </button>
        ))}
      </div>
    </div>
  );
}

export default SelectQuizPage;
