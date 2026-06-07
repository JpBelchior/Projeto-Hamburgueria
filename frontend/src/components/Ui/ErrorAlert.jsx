export default function ErrorAlert({ message, className = "" }) {
  return (
    <div className={`rounded-xl bg-red-500/10 border border-red-500/30 px-4 py-3 text-red-400 text-xs ${className}`}>
      {message}
    </div>
  );
}
