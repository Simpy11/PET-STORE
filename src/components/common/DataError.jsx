export default function DataError({ message }) {
  return message ? <div role="alert" className="mb-6 p-4 rounded-xl border border-rose-300 bg-rose-50 text-rose-800 dark:bg-rose-950 dark:text-rose-200">{message} <button className="underline font-bold" onClick={() => window.location.reload()}>retry</button>.</div> : null;
}
