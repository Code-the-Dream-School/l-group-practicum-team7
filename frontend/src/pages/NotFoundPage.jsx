function NotFoundPage({ onNavigate = () => {} }) {
  return (
    <main className="mobile-page not-found-page">
      <section className="compact-page-shell">
        <section className="page-hero compact-hero">
          <p className="page-eyebrow">404</p>
          <h1>Page not found</h1>
          <p>This page does not exist.</p>

          <button
            type="button"
            className="btn-primary"
            onClick={() => onNavigate("dashboard")}
          >
            Go to Dashboard
          </button>
        </section>
      </section>
    </main>
  );
}

export default NotFoundPage;
