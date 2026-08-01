import React, { useEffect, useRef, useState, useCallback, lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { Link } from "react-router-dom";
import PillNav from './PillNav';
import BorderGlow from './BorderGlow';
import './Home.css';

const GridScan = lazy(() => import('./GridScan'));
const CircularGallery = lazy(() => import('./CircularGallery'));
const MagicBento = lazy(() => import('./MagicBento'));
const EventModal = lazy(() => import('./EventModal'));
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
   const galleryItems = [
     { image: "gallery_1.jpeg", text: "" },
     { image: "gallery_2.jpeg", text: "" },
     { image: "gallery_3.jpeg", text: "" },
     { image: "gallery_4.jpeg", text: "" },
     { image: "gallery_5.jpeg", text: "" },
     { image: "gallery_6.jpeg", text: "" },
     { image: "gallery_7.jpeg", text: "" },
     { image: "gallery_8.jpeg", text: "" },
     { image: "gallery_9.jpeg", text: "" },
     { image: "gallery_10.jpeg", text: "" },
     { image: "gallery_11.jpeg", text: "" },
     { image: "gallery_12.jpeg", text: "" },
     { image: "gallery_13.jpeg", text: "" },
     { image: "gallery_14.jpeg", text: "" },
     { image: "gallery_15.jpeg", text: "" },
     { image: "gallery_16.jpeg", text: "" },
     { image: "gallery_17.jpeg", text: "" }
   ];
 
   return (
     <section id="gallery" style={{ padding: '100px 0', overflow: 'hidden' }}>
       <div className="wrap" style={{ paddingBottom: '30px' }}>
         <Reveal className="section-head">
           <div className="eyebrow mono">Proof we actually have fun</div>
           <h2>The gallery in motion</h2>
           <p>Wins, fails, and everything soldered in between. Drag or scroll to navigate through the 3D gallery.</p>
         </Reveal>
       </div>
 
       <Reveal
         className="circular-gallery-full-wrap"
         style={{
           width: '100vw',
           position: 'relative',
           left: '50%',
           right: '50%',
           marginLeft: '-50vw',
           marginRight: '-50vw',
           height: '520px',
           overflow: 'hidden'
         }}
       >
         <Suspense fallback={null}>
           <CircularGallery
             items={galleryItems}
             bend={1}
             textColor="#ffffff"
             borderRadius={0.05}
             scrollEase={0.05}
             fontUrl="https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@700&display=swap"
             font="bold 26px Chakra Petch"
           />
         </Suspense>
       </Reveal>
     </section>
   );
 }
 
 function TechnicalClub() {
  useWebFonts();
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [burst, confettiLayer] = useConfetti();

  const events = [
    {
      date: "COMPLETED",
      title: "ROBO DRIVE",
      tag: "Robotics",
      desc: "Contestants built their own RC cars from scratch and had to navigate a challenging obstacle course. Precision driving, custom builds, and engineering skill were tested in this high-energy competition.",
      loc: "Main Court",
      meta: "Teams",
      glowColor: "255, 183, 3",
      highlights: [
        "Hand-built RC cars from custom chassis and electronics",
        "Multi-stage obstacle course with increasing difficulty"
      ],
      images: []
    },
    {
      date: "COMPLETED",
      title: "PIXEL PANORAMA",
      tag: "Creative",
      desc: "A video editing workshop and challenge rolled into one. Participants learned professional editing techniques and then put their skills to the test by creating a compelling short video under a time limit.",
      loc: "Media Lab",
      meta: "Individual",
      glowColor: "63, 169, 245",
      highlights: [
        "Hands-on workshop covering editing techniques and effects",
        "Live challenge with a time limit and theme reveal"
      ],
      images: []
    },
    {
      date: "COMPLETED",
      title: "GRANDMASTERS JEOPARDY",
      tag: "Quiz",
      desc: "An epic Marvel-themed Jeopardy showdown where teams competed across categories spanning tech, trivia, and the MCU. Fast buzzers, fierce competition, and a whole lot of pop culture chaos.",
      loc: "Seminar Hall",
      meta: "Teams of 3",
      glowColor: "192, 132, 252",
      highlights: [
        "Marvel-themed categories across tech and pop culture",
        "Live buzzer rounds with surprise bonus challenges"
      ],
      images: []
    },
    {
      date: "COMPLETED",
      title: "ROBO MANIA",
      tag: "Workshop",
      desc: "A deep dive into robotics, electronics, and embedded systems. Members got hands-on experience with sensors, motors, and microcontrollers — learning how to build and program robots from the ground up.",
      loc: "Workshop Bay",
      meta: "Open entry",
      glowColor: "126, 217, 87",
      highlights: [
        "Beginner-friendly sessions on circuits and microcontrollers",
        "Build and program your own mini robot from scratch"
      ],
      images: []
    },
    {
      date: "COMING SOON",
      title: "COMING SOON",
      tag: "TBA",
      desc: "Something exciting is in the works. Stay tuned for the next Technical Club event — follow our socials to be the first to know.",
      loc: "TBA",
      meta: "TBA",
      glowColor: "56, 189, 248",
      highlights: [],
      images: []
    },
    {
      date: "COMING SOON",
      title: "COMING SOON",
      tag: "TBA",
      desc: "Another event is being planned by the team. Keep an eye on our announcements — it's going to be worth the wait.",
      loc: "TBA",
      meta: "TBA",
      glowColor: "244, 114, 182",
      highlights: [],
      images: []
    },
  ];

  const blades = [
    {
      glow: "#3fa9f5",
      glowColor: "205 92 60",
      colors: ['#3fa9f5', '#1f6fb2', '#bfe6ff'],
      title: "HARDWARE",
      tag: "HANDS-ON",
      desc: "Solder stations, motor drivers, and robots that occasionally listen to instructions. Build bots for the annual arena battle.",
      icon: <path d="M4 17V7l8-4 8 4v10l-8 4-8-4Zm0-10 8 4 8-4M12 11v10" stroke="#3fa9f5" strokeWidth="2.2" />
    },
    {
      glow: "#ffb703",
      glowColor: "43 100 51",
      colors: ['#ffb703', '#ff8800', '#ffe066'],
      title: "SOFTWARE",
      highlight: "E",
      tag: "SHIP WEEKLY",
      desc: "Hackathons, open-source sprints, and apps born from \"wouldn't it be cool if...\" at 1am. Ship early, ship loud.",
      icon: <path d="M8 9l-5 3 5 3M16 9l5 3-5 3M13 5l-2 14" stroke="#ffb703" strokeWidth="2.2" />
    },
    {
      glow: "#7ed957",
      glowColor: "100 63 60",
      colors: ['#7ed957', '#4caf50', '#a8f087'],
      title: "DIGITAL MARKETING",
      tag: "GET THE WORD OUT",
      desc: "Campaigns, content, and campus buzz. Posters, socials, and hype videos that get people through the workshop door.",
      icon: <><circle cx="12" cy="12" r="8" stroke="#7ed957" strokeWidth="2.2" /><path d="M12 4v4M12 16v4M4 12h4M16 12h4" stroke="#7ed957" strokeWidth="2.2" /></>
    },
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

      <PillNav
        logo="logo.png"
        logoAlt="Technical Club Logo"
        items={[
          { label: 'What We Do', href: '#blades' },
          { label: 'Events', href: '#events' },
          { label: 'Gallery', href: '/gallery' },
          { label: 'Team', href: '#team' },
          { label: 'Join', href: '#join' }
        ]}
        baseColor="#000000"
        pillColor="#ffffff"
        pillTextColor="#000000"
        hoveredPillTextColor="#ffffff"
        ease="power3.easeOut"
        initialLoadAnimation
      />

      <section className="hero" id="top">
        <div className="hero-gridscan-bg">
          <Suspense fallback={null}>
            <GridScan
              sensitivity={0.55}
              lineThickness={1}
              linesColor="#1b4570"
              gridScale={0.07}
              scanColor="#2863c4"
              scanOpacity={0.4}
              enablePost
              bloomIntensity={0.6}
              chromaticAberration={0.002}
              noiseIntensity={0.01}
              scanGlow={1.1}
            />
          </Suspense>
        </div>
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
              <a href="https://www.instagram.com/technicalclubrbu?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" className="btn" target="_blank" rel="noopener noreferrer">Follow the Club →</a>
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
          <BorderGlow
            edgeSensitivity={30}
            glowColor="205 92 60"
            backgroundColor="rgba(8, 27, 48, 0.75)"
            borderRadius={22}
            glowRadius={35}
            glowIntensity={1.2}
            coneSpread={28}
            animated={false}
            colors={['#3fa9f5', '#1f6fb2', '#bfe6ff']}
          >
            <div className="blade-glow-card">
              <div className="blade-glow-top">
                <span className="blade-glow-label mono" style={{ color: "#3fa9f5" }}>HANDS-ON</span>
                <svg className="blade-glow-icon" viewBox="0 0 24 24" fill="none"><path d="M4 17V7l8-4 8 4v10l-8 4-8-4Zm0-10 8 4 8-4M12 11v10" stroke="#3fa9f5" strokeWidth="2.2" /></svg>
              </div>
              <div className="blade-glow-bottom">
                <h3>HARDWARE</h3>
                <p>Solder stations, motor drivers, and robots that occasionally listen to instructions. Build bots for the annual arena battle.</p>
              </div>
            </div>
          </BorderGlow>

          <BorderGlow
            edgeSensitivity={30}
            glowColor="43 100 51"
            backgroundColor="rgba(8, 27, 48, 0.75)"
            borderRadius={22}
            glowRadius={35}
            glowIntensity={1.2}
            coneSpread={28}
            animated={false}
            colors={['#ffb703', '#ff8800', '#ffe066']}
          >
            <div className="blade-glow-card">
              <div className="blade-glow-top">
                <span className="blade-glow-label mono" style={{ color: "#ffb703" }}>SHIP WEEKLY</span>
                <svg className="blade-glow-icon" viewBox="0 0 24 24" fill="none"><path d="M8 9l-5 3 5 3M16 9l5 3-5 3M13 5l-2 14" stroke="#ffb703" strokeWidth="2.2" /></svg>
              </div>
              <div className="blade-glow-bottom">
                <h3>SOFTWARE</h3>
                <p>Hackathons, open-source sprints, and apps born from "wouldn't it be cool if..." at 1am. Ship early, ship loud.</p>
              </div>
            </div>
          </BorderGlow>

          <BorderGlow
            edgeSensitivity={30}
            glowColor="100 63 60"
            backgroundColor="rgba(8, 27, 48, 0.75)"
            borderRadius={22}
            glowRadius={35}
            glowIntensity={1.2}
            coneSpread={28}
            animated={false}
            colors={['#7ed957', '#4caf50', '#a8f087']}
          >
            <div className="blade-glow-card">
              <div className="blade-glow-top">
                <span className="blade-glow-label mono" style={{ color: "#7ed957" }}>GET THE WORD OUT</span>
                <svg className="blade-glow-icon" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="8" stroke="#7ed957" strokeWidth="2.2" /><path d="M12 4v4M12 16v4M4 12h4M16 12h4" stroke="#7ed957" strokeWidth="2.2" /></svg>
              </div>
              <div className="blade-glow-bottom">
                <h3>DIGITAL MARKETING</h3>
                <p>Campaigns, content, and campus buzz. Posters, socials, and hype videos that get people through the workshop door.</p>
              </div>
            </div>
          </BorderGlow>
        </Reveal>
      </section>

      <section className="wrap" id="events">
        <Reveal className="section-head">
          <div className="eyebrow mono">On the calendar</div>
          <h2>Upcoming builds &amp; meetups</h2>
          <p>No boring lectures — every session ends with something that lights up, moves, or (occasionally) smokes a little.</p>
        </Reveal>
        <Reveal className="events-bento-wrap" as="div">
          <Suspense fallback={null}>
            <MagicBento
              cards={events}
              onCardClick={(ev) => setSelectedEvent(ev)}
              textAutoHide={false}
              enableStars={true}
              enableSpotlight={true}
              enableBorderGlow={true}
              enableTilt={true}
              enableMagnetism={true}
              clickEffect={true}
              spotlightRadius={320}
              particleCount={14}
              glowColor="63, 169, 245"
            />
          </Suspense>
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
              <div className="avatar avatar--placeholder">
                <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="avatar-icon">
                  <circle cx="32" cy="22" r="12" fill="rgba(63,169,245,0.18)" stroke="rgba(63,169,245,0.5)" strokeWidth="2"/>
                  <path d="M8 56c0-13.255 10.745-24 24-24s24 10.745 24 24" fill="rgba(63,169,245,0.12)" stroke="rgba(63,169,245,0.5)" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <h4 className="reveal-soon-text">reveal soon...</h4>
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
          <a href="https://www.instagram.com/technicalclubrbu?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" className="btn" target="_blank" rel="noopener noreferrer">Follow Us on Instagram →</a>
        </Reveal>
      </section>

      <footer>
        <div className="brand-text">TECHNICAL<span style={{ color: "var(--amber)" }}>.</span>CLUB</div>
        <div>Made by members, for members · © 2026</div>
      </footer>

      {confettiLayer}
      <Suspense fallback={null}>
        {selectedEvent && <EventModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />}
      </Suspense>
    </div>
  );
}
export default TechnicalClub;