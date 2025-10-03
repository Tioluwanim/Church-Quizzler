const API_BASE = import.meta.env.VITE_API_BASE || "https://church-quizzler.onrender.com";

// --------------------
// TEAMS
// --------------------
export async function fetchTeams() {
  const res = await fetch(`${API_BASE}/teams`);
  if (!res.ok) throw new Error("Failed to fetch teams");
  return res.json();
}

export async function createTeam(team) {
  const res = await fetch(`${API_BASE}/teams`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(team),
  });
  if (!res.ok) throw new Error("Failed to create team");
  return res.json();
}

export async function updateTeam(teamId, team) {
  const res = await fetch(`${API_BASE}/teams/${teamId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(team),
  });
  if (!res.ok) throw new Error("Failed to update team");
  return res.json();
}

export async function deleteTeam(teamId) {
  const res = await fetch(`${API_BASE}/teams/${teamId}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete team");
  return res.json();
}

// --------------------
// CATEGORIES
// --------------------
// --------------------
// CATEGORIES
// --------------------
export async function fetchCategories() {
  const res = await fetch(`${API_BASE}/categories`);
  if (!res.ok) throw new Error("Failed to fetch categories");
  
  const data = await res.json();

  // Normalize category objects to always have a `name` property
  return data.map(cat => ({
    id: cat.id,
    name: cat.name || cat.category_name || `Category ${cat.id}`
  }));
}


// --------------------
// QUESTIONS
// --------------------
export async function fetchQuestions() {
  const res = await fetch(`${API_BASE}/questions`);
  if (!res.ok) throw new Error("Failed to fetch questions");
  return res.json();
}

export async function fetchQuestionsByCategory(categoryId) {
  const res = await fetch(`${API_BASE}/categories/${categoryId}/questions`);
  if (!res.ok) throw new Error("Failed to fetch questions for category");
  return res.json();
}

export async function createQuestion(question) {
  const res = await fetch(`${API_BASE}/questions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(question),
  });
  if (!res.ok) throw new Error("Failed to create question");
  return res.json();
}

// --------------------
// UPLOAD QUESTIONS
// --------------------
export async function uploadQuestions(file) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_BASE}/questions/upload`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Failed to upload file" }));
    throw new Error(err.detail || "Failed to upload file");
  }

  return res.json();
}

// --------------------
// SCORES
// --------------------
export async function awardScore(score) {
  const res = await fetch(`${API_BASE}/scores`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(score), // score = { team_id, question_id, points }
  });
  if (!res.ok) throw new Error("Failed to award score");
  return res.json();
}

// alias for QuizPage.jsx compatibility
export async function submitAnswer(teamId, questionId, points) {
  return awardScore({ team_id: teamId, question_id: questionId, points });
}

// --------------------
// SCOREBOARD
// --------------------
export async function fetchScoreboard() {
  const res = await fetch(`${API_BASE}/scoreboard`);
  if (!res.ok) throw new Error("Failed to fetch scoreboard");
  return res.json();
}

export async function fetchScoreboardByCategory(categoryId) {
  const res = await fetch(`${API_BASE}/scoreboard/category/${categoryId}`);
  if (!res.ok) throw new Error("Failed to fetch scoreboard by category");
  return res.json();
}

export async function fetchTeamScores(teamId) {
  const res = await fetch(`${API_BASE}/teams/${teamId}/scores`);
  if (!res.ok) throw new Error("Failed to fetch team scores");
  return res.json();
}
