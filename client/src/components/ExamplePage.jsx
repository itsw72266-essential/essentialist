// Import Next.js Link
import Link from "next/link";

export default function ExamplePage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center font-sans p-6">
      <h1 className="text-3xl font-bold mb-6">Professional Styling Example</h1>
      
      {/* Next.js Link usage */}
      <Link
        href="#target"
        className="
          text-primary
          hover:underline
          focus-visible:underline
          focus-visible:decoration-pink-500
          outline-none
          transition
          rounded
          px-1
        "
      >
        Accessible Link (focus me!)
      </Link>

      {/* Space */}
      <div className="h-6" />

      {/* Input Example */}
      <input
        type="text"
        placeholder="Type here…"
        className="
          w-64
          py-2
          px-4
          bg-white
          dark:bg-background
          border
          border-input
          rounded-lg
          shadow-sm
          focus:outline-none
          focus:ring-2
          focus:ring-pink-500
          focus:border-pink-500
          transition
          text-base
          font-sans
          text-foreground
          placeholder:text-muted-foreground
        "
      />

      {/* Demo target for anchor */}
      <div id="target" className="mt-10 p-4 bg-muted rounded-lg shadow">
        <span className="block text-muted-foreground text-sm">#target anchor reached!</span>
      </div>
    </div>
  );
}