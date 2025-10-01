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
    navigate(`/select-team/${category.id}`);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-2xl shadow-md">
      <h1 className="text-3xl font-bold mb-6 text-center">📚 Select Quiz Session</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat) => (
          <div
            key={cat.id}
            onClick={() => handleSelectCategory(cat)}
            className="p-6 bg-purple-600 text-white rounded-2xl shadow-lg cursor-pointer hover:scale-105 transition transform text-center font-semibold text-xl"
          >
            {cat.name}
          </div>
        ))}
      </div>
    </div>
  );
}

export default SelectQuizPage;
