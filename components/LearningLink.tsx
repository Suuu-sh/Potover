'use client';
import {ReactNode} from 'react';
import {useRouter} from 'next/navigation';
import {useAuth} from '@/lib/auth-client';
import {useLearningHistory} from '@/lib/learning-history';
type Props={slug:string;href:string;children:ReactNode;className?:string;'aria-label'?:string};
export function LearningLink({slug,href,children,className,...props}:Props){const router=useRouter();const {user,loading}=useAuth();const {recordLearning}=useLearningHistory();function open(event:React.MouseEvent<HTMLAnchorElement>){if(event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;if(loading){event.preventDefault();return}if(!user){event.preventDefault();const next=`${location.pathname}${location.search}${location.hash}`;router.push(`/login?next=${encodeURIComponent(next)}&reason=learning`);return}void recordLearning(slug).catch(()=>undefined)}return <a {...props} className={className} href={href} target="_blank" rel="noopener noreferrer" onClick={open}>{children}</a>}
