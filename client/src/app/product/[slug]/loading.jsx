export default function ProductLoading() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-4 bg-[#faf6f3]">
      <div
        className="h-10 w-10 rounded-full border-2 border-pink-500 border-t-transparent animate-spin"
        aria-hidden
      />
      <p className="text-sm text-gray-600">Loading product…</p>
    </div>
  );
}
