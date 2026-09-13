// Placeholder home. The real landing page (port of the Kit page) is built in sprint 1.
export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-24 text-center">
      <h1 className="font-display text-6xl uppercase tracking-wide sm:text-8xl">
        Karma
      </h1>
      <p className="max-w-md text-lg text-foreground/80">
        Le petit coup de pouce discret pour les hommes qui veulent entretenir la
        magie dans leur couple.
      </p>
      <p className="text-sm uppercase tracking-[0.2em] text-gold">
        Bientôt
      </p>
    </main>
  );
}
