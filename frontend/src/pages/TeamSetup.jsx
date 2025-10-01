import { useState, useEffect } from "react";
import { fetchTeams, createTeam, deleteTeam, uploadQuestions } from "../api";
import { useNavigate } from "react-router-dom";

function TeamSetup() {
  const [teamName, setTeamName] = useState("");
  const [teams, setTeams] = useState([]);
  const [fileName, setFileName] = useState("");
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(""); // New state for errors
  const navigate = useNavigate();

  useEffect(() => {
    loadTeams();
  }, []);

  const loadTeams = async () => {
    try {
      const data = await fetchTeams();
      setTeams(data);
      setError(""); // Clear any previous error
    } catch (err) {
      console.error(err);
      setError("Failed to load teams. Please try again.");
    }
  };

  const addTeam = async () => {
    if (!teamName.trim()) return;
    try {
      await createTeam({ name: teamName });
      setTeamName("");
      loadTeams();
    } catch (err) {
      console.error(err);
      setError("Failed to add team. Please try again.");
    }
  };

  const removeTeam = async (id) => {
    try {
      await deleteTeam(id);
      loadTeams();
    } catch (err) {
      console.error(err);
      setError("Failed to remove team. Please try again.");
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFileName(selectedFile.name);
    }
  };

  const handleFileUpload = async () => {
    if (!file) return alert("Please select a file first!");
    setUploading(true);
    try {
      const result = await uploadQuestions(file);
      alert(`Uploaded ${result.uploaded} questions ✅`);
      setError(""); // Clear error on success
    } catch (err) {
      console.error(err);
      setError("Upload failed ❌: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-16 bg-gradient-to-b from-white via-yellow-50 to-purple-50 rounded-4xl shadow-2xl font-serif">
      {/* Logo */}
      <div className="flex justify-center mb-8">
        <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center shadow-inner">
          <span className="text-gray-400 text-xl font-bold">Logo</span>
        </div>
      </div>

      {/* Header */}
      <h2 className="text-5xl font-bold text-purple-800 text-center mb-12">
        Anglican Church Quiz Setup
      </h2>

      {/* Display error if any */}
      {error && (
        <div className="mb-6 text-red-600 text-xl font-semibold">
          {error}
        </div>
      )}

      {/* Team Input */}
      <div className="flex gap-6 mb-12">
        <input
          type="text"
          placeholder="Team Name"
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
          className="flex-1 px-6 py-4 border-2 border-purple-200 rounded-full text-2xl focus:outline-none focus:ring-4 focus:ring-purple-300 shadow-inner"
        />
        <button
          onClick={addTeam}
          className="px-8 py-4 bg-gradient-to-r from-purple-600 to-yellow-400 text-white text-2xl font-semibold rounded-full shadow-lg hover:scale-105 transition"
        >
          Add
        </button>
      </div>

      {/* Team List */}
      <h3 className="text-3xl font-semibold mb-6 text-purple-700">Teams:</h3>
      {teams.length === 0 ? (
        <p className="text-gray-500 mb-10 text-2xl">No teams added yet.</p>
      ) : (
        <ul className="space-y-4 mb-12">
          {teams.map((team) => (
            <li
              key={team.id}
              onClick={() => removeTeam(team.id)}
              className="flex items-center gap-4 px-6 py-4 rounded-2xl shadow-lg font-medium text-2xl text-white cursor-pointer hover:scale-105 transition"
              style={{ backgroundColor: team.color || "#6A0DAD" }}
              title="Click to remove team"
            >
              {team.name}
            </li>
          ))}
        </ul>
      )}

      {/* File Upload */}
      <div className="mb-12">
        <h2 className="text-3xl font-semibold mb-4 text-purple-700">
          Upload Questions
        </h2>
        <label className="block">
          <input
            type="file"
            accept=".doc,.docx,.txt,.pdf"
            onChange={handleFileChange}
            className="hidden"
          />
          <div className="w-full px-8 py-6 border-2 border-dashed rounded-2xl cursor-pointer text-gray-600 hover:border-purple-500 hover:text-purple-700 text-2xl transition shadow-inner">
            {fileName ? fileName : "Click to upload a file"}
          </div>
        </label>

        {file && (
          <button
            onClick={handleFileUpload}
            disabled={uploading}
            className="mt-4 px-6 py-3 bg-green-600 text-white text-xl rounded-full shadow hover:bg-green-700 transition disabled:opacity-50"
          >
            {uploading ? "Uploading..." : "Upload File"}
          </button>
        )}
      </div>

      {/* Start Button */}
      <button
        onClick={() => navigate("/quiz")}
        className="w-full py-5 bg-gradient-to-r from-yellow-400 to-purple-600 text-white text-3xl font-bold rounded-full shadow-lg hover:scale-105 transition"
      >
        Start Quiz
      </button>
    </div>
  );
}

export default TeamSetup;
