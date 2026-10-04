'use client';
import {useI18n} from '@/lib/i18n-client';
import {Menu,Search} from 'lucide-react';
type Props={draft:string;setDraft:(v:string)=>void;onSubmit:(e:React.FormEvent)=>void;openFilters:()=>void};
export function DocsHeader({draft,setDraft,onSubmit,openFilters}:Props){
  const {t:uiText}=useI18n();return <div className="workspace-header docs-search-toolbar"><strong>{uiText("探す")}</strong><form className="command-search" onSubmit={onSubmit}><Search size={19}/><input aria-label={uiText("コンテンツを検索")} value={draft} onChange={e=>setDraft(e.target.value)} placeholder={uiText("記事・動画・キーワードを検索")}/><button>{uiText("検索")}</button></form><div className="header-actions"><span>GTO Wizard</span></div><button className="mobile-filter-button" onClick={openFilters}><Menu size={20}/> {uiText(" 絞り込み")}</button></div>}
