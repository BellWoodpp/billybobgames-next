import { classNames } from "@/lib/classNames";
import { createGameTrackingContext } from "@/lib/analytics";
import PageShell from "./PageShell";
import GameBreadcrumb from "./GameBreadcrumb";
import RecentlyPlayedTracker from "./RecentlyPlayedTracker";
import GameFrameWithControls from "./GameFrameWithControls";
import styles from "../styles/game-page.module.css";

type GamePlayPageProps = {
  title: string;
  subtitle: string;
  landingHref: string;
  recentlyPlayed: {
    href: string;
    title: string;
    img?: string;
  };
  iframeSrc: string;
  iframeTitle: string;
  analyticsHref?: string;
  allow?: string;
  allowFullScreen?: boolean;
  loading?: "lazy" | "eager";
  showFullscreenButton?: boolean;
  wrapperClassName?: string;
  frameWrapperClassName?: string;
  frameClassName?: string;
};

export default function GamePlayPage({
  title,
  subtitle,
  landingHref,
  recentlyPlayed,
  iframeSrc,
  iframeTitle,
  analyticsHref,
  allow = "autoplay",
  allowFullScreen,
  loading,
  showFullscreenButton = true,
  wrapperClassName,
  frameWrapperClassName,
  frameClassName,
}: GamePlayPageProps) {
  const wrapperClasses = classNames(styles.wrapper, wrapperClassName);
  const analyticsGame = createGameTrackingContext(analyticsHref || recentlyPlayed.href, recentlyPlayed.title);

  return (
    <PageShell>
      <main className={wrapperClasses}>
        <RecentlyPlayedTracker href={recentlyPlayed.href} title={recentlyPlayed.title} img={recentlyPlayed.img} />
        <header className={styles.header}>
          <GameBreadcrumb current={title} homeHref={landingHref} homeLabel="Back" />
          <h1 className={styles.title}>{title}</h1>
          <p className={styles.subtitle}>{subtitle}</p>
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
          analyticsGame={analyticsGame}
        />
      </main>
    </PageShell>
  );
}
