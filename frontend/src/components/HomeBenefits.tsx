type Benefit = { label?: string };
export default function HomeBenefits({ items }: { items?: Benefit[] }) {
  if (!items?.length) return null;
  return (
    <section className="section">
      <div className="container">
        <h2>Benefits</h2>
        <ul style={{ display: 'grid', gap: 'var(--space-2)', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
          {items.map((b, i) => (
            <li key={i} className="card bordered">{b.label}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}


