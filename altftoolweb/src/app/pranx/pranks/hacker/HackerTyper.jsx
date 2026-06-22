
"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { BadgeAlert, Bot, Code2, Download, Eye, Folder, Monitor, ShieldAlert, Terminal } from "lucide-react";
import { useInterval } from "../../hooks/useInterval";
import { openFullscreen } from "../../lib/fullscreen";
import { HackerDesktopIcon, HackerWindow } from "./HackerWindow";
import { MatrixCodeWall, NeuralMesh, PasswordCracker, SignalGraph } from "./HackerWidgets";

export function HackerTyper() {
  const snippets = [
    "trace --node gateway.local --mask 23.86.111.0",
    "decrypting packet stream: 0x7F 0x4A 0x99",
    "ACCESS CHECK: spoofed credentials accepted",
    "neural mesh reroute complete",
    "compiler: injected harmless demo module",
    "password cracker: checksum matched",
    "advertisement blocker detected",
    "remote connection tunnel stabilized",
  ];
  const [consoleText, setConsoleText] = useState("pene");
  const [activeTask, setActiveTask] = useState("Password Cracker");
  const [openPanels, setOpenPanels] = useState({
    console: true,
    neural: true,
    compiler: true,
    traffic: true,
    ads: true,
    password: true,
  });
  const [maximizedPanel, setMaximizedPanel] = useState(null);
  const desktopRef = useRef(null);
  const terminalRef = useRef(null);
  const openPanel = useCallback((panel, label) => {
    setOpenPanels((current) => ({ ...current, [panel]: true }));
    setActiveTask(label || panel);
    window.requestAnimationFrame(() => {
      if (window.innerWidth <= 980) {
        document.querySelector(`[data-panel="${panel}"]`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    });
  }, []);
  const minimizePanel = useCallback((panel) => {
    setOpenPanels((current) => ({ ...current, [panel]: false }));
    setMaximizedPanel((current) => (current === panel ? null : current));
  }, []);
  const togglePanelFullscreen = useCallback((panel, label) => {
    setOpenPanels((current) => ({ ...current, [panel]: true }));
    setActiveTask(label || panel);
    setMaximizedPanel((current) => (current === panel ? null : panel));
  }, []);
  const windowProps = useCallback(
    (panel, label) => ({
      panel,
      active: activeTask === label,
      maximized: maximizedPanel === panel,
      onActivate: () => openPanel(panel, label),
      onMinimize: () => minimizePanel(panel),
      onMaximize: () => togglePanelFullscreen(panel, label),
    }),
    [activeTask, maximizedPanel, minimizePanel, openPanel, togglePanelFullscreen]
  );
  const desktopIcons = [
    { icon: Bot, label: "Bitcoin Miner", panel: "neural", task: "Neural Network Tracing" },
    { icon: Eye, label: "Headquarter surveillance", panel: "neural", task: "Neural Network Tracing" },
    { icon: Folder, label: "Password Cracker", panel: "password", task: "Password Cracker" },
    { icon: BadgeAlert, label: "Nuclear Plant", panel: "traffic", task: "Traffic Monitor" },
    { icon: Monitor, label: "Remote Connection", panel: "traffic", task: "Traffic Monitor" },
    { icon: Download, label: "Advertisements", panel: "ads", task: "Advertisements" },
    { icon: Code2, label: "Compiler", panel: "compiler", task: "Compiler" },
    { icon: Terminal, label: "Program Console", panel: "console", task: "Program Console" },
  ];
  const taskButtons = [
    { label: "Password Cracker", panel: "password", prefix: "*| " },
    { label: "Advertisements", panel: "ads", prefix: "$ " },
    { label: "Compiler", panel: "compiler", prefix: "↔ " },
    { label: "Program Console", panel: "console", prefix: ">_ " },
    { label: "Neural Network Tracing", panel: "neural", prefix: "◇ " },
    { label: "Traffic Monitor", panel: "traffic", prefix: "▥ " },
  ];

  useInterval(() => {
    setConsoleText((current) => `${current}\n${snippets[Math.floor(Math.random() * snippets.length)]}`.slice(-1700));
  }, 1500);

  useEffect(() => {
    terminalRef.current?.focus();
  }, []);

  return (
    <main ref={desktopRef} className="hacker-route h-screen min-h-[680px] overflow-hidden bg-black font-mono text-[#00ff19]">
      <div className="relative h-full overflow-hidden bg-[radial-gradient(circle_at_55%_58%,rgba(0,255,25,0.36),transparent_0_16rem),radial-gradient(circle_at_70%_15%,rgba(0,255,25,0.2),transparent_0_18rem),linear-gradient(115deg,#020402,#001a05_48%,#030303)]">
        <div className="absolute inset-0 opacity-35 [background-image:linear-gradient(120deg,transparent_0_42%,rgba(0,255,25,0.18)_45%,transparent_52%),radial-gradient(circle_at_51%_56%,transparent_0_90px,rgba(0,255,25,0.25)_92px,transparent_155px)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0)_50%,rgba(0,255,25,0.08)_51%)] bg-[size:100%_4px]" />
        <div className="absolute left-[43%] top-[43%] hidden h-[23rem] w-[23rem] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-4 border-[#00ff19]/45 text-center text-[#00ff19]/65 shadow-[0_0_55px_rgba(0,255,25,0.35)] lg:grid">
          <div className="rounded-full border-2 border-[#00ff19]/55 p-12">
            <ShieldAlert className="mx-auto h-20 w-20" />
            <p className="mt-3 text-sm font-black uppercase tracking-[0.28em]">National Security Agency</p>
            <p className="mt-1 text-xs uppercase tracking-[0.3em]">Simulation</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => openFullscreen(desktopRef)}
          className="absolute right-4 top-4 z-40 rounded-md border-2 border-[#00ff19] bg-black/70 px-4 py-2 text-sm font-black uppercase tracking-[0.16em] text-[#00ff19] shadow-[0_0_20px_rgba(0,255,25,0.35)] hover:bg-[#00ff19] hover:text-black"
        >
          Full Screen
        </button>

        {openPanels.console ? (
          <HackerWindow title="Program Console" className="panel-console left-[1.2%] top-[3.8%] h-[36%] w-[31%] min-w-[320px]" {...windowProps("console", "Program Console")}>
            <textarea
              ref={terminalRef}
              value={consoleText}
              onChange={(event) => setConsoleText(event.target.value)}
              onKeyDown={(event) => {
                if (event.key.length === 1) openPanel("console", "Program Console");
              }}
              className="h-full w-full resize-none bg-black/80 p-3 font-mono text-xl leading-7 text-[#00ff19] outline-none [text-shadow:0_0_10px_rgba(0,255,25,0.75)]"
            />
          </HackerWindow>
        ) : null}

        {openPanels.neural ? (
          <HackerWindow title="Neural Network Tracing" className="panel-neural left-[34%] top-[2%] h-[38%] w-[32%]" {...windowProps("neural", "Neural Network Tracing")}>
            <NeuralMesh />
          </HackerWindow>
        ) : null}

        {openPanels.compiler ? (
          <HackerWindow title="Compiling..." className="panel-compiler bottom-[15%] left-[1.2%] h-[35%] w-[32%]" compact {...windowProps("compiler", "Compiler")}>
            <MatrixCodeWall />
          </HackerWindow>
        ) : null}

        {openPanels.traffic ? (
          <HackerWindow title="Traffic Monitor" className="panel-traffic bottom-0 left-[33%] h-[31%] w-[26%]" compact {...windowProps("traffic", "Traffic Monitor")}>
            <SignalGraph />
          </HackerWindow>
        ) : null}

        {openPanels.ads ? (
          <HackerWindow title="Advertisements" className="panel-ads right-[21.5%] top-[41%] h-[36%] w-[22%] min-w-[300px]" {...windowProps("ads", "Advertisements")}>
            <div className="grid h-full place-items-center p-4 text-center">
              <div className="rounded-3xl bg-[#00ff19] px-8 py-6 text-black shadow-[0_0_28px_rgba(0,255,25,0.65)]">
                <p className="text-3xl font-black leading-tight">Sorry, you are using ad blocker.</p>
                <div className="mx-auto mt-4 grid h-28 w-28 place-items-center rounded-full border-[12px] border-red-600">
                  <BadgeAlert className="h-16 w-16 text-black" />
                </div>
                <button className="mt-4 rounded-lg bg-black px-5 py-2 text-sm font-black text-[#00ff19]">Disable AdBlock Now?</button>
              </div>
            </div>
          </HackerWindow>
        ) : null}

        {openPanels.password ? (
          <HackerWindow title="Password Cracker" className="panel-password bottom-[5.5%] right-[6.5%] h-[33%] w-[31%] min-w-[360px]" {...windowProps("password", "Password Cracker")}>
            <PasswordCracker />
          </HackerWindow>
        ) : null}

        <div className="desktop-icons absolute right-[4%] top-[5%] grid grid-cols-2 gap-x-9 gap-y-8">
          {desktopIcons.map((item) => (
            <HackerDesktopIcon
              key={item.label}
              icon={item.icon}
              label={item.label}
              active={activeTask === item.task}
              onClick={() => openPanel(item.panel, item.task)}
            />
          ))}
        </div>

        <div className="absolute bottom-0 left-0 right-0 z-40 flex h-11 items-center gap-2 overflow-x-auto bg-[#00f715] px-3 text-black shadow-[0_-4px_20px_rgba(0,255,25,0.35)]">
          <Link href="/pranx" className="flex h-8 shrink-0 items-center gap-2 rounded-sm px-2 text-xl font-black hover:bg-black/10">
            <span className="text-2xl">≡</span> Start
          </Link>
          {taskButtons.map((task) => (
            <button
              key={task.label}
              onClick={() => openPanel(task.panel, task.label)}
              className={`h-8 shrink-0 rounded-md border-2 border-black px-3 text-sm font-black ${activeTask === task.label ? "bg-black text-[#00ff19]" : "bg-[#00f715] text-black"}`}
            >
              {task.prefix}
              {task.label}
            </button>
          ))}
          {maximizedPanel ? (
            <button
              type="button"
              onClick={() => setMaximizedPanel(null)}
              className="h-8 shrink-0 rounded-md border-2 border-black bg-[#00f715] px-3 text-sm font-black text-black hover:bg-black hover:text-[#00ff19]"
            >
              Restore
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => openFullscreen(desktopRef)}
            className="ml-auto h-8 shrink-0 rounded-md border-2 border-black bg-black px-3 text-sm font-black text-[#00ff19] hover:bg-[#00ff19] hover:text-black"
          >
            Full Screen
          </button>
          <span className="hidden shrink-0 text-sm font-black sm:inline">SAFE LOCAL PRANK MODE</span>
        </div>

        <style jsx global>{`
          @keyframes hackerDrift {
            from { transform: translateY(-10px); }
            to { transform: translateY(22px); }
          }
          .hacker-route section[data-maximized="true"] {
            left: 0 !important;
            top: 0 !important;
            right: 0 !important;
            bottom: 44px !important;
            width: 100% !important;
            height: calc(100% - 44px) !important;
            min-width: 0 !important;
            z-index: 60 !important;
          }
          @media (max-width: 980px) {
            .hacker-route { overflow: auto; }
            .hacker-route > div {
              min-height: 1120px;
            }
            .hacker-route section,
            .hacker-route .absolute {
              position: absolute;
            }
            .hacker-route .panel-console { left: 16px !important; top: 20px !important; width: calc(100% - 32px) !important; height: 260px !important; min-width: 0 !important; }
            .hacker-route .panel-neural { left: 16px !important; top: 300px !important; width: calc(100% - 32px) !important; height: 260px !important; }
            .hacker-route .panel-compiler { left: 16px !important; top: 580px !important; width: calc(50% - 24px) !important; height: 240px !important; }
            .hacker-route .panel-traffic { left: calc(50% + 8px) !important; top: 580px !important; width: calc(50% - 24px) !important; height: 240px !important; }
            .hacker-route .panel-ads { left: 16px !important; right: auto !important; top: 840px !important; width: calc(50% - 24px) !important; min-width: 0 !important; height: 230px !important; }
            .hacker-route .panel-password { left: calc(50% + 8px) !important; right: auto !important; top: 840px !important; width: calc(50% - 24px) !important; min-width: 0 !important; height: 230px !important; }
            .hacker-route .desktop-icons { display: none; }
          }
          @media (max-width: 640px) {
            .hacker-route > div { min-height: 1420px; }
            .hacker-route section[data-panel] { left: 12px !important; width: calc(100% - 24px) !important; min-width: 0 !important; }
            .hacker-route .panel-console { top: 16px !important; height: 245px !important; }
            .hacker-route .panel-neural { top: 278px !important; height: 230px !important; }
            .hacker-route .panel-compiler { top: 526px !important; height: 210px !important; }
            .hacker-route .panel-traffic { top: 754px !important; height: 210px !important; }
            .hacker-route .panel-ads { top: 982px !important; height: 210px !important; }
            .hacker-route .panel-password { top: 1210px !important; height: 185px !important; }
          }
        `}</style>
      </div>
    </main>
  );
}
