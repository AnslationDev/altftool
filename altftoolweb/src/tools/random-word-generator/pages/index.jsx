"use client";

import GeneratorTool from "@/tools/_shared/batch/GeneratorTool";

const generate = () => { const w = ["orbit","meadow","cipher","lantern","quartz","breeze","harbor","velvet","ember","cascade","thistle","marble","cobalt","willow","nimbus","saffron","glacier","pixel","comet","fable","raven","dune","prism","echo","zenith","onyx","mirth","fjord","kelp","brisk","gadget","hollow","jolt","kismet","lucid","moss","nectar","opal","plume","quill"]; const pick = new Set(); while (pick.size < 6) pick.add(w[Math.floor(Math.random() * w.length)]); return { list: [...pick] }; };

export default function Page() {
  return (
    <GeneratorTool title={"Random Word Generator"} description={"Generate a batch of random English words for games, prompts and brainstorming."} buttonLabel={"New words"} generate={generate} />
  );
}
