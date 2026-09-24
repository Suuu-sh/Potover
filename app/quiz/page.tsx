import {SolverQuiz} from '@/components/SolverQuiz';

export const metadata={
  title:'プリフロップ GTOクイズ — Potover',
  description:'SolveaGTOの独自AI Solverの戦略をもとに、プリフロップの判断をクイズ形式で練習できます。',
};

export default function Quiz(){
  return <SolverQuiz/>;
}
