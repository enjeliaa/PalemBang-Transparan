export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl animate-pulse px-4 py-10">
      <div className="h-10 w-64 rounded bg-zinc-200" />
      <div className="mt-6 grid gap-5 lg:grid-cols-3">
        <div className="h-72 rounded bg-zinc-200 lg:col-span-2" />
        <div className="h-72 rounded bg-zinc-200" />
      </div>
    </div>
  );
}
