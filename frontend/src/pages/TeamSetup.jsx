import { useState, useEffect } from "react";
import { fetchTeams, createTeam, deleteTeam, uploadQuestions } from "../api";
import { useNavigate } from "react-router-dom";

function TeamSetup() {
  const [teamName, setTeamName] = useState("");
  const [teams, setTeams] = useState([]);
  const [fileName, setFileName] = useState("");
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    loadTeams();
  }, []);

  const loadTeams = async () => {
    try {
      const data = await fetchTeams();
      setTeams(data);
      setError("");
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
      setError("");
    } catch (err) {
      console.error(err);
      setError("Upload failed ❌: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 sm:p-12 bg-gradient-to-b from-white via-yellow-50 to-purple-50 rounded-3xl shadow-2xl font-serif">
      {/* Logos */}
      <div className="flex flex-col sm:flex-row justify-center gap-8 mb-8 items-center">
        <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center shadow-inner">
          <span className="text-gray-400 text-lg font-bold text-center">Logo 1</span>
        </div>
        <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center shadow-inner">
          <span className="text-gray-400 text-lg font-bold text-center">Logo 2</span>
        </div>
      </div>

      {/* Header */}
      <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-purple-800 text-center mb-10">
        Oke-Osun Anglican Girls & Ladies Guild Quiz Competition
      </h2>

      {/* Error */}
      {error && <div className="mb-6 text-red-600 text-lg sm:text-xl font-semibold text-center">{error}</div>}

      {/* Team Input */}
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 mb-8 justify-center">
        <input
          type="text"
          placeholder="Team Name"
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
          className="flex-1 px-4 sm:px-6 py-3 border-2 border-purple-200 rounded-full text-lg sm:text-2xl focus:outline-none focus:ring-4 focus:ring-purple-300 shadow-inner"
        />
        <button
          onClick={addTeam}
          className="px-6 sm:px-10 py-3 sm:py-4 bg-gradient-to-r from-purple-600 to-yellow-400 text-white text-lg sm:text-2xl font-semibold rounded-full shadow-lg hover:scale-105 transition"
        >
          Add Team
        </button>
      </div>

      {/* Team List */}
      <h3 className="text-2xl sm:text-3xl font-semibold mb-4 text-purple-700 text-center">Teams:</h3>
      {teams.length === 0 ? (
        <p className="text-gray-500 mb-8 text-center text-lg sm:text-xl">No teams added yet.</p>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {teams.map((team) => (
            <li
              key={team.id}
              onClick={() => removeTeam(team.id)}
              className="flex items-center justify-center px-4 py-3 sm:px-6 sm:py-4 rounded-2xl shadow-lg font-medium text-lg sm:text-xl text-white cursor-pointer hover:scale-105 transition"
              style={{ backgroundColor: team.color || "#6A0DAD" }}
              title="Click to remove team"
            >
              {team.name}
            </li>
          ))}
        </ul>
      )}

      {/* File Upload */}
      <div className="mb-8">
        <h2 className="text-xl sm:text-2xl font-semibold mb-2 text-purple-700 text-center">Upload Questions</h2>
        <label className="block">
          <input type="file" accept=".doc,.docx,.txt,.pdf" onChange={handleFileChange} className="hidden" />
          <div className="w-full sm:w-3/4 mx-auto px-4 py-3 border-2 border-dashed rounded-2xl cursor-pointer text-gray-600 hover:border-purple-500 hover:text-purple-700 text-lg sm:text-xl text-center transition shadow-inner">
            {fileName ? fileName : "Click to upload a file"}
          </div>
        </label>

        {file && (
          <button
            onClick={handleFileUpload}
            disabled={uploading}
            className="mt-4 block mx-auto px-6 sm:px-10 py-2 sm:py-3 bg-green-600 text-white text-lg sm:text-xl rounded-full shadow hover:bg-green-700 transition disabled:opacity-50"
          >
            {uploading ? "Uploading..." : "Upload File"}
          </button>
        )}
      </div>

      {/* Start Quiz */}
      <button
        onClick={() => navigate("/quiz")}
        className="w-full sm:w-2/3 md:w-1/2 block mx-auto py-3 sm:py-4 bg-gradient-to-r from-yellow-400 to-purple-600 text-white text-lg sm:text-2xl font-bold rounded-full shadow-lg hover:scale-105 transition"
      >
        Start Quiz
      </button>
    </div>
  );
}

export default TeamSetup;
