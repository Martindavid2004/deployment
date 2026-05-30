import { LANGUAGES } from "../data/problems";

const LABELS = {
  python: "Python",
  cpp: "C++",
  java: "Java",
};

export default function LanguageSelector({ current, onChange }) {
  return (
    <div className="flex items-center gap-1 px-1.5 py-1 rounded-full bg-slate-900/90 border border-slate-700 shadow-lg">
      {LANGUAGES.map((lang) => (
        <button
          key={lang}
          onClick={() => onChange(lang)}
          className={`px-2.5 py-1 rounded-full text-[11px] font-medium ${
            current === lang
              ? "bg-emerald-500 text-slate-950"
              : "text-slate-300 hover:bg-slate-800"
          }`}
        >
          {LABELS[lang]}
        </button>
      ))}
    </div>
  );
}
