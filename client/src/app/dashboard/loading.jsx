export default function DashboardLoading() {
  return (
    <div className="min-h-[40vh] flex flex-col items-center justify-center gap-3 px-4">
      <div
        className="h-9 w-9 rounded-full border-2 border-pink-500 border-t-transparent animate-spin"
        aria-hidden
      />
      <p className="text-sm text-slate-600">Loading dashboard…</p>
    </div>
  );
}
