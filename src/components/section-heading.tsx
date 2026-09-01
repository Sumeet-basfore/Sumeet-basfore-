type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  description?: string;
  aside?: React.ReactNode;
  id?: string;
};

export function SectionHeading({ eyebrow, title, description, aside, id }: SectionHeadingProps) {
  return (
    <div className="section-heading">
      <div>
        <p className="eyebrow"><span className="eyebrow-dot" />{eyebrow}</p>
        <h2 id={id}>{title}</h2>
      </div>
      {(description || aside) && (
        <div className="section-heading-meta">
          {description && <p>{description}</p>}
          {aside}
        </div>
      )}
    </div>
  );
}
