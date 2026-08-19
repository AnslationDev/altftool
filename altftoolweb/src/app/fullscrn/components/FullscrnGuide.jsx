/**
 * Server-rendered reference copy for /fullscrn.
 *
 * The tool itself is a client component that ships almost no crawlable text,
 * which is why this route had the softest SERP on the site. Everything here is
 * plain HTML with no client JavaScript, and every fact is read off the
 * implementation (FullscrnClient.jsx, components/EditorArea.jsx,
 * components/SettingSidebar.jsx) so the page, the JSON-LD in page.jsx and the
 * product cannot disagree.
 *
 * The page's <h1> is rendered by components/Header.jsx above the tool, so this
 * section starts at <h2>.
 */
export default function FullscrnGuide() {
  return (
    <section
      aria-labelledby="fullscrn-guide-heading"
      className="w-full bg-background text-foreground"
    >
      <div className="mx-auto w-full max-w-3xl px-4 py-12 sm:py-16">
        <h2
          id="fullscrn-guide-heading"
          className="text-2xl font-bold tracking-tight sm:text-3xl"
        >
          How to display text fullscreen
        </h2>
        <p className="mt-4 text-base leading-7 text-muted-foreground">
          Type your words into the Text tab, set the size and colours, then send
          them fullscreen. There is no sign-up and nothing is uploaded: the text
          you type, the image you choose and every setting stay inside this
          browser tab.
        </p>

        <ol className="mt-6 list-decimal space-y-3 pl-6 text-base leading-7 marker:font-semibold marker:text-primary">
          <li>
            Open the <strong>Text</strong> tab and type or paste the words you
            want to show.
          </li>
          <li>
            Set the font size, alignment, text colour and background colour in
            the settings panel on the right.
          </li>
          <li>
            Press <strong>Go Fullscreen</strong>, or press{" "}
            <kbd className="rounded border border-border bg-card px-1.5 py-0.5 font-mono text-sm">
              Cmd + Enter
            </kbd>{" "}
            on macOS or{" "}
            <kbd className="rounded border border-border bg-card px-1.5 py-0.5 font-mono text-sm">
              Ctrl + Enter
            </kbd>{" "}
            on Windows and Linux.
          </li>
          <li>
            Press <strong>Esc</strong> to leave fullscreen and return to the
            editor with your text intact.
          </li>
        </ol>

        <h2 className="mt-12 text-2xl font-bold tracking-tight">
          What the fullscreen view can show
        </h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[34rem] border-collapse text-left text-sm">
            <caption className="sr-only">
              The three tabs of the AltFTool fullscreen display and what each one
              shows
            </caption>
            <thead>
              <tr className="border-b border-border">
                <th scope="col" className="py-2 pr-4 font-semibold">
                  Tab
                </th>
                <th scope="col" className="py-2 pr-4 font-semibold">
                  Fills the screen with
                </th>
                <th scope="col" className="py-2 font-semibold">
                  What you can change
                </th>
              </tr>
            </thead>
            <tbody className="text-muted-foreground">
              <tr className="border-b border-border">
                <th scope="row" className="py-3 pr-4 font-medium text-foreground">
                  Text
                </th>
                <td className="py-3 pr-4">
                  The words you typed, in large letters
                </td>
                <td className="py-3">
                  Font size, left/centre/right alignment, text colour,
                  background colour
                </td>
              </tr>
              <tr className="border-b border-border">
                <th scope="row" className="py-3 pr-4 font-medium text-foreground">
                  Image
                </th>
                <td className="py-3 pr-4">
                  One picture from your device, scaled to fit
                </td>
                <td className="py-3">Background colour behind the picture</td>
              </tr>
              <tr>
                <th scope="row" className="py-3 pr-4 font-medium text-foreground">
                  Clock
                </th>
                <td className="py-3 pr-4">
                  A live clock, a stopwatch or a countdown
                </td>
                <td className="py-3">
                  Time zone, 12- or 24-hour format, text and background colour
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2 className="mt-12 text-2xl font-bold tracking-tight">
          What this tool does not do
        </h2>
        <ul className="mt-4 list-disc space-y-3 pl-6 text-base leading-7 text-muted-foreground marker:text-primary">
          <li>
            <span className="text-foreground">Nothing is saved.</span> There is
            no account and no storage: reloading the page clears your text,
            image and colours.
          </li>
          <li>
            <span className="text-foreground">Nothing is uploaded.</span> A
            picture you pick is read straight from your device and never sent to
            a server.
          </li>
          <li>
            <span className="text-foreground">
              Fullscreen needs browser support.
            </span>{" "}
            The button uses the browser Fullscreen API, which Safari on iPhone
            does not offer for page elements.
          </li>
          <li>
            <span className="text-foreground">One block at a time.</span> The
            fullscreen view shows the active tab only — text, image or clock,
            never two together — and there are no slides, transitions or
            scrolling text.
          </li>
          <li>
            <span className="text-foreground">Fixed clock choices.</span> The
            countdown starts at 10:00 and resets to 10:00, and the time zone
            list covers Local, UTC, New York, London, Dubai, India and Tokyo.
          </li>
        </ul>

        <h2 className="mt-12 text-2xl font-bold tracking-tight">
          Keyboard shortcuts
        </h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[22rem] border-collapse text-left text-sm">
            <caption className="sr-only">
              Keyboard shortcuts for the AltFTool fullscreen display
            </caption>
            <thead>
              <tr className="border-b border-border">
                <th scope="col" className="py-2 pr-4 font-semibold">
                  Keys
                </th>
                <th scope="col" className="py-2 font-semibold">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="text-muted-foreground">
              <tr className="border-b border-border">
                <th scope="row" className="py-3 pr-4 font-medium text-foreground">
                  Cmd + Enter / Ctrl + Enter
                </th>
                <td className="py-3">Go fullscreen</td>
              </tr>
              <tr>
                <th scope="row" className="py-3 pr-4 font-medium text-foreground">
                  Esc
                </th>
                <td className="py-3">Exit fullscreen</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
