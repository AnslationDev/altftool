"use client";

import { HackerTyper } from "./HackerTyper";
import { BlueScreen, DvdBounce, FakeVirus, FbiWarning, MatrixRain, PipesScreensaver, StaticTv, TrollFace } from "./CanvasPranks";
import { BiosSimulator, FakeDosTerminal, GoogleTerminal, JurassicConsole, JurassicDashboard, NortonCommander, WinXpSimulator } from "./RetroPranks";
import { MazeRunner, Minesweeper, TetrisGame } from "./Games";
import { ChatGenerator, FakeUpdate, Soundboard } from "./UtilityPranks";

const prankComponentMap = {
  hacker: HackerTyper,
  matrix: MatrixRain,
  bsod: BlueScreen,
  pipes: PipesScreensaver,
  dvd: DvdBounce,
  virus: FakeVirus,
  fbi: FbiWarning,
  dos: FakeDosTerminal,
  "google-terminal": GoogleTerminal,
  bios: BiosSimulator,
  norton: NortonCommander,
  winxp: WinXpSimulator,
  jurassic: JurassicDashboard,
  "jurassic-console": JurassicConsole,
  update: FakeUpdate,
  minesweeper: Minesweeper,
  tetris: TetrisGame,
  maze: MazeRunner,
  soundboard: Soundboard,
  chat: ChatGenerator,
  static: StaticTv,
  troll: TrollFace,
};

export default function RenderPrank({ prank }) {
  const Component = prankComponentMap[prank.component] || FakeUpdate;
  return <Component prank={prank} slug={prank.slug} />;
}
