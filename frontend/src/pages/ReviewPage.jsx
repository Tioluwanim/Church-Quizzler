import { useEffect, useState } from "react";
import { fetchQuestions } from "../api";

function ReviewPage() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      const data = await fetchQuestions();
      setQuestions(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p className="text-center mt-8 text-lg">Loading...</p>;
  if (questions.length === 0) return <p className="text-center mt-8 text-gray-500">No questions available.</p>;

  return (
    <div className="max-w-5xl mx-auto p-6 sm:p-12 bg-gradient-to-b from-white via-yellow-50 to-purple-50 rounded-3xl shadow-2xl flex flex-col gap-6 font-serif">
      <h2 className="text-3xl font-bold text-purple-800 text-center">Quiz Review</h2>
      <ul className="space-y-4">
        {questions.map((q) => (
          <li key={q.id} className="bg-white rounded-2xl shadow p-4 sm:p-6 flex flex-col gap-2">
            <p className="text-lg sm:text-xl font-semibold">{q.text}</p>
            <p className="text-gray-700">Answer: <span className="font-bold">{q.answer}</span></p>
            {q.category && <p className="text-gray-500 text-sm">Category: {q.category}</p>}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ReviewPage;
