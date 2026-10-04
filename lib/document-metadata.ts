type InterfaceMetadata={title?:string;description:string};

/** Keep the selected language after Next finishes reconciling its static head. */
export function watchDocumentMetadata(target:Document,Observer:typeof MutationObserver,metadata:InterfaceMetadata,isCurrentRoute:()=>boolean=()=>true){
  let active=true;
  const synchronize=()=>{
    if(!active||!isCurrentRoute())return;
    if(metadata.title!==undefined&&target.title!==metadata.title)target.title=metadata.title;
    const description=target.querySelector('meta[name="description"]');
    if(description&&description.getAttribute('content')!==metadata.description)description.setAttribute('content',metadata.description);
  };
  const observer=new Observer(synchronize);
  observer.observe(target.head,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['content']});
  synchronize();
  return()=>{active=false;observer.disconnect();};
}
