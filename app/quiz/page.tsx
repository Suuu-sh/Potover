import {SolverQuiz} from '@/components/SolverQuiz';

export const metadata={
  title:'プリフロップ レンジクイズ — Potover',
  description:'SolveaGTOの推定レンジをもとに、プリフロップの判断をクイズ形式で練習できます。',
};

export default function Quiz(){
  return <SolverQuiz/>;
}
