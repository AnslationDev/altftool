const seo = {
  intro:
    "The Monitor Brightness Match Guide calculates the screen luminance that matches your room, rather than leaving the brightness slider wherever it shipped. It converts room illuminance into the luminance of the wall behind the display with the Lambertian relation L = E x reflectance / pi, applies the roughly 3:1 screen-to-immediate-surround luminance ratio that ISO 9241-303 and ANSI/HFES 100 set as an ergonomic limit, and never recommends less than the 80 cd/m2 display white minimum in ISO 3664:2009. The output is a target in cd/m2 plus the approximate slider percentage on your panel.",
  useCases: [
    "Find the right brightness for a 350-nit monitor in a 500 lux office — about 120 cd/m2, roughly a third of the way up the slider.",
    "Work out why a screen feels harsh at night: in a 30 lux room a display at 105 cd/m2 is already 22 times brighter than the wall behind it.",
    "Check whether a desk beside a sunlit window is beyond what any normal panel can match before buying a brighter monitor.",
    "Set a colour-work display so it meets the ISO 3664 preference for 120 cd/m2 or more.",
  ],
  benefits: [
    ["Real photometry", "Uses the Lambertian lux-to-cd/m2 conversion instead of a rule of thumb, so wall colour actually changes the answer."],
    ["Standards-anchored limits", "Applies the 3:1 surround and 10:1 field luminance ratios, with the ISO 3664 80 cd/m2 floor as a hard minimum."],
    ["Tells you which rule bound the answer", "Shows whether the ratio, the floor or the panel's peak output set the recommendation."],
  ],
  faqs: [
    [
      "What brightness should my monitor be for eye comfort?",
      "Match it to the room rather than picking a fixed number. In a 500 lux office with mid-tone walls that works out at roughly 120 cd/m2; in a dim evening room the answer falls to the ISO 3664 floor of 80 cd/m2. The rule that matters is keeping the screen within about three times the luminance of what surrounds it.",
    ],
    [
      "Is it bad to use a bright screen in a dark room?",
      "It is the least comfortable configuration, because the eye has to re-adapt every time you glance away from a screen that can be 20 times brighter than the wall. Ergonomic standards cap the screen-to-surround ratio at about 3:1. The better fix is a low bias light behind the monitor, not turning the screen down below 80 cd/m2 where text starts to lose contrast.",
    ],
    [
      "How do I convert lux to nits?",
      "For a matte surface, luminance in cd/m2 equals illuminance in lux multiplied by the surface reflectance and divided by pi. A 500 lux room with a 0.5-reflectance wall gives about 80 cd/m2 of surround luminance. Lux measures light arriving; nits measure light leaving a surface, so the conversion always needs a reflectance.",
    ],
    [
      "Does lowering brightness reduce eye strain?",
      "Only if the screen was mismatched to the room in the first place. Digital eye strain is driven mainly by sustained near focus and a reduced blink rate, so brightness matching sits alongside distance breaks, screen height and an up-to-date prescription. Persistent headaches or eye pain warrant an eye examination.",
    ],
  ],
};

export default seo;
