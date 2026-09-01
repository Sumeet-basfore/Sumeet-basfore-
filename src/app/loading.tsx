import { SiteHeader } from "@/components/site-header";

function LoadingBlock({ className = "" }: { className?: string }) {
  return <span className={`loading-block ${className}`} aria-hidden="true" />;
}

export default function Loading() {
  return (
    <main className="loading-page" aria-busy="true" aria-label="Loading portfolio">
      <SiteHeader />
      <section className="page-shell loading-shell" aria-labelledby="loading-title">
        <p className="eyebrow" role="status" aria-live="polite"><span className="eyebrow-dot" />Loading selected work</p>
        <h1 id="loading-title"><LoadingBlock className="loading-title-line" /><LoadingBlock className="loading-title-line loading-title-short" /></h1>
        <div className="loading-grid" aria-hidden="true">
          <LoadingBlock className="loading-card loading-card-featured" />
          <LoadingBlock className="loading-card" />
          <LoadingBlock className="loading-card" />
        </div>
      </section>
    </main>
  );
}
