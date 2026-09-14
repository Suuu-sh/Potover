import Image from 'next/image';
import styles from './ServiceCharacter.module.css';

export type CharacterScene = 'search' | 'roadmap' | 'saved';

/** Shared editorial characters communicate the learning journey without mock UI. */
export function ServiceCharacter({scene}: {scene: CharacterScene}) {
  return <div className={styles.scene} aria-hidden="true">
    <Image src={`/service/characters/${scene}.png`} width={1024} height={1024} alt="" sizes="(max-width:760px) 85vw, 33vw"/>
  </div>;
}
