import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center text-xs">
      <h1 className="text-xl font-semibold mb-2">Page not found</h1>
      <p className="text-slate-400 mb-3">
        The route you opened is not part of codoAI.
      </p>
      <Link
        to="/"
        className="px-4 py-2 rounded-full bg-emerald-500 text-slate-950 text-sm font-semibold hover:bg-emerald-400"
      >
        Go back home
      </Link>
    </div>
  );
}
