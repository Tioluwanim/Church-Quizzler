import { useState, useEffect } from "react";
import { fetchTeams, createTeam, deleteTeam, uploadQuestions } from "../api";
import { useNavigate } from "react-router-dom";

function TeamSetup() {
  const [teamName, setTeamName] = useState("");
  const [teams, setTeams] = useState([]);
  const [timerSeconds, setTimerSeconds] = useState(30);
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => { loadTeams(); }, []);

  const loadTeams = async () => {
    try {
      const data = await fetchTeams();
      setTeams(data);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Failed to load teams.");
    }
  };

  const addTeam = async () => {
    if (!teamName.trim()) return;
    try {
      await createTeam({ name: teamName, color: null, timer_seconds: timerSeconds });
      setTeamName(""); setTimerSeconds(30);
      loadTeams();
    } catch (err) {
      console.error(err); setError("Failed to add team.");
    }
  };

  const removeTeam = async (id) => {
    try { await deleteTeam(id); loadTeams(); } 
    catch (err) { console.error(err); setError("Failed to remove team."); }
  };

  const handleFileChange = (e) => { 
    const f = e.target.files[0]; 
    if(f){setFile(f); setFileName(f.name);} 
  };

  const handleFileUpload = async () => {
    if (!file) return alert("Select a file first!");
    setUploading(true);
    try { 
      const result = await uploadQuestions(file); 
      alert(`Uploaded ${result.uploaded} questions ✅`); 
      setError(""); 
    }
    catch (err) { 
      console.error(err); setError("Upload failed: "+err.message); 
    }
    finally { setUploading(false); }
  };

  return (
    <div className="w-full min-h-screen p-8 bg-gradient-to-br from-yellow-50 via-white to-purple-50 font-serif">
      <div className="flex items-center justify-between mb-12">
        <img src="/logo1.png" alt="Logo 1" className="h-20 sm:h-24 md:h-28 object-contain" />
        <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold text-purple-900 text-center px-4">
          Oke Osun Anglican Diocese <br />Girls & Ladies Guild 2025 Quiz Competition
        </h2>
        <img src="/logo2.png" alt="Logo 2" className="h-20 sm:h-24 md:h-28 object-contain" />
      </div>

      {error && <div className="mb-6 text-red-600 text-lg text-center">{error}</div>}

      <div className="flex flex-col lg:flex-row gap-6 mb-10 justify-center items-center">
        <input type="text" placeholder="Team Name" value={teamName} onChange={(e)=>setTeamName(e.target.value)}
          className="flex-1 px-6 py-3 border-2 border-purple-200 rounded-full text-lg focus:outline-none focus:ring-4 focus:ring-purple-300"/>
        <input type="number" min="5" value={timerSeconds} onChange={(e)=>setTimerSeconds(Number(e.target.value))}
          className="w-36 px-4 py-3 border-2 border-purple-200 rounded-full text-lg text-center focus:outline-none focus:ring-4 focus:ring-purple-300" placeholder="Timer (s)"/>
        <button onClick={addTeam} className="px-10 py-3 bg-gradient-to-r from-purple-600 to-yellow-400 text-white text-lg rounded-full shadow-lg hover:scale-105 transition">Add Team</button>
      </div>

      <h3 className="text-2xl font-semibold mb-6 text-purple-700 text-center">Teams:</h3>
      {teams.length===0 ? <p className="text-gray-500 mb-12 text-center">No teams yet.</p> : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {teams.map(t => (
            <li key={t.id} onClick={()=>removeTeam(t.id)}
              className="flex items-center justify-between px-6 py-4 rounded-2xl shadow-lg text-lg text-white cursor-pointer hover:scale-105 transition"
              style={{backgroundColor:t.color||"#6A0DAD"}} title="Click to remove team">
              <span>{t.name}</span>
              <span className="ml-4 text-sm font-bold">⏳ {t.timer_seconds}s</span>
            </li>
          ))}
        </ul>
      )}

      <div className="mb-12 text-center">
        <h2 className="text-xl font-semibold mb-4 text-purple-700">Upload Questions</h2>
        <label className="block cursor-pointer">
          <input type="file" accept=".doc,.docx,.txt,.pdf" onChange={handleFileChange} className="hidden"/>
          <div className="w-full sm:w-3/4 lg:w-1/2 mx-auto px-6 py-4 border-2 border-dashed rounded-2xl text-gray-600 hover:border-purple-500 hover:text-purple-700 text-lg text-center transition">
            {fileName||"Click to upload a file"}
          </div>
        </label>
        {file && <button onClick={handleFileUpload} disabled={uploading} className="mt-6 px-8 py-3 bg-green-600 text-white text-lg rounded-full shadow hover:bg-green-700 transition disabled:opacity-50">{uploading ? "Uploading..." : "Upload File"}</button>}
      </div>

      <div className="text-center">
        <button 
          onClick={()=>navigate("/select-team")}
          className="px-16 py-4 bg-gradient-to-r from-yellow-400 to-purple-600 text-white text-xl font-bold rounded-full shadow-lg hover:scale-105 transition"
        >
          Start Quiz
        </button>
      </div>
    </div>
  );
}

export default TeamSetup;
