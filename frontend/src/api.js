const API_BASE = "https://church-quizzler.onrender.com"; // Adjust if backend runs elsewhere

// Teams
export async function fetchTeams() {
  const res = await fetch(`${API_BASE}/teams`);
  return res.json();
}

export async function createTeam(team) {
  const res = await fetch(`${API_BASE}/teams`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(team),
  });
  return res.json();
}

export async function deleteTeam(id) {
  await fetch(`${API_BASE}/teams/${id}`, { method: "DELETE" });
}

// Questions
export async function fetchQuestions() {
  const res = await fetch(`${API_BASE}/questions`);
  return res.json();
}

// Scores
export async function fetchScoreboard() {
  const res = await fetch(`${API_BASE}/scoreboard`);
  return res.json();
}
// Upload questions file
export async function uploadQuestions(file) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_BASE}/questions/upload`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    throw new Error("Failed to upload file");
  }

  return res.json();
}
