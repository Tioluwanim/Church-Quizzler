import { useEffect, useState } from "react";
import { fetchCategories } from "../api";
import { useNavigate } from "react-router-dom";

function SelectQuizPage() {
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadCategories() {
      try {
        const data = await fetchCategories();
        setCategories(data);
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      }
    }
    loadCategories();
  }, []);

  const handleSelectCategory = (category) => {
    // Ensure all teams are stored locally for tracking answered
    if (!localStorage.getItem("all_teams")) localStorage.setItem("all_teams", JSON.stringify([]));

    // Navigate to SelectTeam page with categoryId in URL
    navigate(`/select-team/${category.id}`);
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-2xl shadow-md">
      <h1 className="text-2xl font-bold mb-4 text-center">📚 Select Quiz Session</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {categories.length === 0 && <p className="text-center text-gray-500">No categories available.</p>}

        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => handleSelectCategory(cat)}
            className="p-4 bg-purple-600 text-white rounded-xl text-center hover:bg-purple-700 transition font-semibold"
          >
            {cat.name || cat.category_name || `Category ${cat.id}`} {/* fallback if API property differs */}
          </button>
        ))}
      </div>
    </div>
  );
}

export default SelectQuizPage;
