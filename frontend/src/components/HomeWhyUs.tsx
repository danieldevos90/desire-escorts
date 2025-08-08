type Props = { html?: string; id?: string };

export default function HomeWhyUs({ html, id }: Props) {
  if (!html) return null;
  return (
    <section className="section" id={id}>
      <div className="container">
        <h2>Why Us</h2>
        <div className="prose" dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    </section>
  );
}


