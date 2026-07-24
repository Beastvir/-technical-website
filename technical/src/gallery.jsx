import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { X, ChevronLeft, ChevronRight, Shuffle, Play, Volume2, VolumeX } from "lucide-react";

/* ============================================================
   TECHNICAL CLUB — GALLERY PAGE (video-first cut)
   Same token system as the main site: navy/amber/ice, Chakra
   Petch display, JetBrains Mono labels, Permanent Marker
   stickers. The reel is now the hero: one big "now playing"
   stage that glitch-cuts between clips, a filmstrip to jump
   between them, and a smaller corkboard of stills underneath
   that exists to back up whatever's currently playing.
   ============================================================ */

function useWebFonts() {
  useEffect(() => {
    const id = "tc-gallery-fonts";
    if (document.getElementById(id)) return;
    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Chakra+Petch:ital,wght@0,400;0,500;0,600;0,700;1,600&family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&family=Permanent+Marker&display=swap";
    document.head.appendChild(link);
  }, []);
}

const COLORS = {
  navyDeep: "#081b30",
  navy: "#0f2c4c",
  blue: "#1f6fb2",
  blueBright: "#3fa9f5",
  ice: "#bfe6ff",
  amber: "#ffb703",
  green: "#7ed957",
  paper: "#eef4f9",
  line: "rgba(191,230,255,0.14)",
};

/* ---------- scroll reveal ---------- */
function useReveal(threshold = 0.12) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.unobserve(el);
        }
      },
      { threshold }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return [ref, visible];
}

function Reveal({ as: Tag = "div", className = "", children, ...rest }) {
  const [ref, visible] = useReveal();
  return (
    <Tag ref={ref} className={`reveal ${visible ? "in" : ""} ${className}`} {...rest}>
      {children}
    </Tag>
  );
}

/* ---------- sticker ---------- */
function Sticker({ text, style, tone = "amber", tail = "left" }) {
  return (
    <div className={`sticker sticker--${tone} tail-${tail}`} style={style}>
      {text}
    </div>
  );
}

/* ---------- data ----------
   VIDEOS drive the hero stage. Set `url` to a real video src
   (mp4/webm) to play it — leave empty and it falls back to an
   animated "static" placeholder card so the layout still reads
   correctly before real footage is dropped in.
   PHOTOS are now supporting stills, tagged with the video they
   back up via `videoId` so the corkboard can echo whatever's
   currently playing. */
const VIDEOS = [
  { id: "v1", url: "", poster: "linear-gradient(135deg,#1f6fb2,#081b30)", caption: "24HR BUILD SPRINT — SUNRISE FINISH", tag: "Flagship", cat: "Builds" },
  { id: "v2", url: "", poster: "linear-gradient(135deg,#ffb703,#0f2c4c)", caption: "BOT ARENA FINALS — CROWD GOES LOUD", tag: "Live", cat: "Events" },
  { id: "v3", url: "", poster: "linear-gradient(135deg,#3fa9f5,#0f2c4c)", caption: "HACKATHON WINNERS — TEAM CTRL+ALT", tag: "W", cat: "Team" },
  { id: "v4", url: "", poster: "linear-gradient(135deg,#0f2c4c,#1f6fb2)", caption: "WORKSHOP BAY — 1AM PROTOTYPE MODE", tag: "Late night", cat: "Builds" },
  { id: "v5", url: "", poster: "linear-gradient(135deg,#081b30,#ffb703)", caption: "3AM AND IT FINALLY WORKS", tag: "Clutch", cat: "Fails" },
  { id: "v6", url: "", poster: "linear-gradient(135deg,#1f6fb2,#7ed957)", caption: "FIRST PLACE, HACK THE CAMPUS", tag: "W", cat: "Events" },
];

const PHOTOS = [
  { id: 1, videoId: "v1", caption: "SUNRISE, TAKE TWO", gradient: "linear-gradient(135deg,#1f6fb2,#081b30)", rot: -4 },
  { id: 2, videoId: "v2", caption: "FRONT ROW, ARENA FINALS", gradient: "linear-gradient(135deg,#ffb703,#0f2c4c)", rot: 3 },
  { id: 3, videoId: "v4", caption: "FIRST BADGE EVER SOLDERED", gradient: "linear-gradient(135deg,#7ed957,#081b30)", rot: -2 },
  { id: 4, videoId: "v3", caption: "TEAM CTRL+ALT, POST-WIN", gradient: "linear-gradient(135deg,#3fa9f5,#0f2c4c)", rot: 5 },
  { id: 5, videoId: "v4", caption: "SEVEN MONITORS, ONE DEADLINE", gradient: "linear-gradient(135deg,#0f2c4c,#1f6fb2)", rot: -3 },
  { id: 6, videoId: "v5", caption: "3AM, STILL SMILING", gradient: "linear-gradient(135deg,#081b30,#ffb703)", rot: 2 },
  { id: 7, videoId: "v5", caption: "MAGIC SMOKE, MOTOR #3", gradient: "linear-gradient(135deg,#3fa9f5,#081b30)", rot: -5 },
  { id: 8, videoId: "v3", caption: "PIZZA, PROTOTYPE BUDGET", gradient: "linear-gradient(135deg,#7ed957,#0f2c4c)", rot: 4 },
  { id: 9, videoId: "v1", caption: "CAD NIGHT, HOUR SEVEN", gradient: "linear-gradient(135deg,#ffb703,#1f6fb2)", rot: -2 },
  { id: 10, videoId: "v6", caption: "TROPHY, STILL WARM", gradient: "linear-gradient(135deg,#1f6fb2,#7ed957)", rot: 3 },
  { id: 11, videoId: "v2", caption: "GRAVEYARD SHIFT, BADGE BAY", gradient: "linear-gradient(135deg,#0f2c4c,#3fa9f5)", rot: -3 },
  { id: 12, videoId: "v6", caption: "THE ROBOT THAT ONLY TURNS LEFT", gradient: "linear-gradient(135deg,#081b30,#7ed957)", rot: 5 },
];

const CATS = ["All", "Builds", "Events", "Team", "Fails"];

/* ---------- featured video stage ---------- */
function FeaturedStage({ video, index, total, onNav, muted, onToggleMute }) {
  const [glitching, setGlitching] = useState(false);
  const videoRef = useRef(null);

  const step = useCallback(
    (dir) => {
      setGlitching(true);
      setTimeout(() => {
        onNav(dir);
        setTimeout(() => setGlitching(false), 40);
      }, 200);
    },
    [onNav]
  );

  useEffect(() => {
    const el = videoRef.current;
    if (el && video.url) {
      el.currentTime = 0;
      el.play().catch(() => {});
    }
  }, [video]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [step]);

  return (
    <div className="gp-stage-wrap">
      <div className="gp-stage-eyebrow mono">
        <span className="gp-live-dot" /> Now playing — {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
      </div>
      <div className={`gp-stage ${glitching ? "glitching" : ""}`}>
        <div className="gp-stage-media" style={{ background: video.poster }}>
          {video.url ? (
            <video
              ref={videoRef}
              className="gp-stage-video"
              src={video.url}
              muted={muted}
              autoPlay
              loop
              playsInline
            />
          ) : (
            <div className="gp-stage-placeholder">
              <div className="gp-static" />
              <Play size={40} className="gp-play-icon" />
            </div>
          )}
          <div className="gp-stage-layer red" />
          <div className="gp-stage-layer blue" />
          <div className="gp-stage-scan" />
          <div className="gp-stage-vignette" />
        </div>

        <button className="gp-stage-nav prev" onClick={() => step(-1)} aria-label="Previous clip">
          <ChevronLeft size={24} />
        </button>
        <button className="gp-stage-nav next" onClick={() => step(1)} aria-label="Next clip">
          <ChevronRight size={24} />
        </button>

        <button className="gp-mute" onClick={onToggleMute} aria-label={muted ? "Unmute" : "Mute"}>
          {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </button>

        <div className="gp-stage-meta">
          <span className="gp-stage-tag mono">{video.tag}</span>
          <div className="gp-stage-caption">{video.caption}</div>
        </div>
      </div>
    </div>
  );
}

/* ---------- filmstrip thumbnail ---------- */
function FilmThumb({ video, active, onClick }) {
  return (
    <button className={`gp-thumb ${active ? "active" : ""}`} onClick={onClick} style={{ background: video.poster }}>
      <Play size={14} className="gp-thumb-play" />
      <span className="gp-thumb-cap mono">{video.tag}</span>
    </button>
  );
}

/* ---------- still (small supporting photo) ---------- */
function StillCard({ photo, onOpen, index, dimmed }) {
  const [ref, visible] = useReveal(0.05);
  return (
    <div
      ref={ref}
      className={`gp-still reveal ${visible ? "in" : ""} ${dimmed ? "dim" : ""}`}
      style={{ "--rot": `${photo.rot}deg`, "--d": `${(index % 8) * 45}ms` }}
      onClick={() => onOpen(photo)}
    >
      <div className="gp-tape" />
      <div className="gp-still-photo" style={{ background: photo.gradient }}>
        <div className="gp-sheen" />
        <div className="gp-scan" />
      </div>
      <div className="gp-still-caption">{photo.caption}</div>
    </div>
  );
}

/* ---------- lightbox (stills) ---------- */
function Lightbox({ photo, list, onClose, onNav }) {
  const [glitching, setGlitching] = useState(false);

  const step = useCallback(
    (dir) => {
      setGlitching(true);
      setTimeout(() => {
        onNav(dir);
        setGlitching(false);
      }, 220);
    },
    [onNav]
  );

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, step]);

  if (!photo) return null;

  return (
    <div className="lb-backdrop" onClick={onClose}>
      <div className="lb-frame" onClick={(e) => e.stopPropagation()}>
        <button className="lb-close" onClick={onClose} aria-label="Close">
          <X size={18} />
        </button>
        <div className={`lb-photo ${glitching ? "glitching" : ""}`} style={{ background: photo.gradient }}>
          <div className="lb-layer red" />
          <div className="lb-layer blue" />
          <div className="lb-scan" />
        </div>
        <div className="lb-meta">
          <div className="lb-caption">{photo.caption}</div>
        </div>
        <button className="lb-nav prev" onClick={() => step(-1)} aria-label="Previous">
          <ChevronLeft size={22} />
        </button>
        <button className="lb-nav next" onClick={() => step(1)} aria-label="Next">
          <ChevronRight size={22} />
        </button>
      </div>
    </div>
  );
}

/* ================= MAIN PAGE ================= */
export default function GalleryPage() {
  useWebFonts();
  const [cat, setCat] = useState("All");
  const [active, setActive] = useState(null);
  const [seed, setSeed] = useState(0);
  const [videoIdx, setVideoIdx] = useState(0);
  const [muted, setMuted] = useState(true);

  const currentVideo = VIDEOS[videoIdx];

  const navVideo = (dir) => {
    setVideoIdx((i) => (i + dir + VIDEOS.length) % VIDEOS.length);
  };

  const filtered = useMemo(() => {
    const base = cat === "All" ? PHOTOS : PHOTOS.filter((p) => VIDEOS.find((v) => v.id === p.videoId)?.cat === cat);
    if (seed === 0) return base;
    const arr = [...base];
    let s = seed;
    for (let i = arr.length - 1; i > 0; i--) {
      s = (s * 9301 + 49297) % 233280;
      const j = Math.floor((s / 233280) * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }, [cat, seed]);

  const openPhoto = (p) => setActive(p);
  const closePhoto = () => setActive(null);
  const navPhoto = (dir) => {
    setActive((cur) => {
      if (!cur) return cur;
      const idx = filtered.findIndex((p) => p.id === cur.id);
      const next = (idx + dir + filtered.length) % filtered.length;
      return filtered[next];
    });
  };

  return (
    <div className="tc-root gp-root">
      <style>{`
        :root{
          --navy-deep:${COLORS.navyDeep}; --navy:${COLORS.navy}; --blue:${COLORS.blue};
          --blue-bright:${COLORS.blueBright}; --ice:${COLORS.ice}; --amber:${COLORS.amber};
          --green:${COLORS.green}; --paper:${COLORS.paper}; --line:${COLORS.line}; --maxw:1200px;
        }
        .tc-root{ background:var(--navy-deep); color:var(--paper); font-family:'Inter',sans-serif;
          min-height:100vh; position:relative; overflow-x:hidden; }
        .tc-root *{ box-sizing:border-box; }
        .tc-root h1,.tc-root h2,.tc-root h3{ font-family:'Chakra Petch',sans-serif; text-transform:uppercase;
          letter-spacing:0.01em; margin:0; }
        .mono{ font-family:'JetBrains Mono',monospace; }
        .grid-bg{ position:fixed; inset:0; z-index:0; pointer-events:none;
          background-image:linear-gradient(var(--line) 1px, transparent 1px), linear-gradient(90deg, var(--line) 1px, transparent 1px);
          background-size:48px 48px;
          -webkit-mask-image:radial-gradient(circle at 50% 10%, black 0%, black 35%, transparent 80%);
          mask-image:radial-gradient(circle at 50% 10%, black 0%, black 35%, transparent 80%); }
        .reveal{ opacity:0; transform:translateY(24px); transition:opacity .6s ease, transform .6s cubic-bezier(.2,.7,.3,1); transition-delay:var(--d,0ms); }
        .reveal.in{ opacity:1; transform:translateY(0); }

        /* ---- hero ---- */
        .gp-hero{ position:relative; z-index:1; padding:110px 24px 32px; max-width:var(--maxw); margin:0 auto; text-align:center; }
        .gp-eyebrow{ font-family:'JetBrains Mono'; font-size:0.78rem; letter-spacing:0.18em; color:var(--amber);
          text-transform:uppercase; display:inline-flex; align-items:center; gap:10px; margin-bottom:18px; }
        .gp-eyebrow::before, .gp-eyebrow::after{ content:""; width:26px; height:1px; background:var(--amber); }
        .gp-hero h1{ font-size:clamp(2.4rem,7vw,4.4rem); line-height:1.02; font-weight:700; position:relative; display:inline-block; }
        .gp-hero h1 .glitch-word{ position:relative; display:inline-block; color:var(--blue-bright); }
        .gp-hero h1 .glitch-word::before, .gp-hero h1 .glitch-word::after{
          content:attr(data-text); position:absolute; left:0; top:0; width:100%; overflow:hidden; }
        .gp-hero h1 .glitch-word::before{ color:var(--amber); clip-path:inset(0 0 55% 0); animation:gw1 3.6s infinite linear; }
        .gp-hero h1 .glitch-word::after{ color:var(--green); clip-path:inset(55% 0 0 0); animation:gw2 3.6s infinite linear; }
        @keyframes gw1{ 0%,88%,100%{ transform:translate(0,0); opacity:0; } 90%{ transform:translate(-3px,-1px); opacity:0.8; } 93%{ transform:translate(2px,1px); opacity:0.6; } 96%{ opacity:0; } }
        @keyframes gw2{ 0%,88%,100%{ transform:translate(0,0); opacity:0; } 90%{ transform:translate(3px,1px); opacity:0.8; } 93%{ transform:translate(-2px,-1px); opacity:0.6; } 96%{ opacity:0; } }
        .gp-hero p{ font-size:1.05rem; color:var(--ice); opacity:0.8; max-width:52ch; margin:20px auto 0; line-height:1.6; }

        /* ---- featured video stage ---- */
        .gp-stage-wrap{ position:relative; z-index:1; max-width:980px; margin:8px auto 0; padding:0 24px; }
        .gp-stage-eyebrow{ display:flex; align-items:center; gap:8px; font-size:0.74rem; letter-spacing:0.14em;
          text-transform:uppercase; color:var(--amber); margin-bottom:14px; }
        .gp-live-dot{ width:7px; height:7px; border-radius:50%; background:var(--amber); box-shadow:0 0 0 0 rgba(255,183,3,0.6);
          animation:live-pulse 1.6s infinite; }
        @keyframes live-pulse{ 0%{ box-shadow:0 0 0 0 rgba(255,183,3,0.55); } 70%{ box-shadow:0 0 0 8px rgba(255,183,3,0); } 100%{ box-shadow:0 0 0 0 rgba(255,183,3,0); } }
        .gp-stage{ position:relative; border-radius:22px; overflow:hidden; border:1px solid var(--line);
          box-shadow:0 40px 90px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,183,3,0.06);
          background:var(--navy); }
        .gp-stage-media{ position:relative; width:100%; aspect-ratio:16/9; background-size:cover; background-position:center; overflow:hidden; }
        .gp-stage-video{ position:absolute; inset:0; width:100%; height:100%; object-fit:cover; }
        .gp-stage-placeholder{ position:absolute; inset:0; display:flex; align-items:center; justify-content:center; }
        .gp-static{ position:absolute; inset:0; opacity:0.16; mix-blend-mode:overlay;
          background-image:repeating-linear-gradient(0deg, rgba(255,255,255,0.5) 0 1px, transparent 1px 2px);
          animation:static-flicker 0.12s steps(2) infinite; }
        @keyframes static-flicker{ 0%{ transform:translateY(0); } 100%{ transform:translateY(2px); } }
        .gp-play-icon{ color:rgba(238,244,249,0.85); filter:drop-shadow(0 6px 18px rgba(0,0,0,0.5)); }
        .gp-stage-layer{ position:absolute; inset:0; background:inherit; opacity:0; mix-blend-mode:screen; pointer-events:none; }
        .gp-stage-layer.red{ filter:saturate(3) hue-rotate(-40deg); }
        .gp-stage-layer.blue{ filter:saturate(3) hue-rotate(150deg); }
        .gp-stage-scan{ position:absolute; inset:0; background:repeating-linear-gradient(0deg, rgba(0,0,0,0.14) 0 1px, transparent 1px 3px);
          mix-blend-mode:overlay; pointer-events:none; }
        .gp-stage-vignette{ position:absolute; inset:0; box-shadow:inset 0 0 90px rgba(8,27,48,0.55); pointer-events:none; }
        .gp-stage.glitching .gp-stage-layer.red{ animation:stR 200ms steps(3) both; }
        .gp-stage.glitching .gp-stage-layer.blue{ animation:stB 200ms steps(3) both; }
        .gp-stage.glitching .gp-stage-media{ animation:stJump 200ms steps(4) both; }
        @keyframes stR{ 0%{opacity:0;transform:translateX(0);} 40%{opacity:.85;transform:translateX(14px);} 100%{opacity:0;transform:translateX(0);} }
        @keyframes stB{ 0%{opacity:0;transform:translateX(0);} 40%{opacity:.85;transform:translateX(-14px);} 100%{opacity:0;transform:translateX(0);} }
        @keyframes stJump{ 0%,100%{ filter:none; } 30%{ filter:contrast(1.4) brightness(1.15); } 55%{ filter:contrast(0.8); } }
        .gp-stage-nav{ position:absolute; top:50%; transform:translateY(-50%); width:48px; height:48px; border-radius:50%;
          border:1px solid var(--line); background:rgba(8,27,48,0.55); color:var(--paper); display:flex; align-items:center;
          justify-content:center; cursor:pointer; transition:all .2s; backdrop-filter:blur(4px); }
        .gp-stage-nav:hover{ background:var(--amber); color:var(--navy-deep); border-color:var(--amber); }
        .gp-stage-nav.prev{ left:16px; } .gp-stage-nav.next{ right:16px; }
        .gp-mute{ position:absolute; top:16px; right:16px; width:36px; height:36px; border-radius:50%; border:1px solid var(--line);
          background:rgba(8,27,48,0.55); color:var(--paper); display:flex; align-items:center; justify-content:center; cursor:pointer;
          backdrop-filter:blur(4px); transition:all .2s; }
        .gp-mute:hover{ background:var(--blue-bright); color:var(--navy-deep); border-color:var(--blue-bright); }
        .gp-stage-meta{ position:absolute; left:0; right:0; bottom:0; padding:34px 22px 18px;
          background:linear-gradient(0deg, rgba(4,12,22,0.88) 0%, rgba(4,12,22,0.35) 60%, transparent 100%);
          display:flex; align-items:center; gap:12px; }
        .gp-stage-tag{ font-size:0.68rem; letter-spacing:0.08em; text-transform:uppercase; color:var(--navy-deep);
          background:var(--amber); padding:5px 11px; border-radius:999px; font-weight:700; flex-shrink:0; }
        .gp-stage-caption{ font-family:'Chakra Petch'; font-size:1.1rem; letter-spacing:0.01em; color:var(--paper); }

        /* ---- filmstrip ---- */
        .gp-filmstrip{ display:flex; gap:12px; margin:18px auto 0; max-width:980px; padding:0 24px 4px;
          overflow-x:auto; scrollbar-width:thin; }
        .gp-thumb{ position:relative; flex:0 0 auto; width:96px; height:60px; border-radius:8px; border:2px solid transparent;
          background-size:cover; cursor:pointer; display:flex; align-items:flex-end; justify-content:flex-start; padding:6px;
          opacity:0.55; transition:all .25s ease; }
        .gp-thumb:hover{ opacity:0.85; transform:translateY(-2px); }
        .gp-thumb.active{ opacity:1; border-color:var(--amber); box-shadow:0 8px 20px rgba(255,183,3,0.25); }
        .gp-thumb-play{ position:absolute; top:6px; right:6px; color:rgba(255,255,255,0.85); }
        .gp-thumb-cap{ font-size:0.58rem; letter-spacing:0.04em; text-transform:uppercase; color:var(--paper);
          background:rgba(8,27,48,0.65); padding:2px 6px; border-radius:4px; }

        /* ---- stills section (secondary corkboard) ---- */
        .gp-stills-heading{ position:relative; z-index:1; max-width:var(--maxw); margin:64px auto 0; padding:0 24px;
          display:flex; align-items:center; justify-content:space-between; gap:16px; flex-wrap:wrap; }
        .gp-stills-title{ display:flex; flex-direction:column; gap:4px; }
        .gp-stills-eyebrow{ font-family:'JetBrains Mono'; font-size:0.7rem; letter-spacing:0.14em; text-transform:uppercase; color:var(--blue-bright); opacity:0.8; }
        .gp-stills-title h2{ font-size:1.3rem; }
        .gp-chips{ display:flex; gap:8px; flex-wrap:wrap; }
        .gp-chip{ font-family:'JetBrains Mono'; font-size:0.7rem; letter-spacing:0.06em; text-transform:uppercase;
          padding:7px 14px; border-radius:999px; border:1px solid var(--line); background:rgba(255,255,255,0.02);
          color:var(--ice); cursor:pointer; transition:all .25s ease; }
        .gp-chip:hover{ border-color:var(--blue-bright); color:var(--paper); }
        .gp-chip.active{ background:var(--amber); border-color:var(--amber); color:var(--navy-deep); font-weight:700; }
        .gp-shuffle{ display:inline-flex; align-items:center; gap:6px; font-family:'JetBrains Mono'; font-size:0.7rem;
          text-transform:uppercase; letter-spacing:0.06em; padding:7px 14px; border-radius:999px; border:1px solid var(--blue-bright);
          background:transparent; color:var(--blue-bright); cursor:pointer; transition:transform .2s ease, background .2s ease; }
        .gp-shuffle:hover{ background:rgba(63,169,245,0.12); transform:translateY(-2px); }
        .gp-shuffle svg{ transition:transform .4s ease; }
        .gp-shuffle:active svg{ transform:rotate(180deg); }

        .gp-board{ position:relative; z-index:1; max-width:var(--maxw); margin:24px auto 0; padding:40px clamp(16px,4vw,44px) 54px;
          border-radius:22px; background:
            radial-gradient(circle at 15% 10%, rgba(255,255,255,0.03), transparent 55%),
            repeating-linear-gradient(45deg, rgba(255,255,255,0.012) 0 2px, transparent 2px 14px),
            var(--navy);
          border:1px solid var(--line); opacity:0.92; }
        .gp-grid{ display:grid; grid-template-columns:repeat(6,1fr); gap:20px 16px; }
        .gp-still{ position:relative; background:var(--paper); padding:8px 8px 20px; border-radius:4px; cursor:pointer;
          transform:rotate(var(--rot)) scale(0.94); box-shadow:0 10px 20px rgba(0,0,0,0.35);
          transition:transform .3s cubic-bezier(.2,.8,.2,1), box-shadow .3s, opacity .3s; }
        .gp-still:hover{ transform:rotate(0deg) translateY(-6px) scale(1); box-shadow:0 18px 34px rgba(0,0,0,0.45); z-index:5; opacity:1; }
        .gp-tape{ position:absolute; top:-7px; left:50%; transform:translateX(-50%) rotate(-3deg); width:38px; height:14px;
          background:rgba(255,183,3,0.5); border:1px solid rgba(255,183,3,0.65); }
        .gp-still-photo{ position:relative; width:100%; aspect-ratio:1/1; border-radius:2px; overflow:hidden; }
        .gp-sheen{ position:absolute; inset:0; background:linear-gradient(155deg, rgba(63,169,245,0.16) 0%, rgba(8,27,48,0.05) 35%, rgba(8,27,48,0.4) 100%);
          box-shadow: inset 0 0 0 1px rgba(191,230,255,0.22); }
        .gp-scan{ position:absolute; inset:0; background:repeating-linear-gradient(0deg, rgba(0,0,0,0.1) 0 1px, transparent 1px 3px); mix-blend-mode:overlay; opacity:0; transition:opacity .3s; }
        .gp-still:hover .gp-scan{ opacity:1; }
        .gp-still-caption{ font-family:'Permanent Marker',cursive; color:var(--navy-deep); font-size:0.62rem; text-align:center; margin-top:8px; line-height:1.2; }

        /* ---- stickers on board ---- */
        .sticker{ position:absolute; z-index:6; font-family:'Permanent Marker',cursive; font-size:0.82rem; padding:8px 13px;
          border-radius:20px; line-height:1.1; white-space:nowrap; transform:rotate(-6deg); box-shadow:0 10px 22px rgba(0,0,0,0.35);
          border:2px solid var(--navy-deep); pointer-events:none; }
        .sticker--amber{ background:var(--amber); color:var(--navy-deep); }
        .sticker--blue{ background:var(--blue-bright); color:var(--navy-deep); }
        .sticker--ice{ background:var(--paper); color:var(--navy-deep); }

        /* ---- lightbox (stills) ---- */
        .lb-backdrop{ position:fixed; inset:0; z-index:200; background:rgba(4,12,22,0.86); backdrop-filter:blur(6px);
          display:flex; align-items:center; justify-content:center; padding:24px; animation:lb-in .25s ease; }
        @keyframes lb-in{ from{ opacity:0; } to{ opacity:1; } }
        .lb-frame{ position:relative; width:min(700px,92vw); animation:lb-pop .3s cubic-bezier(.2,.8,.2,1); }
        @keyframes lb-pop{ from{ transform:scale(0.92) translateY(10px); opacity:0; } to{ transform:scale(1) translateY(0); opacity:1; } }
        .lb-photo{ position:relative; width:100%; aspect-ratio:16/10; border-radius:18px; overflow:hidden; border:1px solid var(--line);
          box-shadow:0 40px 90px rgba(0,0,0,0.55); background-size:cover; background-position:center; }
        .lb-layer{ position:absolute; inset:0; background:inherit; opacity:0; mix-blend-mode:screen; }
        .lb-layer.red{ filter:saturate(3) hue-rotate(-40deg); }
        .lb-layer.blue{ filter:saturate(3) hue-rotate(150deg); }
        .lb-scan{ position:absolute; inset:0; background:repeating-linear-gradient(0deg, rgba(0,0,0,0.12) 0 1px, transparent 1px 3px); mix-blend-mode:overlay; }
        .lb-photo.glitching .lb-layer.red{ animation:lbR 220ms steps(3) both; }
        .lb-photo.glitching .lb-layer.blue{ animation:lbB 220ms steps(3) both; }
        @keyframes lbR{ 0%{opacity:0;transform:translateX(0);} 40%{opacity:.8;transform:translateX(10px);} 100%{opacity:0;transform:translateX(0);} }
        @keyframes lbB{ 0%{opacity:0;transform:translateX(0);} 40%{opacity:.8;transform:translateX(-10px);} 100%{opacity:0;transform:translateX(0);} }
        .lb-meta{ display:flex; align-items:center; gap:12px; margin-top:18px; }
        .lb-caption{ font-family:'Chakra Petch'; font-size:1.05rem; letter-spacing:0.02em; color:var(--paper); }
        .lb-close{ position:absolute; top:-46px; right:0; width:36px; height:36px; border-radius:50%; border:1px solid var(--line);
          background:rgba(255,255,255,0.06); color:var(--paper); display:flex; align-items:center; justify-content:center; cursor:pointer; transition:all .2s; }
        .lb-close:hover{ background:var(--amber); color:var(--navy-deep); border-color:var(--amber); transform:rotate(90deg); }
        .lb-nav{ position:absolute; top:50%; transform:translateY(-50%); width:44px; height:44px; border-radius:50%;
          border:1px solid var(--line); background:rgba(8,27,48,0.65); color:var(--paper); display:flex; align-items:center;
          justify-content:center; cursor:pointer; transition:all .2s; backdrop-filter:blur(4px); }
        .lb-nav:hover{ background:var(--blue-bright); color:var(--navy-deep); border-color:var(--blue-bright); }
        .lb-nav.prev{ left:-20px; } .lb-nav.next{ right:-20px; }

        @media (max-width:980px){
          .gp-grid{ grid-template-columns:repeat(3,1fr); }
          .lb-nav.prev{ left:6px; } .lb-nav.next{ right:6px; }
        }
        @media (max-width:520px){
          .gp-grid{ grid-template-columns:repeat(2,1fr); gap:16px; }
          .gp-board{ padding:32px 14px 40px; }
          .gp-stage-caption{ font-size:0.9rem; }
          .gp-stage-nav{ width:38px; height:38px; }
        }
        @media (prefers-reduced-motion: reduce){
          .tc-root *{ animation-duration:0.001ms !important; animation-iteration-count:1 !important; transition-duration:0.001ms !important; }
        }
      `}</style>

      <div className="grid-bg" />

      <section className="gp-hero">
        <div className="gp-eyebrow mono">Proof we actually have fun</div>
        <h1>
          THE <span className="glitch-word" data-text="GALLERY">GALLERY</span>
        </h1>
        <p>The reel first — wins, fails, and everything soldered in between. Stills from the board back it up underneath.</p>
      </section>

      <FeaturedStage
        video={currentVideo}
        index={videoIdx}
        total={VIDEOS.length}
        onNav={navVideo}
        muted={muted}
        onToggleMute={() => setMuted((m) => !m)}
      />

      <div className="gp-filmstrip">
        {VIDEOS.map((v, i) => (
          <FilmThumb key={v.id} video={v} active={i === videoIdx} onClick={() => setVideoIdx(i)} />
        ))}
      </div>

      <div className="gp-stills-heading">
        <div className="gp-stills-title">
          <span className="gp-stills-eyebrow mono">Supporting evidence</span>
          <h2>Stills from the board</h2>
        </div>
        <div className="gp-chips">
          {CATS.map((c) => (
            <button key={c} className={`gp-chip ${cat === c ? "active" : ""}`} onClick={() => setCat(c)}>
              {c}
            </button>
          ))}
          <button className="gp-shuffle" onClick={() => setSeed((s) => s + 1)}>
            <Shuffle size={13} /> Shuffle
          </button>
        </div>
      </div>

      <Reveal className="gp-board" as="div">
        <Sticker text="SQUAD GOALS ✨" tone="amber" tail="left" style={{ top: "-14px", left: "3%" }} />
        <Sticker text="MORE COMING SOON →" tone="ice" tail="right" style={{ bottom: "-12px", right: "3%" }} />
        <div className="gp-grid">
          {filtered.map((p, i) => (
            <StillCard
              key={p.id}
              photo={p}
              index={i}
              onOpen={openPhoto}
              dimmed={currentVideo && p.videoId !== currentVideo.id}
            />
          ))}
        </div>
      </Reveal>

      <div style={{ height: 90 }} />

      <Lightbox photo={active} list={filtered} onClose={closePhoto} onNav={navPhoto} />
    </div>
  );
}