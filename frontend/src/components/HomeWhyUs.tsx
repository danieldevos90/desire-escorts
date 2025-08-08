type Props = { html?: string };

export default function HomeWhyUs({ html }: Props) {
  if (!html) return null;
  return (
    <section className="section">
      <div className="container">
        <h2>Why Us</h2>
        <div className="prose" dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    </section>
  );
}


