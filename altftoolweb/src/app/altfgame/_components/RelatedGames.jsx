import GameGrid from "./GameGrid";

// Related-games strip shown under the player.
export default function RelatedGames({ title = "Related games", games }) {
  if (!games?.length) return null;
  return (
    <section className="mt-12">
      <h2 className="mb-4 text-xl font-bold tracking-tight">{title}</h2>
      <GameGrid games={games} />
    </section>
  );
}
