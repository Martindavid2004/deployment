import { useState } from "react";

export default function Admin({ problems, setProblems }) {
  const [title, setTitle] = useState("");
  const [difficulty, setDifficulty] = useState("Easy");
  const [topics, setTopics] = useState("");
  const [videoUrl, setVideoUrl] = useState("");

  const handleAdd = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const nextId = problems.length
      ? Math.max(...problems.map((p) => p.id)) + 1
      : 1;

    const newProblem = {
      id: nextId,
      title: title.trim(),
      difficulty,
      topics: topics
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      videoUrl: videoUrl || "https://example.com",
      referenceCode: {
        python: "# TODO: add Python reference solution",
        cpp: "// TODO: add C++ reference solution",
        java: "// TODO: add Java reference solution",
      },
      explanations: {
        python: ["Explain your Python logic here."],
        cpp: ["Explain your C++ logic here."],
        java: ["Explain your Java logic here."],
      },
      sampleTests: [{ id: 1, input: "", expected: "" }],
    };

    setProblems([...problems, newProblem]);
    setTitle("");
    setDifficulty("Easy");
    setTopics("");
    setVideoUrl("");
    alert("Problem added. Students can now see it in the Problems list.");
  };

  return (
    <div className="text-xs">
      <div className="border border-emerald-500/60 rounded-2xl p-4 bg-slate-950/90">
        <h1 className="text-lg font-semibold mb-1">Admin panel</h1>
        <p className="text-slate-400 mb-3">
          Add coding problems that will appear for students.
        </p>
        <form onSubmit={handleAdd} className="space-y-3">
          <div className="flex flex-col gap-1">
            <label>Title</label>
            <input
              className="rounded-lg border border-slate-700 bg-slate-900 px-2 py-1 text-xs"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Check Prime Number"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label>Difficulty</label>
            <select
              className="rounded-lg border border-slate-700 bg-slate-900 px-2 py-1 text-xs"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
            >
              <option>Easy</option>
              <option>Medium</option>
              <option>Hard</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label>Topics (comma separated)</label>
            <input
              className="rounded-lg border border-slate-700 bg-slate-900 px-2 py-1 text-xs"
              value={topics}
              onChange={(e) => setTopics(e.target.value)}
              placeholder="loops, arrays, recursion..."
            />
          </div>
          <div className="flex flex-col gap-1">
            <label>Learning video URL</label>
            <input
              className="rounded-lg border border-slate-700 bg-slate-900 px-2 py-1 text-xs"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://..."
            />
          </div>
          <button
            type="submit"
            className="mt-2 px-4 py-2 rounded-full bg-emerald-500 text-slate-950 text-sm font-semibold hover:bg-emerald-400"
          >
            Add problem
          </button>
        </form>
      </div>

      <div className="border border-slate-700 rounded-2xl p-4 mt-4">
        <h2 className="text-sm font-semibold mb-2">Existing problems</h2>
        <ul className="space-y-1">
          {problems.map((p) => (
            <li
              key={p.id}
              className="flex justify-between items-center border border-slate-700 rounded-lg px-3 py-2"
            >
              <div>
                <div className="font-semibold text-slate-100">
                  #{p.id} — {p.title}
                </div>
                <div className="text-[11px] text-slate-400">
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
