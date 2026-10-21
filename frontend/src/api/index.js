import { API_BASE } from "../utils/api";

/**
 * Fetch all algorithm and system design tracks.
 */
export async function fetchAlgorithmTracks() {
  const token = localStorage.getItem("token");
  const headers = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}/algorithms/tracks`, { headers });
  if (!res.ok) {
    throw new Error(`Failed to load tracks: ${res.status}`);
  }
  return await res.json();
}

/**
 * Fetch single algorithm track with sandbox config and real-world case studies.
 */
export async function fetchAlgorithmTrack(trackId) {
  const token = localStorage.getItem("token");
  const headers = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}/algorithms/tracks/${trackId}`, { headers });
  if (!res.ok) {
    throw new Error(`Failed to load track ${trackId}: ${res.status}`);
  }
  return await res.json();
}

/**
 * Request AI synthesis of a custom algorithm track.
 */
export async function generateCustomAlgorithmTrack(topic, category = "arrays", difficulty = "intermediate", scenarioPrompt = null) {
  const token = localStorage.getItem("token");
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const bodyData = { topic, category, difficulty };
  if (scenarioPrompt) {
    bodyData.scenario_prompt = scenarioPrompt;
  }

  const res = await fetch(`${API_BASE}/algorithms/generate`, {
    method: "POST",
    headers,
    body: JSON.stringify(bodyData)
  });

  if (!res.ok) {
    throw new Error(`Failed to generate algorithm: ${res.status}`);
  }
  return await res.json();
}
