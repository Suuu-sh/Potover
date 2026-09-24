type HomeSectionHeadingProps = {
  title: string;
  note?: string;
  level?: 'h1' | 'h2';
};

export function HomeSectionHeading({title,note,level='h2'}:HomeSectionHeadingProps){
  const Heading=level;
  return <div className="home-section-heading"><Heading>{title}</Heading>{note&&<small>{note}</small>}</div>;
}
