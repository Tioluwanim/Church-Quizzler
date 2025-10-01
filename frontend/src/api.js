import axios from "axios";

const API_BASE = "https://church-quizzler.onrender.com";

// QUESTIONS
export const fetchQuestions = async () => {
  try {
    const res = await axios.get(`${API_BASE}/questions`);
    return res.data;
  } catch (err) {
    console.error("Error fetching questions:", err);
    return [];
  }
};

export const uploadQuestions = async (file) => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const res = await axios.post(`${API_BASE}/questions/upload`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return res.data; // expected { uploaded: number }
  } catch (err) {
    console.error("Error uploading questions:", err);
    throw err;
  }
};

// TEAMS
export const fetchTeams = async () => {
  try {
    const res = await axios.get(`${API_BASE}/teams`);
    return res.data;
  } catch (err) {
    console.error("Error fetching teams:", err);
    return [];
  }
};

export const createTeam = async (team) => {
  try {
    const res = await axios.post(`${API_BASE}/teams`, team);
    return res.data;
  } catch (err) {
    console.error("Error creating team:", err);
    throw err;
  }
};

export const deleteTeam = async (teamId) => {
  try {
    const res = await axios.delete(`${API_BASE}/teams/${teamId}`);
    return res.data;
  } catch (err) {
    console.error("Error deleting team:", err);
    throw err;
  }
};

// SCORES
export const fetchScoreboard = async () => {
  try {
    const res = await axios.get(`${API_BASE}/scores`);
    return res.data;
  } catch (err) {
    console.error("Error fetching scoreboard:", err);
    return [];
  }
};
