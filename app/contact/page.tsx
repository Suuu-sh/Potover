import {LegalPage} from '@/components/LegalPage';

export const metadata={
  title:'お問い合わせ — Potover',
  description:'Potoverへのお問い合わせ先。',
};

export default function Contact(){
  return <LegalPage title="お問い合わせ" description="サービスやアカウントについてのご連絡はこちらからお願いします。" sections={[
    {title:'運営者',paragraphs:['Suu']},
    {title:'連絡先',paragraphs:['メール：potover39@gmail.com']},
    {title:'個人情報に関するお問い合わせ',paragraphs:['保有個人データに関する運営者の氏名・住所等、個人情報保護法第32条に基づく事項は、本人の求めに応じて遅滞なく回答します。上記メールアドレスへご連絡ください。']},
    {title:'アカウントについて',paragraphs:['アカウントの削除はプロフィール画面から行えます。パスワードを忘れてログインできない場合は、登録したメールアドレスからご連絡ください。']},
  ]}/>;
}
