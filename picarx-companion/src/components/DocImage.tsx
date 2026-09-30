import {useRef,useState} from 'react';
export function DocImage({src,width,align}:{src:string;width?:string;align?:string}){
 const [zoomed,setZoomed]=useState(false),[missing,setMissing]=useState(false);const trigger=useRef<HTMLButtonElement>(null);
 const label='Source image: '+decodeURIComponent(src.split('/').slice(-1)[0]??'illustration').replace(/[_-]/g,' ');
 const w=width&&/^\d+$/.test(width)?`${width}px`:width;
 const close=()=>{setZoomed(false);trigger.current?.focus();};
 return <><figure className={`doc-image ${align==='center'?'center':''}`}>
 {missing?<p role="status">{label} is unavailable. Use the accompanying source text.</p>:<button className="image-trigger" ref={trigger} aria-label={'Enlarge '+label} onClick={()=>setZoomed(true)}><img src={src} alt={label} style={w?{width:w}:undefined} onError={()=>setMissing(true)} loading="lazy"/></button>}
 </figure>{zoomed&&<div className="lightbox" role="dialog" aria-modal="true" aria-label={label} onClick={close} onKeyDown={e=>{if(e.key==='Escape'){e.preventDefault();close();}if(e.key==='Tab'){e.preventDefault();}}}>
 <button className="button lightbox-close" aria-label="Close source image" ref={el=>{el?.focus();}} onClick={close}>Close</button><img src={src} alt={label}/></div>}</>;
}
