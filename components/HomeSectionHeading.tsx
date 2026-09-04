type HomeSectionHeadingProps = {
  eyebrow: string;
  title: string;
  level?: 'h1' | 'h2';
};

export function HomeSectionHeading({eyebrow,title,level='h2'}:HomeSectionHeadingProps){
  const Heading=level;
  return <div className="home-section-heading"><small>{eyebrow}</small><Heading>{title}</Heading></div>;
}
