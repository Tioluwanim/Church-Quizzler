import { useEffect, useState } from "react";
import axios from "axios";

function ReviewPage() {
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const res = await axios.get("https://church-quizzler.onrender.com/questions");
      setQuestions(res.data);
    } catch (err) {
      console.error("Error loading questions:", err);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-12 bg-gradient-to-b from-purple-50 to-yellow-50">
      <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-8 md:mb-10 text-center text-purple-800">
        📖 Review Questions
      </h1>

      <div className="max-w-xl md:max-w-4xl mx-auto space-y-4 md:space-y-6 px-2 md:px-0">
        {questions.length === 0 ? (
          <p className="text-gray-500 text-center text-lg md:text-xl">
            No questions available
          </p>
        ) : (
          questions.map((q, idx) => (
            <div
              key={q.id}
              className="bg-white p-4 md:p-6 rounded-2xl shadow-md border-l-4 border-purple-400"
            >
              <h2 className="text-lg md:text-2xl font-semibold text-purple-700 mb-1 md:mb-2">
                Q{idx + 1}: {q.text}
              </h2>
              <p className="text-base md:text-xl text-green-700 font-medium">
                ✅ Answer: {q.answer}
              </p>
              {q.category && (
                <p className="text-sm md:text-base text-gray-500">
                  Category: {q.category}
                </p>
              )}
              <p className="text-sm md:text-base text-gray-500">Points: {q.points}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default ReviewPage;
