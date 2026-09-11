import Image from 'next/image';
import styles from './ServicePreview.module.css';

const labels = {search:'探す：フィルターと記事一覧',roadmap:'学習ロードマップのコース一覧',saved:'ブックマーク：未保存時の画面'};

/** Captured from the actual app, rather than an illustrative replica. */
export function ServicePreview({kind}: {kind: 'search' | 'roadmap' | 'saved'}) {
  return <div className={styles.window}>
    <Image className={styles.light} src={`/service/potover-${kind}-light.png`} width={1280} height={820} alt={labels[kind]} sizes="(max-width:760px) 90vw, 65vw"/>
    <Image className={styles.dark} src={`/service/potover-${kind}-dark.png`} width={1280} height={820} alt={labels[kind]} sizes="(max-width:760px) 90vw, 65vw"/>
  </div>;
}
