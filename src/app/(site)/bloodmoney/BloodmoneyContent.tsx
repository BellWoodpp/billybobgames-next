/* eslint-disable react/no-unescaped-entities */

// 专注于SEO文档渲染

import Link from "next/link";
import { classNames } from "@/lib/classNames";
import { WsrvImage } from "@/components/WsrvImage";
import PageShell from "../_components/PageShell";
import GameBreadcrumb from "../_components/GameBreadcrumb";
import styles from "./bloodmoney.module.css";

const galleryImages = [
  "https://r2bucket.billybobgames.org/bloodmoney-webp/1.webp",
  "https://r2bucket.billybobgames.org/bloodmoney-webp/2.webp",
  "https://r2bucket.billybobgames.org/bloodmoney-webp/3.webp",
  "https://r2bucket.billybobgames.org/bloodmoney-webp/4.webp",
  "https://r2bucket.billybobgames.org/bloodmoney-webp/5.webp",
];

export default function BloodmoneyContent() {
  return (
    <PageShell containerClassName={styles.fullWidth}>
      <main className={styles.wrapper}>
        <header className={styles.header}>
          <GameBreadcrumb current="BLOODMONEY" />
          <h1 className={styles.title}>BLOODMONEY</h1>
          <p className={styles.subtitle}>
            Dive into this atmospheric adventure without leaving BillyBob Games.
          </p>
          <div className={styles.playCtas}>
            <Link className={styles.playPoster} href="/bloodmoney/play" aria-label="Open BLOODMONEY play view">
              <WsrvImage
                src="https://r2bucket.billybobgames.org/bloodmoney-webp/bloodmoney.webp"
                alt="Play BLOODMONEY"
                width={1200}
                height={675}
                priority
                sizes="(min-width: 960px) 560px, 92vw"
                layout="constrained"
              />
            </Link>
          </div>
        </header>

        <section className={styles.details} aria-label="About BLOODMONEY">
          <article className={styles.detailsContent}>
            <h2>HOW FAR WOULD YOU GO FOR MONEY?</h2>
            <p>
              You're struck with a serious condition and the only treatment available is an expensive operation. $25,000, to
              be exact. How are you going to get that money in time? It seems hopeless. Dire, even.
            </p>
            <p>
              But then, BOOM! THERE HE IS! THERE IS HARVEY HARVINGTON! IN A STALL ON THE SIDE OF THE ROAD! $1 IN EXCHANGE
              FOR JUST ONE CLICK! THAT'S THE DEAL OF A LIFETIME!
            </p>
            <p>
              "Really?" YES! "How much will he give me?" AS MUCH AS YOU CAN CLICK HIM FOR! "Can he give me more?" YEAH~!
            </p>
            <p>
              Sure, $1 per click is good, but how about $2? $4? $8? All you need to do is hurt him! Needles, hammers,
              scissors, whatever! The more pain you inflict on him, the more money you'll get! The question now isn't "how
              much will he give you" so much as it is "how much can I make him fork over?"! The only limit is your sanity,
              as well as Harvey's life force!
            </p>
            <h3>COMES WITH:</h3>
            <ul>
              <li>3 ENDINGS!</li>
              <li>Cute pastel art!</li>
              <li>30+ minutes of clicking fun!</li>
              <li>A TON OF MONEY!</li>
              <li>
                The knowledge you ruined the life of an innocent man who only wanted to bring some of his good and
                generosity into the world!!!
              </li>
              <li>A COOL SONG!</li>
            </ul>
            <p className={styles.cta}>WHAT ARE YOU WAITING FOR??? GET HARVEY'S 1-DOLLAR-PER-CLICK PACKAGE TODAY!!</p>
            <p className={styles.warning}>[FLASHING LIGHTS WARNING: DO NOT PLAY IF YOU ARE PHOTOSENSITIVE]</p>
            <h3>FOLLOW THE DEVELOPER!:</h3>
            <ul className={styles.links}>
              <li>
                <a href="https://x.com/shroomychrist" target="_blank" rel="noopener noreferrer">
                  Twitter: @shroomychrist
                </a>
              </li>
              <li>
                <a
                  href="https://www.youtube.com/@shroomy__rxcks"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  YouTube: shroomy__rxcks
                </a>
              </li>
            </ul>
          </article>

          <aside className={styles.detailsGallery} aria-label="BLOODMONEY gallery">
            {galleryImages.map((src) => (
              <WsrvImage
                key={src}
                src={src}
                alt="BLOODMONEY screenshot"
                width={800}
                height={450}
                sizes="(min-width: 960px) 400px, 100vw"
                layout="constrained"
              />
            ))}
          </aside>

          <details className={styles.detailsMore}>
            <summary className={styles.showMore}>
              <span className={styles.showMoreLabelClosed}>Show more</span>
              <span className={styles.showMoreLabelOpen}>Show less</span>
            </summary>
            <div className={styles.moreInfo}>
                <p className={styles.teaser}>
                  BLOODMONEY! challenges players to earn $25,000 in a darkly twisted clicker game. Each decision ramps up
                  tension and leads to shocking endings. Play now!
                </p>
                <h3 className={classNames(styles.moreInfoTitle, styles.moreInfoTitleXl)}>
                  BLOODMONEY!—The Darkest Clicker Game Ever
                </h3>
                <p>
                  Chaos awaits with every click in BLOODMONEY!, the indie horror clicker that transforms simple tapping
                  into a thrilling journey of choices. Developed by ShroomyChrist and released on August 3, 2025, this game
                  blends addictive clicker mechanics with thrilling humor, offering players a unique experience that feels
                  both unpredictable and engaging. Its quirky, drama-filled world keeps every session fresh, pulling players
                  deeper into a story where decisions carry real weight.
                </p>
                <p>
                  Every decision in BLOODMONEY! sets the stage for escalating consequences while maintaining a simple,
                  approachable interface. Each click builds suspense and excitement, making the experience as captivating as
                  it is unconventional. Step inside and prepare for the unpredictable challenges that lie ahead!
                </p>
                <h3 className={styles.moreInfoTitle}>The Twisted Story Behind BLOODMONEY!</h3>
                <p>
                  BLOODMONEY! tells the story of a protagonist caught in a high-stakes struggle to gather $25,000 under
                  extraordinary pressure. Then, Harvey Harvington, a mysterious vendor, appears on the roadside and offers
                  seemingly simple terms. Tension collides with urgency as every choice shifts the atmosphere, pushing the
                  narrative toward surprising turns. The storyline blends sharp humor, absurd moments, and tough decisions,
                  keeping players hooked while navigating a world where every decision feels meaningful. Its quirky, eerie
                  charm transforms each session into a mental chess game of strain and surprising outcomes.
                </p>
                <h2 className={classNames(styles.moreInfoTitle, styles.moreInfoTitleXl)}>
                  Gameplay: Clicking through Absurd and Risky Decisions
                </h2>
                <h3 className={styles.moreInfoSubtitle}>Core Main Game Rules</h3>
                <p>To fully enjoy BLOODMONEY!, understanding the game progression is key.</p>
                <ul className={styles.moreInfoList}>
                  <li>The story begins with your in-game avatar under heavy personal pressure, aiming to secure $25,000.</li>
                  <li>
                    During a desperate drive home, Harvey Harvington appears with his booth and the sign: "1 CLICK = 1
                    DOLLAR."
                  </li>
                  <li>Clicking generates USD, the in-game currency, which accumulates toward the ultimate goal of $25,000.</li>
                  <li>Players can escalate the cost per click to increase earnings, making each decision feel more intense.</li>
                  <li>Harvey will try to make you stop your clicking progress continuously with short conversations.</li>
                  <li>
                    As the total rises, stakes and suspense grow, requiring strategic pacing to balance speed and
                    consequences.
                  </li>
                </ul>
                <p>
                  The gameplay thrives on this progression, combining minimalist click mechanics with strategic
                  decision-making. Every choice amplifies stakes, creating a rhythm of risk and reward that keeps players
                  fully engaged. Patience, observation, and calculated progression form the backbone of this humorous,
                  addictive clicker experience.
                </p>
                <h2 className={classNames(styles.moreInfoTitle, styles.moreInfoTitleBlack)}>
                  All Interaction Tools in This Game
                </h2>
                <p>
                  BLOODMONEY! provides seven tools for players to interact with Harvey. Each tool raises the momentum while
                  boosting USD per click, and every tool can only be purchased once. They force a balance between higher
                  rewards and growing pressure, shaping gameplay rhythm and the story’s final outcomes.
                </p>
                <p><strong>Feather ($100):</strong> The lightest option, introducing subtle unease with minimal payout increase.</p>
                <p><strong>Needle ($500):</strong> Adds a sharper growth, raising earnings faster and climax slightly more.</p>
                <p><strong>Hammer ($1,500):</strong> Delivers stronger effects, offering a noticeable boost in USD for each click.</p>
                <p><strong>Scissors ($3,000):</strong> Inflicts significant intensity, balancing risk and reward as advancement builds.</p>
                <p><strong>Match ($6,000):</strong> Creates dramatic horror, increasing payouts and weight considerably.</p>
                <p><strong>Knife ($10,000):</strong> Severe escalation, pushing both challenge and earnings close to extreme levels.</p>
                <p><strong>Gun ($20,000):</strong> The ultimate tool, maximizing payout and tension at the highest stage.</p>
                <h2 className={classNames(styles.moreInfoTitle, styles.moreInfoTitlePurple)}>
                  Simple Control Mechanics
                </h2>
                <h3 className={styles.moreInfoSubtitle}>Core Main Game Rules</h3>
                <ul className={styles.moreInfoList}>
                  <li>
                    <strong>Left Click:</strong> Generates a dollar per interaction to Harvey Harvington.
                  </li>
                  <li>
                    <strong>Climb Slider:</strong> Raises payment per click while adding some action.
                  </li>
                  <li>
                    <strong>Pause Button:</strong> Allows players to strategize without urgency.
                  </li>
                </ul>
                <p>
                  Minimal controls make BLOODMONEY! accessible yet deceptively deep, turning straightforward mechanics into
                  a choice-driven experience. The simplicity encourages focus on strategy, tension, and the dark humor woven
                  through every interaction.
                </p>
                <h2 className={classNames(styles.moreInfoTitle, styles.moreInfoTitleXl)}>
                  Strategic Choices &amp; Player Decisions
                </h2>
                <h3 className={classNames(styles.moreInfoTitle, styles.moreInfoTitlePurpleSm)}>
                  A Unique Blend: Witty, Weird, and Eerily Fun
                </h3>
                <p>
                  Before exploring the varied outcomes, players need to recognize the importance of decision-making in
                  BLOODMONEY! Gameplay challenge is amplified through a mix of sharp comedy and offbeat visuals.
                </p>
                <ul className={classNames(styles.moreInfoList, styles.moreInfoListBullets)}>
                  <li>
                    Each click introduces absurd consequences, blending striking imagery with perfectly timed comedy.
                  </li>
                  <li>
                    Quirky animations highlight Harvey’s reactions, raising the unease with each escalation.
                  </li>
                  <li>
                    The soundtrack shifts between thrilling tones and unexpected playful cues, intensifying the unsettling
                    charm.
                  </li>
                </ul>
                <p>
                  This combination of humor and haunting style ensures the game’s clicker mechanics remain fresh, addictive,
                  and emotionally engaging. Players experience brief relief followed by renewed anticipation, reinforcing the
                  game’s addictive rhythm.
                </p>
                <h2 className={classNames(styles.moreInfoTitle, styles.moreInfoTitlePurple)}>
                  Multiple Endings – Find Your Fate in This Clicker Game
                </h2>
                <p>
                  In BLOODMONEY!, your choices directly shape the ending, creating replayable paths filled with dark humor.
                  Players who embrace the unpredictable flow find themselves replaying to uncover every hidden twist and
                  outcome. The branching endings reward curiosity and experimentation, making each session distinct and
                  memorable. Here are all endings in this clicker storyline:
                </p>
                <ul className={classNames(styles.moreInfoList, styles.moreInfoListEndings)}>
                  <li>
                    <strong>Good Ending:</strong> Exercising restraint while reaching $25,000 preserves Harvey’s role. Players
                    achieve their goal without rising stakes, feeling satisfaction and relief for careful decision-making
                    amidst the game’s step-up.
                  </li>
                  <li>
                    <strong>Normal Ending:</strong> Continuing to click past the target and spending money on various items
                    leads to severe consequences for Harvey. The result balances partial success with compromise, leaving
                    players with a mix of triumph and guilt.
                  </li>
                  <li>
                    <strong>Bad Ending:</strong> Choosing to spend $20,000 on a gun to escalate events results in Harvey’s
                    downfall. The scenario culminates in a bold twist, highlighting the ironic cost of reckless choices.
                  </li>
                </ul>
                <h2 className={classNames(styles.moreInfoTitle, styles.moreInfoTitleHeadline)}>
                  Why BLOODMONEY! is Trending Right Now
                </h2>
                <p>
                  Every click in BLOODMONEY! matters, blending chaos, strategy, and wicked comedy into one addictive
                  experience. Players quickly feel the stakes rise as choices stack up, shaping the story and setting the stage
                  for its standout features.
                </p>
                <h3 className={classNames(styles.moreInfoTitle, styles.moreInfoTitlePurpleSm)}>
                  In-Game Visuals and Audio
                </h3>
                <p>
                  The art and audio together reinforce the game’s unique vibe, creating a clicker world that is both memorable
                  and unsettling.
                </p>
                <p><strong>Visual Style:</strong> Minimalist yet detailed animations showcase each consequence in creative fashion.</p>
                <p><strong>Color Palette:</strong> Pastel shades clash with darker themes, amplifying the absurd atmosphere.</p>
                <p>
                  <strong>Audio Design:</strong> Haunting soundscapes layered with playful cues intensify suspense and sardonic
                  comedy.
                </p>
                <h2 className={classNames(styles.moreInfoTitle, styles.moreInfoTitlePurple)}>
                  Unique Highlight Features
                </h2>
              <ul className={classNames(styles.moreInfoList, styles.moreInfoListBullets)}>
                <li>Addictive clicker mechanics with escalating thrills.</li>
                <li>Earn USD while balancing consequence and strategy.</li>
                <li>Multiple weapons create unique drama and surprise.</li>
                <li>One-time purchases force careful, strategic decision-making.</li>
                <li>Three distinct endings reflect your choices in the progression.</li>
                <li>Sardonic comedy blends with horror for immersive chaos.</li>
                <li>Minimalist controls keep gameplay simple yet engaging.</li>
                <li>Replayable paths encourage experimentation and risk-taking.</li>
              </ul>
            </div>
          </details>
        </section>
      </main>
    </PageShell>
  );
}
