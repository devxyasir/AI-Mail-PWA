/**
 * Global loading UI shown while Next.js is resolving Server Components.
 */
export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface" data-testid="loading-screen">
      <div className="flex flex-col items-center gap-fib-13">
        <div
          className="h-fib-34 w-fib-34 animate-spin border-2 border-primary border-t-transparent"
          role="status"
          aria-label="Loading"
          data-testid="global-spinner"
        />
        <p className="text-[10px] font-mono font-bold tracking-[0.2em] text-outline uppercase">Loading...</p>
      </div>
    </div>
  );
}