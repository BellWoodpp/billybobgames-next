import type { ReactNode } from "react";
import { classNames } from "@/lib/classNames";
import PageShell from "./PageShell";
import GameBreadcrumb from "./GameBreadcrumb";
import RecentlyPlayedTracker from "./RecentlyPlayedTracker";
import GameFrameWithControls from "./GameFrameWithControls";
import GameStructuredData from "./GameStructuredData";
import styles from "../styles/game-page.module.css";

type SimpleGamePageProps = {
  title: string;
  subtitle: string;
  recentlyPlayed?: { href: string; title: string; img?: string };
  iframeSrc: string;
  iframeTitle: string;
  allow?: string;
  allowFullScreen?: boolean;
  loading?: "lazy" | "eager";
  showFullscreenButton?: boolean;
  wrapperClassName?: string;
  frameWrapperClassName?: string;
  frameClassName?: string;
  titleClassName?: string;
  subtitleClassName?: string;
  supportingText?: string;
  howToTitle?: string;
  howToItems: Array<ReactNode>;
  howToClassName?: string;
  howToListClassName?: string;
  howToTitleClassName?: string;
};

export default function SimpleGamePage({
  title,
  subtitle,
  recentlyPlayed,
  iframeSrc,
  iframeTitle,
  allow = "autoplay",
  allowFullScreen,
  loading,
  showFullscreenButton,
  wrapperClassName,
  frameWrapperClassName,
  frameClassName,
  titleClassName,
  subtitleClassName,
  supportingText,
  howToTitle = "How to Play",
  howToItems,
  howToClassName,
  howToListClassName,
  howToTitleClassName,
}: SimpleGamePageProps) {
  const wrapperClasses = classNames(styles.wrapper, wrapperClassName);
  const headingClasses = classNames(styles.title, titleClassName);
  const subtitleClasses = classNames(styles.subtitle, subtitleClassName);
  const howToClasses = classNames(styles.howToPlay, howToClassName);
  const howToListClasses = classNames(styles.howToPlayList, howToListClassName);
  const howToTitleClasses = classNames(styles.howToPlayTitle, howToTitleClassName);

  return (
    <PageShell>
      {recentlyPlayed?.href ? (
        <GameStructuredData
          title={title}
          description={subtitle}
          path={recentlyPlayed.href}
          image={recentlyPlayed.img}
        />
      ) : null}
      <main className={wrapperClasses}>
        {recentlyPlayed ? (
          <RecentlyPlayedTracker href={recentlyPlayed.href} title={recentlyPlayed.title} img={recentlyPlayed.img} />
        ) : null}
        <header className={styles.header}>
          <GameBreadcrumb current={title} />
          <h1 className={headingClasses}>{title}</h1>
          <p className={subtitleClasses}>{subtitle}</p>
        </header>

        <GameFrameWithControls
          iframeSrc={iframeSrc}
          iframeTitle={iframeTitle}
          allow={allow}
          allowFullScreen={allowFullScreen}
          loading={loading}
          showFullscreenButton={showFullscreenButton}
          wrapperClassName={frameWrapperClassName}
          frameClassName={frameClassName}
        />

        {supportingText ? <p className={styles.supportingText}>{supportingText}</p> : null}

        <section className={howToClasses} aria-label={`How to play ${title}`}>
          <h2 className={howToTitleClasses}>{howToTitle}</h2>
          <ul className={howToListClasses}>
            {howToItems.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </section>
      </main>
    </PageShell>
  );
}
