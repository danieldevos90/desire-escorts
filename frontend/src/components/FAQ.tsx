type FAQProps = {
  title?: string;
  html?: string;
};

export default function FAQ({ title = "FAQ", html }: FAQProps) {
  return (
    <section className="section">
      <div className="container">
        <h2>{title}</h2>
        {html ? (
          <div className="prose" style={{ marginTop: "var(--space-4)" }} dangerouslySetInnerHTML={{ __html: html }} />
        ) : (
          <p className="muted" style={{ marginTop: "var(--space-2)" }}>No FAQ content available.</p>
        )}
      </div>
    </section>
  );
}


