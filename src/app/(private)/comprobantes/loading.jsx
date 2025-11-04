// ejemplo: src/app/(private)/ingresos/loading.jsx
export default function Loading() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-6 animate-pulse">
      <div className="h-6 w-48 bg-slate-200 rounded mb-4" />
      <div className="h-10 w-full bg-slate-200 rounded mb-3" />
      <div className="grid md:grid-cols-2 gap-4">
        <div className="h-24 bg-slate-200 rounded" />
        <div className="h-24 bg-slate-200 rounded" />
      </div>
    </div>
  );
}
