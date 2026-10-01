export default function SectionHeader({ kicker, title, highlight, children, id, as: H = 'h2', className = '' }) {
  return (
    <div className={`section-header ${className}`.trim()}>
      {kicker ? <span className="kicker">{kicker}</span> : null}
      <H id={id}>
        {title} {highlight ? <span className="gradient-text">{highlight}</span> : null}
      </H>
      {children ? <p>{children}</p> : null}
    </div>
  );
}
