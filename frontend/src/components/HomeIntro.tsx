type Props = { html?: string };

export default function HomeIntro({ html }: Props) {
  if (!html) return null;
  return (
    <section className="section">
      <div className="container">
        <h2>Introduction</h2>
        <div className="prose" dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    </section>
  );
}


