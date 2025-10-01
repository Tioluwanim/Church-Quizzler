import { useEffect, useState } from "react";
import { fetchCategories } from "../api";
import { Link } from "react-router-dom";

function SelectQuizPage() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    async function load() {
      const c = await fetchCategories();
      setCategories(c);
    }
    load();
  }, []);

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-2xl shadow-md">
      <h1 className="text-2xl font-bold mb-4">📚 Select Quiz Session</h1>
      <div className="grid gap-4">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            to={`/quiz/${cat.id}`}
            className="p-4 bg-purple-600 text-white rounded-xl text-center hover:bg-purple-700 transition"
          >
            {cat.name}
          </Link>
        ))}
      </div>
    </div>
  );
}

export default SelectQuizPage;
