export const LEARNING_HISTORY_KEY='potover-learning-history';
export type LearningEvent={slug:string;openedAt:string};
export function getLearningHistory():LearningEvent[]{if(typeof window==='undefined')return [];try{return JSON.parse(localStorage.getItem(LEARNING_HISTORY_KEY)||'[]') as LearningEvent[]}catch{return []}}
export function recordLearning(slug:string){const history=getLearningHistory();const now=new Date();const today=now.toISOString().slice(0,10);if(!history.some(event=>event.slug===slug&&event.openedAt.slice(0,10)===today)){localStorage.setItem(LEARNING_HISTORY_KEY,JSON.stringify([{slug,openedAt:now.toISOString()},...history].slice(0,500)));window.dispatchEvent(new Event('potover-learning-changed'))}}
