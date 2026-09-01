'use client';
import {ReactNode} from 'react';
import {recordLearning} from '@/lib/learning-history';
type Props={slug:string;href:string;children:ReactNode;className?:string;'aria-label'?:string};
export function LearningLink({slug,href,children,className,...props}:Props){return <a {...props} className={className} href={href} target="_blank" rel="noopener noreferrer" onClick={()=>recordLearning(slug)}>{children}</a>}
