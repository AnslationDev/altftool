import Container from "../ui/Container";
import { brands } from "../../data/brands";

export default function TrustedBy() {
  // Duplicate the row for a seamless infinite marquee
  const row = [...brands, ...brands];
  return (
    <section className="border-y border-slate-200/70 bg-soft py-10 dark:border-white/5 dark:bg-slate-900/40">
      <Container>
        <div className="relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
          <div className="flex w-max anim-marquee items-center gap-16">
            {row.map((brand, i) => (
              <div
                key={i}
                title={brand.name}
                className="shrink-0 transition duration-300 hover:scale-105"
              >
                <brand.Logo />
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
