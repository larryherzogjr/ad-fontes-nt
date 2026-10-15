/** Preserve the Explorer's query, page, source key and Scripture return when reading a study. */
export function hebrewStudyUrl(search:string,slug=''){
 const params=new URLSearchParams(search);params.set('view','hebrew');
 if(slug)params.set('article',slug);else params.delete('article');
 return `/library?${params}`;
}
