'use client';
import {useI18n} from '@/lib/i18n-client';

import {LegalPage} from '@/components/LegalPage';

export default function Contact(){
  const {t:uiText}=useI18n();
  return <LegalPage title={uiText("お問い合わせ")} description={uiText("サービスやアカウントについてのご連絡はこちらからお願いします。")} sections={[
    {title:'運営者',paragraphs:['Suu']},
    {title:'連絡先',paragraphs:['メール：potover39@gmail.com']},
    {title:'個人情報に関するお問い合わせ',paragraphs:['保有個人データに関する運営者の氏名・住所等、個人情報保護法第32条に基づく事項は、本人の求めに応じて遅滞なく回答します。上記メールアドレスへご連絡ください。']},
    {title:'画像プレビューについて',paragraphs:['画像の掲載・権利についてのご連絡は、対象記事のURLと該当する画像を添えて、potover39@gmail.com までお願いします。内容を確認し、必要に応じて画像の表示停止・削除などに対応します。']},
    {title:'アカウントについて',paragraphs:['アカウントの削除はプロフィール画面から行えます。パスワードを忘れてログインできない場合は、登録したメールアドレスからご連絡ください。']},
  ]}/>;
}
