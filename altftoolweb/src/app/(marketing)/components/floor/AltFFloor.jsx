import "./floor.css";
import { ACTIVITY_CYCLE, BOARD, CASTS, PRODUCTS, ROLE_VAR, SCENE, WINDOWS, ZONES } from "./cast";
import FloorViewer from "./FloorViewer";
import { OFFICE_SCENE } from "./scenes";

/*
 * The AltF Floor.
 *
 * A server component on purpose: the scene is pure CSS keyframes, so it needs no
 * hydration, ships no client JavaScript, and paints in the first frame alongside
 * the headline instead of appearing a second later.
 *
 * It is decorative. The floor carries no information a visitor needs, so every
 * part of it is aria-hidden behind one descriptive sentence — a hundred
 * announced <div>s would be actively hostile to a screen reader.
 *
 * That description is a visually-hidden paragraph rather than role="img" on the
 * wrapper. role="img" makes ALL descendants presentational, and the Expand
 * button and its dialog live inside this element: with the role in place, the
 * one interactive thing in the scene did not exist for assistive tech at all.
 */

function Person({ p }) {
  return (
    <div
      className={`fl-node ${p.walker ? "fl-walker" : ""}`}
      style={{ "--x": `${p.x}%`, "--y": `${p.y}%`, "--z": "10px", "--delay": `${p.delay}s` }}
    >
      <div
        className={`fl-person ${p.long ? "fl-person--long" : ""} ${p.walker ? "" : "fl-person--idle"}`}
        style={{
          "--fl-role": `var(${ROLE_VAR[p.role]})`,
          "--fl-skin": p.skin,
          "--fl-hair": p.hair,
          "--delay": `${p.delay}s`,
        }}
      >
        {/* First child on purpose — see .fl-hairlong in floor.css. */}
        {p.long ? <i className="fl-hairlong" /> : null}
        <span className="fl-person__head">
          <i className="fl-eye fl-eye--l" style={{ "--delay": `${p.delay}s` }} />
          <i className="fl-eye fl-eye--r" style={{ "--delay": `${p.delay}s` }} />
          <i className="fl-blush fl-blush--l" />
          <i className="fl-blush fl-blush--r" />
          <i className="fl-mouth" />
        </span>
        <span className="fl-person__body" />
      </div>
      {p.label ? <span className="fl-label">{p.label}</span> : null}
    </div>
  );
}

function Desk({ d }) {
  return (
    <>
      {/* The box itself lies in the floor plane — no counter-rotation, so its
          top face foreshortens with the room. */}
      <div className="fl-deskbox" style={{ "--x": `${d.x}%`, "--y": `${d.y}%`, "--w": "8%", "--h": "4.5%" }}>
        <span className="fl-deskbox__top" />
        <span className="fl-deskbox__front" />
      </div>
      {/* The monitor stands on the desk, so it IS a billboard, lifted to the
          desk's height. */}
      <div className="fl-node" style={{ "--x": `${d.x}%`, "--y": `${d.y - 1}%`, "--z": "22px" }}>
        <span className="fl-monitor">
          <span
            className="fl-screen"
            style={{ "--fl-pod": `var(${ROLE_VAR[d.role]})`, "--delay": `${d.delay}s` }}
          />
        </span>
      </div>
    </>
  );
}

function Chair({ c }) {
  return (
    <div className="fl-node" style={{ "--x": `${c.x}%`, "--y": `${c.y}%`, "--z": "2px" }}>
      <span className="fl-chair" style={{ "--fl-role": `var(${ROLE_VAR[c.role]})` }} />
    </div>
  );
}

function Prop({ p, kind }) {
  return (
    <div className="fl-node" style={{ "--x": `${p.x}%`, "--y": `${p.y}%`, "--z": "2px" }}>
      <span className={`fl-${kind}`} style={{ "--delay": `${p.delay}s` }} />
    </div>
  );
}

function Token({ t }) {
  return (
    <div className="fl-node" style={{ "--x": `${t.from.x}%`, "--y": `${t.from.y}%`, "--z": "34px" }}>
      <span
        className="fl-token"
        style={{
          "--fl-role": `var(${ROLE_VAR[t.role]})`,
          "--dx": `${t.dx}cqw`,
          "--dy": `${t.dy}cqw`,
          "--dur": `${t.dur}s`,
          "--delay": `${t.delay}s`,
        }}
      />
    </div>
  );
}

export default function AltFFloor({ className = "", scene = OFFICE_SCENE, expandable = true }) {
  /* The scene supplies the five accent slots the stylesheet reads. Everything
     below — room, cast, desks, conveyor — is identical for every product. */
  const palette = Object.fromEntries(scene.accent.map((c, i) => [`--fl-a${i + 1}`, c]));

  /* Negative delays start each line part-way through the cycle, so the six hand
     off in sequence without a JavaScript clock. */
  const lines = scene.activity.map((line, i) => ({
    ...line,
    delay: -((i * ACTIVITY_CYCLE) / scene.activity.length),
  }));

  return (
    <div className={`fl-stage ${className}`} style={palette}>
      <p className="sr-only">An illustration of {scene.alt}.</p>

      <div className="fl-room" aria-hidden="true">
        {/* Three walls, each hinged up off an edge of the floor, so the corners
            are real right angles in 3D rather than two flat shapes faked to look
            joined. The side walls are what turn this from a diorama into a room
            you are looking into. */}
        <div className="fl-wallside fl-wallside--left" />
        <div className="fl-wallside fl-wallside--right" />
        <div className="fl-wallback">
          <span className="fl-signage">{scene.signage}</span>
          <span className="fl-board">
            {BOARD.map((b) => (
              <span
                key={b.id}
                className="fl-board__row"
                style={{
                  "--fl-role": `var(${ROLE_VAR[b.role]})`,
                  "--fill": b.fill,
                  "--delay": `${b.delay}s`,
                }}
              />
            ))}
          </span>
          {WINDOWS.map((w) => (
            <span
              key={w.id}
              className="fl-window"
              style={{ left: `${w.left}%`, width: `${w.width}%`, "--delay": `${w.delay}s` }}
            />
          ))}
        </div>

        {/* Light first, because it is on the floor and everything else stands on
            top of it: daylight from the window bay, then the pool each ceiling
            panel throws over its pod. */}
        <div className="fl-daylight" />
        {/* Shadows go down with the light, before anything stands on them. */}
        {CASTS.map((c) => (
          <div
            key={c.id}
            className="fl-cast"
            style={{ "--x": `${c.x}%`, "--y": `${c.y}%`, "--w": `${c.w}%`, "--h": `${c.h}%` }}
          />
        ))}
        {ZONES.map((z) => (
          <div
            key={`pool-${z.id}`}
            className="fl-pool"
            style={{
              "--x": `${z.x}%`,
              "--y": `${z.y}%`,
              "--w": `${z.w * 1.5}%`,
              "--h": `${z.h * 1.5}%`,
              "--fl-pod": `var(${ROLE_VAR[z.role]})`,
            }}
          />
        ))}

        {/* Cabins go down before anything that stands in them. Their partitions
            are real planes, so they occlude the people behind them and not the
            ones in front — which is the whole reason to build them this way. */}
        {ZONES.map((z) => (
          <div
            key={z.id}
            className="fl-cabin"
            style={{
              "--x": `${z.x}%`,
              "--y": `${z.y}%`,
              "--w": `${z.w}%`,
              "--h": `${z.h}%`,
              "--fl-pod": `var(${ROLE_VAR[z.role]})`,
            }}
          >
            <span className="fl-cabin__floor" />
            {z.walls.map((w) => (
              <span key={w} className={`fl-cabin__wall fl-cabin__wall--${w}`} />
            ))}
          </div>
        ))}

        {/* The meeting room has a table where the other rooms have desks. */}
        {ZONES.filter((z) => z.table).map((z) => (
          <div key={`t-${z.id}`} className="fl-node" style={{ "--x": `${z.x}%`, "--y": `${z.y + 4}%`, "--z": "2px" }}>
            <span className="fl-table" />
          </div>
        ))}

        {/* Depth-sorted in cast.js: coplanar counter-rotated nodes paint in DOM
            order, so back-to-front order has to come from the data. */}
        {SCENE.map(({ kind, item }) => {
          if (kind === "chair") return <Chair key={item.id} c={item} />;
          if (kind === "desk") return <Desk key={item.id} d={item} />;
          if (kind === "token") return <Token key={item.id} t={item} />;
          if (kind === "plant" || kind === "cooler") {
            return <Prop key={item.id} p={item} kind={kind} />;
          }
          return <Person key={item.id} p={item} />;
        })}
        {/* One floating tag per pod, naming the team and showing what it is
            building. Rendered last: these are annotations, and a coplanar
            preserve-3d context paints in DOM order, so anything earlier would let
            a passing figure cut the label in half. */}
        {ZONES.map((z) => (
          <div
            key={`tag-${z.id}`}
            className="fl-node fl-podtag"
            style={{
              "--x": `${z.tagX}%`,
              "--y": `${z.tagY}%`,
              "--z": "150px",
              "--fl-pod": `var(${ROLE_VAR[z.role]})`,
            }}
          >
            <span className="fl-podtag__card">
              <span className="fl-podtag__name">{scene.zones[z.role] ?? z.label}</span>
              <span
                className="fl-podtag__meter"
                style={{ "--dur": `${z.dur}s`, "--delay": `${z.delay}s` }}
              />
            </span>
          </div>
        ))}

      </div>

      {/* The output conveyor sits outside the room so it reads as the line where
          finished work leaves the building. */}
      <div className="fl-belt" aria-hidden="true">
        {PRODUCTS.map((p) => (
          <span
            key={p.id}
            className="fl-product"
            style={{
              "--fl-role": `var(${ROLE_VAR[p.role]})`,
              "--dur": `${p.dur}s`,
              "--delay": `${p.delay}s`,
            }}
          />
        ))}
      </div>

      {/* The live feed. Everything else in the scene is atmosphere; this is the
          part that names what is being built, and it holds still long enough to
          be read. It is also the seam where the real build log will plug in. */}
      <div className="fl-ticker" aria-hidden="true">
        <p className="fl-ticker__head">
          <span className="fl-ticker__pip" />
          Live on the floor
        </p>
        <div className="fl-ticker__rail">
          {lines.map((a) => (
            <span
              key={a.label}
              className="fl-ticker__line"
              style={{
                "--fl-role": `var(${ROLE_VAR[a.role]})`,
                "--cycle": `${ACTIVITY_CYCLE}s`,
                "--delay": `${a.delay}s`,
              }}
            >
              <span className="fl-ticker__dot" />
              {a.label}
              <span className="fl-ticker__meta">{a.meta}</span>
            </span>
          ))}
        </div>
      </div>

      {/* The dialog is handed a second, non-expandable copy of the same scene.
          It only mounts once opened, so nothing extra animates until asked. */}
      {expandable ? (
        <FloorViewer label="Expand">
          <AltFFloor scene={scene} expandable={false} />
        </FloorViewer>
      ) : null}
    </div>
  );
}
