'use client';
import {useI18n} from '@/lib/i18n-client';
import Image from 'next/image';
import {ServiceCharacter} from './ServiceCharacter';
import Link from '@/components/LocaleLink';
import {ArrowRight, ArrowUpRight, Bookmark, BookOpen, ChevronDown, Search} from 'lucide-react';
import {roadmapSummaries} from '@/lib/roadmap-summary';
import {ServiceHeader} from './ServiceHeader';
import {ScrollReveal} from './ScrollReveal';
import styles from './ServiceLanding.module.css';

const features = [
  {title: '横断検索', body: '記事も動画も、キーワードでまとめて検索。', href: '/explore'},
  {title: '学習ロードマップ', body: '目的やレベルに合わせて、学ぶ順番が見つかる。', href: '/roadmap'},
  {title: 'あとで読む', body: '気になるコンテンツを保存して、自分のペースで。', href: '/bookmarks'},
];

const sources = [
  {name: 'GTO Wizard', image: '/sources/gto-wizard.png'},
  {name: 'PokerNews', image: '/sources/pokernews.png'},
  {name: 'Upswing Poker', image: '/sources/upswing.png'},
  {name: 'PokerCoaching', image: '/sources/pokercoaching.png'},
  {name: 'Run It Once', image: '/sources/run-it-once.png'},
  {name: 'Poker Hack', image: '/sources/poker-hack.png'},
];

const steps = [
  {number: '01', icon: Search, title: '気になるテーマを探す。', body: 'プリフロップ、GTO、MTT。知りたいキーワードから、記事や動画を横断検索。言語でも絞り込めます。', href: '/explore', action: 'コンテンツを探す'},
  {number: '02', icon: BookOpen, title: '自分に合った順番で学ぶ。', body: '何から始めるか迷ったら、学習ロードマップへ。基礎から実戦的なテーマまで、次の一歩を見つけられます。', href: '/roadmap', action: 'ロードマップを見る'},
  {number: '03', icon: Bookmark, title: '読みたい記事を、手元に。', body: 'ログインしてブックマークを押すと、あとで読むリストへ。アカウントに保存されるので、どの端末からでも戻れます。', href: '/bookmarks', action: '保存した記事を見る'},
];

const questions = [
  {question: 'Potoverでは何ができますか？', answer: 'ポーカーに関する記事や動画を複数の情報源から横断検索できます。テーマ・言語などで絞り込み、学習ロードマップから学ぶ順番を見つけたり、気になるコンテンツをブックマークしたりできます。'},
  {question: 'アカウント登録は必要ですか？', answer: '記事・動画の検索は登録なしで利用できます。ブックマーク、学習履歴、ロードマップの進捗、設定の保存と同期にはログインが必要です。'},
  {question: '記事や動画はどこで見られますか？', answer: 'Potoverで見出しや概要を確認したあと、情報源の元記事やYouTubeへ移動して閲覧できます。外部サイトの利用条件や料金は、それぞれの提供元に準じます。'},
  {question: '保存した記事は他の端末でも見られますか？', answer: 'ログインして保存したブックマークと学習履歴はアカウントに紐づき、ログインした端末で同期されます。'},
  {question: 'GTOソルバーやハンド解析は使えますか？', answer: 'Potoverは、学習コンテンツを探し、学ぶ順番を見つけるためのサービスです。GTOソルバー、ハンド解析、実戦トレーニング機能は提供していません。'},
];

export function ServiceLanding() {
  const {t:uiText,href:localPath}=useI18n();
  return (
    <div className={styles.page}>
      <ServiceHeader/>
      <ScrollReveal>
      <main id="main-content" tabIndex={-1}>
        <section className={styles.hero} aria-labelledby="service-title">
          <Image className={styles.heroImage} src="/login/poker-learners.png" alt="" fill priority sizes="100vw"/>
          <div className={styles.heroInner}>
            <div className={styles.heroCopy}>
              <h1 id="service-title">{uiText("ポーカーの学びを、")}<br/>{uiText("ひとつの場所に。")}</h1>
              <Link className={styles.primaryAction} href={localPath("/explore")}>{uiText("記事・動画を探す ")}<ArrowRight size={26} aria-hidden="true"/></Link>
              <Link className={styles.textAction} href={localPath("/roadmap")}>{uiText("ロードマップを見る ")}<ArrowRight size={20} aria-hidden="true"/></Link>
            </div>
          </div>
        </section>

        <section id="features" className={styles.features} aria-labelledby="features-title">
          <h2 data-reveal id="features-title">{uiText("探す。学ぶ。残す。")}</h2>
          <div className={styles.featureGrid}>
            {features.map((feature, index) => <Link data-reveal data-reveal-delay={index * 90} className={styles.feature} href={localPath(feature.href)} key={feature.title}>
              <div className={styles.featureMedia}><ServiceCharacter scene={index === 0 ? 'search' : index === 1 ? 'roadmap' : 'saved'}/></div>
              <div className={styles.featureCopy}><h3>{uiText(feature.title)}<ArrowUpRight size={18} aria-hidden="true"/></h3><p>{uiText(feature.body)}</p><span className={styles.featureAction}>{uiText("もっと見る ")}<ArrowRight size={16} aria-hidden="true"/></span></div>
            </Link>)}
          </div>
        </section>

        <section id="how-it-works" className={styles.learning} aria-labelledby="learning-title">
          <div data-reveal className={styles.sectionHeading}>

            <h2 id="learning-title">{uiText("探し回る時間を、")}<br/>{uiText("学ぶ時間へ。")}</h2>
            <p>{uiText("情報が多いからこそ、学びへの道筋をシンプルに。")}</p>
          </div>
          <div className={styles.steps}>
            {steps.map(({number, icon: Icon, title, body, href, action}) => <article data-reveal className={styles.step} key={number}>
              <span className={styles.stepNumber}>{uiText(number)}</span>
              <div><Icon size={25} strokeWidth={1.5} aria-hidden="true"/><h3>{uiText(title)}</h3><p>{uiText(body)}</p><Link href={localPath(href)}>{uiText(action)}<ArrowRight size={17} aria-hidden="true"/></Link></div>
            </article>)}
          </div>
        </section>

        <section className={styles.roadmaps} aria-labelledby="roadmaps-title">
          <div data-reveal className={styles.roadmapHeading}><h2 id="roadmaps-title">{uiText("あなたの現在地から。")}</h2><p>{uiText("基礎を知りたい人も、戦略を深めたい人も。")}</p></div>
          <div data-reveal className={styles.roadmapVisual}><div><h3>{uiText("学ぶ順番が、見えてくる。")}</h3><p>{uiText("テーマを探して、自分に合ったコースへ。")}</p></div><ServiceCharacter scene="roadmap"/></div>
          <div className={styles.roadmapGrid}>{roadmapSummaries.map((course, index) => <Link data-reveal data-reveal-delay={index * 90} className={styles.course} href={localPath(`/roadmap#${course.id}`)} key={course.id}>
            <span className={styles.courseNumber}>0{uiText(index + 1)}</span><h3>{uiText(course.title)}</h3><p>{uiText(course.description)}</p><span className={styles.courseAction}>{uiText("コースを見る")}<ArrowUpRight size={22} aria-hidden="true"/></span>
          </Link>)}</div>
        </section>

        <section className={styles.sources} aria-labelledby="sources-title">
          <div data-reveal className={styles.sourcesHeading}><h2 id="sources-title">{uiText("学びの入口を、ひとつに。")}</h2><p>{uiText("ポーカーを支えるさまざまな情報源から、次に読むコンテンツを見つけられます。")}</p></div>
          <div className={styles.sourceGrid}>{sources.map((source, index) => <div data-reveal data-reveal-delay={index * 70} className={styles.sourceCard} key={source.name}><div className={styles.sourceLogo}><Image src={source.image} alt="" width={96} height={52} /></div><span>{uiText(source.name)}</span></div>)}</div>
        </section>

        <section id="faq" className={styles.faq} aria-labelledby="faq-title">
          <div data-reveal><h2 id="faq-title">{uiText("よくある質問")}</h2></div>
          <div className={styles.questions}>{questions.map(({question, answer}) => <details data-reveal className={styles.question} key={question}>
            <summary>{uiText(question)}<ChevronDown size={20} aria-hidden="true"/></summary><p>{uiText(answer)}</p>
          </details>)}</div>
        </section>

        <section data-reveal className={styles.closing} aria-labelledby="closing-title">
          <h2 id="closing-title">{uiText("次の学びを、ここから。")}</h2><p>{uiText("まずは、気になるテーマをひとつ。登録なしで探せます。")}</p>
          <Link className={styles.primaryAction} href={localPath("/explore")}>{uiText("記事・動画を探す")}<ArrowRight size={24} aria-hidden="true"/></Link>
        </section>
      </main>
      </ScrollReveal>

      <footer className={styles.footer}>
        <div><Link className={styles.brand} href={localPath("/")} aria-label={uiText("Potover サービスサイト")}><Image className={styles.lightMark} src="/brand/potover-mark-light.png" alt="" width={34} height={34}/><Image className={styles.darkMark} src="/brand/potover-mark-dark.png" alt="" width={34} height={34}/><span>Potover</span></Link><p>{uiText("ポーカーの学びを、ひとつの場所に。")}</p></div>
        <nav aria-label={uiText("フッターナビゲーション")}><Link href={localPath("/home")}>{uiText("ホーム")}</Link><Link href={localPath("/explore")}>{uiText("探す")}</Link><Link href={localPath("/roadmap")}>{uiText("ロードマップ")}</Link><Link href={localPath("/bookmarks")}>{uiText("ブックマーク")}</Link></nav>
        <small>© {uiText(new Date().getFullYear())} Potover</small>
      </footer>
    </div>
  );
}
