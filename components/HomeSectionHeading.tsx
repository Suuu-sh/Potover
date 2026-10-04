'use client';
import {useI18n} from '@/lib/i18n-client';
type HomeSectionHeadingProps = {
  title: string;
  note?: string;
  level?: 'h1' | 'h2';
};

export function HomeSectionHeading({title,note,level='h2'}:HomeSectionHeadingProps){
  const {t:uiText}=useI18n();
  const Heading=level;
  return <div className="home-section-heading"><Heading>{uiText(title)}</Heading>{note&&<small>{uiText(note)}</small>}</div>;
}
