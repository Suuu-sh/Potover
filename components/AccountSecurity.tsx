'use client';
import {useI18n} from '@/lib/i18n-client';

import {FormEvent,useState} from 'react';
import {KeyRound,ShieldAlert,Trash2} from 'lucide-react';
import {useRouter} from '@/lib/locale-router';

import {useAuth} from '@/lib/auth-client';

type Feedback={kind:'error'|'success';message:string};

export function AccountSecurity(){
  const {t:uiText}=useI18n();
  const {changePassword,deleteAccount}=useAuth();
  const router=useRouter();
  const [currentPassword,setCurrentPassword]=useState('');
  const [newPassword,setNewPassword]=useState('');
  const [newPasswordConfirmation,setNewPasswordConfirmation]=useState('');
  const [deletePassword,setDeletePassword]=useState('');
  const [passwordFeedback,setPasswordFeedback]=useState<Feedback|null>(null);
  const [deleteFeedback,setDeleteFeedback]=useState<Feedback|null>(null);
  const [changingPassword,setChangingPassword]=useState(false);
  const [deletingAccount,setDeletingAccount]=useState(false);

  async function submitPassword(event:FormEvent){
    event.preventDefault();setPasswordFeedback(null);
    if(newPassword!==newPasswordConfirmation){setPasswordFeedback({kind:'error',message:'新しいパスワードが一致していません。'});return}
    setChangingPassword(true);
    try{
      await changePassword(currentPassword,newPassword);
      setCurrentPassword('');setNewPassword('');setNewPasswordConfirmation('');
      setPasswordFeedback({kind:'success',message:'パスワードを変更しました。'});
    }catch(reason){setPasswordFeedback({kind:'error',message:reason instanceof Error?reason.message:'パスワードを変更できませんでした。'})}
    finally{setChangingPassword(false)}
  }

  async function submitDelete(event:FormEvent){
    event.preventDefault();
    if(!window.confirm(uiText('アカウントと保存したブックマーク・学習履歴・フォロー・設定を削除します。続けますか？')))return;
    setDeleteFeedback(null);setDeletingAccount(true);
    try{await deleteAccount(deletePassword);router.replace('/login')}
    catch(reason){setDeleteFeedback({kind:'error',message:reason instanceof Error?reason.message:'アカウントを削除できませんでした。'});setDeletingAccount(false)}
  }

  return <div className="account-security-grid">
    <section className="account-security-card" aria-labelledby="password-heading">
      <div className="account-security-heading"><span className="account-setting-icon"><KeyRound size={21}/></span><div><h2 id="password-heading">{uiText("パスワードを変更")}</h2><p>{uiText("定期的に変更すると、より安心して利用できます。")}</p></div></div>
      <form className="account-security-form" onSubmit={submitPassword}>
        <label><span>{uiText("現在のパスワード")}</span><input className="account-form-input" type="password" autoComplete="current-password" value={currentPassword} onChange={event=>setCurrentPassword(event.target.value)} required disabled={changingPassword}/></label>
        <label><span>{uiText("新しいパスワード")}</span><input className="account-form-input" type="password" autoComplete="new-password" minLength={8} maxLength={128} value={newPassword} onChange={event=>setNewPassword(event.target.value)} required disabled={changingPassword}/></label>
        <label><span>{uiText("新しいパスワード（確認）")}</span><input className="account-form-input" type="password" autoComplete="new-password" minLength={8} maxLength={128} value={newPasswordConfirmation} onChange={event=>setNewPasswordConfirmation(event.target.value)} required disabled={changingPassword}/></label>
        {passwordFeedback&&<p className={`account-feedback account-feedback-${passwordFeedback.kind}`} role={passwordFeedback.kind==='error'?'alert':'status'}>{uiText(passwordFeedback.message)}</p>}
        <button className="account-primary-action" type="submit" disabled={changingPassword}>{uiText(changingPassword?'変更中…':'パスワードを変更')}</button>
      </form>
    </section>
    <section className="account-security-card account-danger-card" aria-labelledby="delete-account-heading">
      <div className="account-security-heading"><span className="account-danger-icon"><ShieldAlert size={21}/></span><div><h2 id="delete-account-heading">{uiText("アカウントを削除")}</h2><p>{uiText("保存したデータも削除され、元に戻せません。")}</p></div></div>
      <form className="account-security-form" onSubmit={submitDelete}>
        <label><span>{uiText("確認のためパスワードを入力")}</span><input className="account-form-input" type="password" autoComplete="current-password" value={deletePassword} onChange={event=>setDeletePassword(event.target.value)} required disabled={deletingAccount}/></label>
        {deleteFeedback&&<p className="account-feedback account-feedback-error" role="alert">{uiText(deleteFeedback.message)}</p>}
        <button className="account-danger-action" type="submit" disabled={deletingAccount}><Trash2 size={15}/>{uiText(deletingAccount?'削除中…':'アカウントを削除')}</button>
      </form>
    </section>
  </div>;
}
