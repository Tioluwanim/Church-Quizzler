import { useEffect, useState } from "react";
import axios from "axios";

function ReviewPage() {
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/questions");
      setQuestions(res.data);
    } catch (err) {
      console.error("Error loading questions:", err);
    }
  };

  return (
    <div className="min-h-screen p-12 bg-gradient-to-b from-purple-50 to-yellow-50">
      <h1 className="text-4xl font-bold mb-10 text-center text-purple-800">
        📖 Review Questions
      </h1>

      <div className="max-w-4xl mx-auto space-y-6">
        {questions.length === 0 ? (
          <p className="text-gray-500 text-center text-xl">
            No questions available
          </p>
        ) : (
          questions.map((q, idx) => (
            <div
              key={q.id}
              className="bg-white p-6 rounded-2xl shadow-md border-l-4 border-purple-400"
            >
              <h2 className="text-2xl font-semibold text-purple-700 mb-2">
                Q{idx + 1}: {q.text}
              </h2>
              <p className="text-xl text-green-700 font-medium">
                ✅ Answer: {q.answer}
              </p>
              {q.category && (
                <p className="text-sm text-gray-500">Category: {q.category}</p>
              )}
              <p className="text-sm text-gray-500">Points: {q.points}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default ReviewPage;
