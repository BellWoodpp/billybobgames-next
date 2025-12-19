import type { Metadata } from "next";
import SimpleGamePage from "../_components/SimpleGamePage";

export const metadata: Metadata = {
  title: "Pac-Man - Billy Bob Games",
  description:
    "Play the browser version of Pac-Man, clear each maze of pellets, dodge the ghosts, and chase high scores right inside BillyBob Games.",
  alternates: {
    canonical: "https://billybobgames.org/pac-man",
  },
};

export default function PacManPage() {
  return (
    <SimpleGamePage
      title="Pac-Man"
      subtitle="Gobble every pellet while dodging the ghosts in this arcade classic."
      iframeSrc="/games/pac-man/index.html"
      iframeTitle="Pac-Man Game"
      howToItems={[
        "Use the arrow keys to guide Pac-Man and clear every pellet in the maze.",
        "Keep your distance from ghosts or grab a power pellet to turn them blue and score big.",
        "Press the space bar whenever you need to pause or resume the action.",
        "Collect bonus fruit and chain ghost captures to push your high score higher.",
      ]}
    />
  );
}
