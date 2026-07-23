import { Link } from "react-router-dom";
import Icon from "./Icons.jsx";
import { Container, Reveal, Eyebrow } from "./ui.jsx";
import { img } from "../data/site.js";

export default function PageHero({
  eyebrow,
  title,
  description,
  image,
  current,
}) {
  return (
    <section className="relative flex min-h-[58vh] items-end overflow-hidden pt-28">
      <div className="absolute inset-0">
        <img
          src={img(image, 1600)}
          alt=""
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/70 to-ink/40" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/70 to-transparent" />
      </div>
      <Container className="relative z-10 pb-14 pt-24">
        <Reveal>
          <Eyebrow light>{eyebrow}</Eyebrow>
        </Reveal>
        <Reveal delay={80}>
          <h1 className="mt-4 max-w-3xl font-display text-4xl font-semibold leading-[1.08] text-white sm:text-5xl lg:text-6xl">
            {title}
          </h1>
        </Reveal>
        {description && (
          <Reveal delay={150}>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-stone-200">
              {description}
            </p>
          </Reveal>
        )}
        <Reveal delay={220}>

        </Reveal>
      </Container>
    </section>
  );
}
