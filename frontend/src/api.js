const API_BASE = "https://church-quizzler.onrender.com"; // adjust if backend URL differs

// =====================
// Teams
// =====================
export async function fetchTeams() {
  try {
    const res = await fetch(`${API_BASE}/teams`);
    if (!res.ok) throw new Error("Failed to fetch teams");
    return res.json();
  } catch (err) {
    console.error("Error fetching teams:", err);
    return [];
  }
}

export async function createTeam(team) {
  try {
    const res = await fetch(`${API_BASE}/teams`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(team),
    });
    if (!res.ok) throw new Error("Failed to create team");
    return res.json();
  } catch (err) {
    console.error("Error creating team:", err);
  }
}

export async function deleteTeam(id) {
  try {
    const res = await fetch(`${API_BASE}/teams/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to delete team");
  } catch (err) {
    console.error("Error deleting team:", err);
  }
}

// =====================
// Questions
// =====================
export async function fetchQuestions() {
  try {
    const res = await fetch(`${API_BASE}/questions`);
    if (!res.ok) throw new Error("Failed to fetch questions");
    return res.json();
  } catch (err) {
    console.error("Error fetching questions:", err);
    return [];
  }
}

// =====================
// Scores
// =====================
export async function fetchScoreboard() {
  try {
    const res = await fetch(`${API_BASE}/scoreboard`);
    if (!res.ok) throw new Error("Failed to fetch scoreboard");
    return res.json();
  } catch (err) {
    console.error("Error fetching scoreboard:", err);
    return [];
  }
}

// =====================
// File Upload
// =====================
export async function uploadQuestions(file) {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const res = await fetch(`${API_BASE}/questions/upload`, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) throw new Error("Failed to upload file");

    return res.json();
  } catch (err) {
    console.error("Error uploading questions:", err);
    throw err;
  }
}
