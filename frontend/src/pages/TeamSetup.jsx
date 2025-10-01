import { useState, useEffect } from "react";
import { fetchTeams, createTeam, deleteTeam, uploadQuestions } from "../api";
import { useNavigate } from "react-router-dom";

function TeamSetup() {
  const [teamName, setTeamName] = useState("");
  const [teams, setTeams] = useState([]);
  const [timerSeconds, setTimerSeconds] = useState(30); // ✅ default 30s
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
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
      await createTeam({ 
        name: teamName, 
        color: null, // backend auto-assigns or randomizes if null
        timer_seconds: timerSeconds 
      });
      setTeamName("");
      setTimerSeconds(30);
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
      {/* Header */}
      <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-purple-800 text-center mb-10">
        Team Setup
      </h2>

      {/* Error */}
      {error && <div className="mb-6 text-red-600 text-lg sm:text-xl text-center">{error}</div>}

      {/* Team Input */}
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 mb-8 justify-center">
        <input
          type="text"
          placeholder="Team Name"
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
          className="flex-1 px-4 sm:px-6 py-3 border-2 border-purple-200 rounded-full text-lg sm:text-xl focus:outline-none focus:ring-4 focus:ring-purple-300"
        />
        <input
          type="number"
          min="5"
          value={timerSeconds}
          onChange={(e) => setTimerSeconds(Number(e.target.value))}
          className="w-28 px-4 py-3 border-2 border-purple-200 rounded-full text-lg sm:text-xl text-center focus:outline-none focus:ring-4 focus:ring-purple-300"
          placeholder="Timer (s)"
        />
        <button
          onClick={addTeam}
          className="px-6 sm:px-10 py-3 bg-gradient-to-r from-purple-600 to-yellow-400 text-white text-lg sm:text-xl font-semibold rounded-full shadow-lg hover:scale-105 transition"
        >
          Add Team
        </button>
      </div>

      {/* Team List */}
      <h3 className="text-2xl font-semibold mb-4 text-purple-700 text-center">Teams:</h3>
      {teams.length === 0 ? (
        <p className="text-gray-500 mb-8 text-center text-lg">No teams added yet.</p>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {teams.map((team) => (
            <li
              key={team.id}
              onClick={() => removeTeam(team.id)}
              className="flex items-center justify-between px-4 py-3 rounded-2xl shadow-lg font-medium text-lg text-white cursor-pointer hover:scale-105 transition"
              style={{ backgroundColor: team.color || "#6A0DAD" }}
              title="Click to remove team"
            >
              <span>{team.name}</span>
              <span className="ml-4 text-sm font-bold">⏳ {team.timer_seconds}s</span>
            </li>
          ))}
        </ul>
      )}

      {/* File Upload */}
      <div className="mb-8 text-center">
        <h2 className="text-xl font-semibold mb-2 text-purple-700">Upload Questions</h2>
        <label className="block cursor-pointer">
          <input type="file" accept=".doc,.docx,.txt,.pdf" onChange={handleFileChange} className="hidden" />
          <div className="w-full sm:w-3/4 mx-auto px-4 py-3 border-2 border-dashed rounded-2xl text-gray-600 hover:border-purple-500 hover:text-purple-700 text-lg text-center transition">
            {fileName ? fileName : "Click to upload a file"}
          </div>
        </label>
        {file && (
          <button
            onClick={handleFileUpload}
            disabled={uploading}
            className="mt-4 px-6 py-2 bg-green-600 text-white text-lg rounded-full shadow hover:bg-green-700 transition disabled:opacity-50"
          >
            {uploading ? "Uploading..." : "Upload File"}
          </button>
        )}
      </div>

      {/* Start Quiz */}
      <button
        onClick={() => navigate("/select-team")}
        className="w-full sm:w-2/3 mx-auto block py-3 bg-gradient-to-r from-yellow-400 to-purple-600 text-white text-lg sm:text-2xl font-bold rounded-full shadow-lg hover:scale-105 transition"
      >
        Start Quiz
      </button>
    </div>
  );
}

export default TeamSetup;
