type Props = { html?: string; id?: string };

export default function HomeIntro({ html, id }: Props) {
  if (!html) return null;
  return (
    <section className="section" id={id}>
      <div className="container">
        <h2>Introduction</h2>
        <div className="prose" dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    </section>
  );
}


