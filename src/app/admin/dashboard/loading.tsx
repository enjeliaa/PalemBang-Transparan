export default function Loading() {
  return (
    <div className="grid animate-pulse gap-4 md:grid-cols-4">
      {[1, 2, 3, 4].map((item) => (
        <div key={item} className="h-32 rounded bg-zinc-200" />
      ))}
    </div>
  );
}
