/** Collection switching deliberately starts with clean, compatible state. */
export const libraryCollections=[
 {id:'comparisons',label:'Textual Comparisons'}, {id:'articles',label:'Greek Word Studies'},
 {id:'lexicon',label:'Greek Lexicon'}, {id:'hebrew',label:'Hebrew Word Explorer'},
 {id:'research',label:'Septuagint Research'}, {id:'connections',label:'NT/OT Connections'},
 {id:'parallels',label:'Gospel Parallels'}, {id:'commentaries',label:'Commentaries'},
 {id:'confessions',label:'Confessional Connections'}, {id:'historical',label:'Historical Writings'}, {id:'lectionary',label:'Lectionary'},
 {id:'packets',label:'Study Packets'}, {id:'fulltext',label:'Search resource text'},
] as const;
export function collectionDestination(id:string){
 if(id==='overview')return '/library?view=overview';
 if(!libraryCollections.some(c=>c.id===id))throw Error('Unknown Library collection.');
 return `/library?view=${id}`;
}
