type CTA = { phone?: string; whatsapp?: string; telegram?: string };

export default function HomeCTA({ cta }: { cta?: CTA }) {
  const phone = cta?.phone;
  const whatsapp = cta?.whatsapp;
  const telegram = cta?.telegram;
  if (!(phone || whatsapp || telegram)) return null;
  return (
    <section className="section">
      <div className="container" style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
        {whatsapp && (
          <a className="btn btn-primary" href={`https://wa.me/${whatsapp.replace(/[^0-9]/g,'')}`} target="_blank" rel="noopener noreferrer">WhatsApp</a>
        )}
        {phone && (
          <a className="btn btn-secondary" href={`tel:${phone}`}>Call</a>
        )}
        {telegram && (
          <a className="btn btn-outline" href={`https://t.me/${telegram.replace(/^@/, '')}`} target="_blank" rel="noopener noreferrer">Telegram</a>
        )}
      </div>
    </section>
  );
}


