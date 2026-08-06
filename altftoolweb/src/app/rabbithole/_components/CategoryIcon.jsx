import {
  Bot,
  ChartScatter,
  FlaskConical,
  Globe2,
  History,
  Joystick,
  Laugh,
  Library,
  Lightbulb,
  Network,
  Orbit,
  PawPrint,
  Puzzle,
  Radio,
  Sparkle,
  Wand2,
  Waves,
  Wrench,
  CircleHelp,
} from "lucide-react";

/**
 * Explicit map rather than a dynamic lucide lookup, so a typo in the taxonomy
 * cannot render an invisible element.
 *
 * The fallback is deliberately CircleHelp and not one of the eighteen real
 * category icons: a typo has to look wrong. Falling back to Sparkle produced a
 * perfectly plausible icon and hid the mistake.
 */
const ICONS = {
  Bot,
  ChartScatter,
  FlaskConical,
  Globe2,
  History,
  Joystick,
  Laugh,
  Library,
  Lightbulb,
  Network,
  Orbit,
  PawPrint,
  Puzzle,
  Radio,
  Sparkle,
  Wand2,
  Waves,
  Wrench,
};

export default function CategoryIcon({ name, className = "h-5 w-5" }) {
  const Icon = ICONS[name] || CircleHelp;
  return <Icon className={className} aria-hidden="true" />;
}
