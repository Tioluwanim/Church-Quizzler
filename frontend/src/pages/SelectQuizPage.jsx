import { useEffect, useState } from "react";
import { fetchCategories, fetchTeams } from "../api";
import { useNavigate } from "react-router-dom";

function SelectQuizPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadCategories() {
      try {
        const data = await fetchCategories();
        setCategories(data || []);
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      } finally {
        setLoading(false);
      }
    }
    loadCategories();
  }, []);

  const handleSelectCategory = async (category) => {
    try {
      // Fetch all teams so we can store them in localStorage for tracking
      const teams = await fetchTeams();
      localStorage.setItem("all_teams", JSON.stringify(teams.map((t) => t.id)));

      // Navigate to SelectTeam page with categoryId in URL
      navigate(`/select-team/${category.id}`);
    } catch (err) {
      console.error("Failed to load teams:", err);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-2xl shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">📚 Select Quiz Session</h1>

      {loading ? (
        <p className="text-center text-gray-500">Loading categories...</p>
      ) : categories.length === 0 ? (
        <p className="text-center text-gray-500">No categories available.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleSelectCategory(cat)}
              className="p-4 bg-purple-600 text-white rounded-xl text-center hover:bg-purple-700 transition font-semibold shadow-md"
            >
              {cat.name || cat.category_name || `Category ${cat.id}`}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default SelectQuizPage;
