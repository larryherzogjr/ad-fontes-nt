import type {ComponentPropsWithRef} from 'react';
import {externalLinkProps} from '@/lib/external-links';

/** Shared by web, offline desktop and printable HTML renderers. */
export default function AppLink(props:ComponentPropsWithRef<'a'>){
 return <a {...props} {...externalLinkProps(props.href,props.rel)}/>;
}
