import { useState } from "react";
import { API_BASE } from "../utils/api";
import { showToast } from "../components/ui/ToastProvider";

export default function Admin({ problems, setProblems }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [difficulty, setDifficulty] = useState("Easy");
  const [topics, setTopics] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!title.trim() || isSubmitting) return;

    const payload = {
      title: title.trim(),
      description: description.trim() || `Solve: ${title.trim()}`,
      difficulty,
      topics: topics
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      videoUrl: videoUrl.trim() || "https://example.com",
      referenceCode: {
        python: "# Add Python reference solution",
        cpp: "// Add C++ reference solution",
        java: "// Add Java reference solution",
      },
      explanations: {
        python: ["Explain your Python logic here."],
        cpp: ["Explain your C++ logic here."],
        java: ["Explain your Java logic here."],
      },
      sampleTests: [{ id: 1, input: "", expected: "" }],
    };

    const token = localStorage.getItem("token");
    if (!token) {
      showToast("Admin authentication required to save problems.", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/problems/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || `Failed to save problem (${res.status})`);
      }

      const created = await res.json();
      setProblems([...problems, created]);
      setTitle("");
      setDescription("");
      setDifficulty("Easy");
      setTopics("");
      setVideoUrl("");
      showToast("Problem saved to database and added to the Problems list.", "success");
    } catch (err) {
      showToast(err.message || "Failed to add problem.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="text-sm">
      <div className="border border-emerald-500/60 rounded-2xl p-4 bg-theme-bg-secondary/90">
        <h1 className="text-xl font-semibold mb-1">Admin panel</h1>
        <p className="text-theme-text-tertiary mb-3">
          Add coding problems that will appear for students.
        </p>
        <form onSubmit={handleAdd} className="space-y-3">
          <div className="flex flex-col gap-1">
            <label htmlFor="admin_title">Title</label>
            <input
              id="admin_title"
              className="rounded-lg border border-theme-border bg-theme-bg-tertiary px-2 py-1 text-sm"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Check Prime Number"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="admin_description">Description</label>
            <textarea
              id="admin_description"
              rows={2}
              className="rounded-lg border border-theme-border bg-theme-bg-tertiary px-2 py-1 text-sm"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Problem statement and constraints..."
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="admin_difficulty">Difficulty</label>
            <select
              id="admin_difficulty"
              className="rounded-lg border border-theme-border bg-theme-bg-tertiary px-2 py-1 text-sm"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
            >
              <option>Easy</option>
              <option>Medium</option>
              <option>Hard</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="admin_topics">Topics (comma separated)</label>
            <input
              id="admin_topics"
              className="rounded-lg border border-theme-border bg-theme-bg-tertiary px-2 py-1 text-sm"
              value={topics}
              onChange={(e) => setTopics(e.target.value)}
              placeholder="loops, arrays, recursion..."
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="admin_video_url">Learning video URL</label>
            <input
              id="admin_video_url"
              className="rounded-lg border border-theme-border bg-theme-bg-tertiary px-2 py-1 text-sm"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://..."
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 px-4 py-2 rounded-full bg-emerald-500 text-theme-bg-primary text-base font-semibold hover:bg-emerald-400 disabled:opacity-50"
          >
            {isSubmitting ? "Saving..." : "Add problem"}
          </button>
        </form>
      </div>

      <div className="border border-theme-border rounded-2xl p-4 mt-4">
        <h2 className="text-base font-semibold mb-2">Existing problems</h2>
        <ul className="space-y-1">
          {problems.map((p) => (
            <li
              key={p.id}
              className="flex justify-between items-center border border-theme-border rounded-lg px-3 py-2"
            >
              <div>
                <div className="font-semibold text-theme-text-primary">
                  #{p.id} — {p.title}
                </div>
                <div className="text-sm text-theme-text-tertiary">
                  {p.difficulty} • {p.topics.join(", ")}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
