import {resolveReference,address,expand,type PassageRange} from './references.ts';
export function comparisonRanges(text:string,ot:boolean):PassageRange[]{
 const ranges=resolveReference(text);if(ranges.some(r=>(address(r.start).book.order<39)!==ot||(address(r.end).book.order<39)!==ot))throw Error(`Choose ${ot?'an Old':'a New'} Testament passage for this side.`);
 if(ranges.reduce((n,r)=>n+expand(r).length,0)>60)throw Error('Choose at most 60 verses per comparison side.');return ranges;
}
/** Deterministic sequence comparison; no inference of literary dependence or English alignment. */
export function orderedGreekMatches(a:string[],b:string[]){
 if(a.length*b.length>4_000_000)throw Error('Choose shorter passages for ordered comparison.');
 const rows=Array.from({length:a.length+1},()=>new Uint16Array(b.length+1));
 for(let i=a.length-1;i>=0;i--)for(let j=b.length-1;j>=0;j--)rows[i][j]=!!a[i]&&a[i].normalize('NFC')===b[j].normalize('NFC')?1+rows[i+1][j+1]:Math.max(rows[i+1][j],rows[i][j+1]);
 const left=new Set<number>(),right=new Set<number>();let i=0,j=0;while(i<a.length&&j<b.length){if(!!a[i]&&a[i].normalize('NFC')===b[j].normalize('NFC')){left.add(i++);right.add(j++);}else if(rows[i+1][j]>=rows[i][j+1])i++;else j++;}return {left,right,count:left.size};
}
