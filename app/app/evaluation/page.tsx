import EvaluationPortal from '@/evaluation/portal';
import { evaluationEdition } from '@/evaluation/config';
export const metadata={title:'Evaluation access · Ad Fontes',robots:{index:false,follow:false}};
export default function EvaluationPage(){return evaluationEdition?<EvaluationPortal/>:<main className="library-page"><h1>Page unavailable</h1><a href="/library">Study Library</a></main>;}
