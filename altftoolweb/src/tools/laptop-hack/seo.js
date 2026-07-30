const seo = {
  intro:
    "Laptop Hack is a prank terminal animation: eight green-on-black status lines type themselves out in sequence — connecting to target laptop, bypassing firewall, injecting payload, access granted — over about 16 seconds, followed by a static mock shell transcript with a blinking cursor. Nothing is scanned, connected to or accessed; the lines and the fake command output are hard-coded text with a CSS typing effect. It is a joke screen for films, sketches, classroom demos of what movie hacking looks like, and winding up a friend who left their laptop unlocked.",
  useCases: [
    "A friend walked away without locking their screen and you want a harmless prank waiting for them that clearly resolves into nothing.",
    "You are shooting a short film or a school play and need a convincing hacker screen in the background without building one or licensing footage.",
    "You are teaching a security-awareness session and want to show what the Hollywood version of an intrusion looks like before explaining what real attacks actually involve.",
  ],
  benefits: [
    ["Runs like a scripted scene", "Each of the eight lines types over two seconds on a staggered delay, so the sequence unfolds at a readable pace rather than appearing all at once."],
    ["Nothing behind the curtain", "There is no input field, no network request and no device access — the terminal output is fixed text, which is what makes it safe to leave on a screen."],
    ["Fills the frame cleanly", "Monospace green text on a dark terminal with a blinking block cursor reads correctly on camera and on a projector."],
  ],
  faqs: [
    [
      "Does this actually hack a laptop?",
      "No. It is an animation of fixed text — the IP addresses, payload commands and password lines are typed into the page as static content, and no connection of any kind is made. Nothing on your device or anyone else's is read, changed or transmitted.",
    ],
    [
      "How long does the animation run?",
      "Roughly 16 seconds. Eight lines each take about two seconds to type and start two seconds apart, then the mock shell transcript stays on screen with the cursor blinking.",
    ],
    [
      "Can I use it in a video or a school project?",
      "Yes — record the screen or point a camera at it. It works well as a background element because the text is legible at a distance and the pacing looks like a scene rather than an instant dump of output.",
    ],
    [
      "Is it safe to leave this on someone's computer?",
      "The page itself does nothing beyond animating text, so it cannot damage or alter anything. Use judgement about who you show it to and where — a fake intrusion screen on a workplace or school machine can be taken seriously by someone who walks past, and that is a people problem rather than a technical one.",
    ],
  ],
};

export default seo;
