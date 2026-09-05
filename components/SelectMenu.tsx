'use client';

import {Check,ChevronDown} from 'lucide-react';
import {KeyboardEvent as ReactKeyboardEvent,useEffect,useId,useRef,useState} from 'react';

export type SelectMenuOption={value:string;label:string};

type SelectMenuProps={
  ariaLabel:string;
  value:string;
  options:SelectMenuOption[];
  onChange:(value:string)=>void;
  className?:string;
};

export function SelectMenu({ariaLabel,value,options,onChange,className}:SelectMenuProps){
  const [open,setOpen]=useState(false);
  const rootRef=useRef<HTMLDivElement>(null);
  const triggerRef=useRef<HTMLButtonElement>(null);
  const optionRefs=useRef<Array<HTMLButtonElement|null>>([]);
  const listboxId=useId();
  const selectedIndex=Math.max(0,options.findIndex(option=>option.value===value));
  const selected=options[selectedIndex];

  useEffect(()=>{
    const closeOnOutside=(event:PointerEvent)=>{if(!rootRef.current?.contains(event.target as Node))setOpen(false)};
    const closeOnEscape=(event:KeyboardEvent)=>{if(event.key==='Escape'){setOpen(false);triggerRef.current?.focus()}};
    document.addEventListener('pointerdown',closeOnOutside);
    document.addEventListener('keydown',closeOnEscape);
    return()=>{document.removeEventListener('pointerdown',closeOnOutside);document.removeEventListener('keydown',closeOnEscape)};
  },[]);
  useEffect(()=>{if(open)requestAnimationFrame(()=>optionRefs.current[selectedIndex]?.focus())},[open,selectedIndex]);

  const choose=(nextValue:string)=>{onChange(nextValue);setOpen(false);requestAnimationFrame(()=>triggerRef.current?.focus())};
  const moveFocus=(event:ReactKeyboardEvent<HTMLButtonElement>,direction:1|-1)=>{event.preventDefault();const current=optionRefs.current.indexOf(event.currentTarget);const next=(current+direction+options.length)%options.length;optionRefs.current[next]?.focus()};

  return <div className={`potover-select${open?' is-open':''}${className?` ${className}`:''}`} ref={rootRef}>
    <button ref={triggerRef} type="button" className="potover-select-trigger" aria-label={ariaLabel} aria-haspopup="listbox" aria-expanded={open} aria-controls={listboxId} onClick={()=>setOpen(current=>!current)} onKeyDown={event=>{if(event.key==='ArrowDown'||event.key==='ArrowUp'){event.preventDefault();setOpen(true)}}}><span>{selected?.label}</span><ChevronDown size={14} aria-hidden="true"/></button>
    {open&&<div id={listboxId} className="potover-select-menu" role="listbox" aria-label={ariaLabel}>{options.map((option,index)=><button key={option.value} ref={node=>{optionRefs.current[index]=node}} type="button" role="option" aria-selected={option.value===value} className={option.value===value?'is-selected':undefined} onClick={()=>choose(option.value)} onKeyDown={event=>{if(event.key==='ArrowDown')moveFocus(event,1);if(event.key==='ArrowUp')moveFocus(event,-1);if(event.key==='Home'){event.preventDefault();optionRefs.current[0]?.focus()}if(event.key==='End'){event.preventDefault();optionRefs.current.at(-1)?.focus()}}}><Check size={14} aria-hidden="true"/><span>{option.label}</span></button>)}</div>}
  </div>;
}
