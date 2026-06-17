import { LANGUAGES } from "../data/problems";

const LABELS = {
  python: "Python",
  cpp: "C++",
  java: "Java",
};

export default function LanguageSelector({ current, onChange }) {
  return (
    <div className="flex items-center gap-1 px-1.5 py-1 rounded-full border shadow-lg" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
      {LANGUAGES.map((lang) => (
        <button
          key={lang}
          onClick={() => onChange(lang)}
          className={`px-2.5 py-1 rounded-full text-sm font-medium transition-colors ${
            current === lang
              ? "text-white"
              : ""
          }`}
          style={current === lang ? {
            background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-strong))'
          } : {
            color: 'var(--text-secondary)'
          }}
        >
          {LABELS[lang]}
        </button>
      ))}
    </div>
  );
}
