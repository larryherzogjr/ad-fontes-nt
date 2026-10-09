'use client';
import {useEffect,useState} from 'react';
import {englishLxxBookName,englishContextsForGreek,englishLxxManifest,englishLxxUrl} from '@/lib/domain/lxx-english';
export default function EnglishLxxLinks({sourceRef}:{sourceRef:string}){
 const [links,setLinks]=useState<ReturnType<typeof englishContextsForGreek>>([]),[error,setError]=useState(false);
 useEffect(()=>{let active=true;setLinks([]);setError(false);englishLxxManifest().then(m=>{if(active)setLinks(englishContextsForGreek(m.books,sourceRef));}).catch(()=>{if(active)setError(true);});return()=>{active=false;};},[sourceRef]);
 if(error)return <p role="status">English Septuagint links could not be loaded.</p>;
 if(!links.length)return null;
 return <section className="study-help"><h3>English Septuagint</h3><p>Read the related LXX2012 chapter beside Greek. Source numbering and verse boundaries may differ; this is chapter context, not an exact verse alignment.</p>{links.map(({book,chapter})=><p key={`${book.code}/${chapter}`}><a href={englishLxxUrl(book.code,chapter)+'&parallel=1'}>{englishLxxBookName(book)} {chapter} · Open English as the main view →</a></p>)}</section>;
}
