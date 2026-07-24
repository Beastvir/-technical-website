import React, { useEffect, useRef, useState, useCallback } from "react";
import { Routes, Route } from "react-router-dom";
import GalleryPage from "./gallery.jsx"
import { Link } from "react-router-dom";
import TechnicalClub from "./Home.jsx";
/* ---------- load webfonts once ---------- */
function useWebFonts() {
  useEffect(() => {
    const id = "tc-fonts";
    if (document.getElementById(id)) return;
    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Chakra+Petch:ital,wght@0,400;0,500;0,600;0,700;1,600&family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&family=Permanent+Marker&display=swap";
    document.head.appendChild(link);
  }, []);
}

/* ---------- design tokens ---------- */
const COLORS = {
  navyDeep: "#081b30",
  navy: "#0f2c4c",
  blue: "#1f6fb2",
  blueBright: "#3fa9f5",
  ice: "#bfe6ff",
  amber: "#ffb703",
  paper: "#eef4f9",
  line: "rgba(191,230,255,0.14)",
};

/* ---------- small reusable motion hook ----------
   Replaces scroll-triggered "reveal" animation.
   Returns a ref to attach + a boolean once the element enters view. */
function useReveal(threshold = 0.15) {
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

/* ---------- count-up numbers, triggered on scroll into view ---------- */
function StatHex({ target, label }) {
  const [ref, visible] = useReveal(0.4);
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!visible) return;
    const step = Math.max(1, Math.round(target / 40));
    let cur = 0;
    const t = setInterval(() => {
      cur += step;
      if (cur >= target) {
        cur = target;
        clearInterval(t);
      }
      setCount(cur);
    }, 30);
    return () => clearInterval(t);
  }, [visible, target]);

  return (
    <div ref={ref} className="stat-hex">
      <div className="stat-num">{count}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

/* ---------- draggable / spinning triskelion hero mark ---------- */
function Triskelion() {
  const imgRef = useRef(null);
  const angleRef = useRef(0);
  const velocityRef = useRef(0.15); // idle deg/frame
  const draggingRef = useRef(false);
  const lastXRef = useRef(0);
  const lastAngleRef = useRef(0);
  const rigRef = useRef(null);

  useEffect(() => {
    let raf;
    const frame = () => {
      angleRef.current += velocityRef.current;
      velocityRef.current += (0.15 - velocityRef.current) * 0.02;
      if (imgRef.current) {
        imgRef.current.style.transform = `rotate(${angleRef.current}deg)`;
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, []);

  const pointerX = (e) => (e.touches ? e.touches[0].clientX : e.clientX);

  const onPointerDown = (e) => {
    draggingRef.current = true;
    lastXRef.current = pointerX(e);
    lastAngleRef.current = angleRef.current;
  };
  const onPointerMove = useCallback((e) => {
    if (!draggingRef.current) return;
    const dx = pointerX(e) - lastXRef.current;
    velocityRef.current = dx * 0.6;
    angleRef.current = lastAngleRef.current + dx * 1.4;
    lastAngleRef.current = angleRef.current;
    lastXRef.current = pointerX(e);
  }, []);
  const onPointerUp = useCallback(() => {
    draggingRef.current = false;
  }, []);

  useEffect(() => {
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };
  }, [onPointerMove, onPointerUp]);

  return (
    <div className="rig" ref={rigRef} onPointerDown={onPointerDown} onDoubleClick={() => (velocityRef.current = 40)}>
      <div className="rig-glow" />
      <div className="rig-ring" />
      <div className="rig-ring r2" />
      <svg className="rig-hex" viewBox="0 0 200 200" width="100%" height="100%">
        <polygon
          points="100,10 183,55 183,145 100,190 17,145 17,55"
          fill="none"
          stroke={COLORS.blueBright}
          strokeWidth="2.5"
        />
      </svg>
      <div className="rig-logo-wrap">
        <img
          ref={imgRef}
          src="logo.png"
          alt="Technical Club triskelion logo"
          className="rig-logo"
          draggable="false"
        />
      </div>
      <div className="spin-hint mono">↻ drag or tap to spin it up</div>
    </div>
  );
}

/* ---------- infinite marquee ---------- */
function Marquee() {
  const words = ["ROBOTICS", "CODE", "3D PRINTING", "IOT", "CAD", "HACKATHONS", "CIRCUITS", "AI", "MAKE STUFF"];
  const doubled = [...words, ...words];
  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee-track">
        {doubled.map((w, i) => (
          <span key={i} className={i % 3 === 0 ? "hot" : ""}>
            {w} <span style={{ opacity: 0.4 }}>✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}

/* ---------- confetti burst on join click ---------- */
function useConfetti() {
  const [particles, setParticles] = useState([]);
  const idRef = useRef(0);

  const burst = useCallback((x, y) => {
    const colors = [COLORS.amber, COLORS.blueBright, COLORS.ice, COLORS.paper];
    const next = Array.from({ length: 24 }, () => {
      idRef.current += 1;
      return {
        id: idRef.current,
        x,
        y,
        size: 5 + Math.random() * 5,
        color: colors[Math.floor(Math.random() * colors.length)],
        round: Math.random() > 0.5,
        dx: (Math.random() - 0.5) * 300,
        dy: (Math.random() - 0.8) * 300,
        rot: Math.random() * 360,
      };
    });
    setParticles((p) => [...p, ...next]);
  }, []);

  const remove = useCallback((id) => {
    setParticles((p) => p.filter((particle) => particle.id !== id));
  }, []);

  const layer = (
    <div className="confetti-layer" aria-hidden="true">
      {particles.map((p) => (
        <div
          key={p.id}
          className="confetti-piece"
          onAnimationEnd={() => remove(p.id)}
          style={{
            left: p.x,
            top: p.y,
            width: p.size,
            height: p.size,
            background: p.color,
            borderRadius: p.round ? "50%" : "2px",
            "--dx": `${p.dx}px`,
            "--dy": `${p.dy}px`,
            "--rot": `${p.rot}deg`,
          }}
        />
      ))}
    </div>
  );

  return [burst, layer];
}

/* ---------- reveal wrapper ---------- */
function Reveal({ as: Tag = "div", className = "", children, ...rest }) {
  const [ref, visible] = useReveal();
  return (
    <Tag ref={ref} className={`reveal ${visible ? "in" : ""} ${className}`} {...rest}>
      {children}
    </Tag>
  );
}

/* ---------- nav mark (small triskelion, no drag) ---------- */
function BrandMark() {
  return (
    <img
      src="logo.png"
      alt="Technical Club logo"
      className="brand-svg"
      draggable="false"
    />
  );
}

/* ---------- sticker: a rotated speech-bubble / tag you can drop anywhere ---------- */
function Sticker({ text, style, tone = "amber", tail = "left" }) {
  return (
    <div className={`sticker sticker--${tone} tail-${tail}`} style={style}>
      {text}
    </div>
  );
}

/* ---------- featured photo, glitch-cuts between shots on an interval ---------- */
function GlitchFeature({ photos }) {
  const [index, setIndex] = useState(0);
  const [glitching, setGlitching] = useState(false);

  useEffect(() => {
    const t = setInterval(() => {
      setGlitching(true);
      setTimeout(() => {
        setIndex((i) => (i + 1) % photos.length);
        setGlitching(false);
      }, 380);
    }, 2000);
    return () => clearInterval(t);
  }, [photos.length]);

  const photo = photos[index];

  return (
    <div className={`glitch-photo ${glitching ? "glitching" : ""}`} style={{ "--img": photo.gradient }}>
      <div className="layer base" />
      <div className="layer red" />
      <div className="layer blue" />
      {photo.isPhoto && <div className="glass-sheen" />}
      <div className="scanlines" />
      <div className="glitch-caption mono">{photo.caption}</div>
      <div className="glitch-dots">
        {photos.map((_, i) => (
          <span key={i} className={i === index ? "on" : ""} />
        ))}
      </div>
    </div>
  );
}

/* ---------- corkboard polaroid grid ---------- */
function Polaroid({ caption, gradient, rotate, isPhoto }) {
  return (
    <div className="polaroid" style={{ transform: `rotate(${rotate}deg)` }}>
      <div className="polaroid-tape" />
      <div
        className={`polaroid-photo ${isPhoto ? "is-photo" : ""}`}
        style={{ background: gradient, backgroundSize: "cover", backgroundPosition: "center" }}
      >
        {isPhoto && <div className="glass-sheen" />}
      </div>
      <div className="polaroid-caption">{caption}</div>
    </div>
  );
}

/* ---------- PREDEFINED PHOTOS ----------
   Paste your own image URLs here. Each entry needs a `url` and a `caption`.
   Used for both the big glitch box and the corkboard polaroids below. */
const imgss = [
  { url: "1.jpeg", caption: "24HR BUILD SPRINT — SUNRISE FINISH" },
  { url: "2.jpeg", caption: "BOT ARENA FINALS — CROWD GOES LOUD" },
  { url: "3.jpeg", caption: "SOLDER & CHILL — FIRST BADGE EVER" },
  { url: "4.jpeg", caption: "HACKATHON WINNERS — TEAM CTRL+ALT" },
  { url: "1.jpeg", caption: "WORKSHOP BAY — 1AM PROTOTYPE MODE" },
  { url: "2.jpeg", caption: "3AM AND IT FINALLY WORKS" },
];

function Gallery() {
  const rotates = [-4, 3, -2, 5, -3, 2];

  const photos = imgss.map((img) => ({ caption: img.caption, gradient: `url(${img.url})`, isPhoto: true }));

  const board = imgss.map((img, i) => ({
    caption: img.caption,
    gradient: `url(${img.url})`,
    rotate: rotates[i % rotates.length],
    isPhoto: true,
  }));

  return (
    <section className="wrap" id="gallery">
      <Reveal className="section-head">
        <div className="eyebrow mono">Proof we actually have fun</div>
        <h2>The gallery, glitching in real time</h2>
        <p>Wins, fails, and everything soldered in between. Swap in your own event photos — the glitch transition and stickers do the rest.</p>
      </Reveal>

      <Reveal className="gallery-feature-wrap">
        <GlitchFeature photos={photos} />
        <Sticker text="SQUAD GOALS ✨" tone="amber" tail="left" style={{ top: "-18px", left: "-14px" }} />
        <Sticker text="WE WON! 🏆" tone="blue" tail="bottom" style={{ top: "10%", right: "-30px" }} />
        <Sticker text="NOM NOM CIRCUITS" tone="ice" tail="right" style={{ bottom: "-16px", left: "6%" }} />
      </Reveal>

      <Reveal className="corkboard">
        <Sticker text="LOL 😂" tone="amber" tail="top" style={{ top: "-22px", left: "18%" }} />
        <Sticker text="CHAOTIC GOOD" tone="blue" tail="top" style={{ top: "-24px", right: "10%" }} />
        {board.map((p) => (
          <Polaroid key={p.caption} {...p} />
        ))}
        <Sticker text="MORE COMING SOON →" tone="ice" tail="left" style={{ bottom: "-20px", right: "4%" }} />
      </Reveal>
    </section>
  );
}

/* ================= MAIN COMPONENT ================= */
 function TechnicalClub() {
  useWebFonts();
  const [menuOpen, setMenuOpen] = useState(false);
  const [burst, confettiLayer] = useConfetti();

  const events = [
    { date: "SAT · AUG 08", title: "24-Hour Build Sprint", tag: "Flagship", desc: "Teams get a mystery parts box and 24 hours. Whatever spins, blinks, or beeps by sunrise wins the trophy blade.", loc: "Workshop Bay", meta: "Teams of 4" },
    { date: "THU · AUG 20", title: "Solder & Chill", tag: "Beginner", desc: "Zero-experience-needed night. Learn to solder, build a blinking badge, keep the badge.", loc: "Lab 3", meta: "Open entry" },
    { date: "FRI · SEP 04", title: "Bot Arena Finals", tag: "Live", desc: "Semester's combat bots face off. Bring earplugs, bring snacks, bring your loudest cheer.", loc: "Main Court", meta: "All welcome" },
  ];

  const blades = [
    { glow: "#3fa9f5", title: "Hardware", tag: "Hands-on", desc: "Solder stations, motor drivers, and robots that occasionally listen to instructions. Build bots for the annual arena battle.",
      icon: <path d="M4 17V7l8-4 8 4v10l-8 4-8-4Zm0-10 8 4 8-4M12 11v10" stroke="#3fa9f5" strokeWidth="1.6" /> },
    { glow: "#ffb703", title: "Software", tag: "Ship weekly", desc: "Hackathons, open-source sprints, and apps born from \"wouldn't it be cool if...\" at 1am. Ship early, ship loud.",
      icon: <path d="M8 9l-5 3 5 3M16 9l5 3-5 3M13 5l-2 14" stroke="#ffb703" strokeWidth="1.6" /> },
    { glow: "#7ed957", title: "Digital Marketing", tag: "Get the word out", desc: "Campaigns, content, and campus buzz. Posters, socials, and hype videos that get people through the workshop door.",
      icon: <><circle cx="12" cy="12" r="8" stroke="#7ed957" strokeWidth="1.6" /><path d="M12 4v4M12 16v4M4 12h4M16 12h4" stroke="#7ed957" strokeWidth="1.6" /></> },
  ];

  const team = [
    { i: "V", name: "valiki", role: "President", ang: "0deg" },
    { i: "SM", name: "Sana M.", role: "Hardware Lead", ang: "60deg" },
    { i: "KV", name: "Kabir V.", role: "Code Lead", ang: "150deg" },
    { i: "PN", name: "Priya N.", role: "Design Lead", ang: "240deg" },
  ];

  const handleJoinClick = (e) => {
    e.preventDefault();
    burst(e.clientX, e.clientY);
  };

  return (
    <div className="tc-root">
      <style>{`
        :root{
          --navy-deep:${COLORS.navyDeep}; --navy:${COLORS.navy}; --blue:${COLORS.blue};
          --blue-bright:${COLORS.blueBright}; --ice:${COLORS.ice}; --amber:${COLORS.amber};
          --paper:${COLORS.paper}; --line:${COLORS.line}; --maxw:1200px;
        }
        .tc-root{ background:var(--navy-deep); color:var(--paper); font-family:'Inter',sans-serif; position:relative; overflow-x:hidden; }
        .tc-root *{ box-sizing:border-box; }
        .tc-root h1,.tc-root h2,.tc-root h3{ font-family:'Chakra Petch',sans-serif; text-transform:uppercase; letter-spacing:0.01em; margin:0; }
        .mono{ font-family:'JetBrains Mono',monospace; }
        .tc-root a{ color:inherit; text-decoration:none; }

        .grid-bg{ position:fixed; inset:0; z-index:0; pointer-events:none;
          background-image:linear-gradient(var(--line) 1px, transparent 1px), linear-gradient(90deg, var(--line) 1px, transparent 1px);
          background-size:48px 48px;
          -webkit-mask-image:radial-gradient(circle at 50% 20%, black 0%, black 40%, transparent 85%);
          mask-image:radial-gradient(circle at 50% 20%, black 0%, black 40%, transparent 85%);
        }
        section{ position:relative; z-index:1; }

        header{ position:fixed; top:0; left:0; right:0; z-index:50; display:flex; align-items:center; justify-content:space-between;
          padding:16px clamp(20px,5vw,56px); background:linear-gradient(180deg, rgba(8,27,48,0.92), rgba(8,27,48,0.6));
          backdrop-filter:blur(10px); border-bottom:1px solid var(--line); }
        .brand{ display:flex; align-items:center; gap:12px; }
        .brand-svg{ width:38px; height:38px; object-fit:contain; transition:transform .5s cubic-bezier(.2,.8,.2,1); }
        .brand:hover .brand-svg{ transform:rotate(160deg); }
        .brand-text{ font-family:'Chakra Petch'; font-weight:700; letter-spacing:0.06em; font-size:1.02rem; }
        .brand-text span{ color:var(--amber); }
        nav ul{ display:flex; gap:clamp(14px,2vw,34px); list-style:none; margin:0; padding:0; }
        nav a{ font-family:'JetBrains Mono'; font-size:0.8rem; text-transform:uppercase; letter-spacing:0.08em; color:var(--ice);
          opacity:0.75; position:relative; padding:6px 2px; transition:opacity .2s; }
        nav a:hover{ opacity:1; }
        nav a::after{ content:""; position:absolute; left:0; bottom:0; height:2px; width:0; background:var(--amber); transition:width .25s ease; }
        nav a:hover::after{ width:100%; }
        .nav-links{ display:flex; align-items:center; gap:30px; }
        .btn{ display:inline-flex; align-items:center; gap:8px; font-family:'JetBrains Mono'; font-size:0.78rem; text-transform:uppercase;
          letter-spacing:0.06em; padding:11px 22px; border-radius:999px; border:1px solid var(--amber); color:var(--navy-deep);
          background:var(--amber); cursor:pointer; transition:transform .2s ease, box-shadow .2s ease, background .2s; white-space:nowrap; }
        .btn:hover{ transform:translateY(-2px); box-shadow:0 10px 24px rgba(255,183,3,0.3); }
        .btn.ghost{ background:transparent; color:var(--amber); }
        .btn.ghost:hover{ background:rgba(255,183,3,0.1); }
        .burger{ display:none; width:26px; height:20px; position:relative; cursor:pointer; background:none; border:none; }
        .burger span{ position:absolute; left:0; right:0; height:2px; background:var(--ice); transition:.3s; }
        .burger span:nth-child(1){ top:0; } .burger span:nth-child(2){ top:9px; } .burger span:nth-child(3){ top:18px; }
        .burger.open span:nth-child(1){ transform:translateY(9px) rotate(45deg); }
        .burger.open span:nth-child(2){ opacity:0; }
        .burger.open span:nth-child(3){ transform:translateY(-9px) rotate(-45deg); }

        .hero{ min-height:100vh; display:flex; align-items:center; justify-content:center; padding:140px 24px 80px; position:relative; }
        .hero-inner{ max-width:var(--maxw); width:100%; display:grid; grid-template-columns:1.1fr 0.9fr; gap:40px; align-items:center; }
        .eyebrow{ font-family:'JetBrains Mono'; font-size:0.78rem; letter-spacing:0.18em; color:var(--amber); text-transform:uppercase;
          margin-bottom:18px; display:flex; align-items:center; gap:10px; }
        .eyebrow::before{ content:""; width:26px; height:1px; background:var(--amber); display:inline-block; }
        .hero h1{ font-size:clamp(2.6rem, 6.4vw, 4.6rem); line-height:1.02; font-weight:700; }
        .hero h1 .line2{ color:var(--blue-bright); }
        .hero p{ font-size:1.08rem; color:var(--ice); opacity:0.85; max-width:46ch; margin:22px 0 30px; line-height:1.6; }
        .hero-ctas{ display:flex; gap:16px; flex-wrap:wrap; }
        .hero-visual{ position:relative; display:flex; align-items:center; justify-content:center; }
        .rig{ position:relative; width:min(500px,92vw); aspect-ratio:1; touch-action:none; cursor:grab; }
        .rig:active{ cursor:grabbing; }
        .rig-ring{ position:absolute; inset:0; border-radius:50%; border:1px dashed rgba(191,230,255,0.25); animation:spin-slow 40s linear infinite; }
        .rig-ring.r2{ inset:38px; border-color:rgba(255,183,3,0.2); animation-duration:60s; animation-direction:reverse; }
        @keyframes spin-slow{ to{ transform:rotate(360deg); } }
        .rig-glow{ position:absolute; inset:10%; border-radius:50%; pointer-events:none;
          background:radial-gradient(circle, rgba(63,169,245,0.28) 0%, rgba(255,183,3,0.08) 45%, transparent 72%);
          filter:blur(6px); }
        .rig-hex{ position:absolute; inset:0; pointer-events:none; }
        .rig-logo-wrap{ position:absolute; top:50%; left:50%; width:100%; height:100%; transform:translate(-50%,-50%); pointer-events:none;display:flex;justify-content:center;align-items:center }
        .rig-logo{ position:absolute; inset:0; width:100%; height:100%; object-fit:contain;
          will-change:transform; user-select:none; -webkit-user-drag:none; pointer-events:none;
          filter:drop-shadow(0 22px 44px rgba(0,0,0,0.55)) drop-shadow(0 0 26px rgba(63,169,245,0.25)); }
        .spin-hint{ position:absolute; bottom:-6px; left:50%; transform:translateX(-50%); font-family:'JetBrains Mono'; font-size:0.68rem;
          letter-spacing:0.1em; color:var(--ice); opacity:0.55; white-space:nowrap; }
        .scroll-cue{ position:absolute; bottom:28px; left:50%; transform:translateX(-50%); display:flex; flex-direction:column;
          align-items:center; gap:8px; font-family:'JetBrains Mono'; font-size:0.7rem; letter-spacing:0.15em; color:var(--ice); opacity:0.6; }
        .scroll-cue .stick{ width:1px; height:34px; background:linear-gradient(var(--amber),transparent); animation:cue 1.8s ease-in-out infinite; }
        @keyframes cue{ 0%{opacity:.2;transform:scaleY(.4);} 50%{opacity:1;transform:scaleY(1);} 100%{opacity:.2;transform:scaleY(.4);} }

        .marquee{ background:var(--navy); border-top:1px solid var(--line); border-bottom:1px solid var(--line); padding:16px 0; overflow:hidden; white-space:nowrap; }
        .marquee-track{ display:inline-flex; gap:0; animation:marquee 26s linear infinite; }
        .marquee-track span{ font-family:'Chakra Petch'; font-weight:600; font-size:1.1rem; letter-spacing:0.05em; padding:0 28px;
          color:var(--ice); opacity:0.85; text-transform:uppercase; display:inline-flex; align-items:center; gap:28px; }
        .marquee-track span.hot{ color:var(--amber); }
        @keyframes marquee{ from{ transform:translateX(0); } to{ transform:translateX(-50%); } }

        .wrap{ max-width:var(--maxw); margin:0 auto; padding:120px 24px; }
        .section-head{ margin-bottom:56px; max-width:60ch; }
        .section-head .eyebrow{ margin-bottom:14px; }
        .section-head h2{ font-size:clamp(1.8rem,3.6vw,2.6rem); }
        .section-head p{ color:var(--ice); opacity:0.75; margin-top:14px; line-height:1.6; font-size:1.02rem; }

        .reveal{ opacity:0; transform:translateY(28px); transition:opacity .7s ease, transform .7s cubic-bezier(.2,.7,.3,1); }
        .reveal.in{ opacity:1; transform:translateY(0); }

        .stats{ display:grid; grid-template-columns:repeat(4,1fr); gap:20px; }
        .stat-hex{ position:relative; padding:30px 20px 26px; text-align:center;
          background:linear-gradient(160deg, rgba(31,111,178,0.16), rgba(15,44,76,0.5));
          clip-path:polygon(50% 0%, 95% 25%, 95% 75%, 50% 100%, 5% 75%, 5% 25%); border:1px solid var(--line);
          transition:transform .3s ease, background .3s ease; }
        .stat-hex:hover{ transform:translateY(-6px); background:linear-gradient(160deg, rgba(31,111,178,0.3), rgba(15,44,76,0.6)); }
        .stat-num{ font-family:'Chakra Petch'; font-weight:700; font-size:2.4rem; color:var(--amber); }
        .stat-label{ font-family:'JetBrains Mono'; font-size:0.72rem; letter-spacing:0.08em; text-transform:uppercase; color:var(--ice); opacity:0.75; margin-top:6px; }

        .blades{ display:grid; grid-template-columns:repeat(3,1fr); gap:24px; }
        .blade-card{ padding:34px 26px; border:1px solid var(--line); border-radius:18px; background:rgba(255,255,255,0.02);
          position:relative; overflow:hidden; transition:transform .35s cubic-bezier(.2,.8,.2,1), border-color .35s; }
        .blade-card::before{ content:""; position:absolute; top:-40%; right:-40%; width:70%; height:70%;
          background:radial-gradient(circle, var(--blade-glow,var(--blue)) 0%, transparent 70%); opacity:0.25; transition:opacity .35s; }
        .blade-card:hover{ transform:translateY(-8px) rotate(-0.5deg); border-color:var(--blade-glow,var(--blue-bright)); }
        .blade-card:hover::before{ opacity:0.5; }
        .blade-icon{ width:52px; height:52px; margin-bottom:20px; }
        .blade-card h3{ font-size:1.3rem; margin-bottom:10px; color:var(--paper); position:relative; display:inline-block; overflow:hidden; }
        .blade-card h3 .title-text{ display:inline-block; background:linear-gradient(90deg, var(--paper) 0%, var(--paper) 40%, var(--blade-glow,var(--blue-bright)) 50%, var(--paper) 60%, var(--paper) 100%);
          background-size:250% 100%; background-position:100% 0; -webkit-background-clip:text; background-clip:text; color:transparent;
          animation:title-sheen 3.2s ease-in-out infinite; animation-delay:var(--blade-delay,0s); }
        @keyframes title-sheen{ 0%{ background-position:180% 0; } 55%{ background-position:-40% 0; } 100%{ background-position:-40% 0; } }
        .blade-card p{ color:var(--ice); opacity:0.8; line-height:1.6; font-size:0.96rem; }
        .blade-tag{ display:inline-block; margin-top:18px; font-family:'JetBrains Mono'; font-size:0.7rem; letter-spacing:0.08em;
          text-transform:uppercase; color:var(--blade-glow,var(--blue-bright)); border:1px solid currentColor; padding:4px 10px; border-radius:999px; }

        .events{ display:grid; grid-template-columns:repeat(3,1fr); gap:22px; }
        .event-card{ border:1px solid var(--line); border-radius:14px; overflow:hidden; background:rgba(255,255,255,0.02); }
        .event-top{ padding:22px 22px 60px; position:relative; background:linear-gradient(135deg, var(--navy), rgba(31,111,178,0.35)); }
        .event-date{ font-family:'JetBrains Mono'; font-size:0.72rem; letter-spacing:0.1em; color:var(--amber); text-transform:uppercase; }
        .event-top h3{ margin-top:10px; font-size:1.22rem; line-height:1.25; }
        .event-tag{ position:absolute; bottom:-14px; left:22px; background:var(--amber); color:var(--navy-deep); font-family:'JetBrains Mono';
          font-size:0.68rem; font-weight:700; letter-spacing:0.06em; padding:6px 12px; border-radius:8px; text-transform:uppercase; }
        .event-bottom{ padding:26px 22px 22px; }
        .event-bottom p{ color:var(--ice); opacity:0.78; font-size:0.92rem; line-height:1.55; }
        .event-meta{ display:flex; justify-content:space-between; margin-top:18px; font-family:'JetBrains Mono'; font-size:0.72rem; color:var(--ice); opacity:0.6; }

        /* ---- gallery: glitch feature ---- */
        .gallery-feature-wrap{ position:relative; max-width:640px; margin:0 auto 90px; }
        .glitch-photo{ position:relative; width:100%; aspect-ratio:16/10; border-radius:16px; overflow:hidden;
          border:1px solid var(--line); box-shadow:0 30px 70px rgba(0,0,0,0.45); background:var(--img);
          background-size:cover; background-position:center; }
        .glitch-photo .layer{ position:absolute; inset:0; background:var(--img); background-size:cover; background-position:center; }
        .glitch-photo .layer.base{ z-index:1; }
        .glitch-photo .glass-sheen{ position:absolute; inset:0; z-index:2.5; pointer-events:none;
          background:linear-gradient(155deg, rgba(63,169,245,0.16) 0%, rgba(8,27,48,0.05) 35%, rgba(8,27,48,0.4) 100%);
          box-shadow: inset 0 0 0 1px rgba(191,230,255,0.22), inset 0 30px 60px rgba(8,27,48,0.35);
        }
        .glitch-photo .layer.red{ z-index:2; opacity:0; mix-blend-mode:screen; filter:saturate(3) hue-rotate(-40deg); }
        .glitch-photo .layer.blue{ z-index:2; opacity:0; mix-blend-mode:screen; filter:saturate(3) hue-rotate(150deg); }
        .glitch-photo .scanlines{ position:absolute; inset:0; z-index:3; pointer-events:none;
          background:repeating-linear-gradient(0deg, rgba(0,0,0,0.12) 0 1px, transparent 1px 3px); mix-blend-mode:overlay; }
        .glitch-caption{ position:absolute; left:16px; bottom:14px; z-index:4; font-size:0.72rem; letter-spacing:0.08em;
          color:var(--paper); background:rgba(8,27,48,0.55); padding:7px 12px; border-radius:999px; border:1px solid var(--line);
          text-transform:uppercase; backdrop-filter:blur(4px); }
        .glitch-dots{ position:absolute; right:14px; top:14px; z-index:4; display:flex; gap:6px; }
        .glitch-dots span{ width:7px; height:7px; border-radius:50%; background:rgba(238,244,249,0.35); transition:background .3s; }
        .glitch-dots span.on{ background:var(--amber); }
        .glitching .layer.base{ animation:glitchSlice 380ms steps(4) both; }
        .glitching .layer.red{ animation:glitchR 380ms steps(4) both; }
        .glitching .layer.blue{ animation:glitchB 380ms steps(4) both; }
        @keyframes glitchSlice{
          0%{ clip-path:inset(0 0 0 0); transform:translate(0,0); }
          20%{ clip-path:inset(10% 0 60% 0); transform:translate(-10px,0); }
          40%{ clip-path:inset(60% 0 5% 0); transform:translate(8px,0); }
          60%{ clip-path:inset(30% 0 40% 0); transform:translate(-6px,0); }
          80%{ clip-path:inset(5% 0 70% 0); transform:translate(4px,0); }
          100%{ clip-path:inset(0 0 0 0); transform:translate(0,0); }
        }
        @keyframes glitchR{
          0%{ opacity:0; transform:translateX(0); } 25%{ opacity:.75; transform:translateX(8px); }
          50%{ opacity:.6; transform:translateX(-5px); } 75%{ opacity:.7; transform:translateX(6px); }
          100%{ opacity:0; transform:translateX(0); }
        }
        @keyframes glitchB{
          0%{ opacity:0; transform:translateX(0); } 25%{ opacity:.75; transform:translateX(-8px); }
          50%{ opacity:.6; transform:translateX(5px); } 75%{ opacity:.7; transform:translateX(-6px); }
          100%{ opacity:0; transform:translateX(0); }
        }

        /* ---- gallery: stickers ---- */
        .sticker{ position:absolute; z-index:6; font-family:'Permanent Marker',cursive; font-size:0.92rem;
          padding:10px 16px; border-radius:20px; line-height:1.1; white-space:nowrap; transform:rotate(-6deg);
          box-shadow:0 10px 22px rgba(0,0,0,0.35); border:2px solid var(--navy-deep); }
        .sticker--amber{ background:var(--amber); color:var(--navy-deep); }
        .sticker--blue{ background:var(--blue-bright); color:var(--navy-deep); }
        .sticker--ice{ background:var(--paper); color:var(--navy-deep); }
        .sticker.tail-left::after, .sticker.tail-right::after, .sticker.tail-bottom::after, .sticker.tail-top::after{
          content:""; position:absolute; width:14px; height:14px; background:inherit; border:2px solid var(--navy-deep);
          border-top:none; border-left:none;
        }
        .sticker.tail-left::after{ left:14px; bottom:-9px; transform:rotate(45deg); border-right:none; border-bottom-color:var(--navy-deep); }
        .sticker.tail-right::after{ right:14px; bottom:-9px; transform:rotate(45deg); }
        .sticker.tail-bottom::after{ left:50%; bottom:-9px; transform:translateX(-50%) rotate(45deg); }
        .sticker.tail-top::after{ left:50%; top:-9px; transform:translateX(-50%) rotate(225deg); }

        /* ---- gallery: corkboard ---- */
        .corkboard{ position:relative; padding:50px clamp(16px,4vw,50px) 44px; border-radius:22px;
          background:
            radial-gradient(circle at 20% 20%, rgba(255,255,255,0.03), transparent 60%),
            repeating-linear-gradient(45deg, rgba(255,255,255,0.015) 0 2px, transparent 2px 14px),
            var(--navy);
          border:1px solid var(--line);
          display:flex; flex-wrap:wrap; gap:28px 22px; justify-content:center; }
        .polaroid{ background:var(--paper); padding:14px 14px 34px; border-radius:4px; width:180px;
          box-shadow:0 16px 30px rgba(0,0,0,0.4); position:relative; transition:transform .3s ease, z-index 0s; }
        .polaroid:hover{ transform:rotate(0deg) scale(1.06) translateY(-4px) !important; z-index:5; }
        .polaroid-photo{ width:100%; aspect-ratio:1/1; border-radius:2px; position:relative; overflow:hidden; }
        .polaroid-photo.is-photo .glass-sheen{ position:absolute; inset:0;
          background:linear-gradient(155deg, rgba(63,169,245,0.14) 0%, rgba(8,27,48,0.02) 40%, rgba(8,27,48,0.3) 100%);
          box-shadow: inset 0 0 0 1px rgba(191,230,255,0.18); }
        .polaroid-caption{ font-family:'Permanent Marker',cursive; color:var(--navy-deep); font-size:0.78rem;
          text-align:center; margin-top:10px; line-height:1.25; }

        .polaroid-tape{ position:absolute; top:-10px; left:50%; transform:translateX(-50%) rotate(-3deg);
          width:56px; height:20px; background:rgba(255,183,3,0.55); border:1px solid rgba(255,183,3,0.7); }

        .team-grid{ display:grid; grid-template-columns:repeat(4,1fr); gap:22px; }
        .team-card{ text-align:center; }
        .avatar{ width:100%; aspect-ratio:1; border-radius:50%; position:relative; margin-bottom:16px;
          display:flex; align-items:center; justify-content:center; transition:transform .4s ease; }
        
        .avatar span{ position:relative; font-family:'Chakra Petch'; font-weight:700; font-size:1.6rem; color:var(--paper); }
        .team-card:hover .avatar{ transform:rotate(20deg) scale(1.04); }
        .team-card h4{ font-size:1.02rem; margin-bottom:2px; }
        .team-card .role{ font-family:'JetBrains Mono'; font-size:0.72rem; color:var(--amber); text-transform:uppercase; letter-spacing:0.06em; }

        .join{ position:relative; border-radius:26px; background:linear-gradient(135deg, var(--navy), var(--blue) 120%);
          padding:70px clamp(24px,6vw,80px); overflow:hidden; text-align:center; }
        .join::before{ content:""; position:absolute; inset:0; background:repeating-linear-gradient(45deg, rgba(255,255,255,0.03) 0 2px, transparent 2px 26px); pointer-events:none; }
        .join h2{ font-size:clamp(2rem,5vw,3.2rem); }
        .join p{ color:var(--ice); opacity:0.85; max-width:52ch; margin:16px auto 30px; }
        .join .btn{ padding:15px 32px; font-size:0.85rem; }

        footer{ border-top:1px solid var(--line); padding:40px 24px; display:flex; justify-content:space-between; align-items:center;
          flex-wrap:wrap; gap:16px; font-family:'JetBrains Mono'; font-size:0.76rem; color:var(--ice); opacity:0.6; position:relative; z-index:1; }

        .mobile-panel{ position:fixed; top:70px; left:0; right:0; z-index:49; background:var(--navy-deep); border-bottom:1px solid var(--line);
          padding:20px 24px 30px; display:none; flex-direction:column; gap:18px; }
        .mobile-panel.open{ display:flex; }
        .mobile-panel a{ font-family:'JetBrains Mono'; text-transform:uppercase; letter-spacing:0.08em; font-size:0.92rem; color:var(--ice); }

        .confetti-layer{ position:fixed; inset:0; pointer-events:none; z-index:999; }
        .confetti-piece{ position:fixed; animation:burst 900ms cubic-bezier(.2,.7,.3,1) forwards; }
        @keyframes burst{ from{ transform:translate(0,0) rotate(0deg); opacity:1; } to{ transform:translate(var(--dx), var(--dy)) rotate(var(--rot)); opacity:0; } }

        @media (max-width:920px){
          nav ul{ display:none; } .burger{ display:block; }
          .hero-inner{ grid-template-columns:1fr; text-align:center; }
          .eyebrow{ justify-content:center; } .hero p{ margin-left:auto; margin-right:auto; } .hero-ctas{ justify-content:center; }
          .stats{ grid-template-columns:repeat(2,1fr); } .blades{ grid-template-columns:1fr; } .events{ grid-template-columns:1fr; }
          .team-grid{ grid-template-columns:repeat(2,1fr); } .wrap{ padding:80px 20px; }
          .gallery-feature-wrap{ margin-bottom:70px; }
          .sticker{ font-size:0.78rem; padding:8px 12px; }
          .polaroid{ width:140px; }
        }
        @media (prefers-reduced-motion: reduce){
          .tc-root *{ animation-duration:0.001ms !important; animation-iteration-count:1 !important; transition-duration:0.001ms !important; }
        }
      `}</style>
{console.log("hello")}
      <div className="grid-bg" />

      <header>
        <a href="#top" className="brand">
          <BrandMark />
          <span className="brand-text">
            TECHNICAL<span>.</span>CLUB
          </span>
        </a>
        <nav>
          <ul>
            <li><a href="#blades">What We Do</a></li>
            <li><a href="#events">Events</a></li>
            <li><Link to={"/gallery"}>gallery</Link></li>
            <li><a href="#team">Team</a></li>
            <li><a href="#join">Join</a></li>
          </ul>
        </nav>
        <div className="nav-links">
          <a href="#join" className="btn">Join the Club</a>
          <button className={`burger ${menuOpen ? "open" : ""}`} aria-label="Menu" onClick={() => setMenuOpen((v) => !v)}>
            <span></span><span></span><span></span>
          </button>
        </div>
      </header>

      <div className={`mobile-panel ${menuOpen ? "open" : ""}`}>
        <a href="#blades" onClick={() => setMenuOpen(false)}>What We Do</a>
        <a href="#events" onClick={() => setMenuOpen(false)}>Events</a>
        <a href="#gallery" onClick={() => setMenuOpen(false)}>Gallery</a>
        <a href="#team" onClick={() => setMenuOpen(false)}>Team</a>
        <a href="#join" onClick={() => setMenuOpen(false)}>Join</a>
      </div>

      <section className="hero" id="top">
        <div className="hero-inner">
          <div>
            <div className="eyebrow mono">Est. campus workshop, est. chaos</div>
            <h1>
              WE BUILD THINGS<br />
              THAT <span className="line2">SPIN, BLINK</span><br />
              &amp; BREAK (ON PURPOSE)
            </h1>
            <p>Technical Club is where circuits meet curiosity. Robotics, code, CAD, and questionable 3am prototypes — three blades, one thrust, zero boring meetings.</p>
            <div className="hero-ctas">
              <a href="#join" className="btn">Join the Club →</a>
              <a href="#events" className="btn ghost">See Upcoming Builds</a>
            </div>
          </div>
          <div className="hero-visual">
            <Triskelion />
          </div>
        </div>
        <div className="scroll-cue"><span>SCROLL</span><span className="stick"></span></div>
      </section>

      <Marquee />

    { /* <section className="wrap" id="about">
        <div className="stats reveal in">
          <StatHex target={340} label="Active Members" />
          <StatHex target={52} label="Projects Shipped" />
          <StatHex target={18} label="Events / Year" />
          <StatHex target={6} label="Coffee Machines Fixed*" />
        </div>
      </section>
*/}
      <Gallery />
      <section className="wrap" id="blades">
        <Reveal className="section-head">
          <div className="eyebrow mono">The three blades</div>
          <h2>One club. Three directions.<br />Same center of gravity.</h2>
          <p>Just like the mark on our badge, everything we do spins out from one core: making things, together. Pick a blade — or spin through all three.</p>
        </Reveal>
        <Reveal className="blades" as="div">
          {blades.map((b, i) => (
            <div className="blade-card" style={{ "--blade-glow": b.glow, "--blade-delay": `${i * 0.4}s` }} key={b.title}>
              <svg className="blade-icon" viewBox="0 0 24 24" fill="none">{b.icon}</svg>
              <h3><span className="title-text">{b.title}</span></h3>
              <p>{b.desc}</p>
              <span className="blade-tag">{b.tag}</span>
            </div>
          ))}
        </Reveal>
      </section>

      <section className="wrap" id="events">
        <Reveal className="section-head">
          <div className="eyebrow mono">On the calendar</div>
          <h2>Upcoming builds &amp; meetups</h2>
          <p>No boring lectures — every session ends with something that lights up, moves, or (occasionally) smokes a little.</p>
        </Reveal>
        <Reveal className="events">
          {events.map((ev) => (
            <div className="event-card" key={ev.title}>
              <div className="event-top">
                <div className="event-date mono">{ev.date}</div>
                <h3>{ev.title}</h3>
                <span className="event-tag">{ev.tag}</span>
              </div>
              <div className="event-bottom">
                <p>{ev.desc}</p>
                <div className="event-meta"><span>{ev.loc}</span><span>{ev.meta}</span></div>
              </div>
            </div>
          ))}
        </Reveal>
      </section>

     

      <section className="wrap" id="team">
        <Reveal className="section-head">
          <div className="eyebrow mono">Core crew</div>
          <h2>The people keeping the blades spinning</h2>
          <p>Every core member runs one of the three blades — plus a rotating cast of a few hundred members making things weekly.</p>
        </Reveal>
        <Reveal className="team-grid">
          {team.map((t) => (
            <div className="team-card" key={t.i}>
              <div
                className="avatar"
                style={{ backgroundImage: `url(valiki.png)` , backgroundSize: 'contain',
  backgroundPosition: 'center'  }}
              >
                <span>{t.i}</span>
              </div>
              <h4>{t.name}</h4>
              <div className="role">{t.role}</div>
            </div>
          ))}
        </Reveal>
      </section>

      <section className="wrap" id="join">
        <Reveal className="join">
          <div className="eyebrow mono" style={{ justifyContent: "center" }}>No experience required</div>
          <h2>Come spin something up with us</h2>
          <p>Bring curiosity, we'll supply the solder, the snacks, and the slightly-too-loud music. Meetings every Thursday, 6 PM, Workshop Bay.</p>
          <a href="#" className="btn" onClick={handleJoinClick}>Grab a Membership Card</a>
        </Reveal>
      </section>

      <footer>
        <div className="brand-text">TECHNICAL<span style={{ color: "var(--amber)" }}>.</span>CLUB</div>
        <div>Made by members, for members · © 2026</div>
      </footer>

      {confettiLayer}
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<TechnicalClub />} />
      <Route path="/gallery" element={<GalleryPage />} />
     
    </Routes>
  );
}

export default App;