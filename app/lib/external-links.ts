/** Absolute web URLs and external protocol handlers leave the current study open. */
export function externalLinkProps(href?:string,rel=''):{target?:'_blank';rel?:string}{
 if(!href||! /^(?:https?:|mailto:|tel:|\/\/)/i.test(href.trim()))return {};
 const tokens=new Set(rel.split(/\s+/).filter(token=>token&&token.toLowerCase()!=='opener'));
 tokens.add('noopener');tokens.add('noreferrer');
 return {target:'_blank',rel:[...tokens].join(' ')};
}
