 import React, { useEffect, useRef, useState, useCallback } from "react";
 import { Routes, Route } from "react-router-dom";
 import { Link } from "react-router-dom";
 import './Home.css'
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
        
         <Link to={"/gallery"} onClick={() => setMenuOpen(false)}>gallery</Link>
        <a href="#team" onClick={() => setMenuOpen(false)}>Team</a>
        <Link to={"/join"} onClick={() => setMenuOpen(false)}>Join</Link>
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
export default TechnicalClub;