export default function CheckoutLoading() {
  return (
    <section className="min-h-screen bg-blue-50 py-6" aria-busy="true" aria-label="Loading checkout">
      <div className="container mx-auto px-4 flex flex-col lg:flex-row gap-6">
        <div className="w-full lg:w-3/5 space-y-4">
          <div className="h-10 w-48 rounded-lg bg-white/80 animate-pulse" />
          <div className="h-64 rounded-lg bg-white shadow animate-pulse" />
          <div className="h-40 rounded-lg bg-white shadow animate-pulse" />
        </div>
        <div className="w-full lg:w-2/5">
          <div className="h-72 rounded-lg bg-white shadow-md p-4 animate-pulse">
            <div className="h-6 w-36 bg-gray-200 rounded mb-6" />
            <div className="space-y-3">
              <div className="h-4 w-full max-w-md bg-gray-100 rounded" />
              <div className="h-4 w-full max-w-sm bg-gray-100 rounded" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
