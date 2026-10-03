import {LegalPage} from '@/components/LegalPage';

export const metadata={
  title:'お問い合わせ — Potover',
  description:'Potoverへのお問い合わせ先。',
};

export default function Contact(){
  return <LegalPage title="お問い合わせ" description="サービスやアカウントについてのご連絡はこちらからお願いします。" sections={[
    {title:'運営者',paragraphs:['一色 陽太']},
    {title:'連絡先',paragraphs:['メール：potover39@gmail.com']},
    {title:'アカウントについて',paragraphs:['アカウントの削除はプロフィール画面から行えます。パスワードを忘れてログインできない場合は、登録したメールアドレスからご連絡ください。']},
  ]}/>;
}
