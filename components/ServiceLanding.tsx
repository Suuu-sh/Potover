import Image from 'next/image';
import Link from 'next/link';
import {ArrowRight, ArrowUpRight, Bookmark, BookOpen, ChevronDown, Search} from 'lucide-react';
import {roadmapSummaries} from '@/lib/roadmap-summary';
import {ServiceHeader} from './ServiceHeader';
import {ScrollReveal} from './ScrollReveal';
import styles from './ServiceLanding.module.css';

const features = [
  {title: '横断検索', body: '記事も動画も、キーワードでまとめて検索。', href: '/docs'},
  {title: '学習ロードマップ', body: '目的やレベルに合わせて、学ぶ順番が見つかる。', href: '/roadmap'},
  {title: 'あとで読む', body: '気になるコンテンツを保存して、自分のペースで。', href: '/bookmarks'},
];

const steps = [
  {number: '01', icon: Search, title: '気になるテーマを探す。', body: 'プリフロップ、GTO、MTT。知りたいキーワードから、記事や動画を横断検索。言語や難易度でも絞り込めます。', href: '/docs', action: 'コンテンツを探す'},
  {number: '02', icon: BookOpen, title: '自分に合った順番で学ぶ。', body: '何から始めるか迷ったら、学習ロードマップへ。基礎から実戦的なテーマまで、次の一歩を見つけられます。', href: '/roadmap', action: 'ロードマップを見る'},
  {number: '03', icon: Bookmark, title: '読みたい記事を、手元に。', body: 'ブックマークを押して、あとで読むリストへ。このブラウザに保存されるので、気になる記事にすぐ戻れます。', href: '/bookmarks', action: '保存した記事を見る'},
];

const questions = [
  {question: 'Potoverでは何ができますか？', answer: 'ポーカーに関する記事や動画を複数の情報源から横断検索できます。テーマ・難易度・言語などで絞り込み、学習ロードマップから学ぶ順番を見つけたり、気になるコンテンツをブックマークしたりできます。'},
  {question: 'アカウント登録は必要ですか？', answer: '記事・動画の検索、学習ロードマップの閲覧、ブックマークは登録なしで利用できます。プロフィール画面の利用にはログインが必要です。'},
  {question: '記事や動画はどこで見られますか？', answer: 'Potoverで見出しや概要を確認したあと、情報源の元記事やYouTubeへ移動して閲覧できます。外部サイトの利用条件や料金は、それぞれの提供元に準じます。'},
  {question: '保存した記事は他の端末でも見られますか？', answer: 'ブックマークは利用中のブラウザに保存されます。アカウントや他の端末とは同期されません。ブラウザのデータを削除すると、保存内容も削除されます。'},
  {question: 'GTOソルバーやハンド解析は使えますか？', answer: 'Potoverは、学習コンテンツを探し、学ぶ順番を見つけるためのサービスです。GTOソルバー、ハンド解析、実戦トレーニング機能は提供していません。'},
];

export function ServiceLanding() {
  return (
    <div className={styles.page}>
      <ServiceHeader/>
      <ScrollReveal>
      <main id="main-content" tabIndex={-1}>
        <section className={styles.hero} aria-labelledby="service-title">
          <Image className={styles.heroImage} src="/banners/potover-midnight-hero.jpg" alt="Potoverの記事ライブラリを表示したノートパソコンと、ポーカーテーブルのチップとカード" width={1654} height={951} sizes="100vw" priority/>
          <div className={styles.heroInner}>
            <div className={styles.heroCopy}>
              <h1 id="service-title">ポーカーの学びを、<br/>ひとつの場所に。</h1>
              <p className={styles.lead}>記事と動画を横断検索。<wbr/>次に学ぶことが、見つかる。</p>
              <Link className={styles.primaryAction} href="/docs">記事・動画を探す <ArrowRight size={26} aria-hidden="true"/></Link>
              <Link className={styles.textAction} href="/roadmap">ロードマップを見る <ArrowRight size={20} aria-hidden="true"/></Link>
            </div>
          </div>
        </section>

        <section id="features" className={styles.features} aria-labelledby="features-title">
          <h2 data-reveal id="features-title">探す。学ぶ。残す。</h2>
          <div className={styles.featureGrid}>
            {features.map((feature, index) => <Link data-reveal data-reveal-delay={index * 90} className={styles.feature} href={feature.href} key={feature.title}>
              <h3>{feature.title}<ArrowUpRight size={18} aria-hidden="true"/></h3>
              <p>{feature.body}</p>
            </Link>)}
          </div>
        </section>

        <section id="how-it-works" className={styles.learning} aria-labelledby="learning-title">
          <div data-reveal className={styles.sectionHeading}>
            <p className={styles.eyebrow}>LESS SEARCHING. MORE LEARNING.</p>
            <h2 id="learning-title">探し回る時間を、<br/>学ぶ時間へ。</h2>
            <p>情報が多いからこそ、学びへの道筋をシンプルに。</p>
          </div>
          <div className={styles.steps}>
            {steps.map(({number, icon: Icon, title, body, href, action}) => <article data-reveal className={styles.step} key={number}>
              <span className={styles.stepNumber}>{number}</span>
              <div><Icon size={25} strokeWidth={1.5} aria-hidden="true"/><h3>{title}</h3><p>{body}</p><Link href={href}>{action}<ArrowRight size={17} aria-hidden="true"/></Link></div>
            </article>)}
          </div>
        </section>

        <section className={styles.roadmaps} aria-labelledby="roadmaps-title">
          <div data-reveal className={styles.roadmapHeading}><p className={styles.eyebrow}>FIND YOUR PATH</p><h2 id="roadmaps-title">あなたの現在地から。</h2><p>基礎を知りたい人も、戦略を深めたい人も。</p></div>
          <div className={styles.roadmapGrid}>{roadmapSummaries.map((course, index) => <Link data-reveal data-reveal-delay={index * 90} className={styles.course} href={`/roadmap#${course.id}`} key={course.id}>
            <span className={styles.courseNumber}>0{index + 1}</span><h3>{course.title}</h3><p>{course.description}</p><span className={styles.courseAction}>コースを見る<ArrowUpRight size={22} aria-hidden="true"/></span>
          </Link>)}</div>
        </section>

        <section id="faq" className={styles.faq} aria-labelledby="faq-title">
          <div data-reveal><p className={styles.eyebrow}>QUESTIONS & ANSWERS</p><h2 id="faq-title">よくある質問</h2></div>
          <div className={styles.questions}>{questions.map(({question, answer}) => <details data-reveal className={styles.question} key={question}>
            <summary>{question}<ChevronDown size={20} aria-hidden="true"/></summary><p>{answer}</p>
          </details>)}</div>
        </section>

        <section data-reveal className={styles.closing} aria-labelledby="closing-title">
          <p className={styles.eyebrow}>YOUR NEXT CHAPTER</p><h2 id="closing-title">次の学びを、ここから。</h2><p>まずは、気になるテーマをひとつ。登録なしで探せます。</p>
          <Link className={styles.primaryAction} href="/docs">記事・動画を探す<ArrowRight size={24} aria-hidden="true"/></Link>
        </section>
      </main>
      </ScrollReveal>

      <footer className={styles.footer}>
        <div><Link className={styles.brand} href="/" aria-label="Potover サービスサイト"><Image src="/brand/potover-mark-dark.png" alt="" width={34} height={34}/><span>Potover</span></Link><p>ポーカーの学びを、ひとつの場所に。</p></div>
        <nav aria-label="フッターナビゲーション"><Link href="/home">ホーム</Link><Link href="/docs">探す</Link><Link href="/roadmap">ロードマップ</Link><Link href="/bookmarks">ブックマーク</Link></nav>
        <small>© {new Date().getFullYear()} Potover</small>
      </footer>
    </div>
  );
}
