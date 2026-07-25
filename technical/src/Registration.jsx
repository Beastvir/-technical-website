
import	React,	{	useEffect,	useRef,	useState,	useCallback	}	from	"react";
/*	----------	load	webfonts	once	(same	as	TechnicalClub.jsx)	----------	*/
function	useWebFonts()	{
		useEffect(()	=>	{
				const	id	=	"tc-fonts";
				if	(document.getElementById(id))	return;
				const	link	=	document.createElement("link");
				link.id	=	id;
				link.rel	=	"stylesheet";
				link.href	=
						"https://fonts.googleapis.com/css2?family=Chakra+Petch:ital,wght@0,400;0,500;0,600;0,700;1,600&family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&family=Permanent+Marker&display=swap";
				document.head.appendChild(link);
		},	[]);
}
/*	----------	design	tokens	(identical	to	TechnicalClub.jsx)	----------	*/
const	COLORS	=	{
		navyDeep:	"#081b30",
		navy:	"#0f2c4c",
		blue:	"#1f6fb2",
		blueBright:	"#3fa9f5",
		ice:	"#bfe6ff",
		amber:	"#ffb703",
		paper:	"#eef4f9",
		line:	"rgba(191,230,255,0.14)",
};
/*	----------	scroll	reveal	hook	(same	as	TechnicalClub.jsx)	----------	*/
function	useReveal(threshold	=	0.15)	{
		const	ref	=	useRef(null);
		const	[visible,	setVisible]	=	useState(false);
		useEffect(()	=>	{
				const	el	=	ref.current;
				if	(!el)	return;
				const	io	=	new	IntersectionObserver(
						([entry])	=>	{
								if	(entry.isIntersecting)	{
										setVisible(true);
										io.unobserve(el);
								}
						},
						{	threshold	}
				);
				io.observe(el);
				return	()	=>	io.disconnect();
		},	[threshold]);
		return	[ref,	visible];
}
function	Reveal({	as:	Tag	=	"div",	className	=	"",	children,	...rest	})	{
		const	[ref,	visible]	=	useReveal();
		return	(
				<Tag	ref={ref}	className={`reveal	${visible	?	"in"	:	""}	${className}`}	{...rest}>
						{children}
				</Tag>
		);
}
/*	----------	nav	mark	(same	as	TechnicalClub.jsx)	----------	*/
function	BrandMark()	{
		return	<img	src="logo.png"	alt="Technical	Club	logo"	className="brand-svg"	draggable="false"	/>;
}
/*	----------	sticker	(same	as	TechnicalClub.jsx)	----------	*/
function	Sticker({	text,	style,	tone	=	"amber",	tail	=	"left"	})	{
		return	(
				<div	className={`sticker	sticker--${tone}	tail-${tail}`}	style={style}>
						{text}
				</div>
		);
}
/*	----------	confetti	burst	on	submit	(same	as	TechnicalClub.jsx)	----------	*/
function	useConfetti()	{
		const	[particles,	setParticles]	=	useState([]);
		const	idRef	=	useRef(0);
		const	burst	=	useCallback((x,	y)	=>	{
				const	colors	=	[COLORS.amber,	COLORS.blueBright,	COLORS.ice,	COLORS.paper];
				const	next	=	Array.from({	length:	28	},	()	=>	{
						idRef.current	+=	1;
						return	{
								id:	idRef.current,
								x,
								y,
								size:	5	+	Math.random()	*	5,
								color:	colors[Math.floor(Math.random()	*	colors.length)],
								round:	Math.random()	>	0.5,
								dx:	(Math.random()	-	0.5)	*	300,
								dy:	(Math.random()	-	0.8)	*	300,
								rot:	Math.random()	*	360,
						};
				});
				setParticles((p)	=>	[...p,	...next]);
		},	[]);
		const	remove	=	useCallback((id)	=>	{
				setParticles((p)	=>	p.filter((particle)	=>	particle.id	!==	id));
		},	[]);
		const	layer	=	(
				<div	className="confetti-layer"	aria-hidden="true">
						{particles.map((p)	=>	(
								<div
										key={p.id}
										className="confetti-piece"
										onAnimationEnd={()	=>	remove(p.id)}
										style={{
												left:	p.x,
												top:	p.y,
												width:	p.size,
												height:	p.size,
												background:	p.color,
												borderRadius:	p.round	?	"50%"	:	"2px",
												"--dx":	`${p.dx}px`,
												"--dy":	`${p.dy}px`,
												"--rot":	`${p.rot}deg`,
										}}
								/>
						))}
				</div>
		);
		return	[burst,	layer];
}
/*	=================	REGISTRATION	PAGE	=================	*/
export	default	function	Registration()	{
		useWebFonts();
		const	[menuOpen,	setMenuOpen]	=	useState(false);
		const	[burst,	confettiLayer]	=	useConfetti();
		const	[submitted,	setSubmitted]	=	useState(false);
		const	[regId,	setRegId]	=	useState("");
		const	[errors,	setErrors]	=	useState({});
		/*	Same	three	blades	as	the	homepage	—	reused	as	an	"interest"	pick	*/
		const	blades	=	[
				{	key:	"hardware",	title:	"Hardware",	glow:	"#3fa9f5"	},
				{	key:	"software",	title:	"Software",	glow:	"#ffb703"	},
				{	key:	"marketing",	title:	"Digital	Marketing",	glow:	"#7ed957"	},
		];
		/*	Same	events	as	the	homepage	events	section	*/
		const	events	=	[
				{	key:	"sprint",	title:	"24-Hour	Build	Sprint",	date:	"SAT	·	AUG	08"	},
				{	key:	"solder",	title:	"Solder	&	Chill",	date:	"THU	·	AUG	20"	},
				{	key:	"arena",	title:	"Bot	Arena	Finals",	date:	"FRI	·	SEP	04"	},
		];
		const	[form,	setForm]	=	useState({
				name:	"",
				rollNo:	"",
				branch:	"",
				year:	"",
				email:	"",
				phone:	"",
				blade:	"",
				picked:	[],
				team:	"",
				consent:	false,
		});
		const	setField	=	(key,	val)	=>	setForm((f)	=>	({	...f,	[key]:	val	}));
		const	toggleEvent	=	(key)	=>	{
				setForm((f)	=>	({
						...f,
						picked:	f.picked.includes(key)	?	f.picked.filter((k)	=>	k	!==	key)	:	[...f.picked,	key],
				}));
		};
		const	validate	=	()	=>	{
				const	e	=	{};
				if	(!form.name.trim())	e.name	=	"Tell	us	your	name.";
				if	(!form.rollNo.trim())	e.rollNo	=	"Roll	number	/	student	ID	needed.";
				if	(!form.branch.trim())	e.branch	=	"Branch	or	department	needed.";
				if	(!form.year)	e.year	=	"Pick	a	year.";
				if	(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))	e.email	=	"That	email	doesn't	look	right.";
				if	(!/^[0-9]{10}$/.test(form.phone.replace(/\D/g,	"")))	e.phone	=	"10-digit	phone	number	needed.";
				if	(form.picked.length	===	0)	e.picked	=	"Pick	at	least	one	event.";
				if	(!form.consent)	e.consent	=	"You	need	to	accept	this	to	continue.";
				setErrors(e);
				return	Object.keys(e).length	===	0;
		};
		const	handleSubmit	=	(ev)	=>	{
				ev.preventDefault();
				if	(!validate())	return;
				/*	===============	HOOK	UP	A	REAL	BACKEND	HERE	===============
							Swap	this	block	for	one	of:
									fetch("https://YOUR_API/register",	{
											method:	"POST",
											headers:	{	"Content-Type":	"application/json"	},
											body:	JSON.stringify(form),
									});
							or	a	Google	Form	/	FormSubmit.co	endpoint.
							===============================================================	*/
				console.log("Registration	submitted:",	form);
				const	id	=	"TC-"	+	Math.random().toString(36).slice(2,	7).toUpperCase();
				setRegId(id);
				burst(ev.clientX,	ev.clientY);
				setSubmitted(true);
		};
		return	(
				<div	className="tc-root">
						<style>{`
								:root{	--navy-deep:${COLORS.navyDeep};	--navy:${COLORS.navy};	--blue:${COLORS.blue};
										--blue-bright:${COLORS.blueBright};	--ice:${COLORS.ice};	--amber:${COLORS.amber};
										--paper:${COLORS.paper};	--line:${COLORS.line};	--maxw:1200px;
								}
								.tc-root{	background:var(--navy-deep);	color:var(--paper);	font-family:'Inter',sans-serif;	position:relative;	overflow-x:hidden;	min-height:100vh;	}
								.tc-root	*{	box-sizing:border-box;	}
								.tc-root	h1,.tc-root	h2,.tc-root	h3{	font-family:'Chakra	Petch',sans-serif;	text-transform:uppercase;	letter-spacing:0.01em;	margin:0;	}
								.mono{	font-family:'JetBrains	Mono',monospace;	}
								.tc-root	a{	color:inherit;	text-decoration:none;	}
								.grid-bg{	position:fixed;	inset:0;	z-index:0;	pointer-events:none;
										background-image:linear-gradient(var(--line)	1px,	transparent	1px),	linear-gradient(90deg,	var(--line)	1px,	transparent	1px);
										background-size:48px	48px;
										-webkit-mask-image:radial-gradient(circle	at	50%	20%,	black	0%,	black	40%,	transparent	85%);
										mask-image:radial-gradient(circle	at	50%	20%,	black	0%,	black	40%,	transparent	85%);
								}
								section{	position:relative;	z-index:1;	}
								header{	position:fixed;	top:0;	left:0;	right:0;	z-index:50;	display:flex;	align-items:center;	justify-content:space-between;
										padding:16px	clamp(20px,5vw,56px);	background:linear-gradient(180deg,	rgba(8,27,48,0.92),	rgba(8,27,48,0.6));
										backdrop-filter:blur(10px);	border-bottom:1px	solid	var(--line);
								}
								.brand{	display:flex;	align-items:center;	gap:12px;	}
								.brand-svg{	width:38px;	height:38px;	object-fit:contain;	transition:transform	.5s	cubic-bezier(.2,.8,.2,1);	}
								.brand:hover	.brand-svg{	transform:rotate(160deg);	}
								.brand-text{	font-family:'Chakra	Petch';	font-weight:700;	letter-spacing:0.06em;	font-size:1.02rem;	}
								.brand-text	span{	color:var(--amber);	}
								nav	ul{	display:flex;	gap:clamp(14px,2vw,34px);	list-style:none;	margin:0;	padding:0;	}
								nav	a{	font-family:'JetBrains	Mono';	font-size:0.8rem;	text-transform:uppercase;	letter-spacing:0.08em;	color:var(--ice);
										opacity:0.75;	position:relative;	padding:6px	2px;	transition:opacity	.2s;	}
								nav	a:hover,	nav	a.active{	opacity:1;	}
								nav	a::after{	content:"";	position:absolute;	left:0;	bottom:0;	height:2px;	width:0;	background:var(--amber);	transition:width	.25s	ease;	}
								nav	a:hover::after,	nav	a.active::after{	width:100%;	}
								.nav-links{	display:flex;	align-items:center;	gap:30px;	}
								.btn{	display:inline-flex;	align-items:center;	gap:8px;	font-family:'JetBrains	Mono';	font-size:0.78rem;	text-transform:uppercase;
										letter-spacing:0.06em;	padding:11px	22px;	border-radius:999px;	border:1px	solid	var(--amber);	color:var(--navy-deep);
										background:var(--amber);	cursor:pointer;	transition:transform	.2s	ease,	box-shadow	.2s	ease,	background	.2s;	white-space:nowrap;	}
								.btn:hover{	transform:translateY(-2px);	box-shadow:0	10px	24px	rgba(255,183,3,0.3);	}
								.btn.ghost{	background:transparent;	color:var(--amber);	}
								.btn.ghost:hover{	background:rgba(255,183,3,0.1);	}
								.btn:disabled{	opacity:0.5;	cursor:not-allowed;	transform:none;	box-shadow:none;	}
								.burger{	display:none;	width:26px;	height:20px;	position:relative;	cursor:pointer;	background:none;	border:none;	}
								.burger	span{	position:absolute;	left:0;	right:0;	height:2px;	background:var(--ice);	transition:.3s;	}
								.burger	span:nth-child(1){	top:0;	}	.burger	span:nth-child(2){	top:9px;	}	.burger	span:nth-child(3){	top:18px;	}
								.burger.open	span:nth-child(1){	transform:translateY(9px)	rotate(45deg);	}
								.burger.open	span:nth-child(2){	opacity:0;	}
								.burger.open	span:nth-child(3){	transform:translateY(-9px)	rotate(-45deg);	}
								.mobile-panel{	position:fixed;	top:70px;	left:0;	right:0;	z-index:49;	background:var(--navy-deep);	border-bottom:1px	solid	var(--line);
										padding:20px	24px	30px;	display:none;	flex-direction:column;	gap:18px;	}
								.mobile-panel.open{	display:flex;	}
								.mobile-panel	a{	font-family:'JetBrains	Mono';	text-transform:uppercase;	letter-spacing:0.08em;	font-size:0.92rem;	color:var(--ice);	}
								.wrap{	max-width:var(--maxw);	margin:0	auto;	padding:120px	24px;	}
								.section-head{	margin-bottom:56px;	max-width:60ch;	}
								.section-head	.eyebrow{	margin-bottom:14px;	display:flex;	align-items:center;	gap:10px;	font-family:'JetBrains	Mono';
										font-size:0.78rem;	letter-spacing:0.18em;	color:var(--amber);	text-transform:uppercase;	}
								.section-head	.eyebrow::before{	content:"";	width:26px;	height:1px;	background:var(--amber);	display:inline-block;	}
								.section-head	h2{	font-size:clamp(1.8rem,3.6vw,2.6rem);	}
								.section-head	p{	color:var(--ice);	opacity:0.75;	margin-top:14px;	line-height:1.6;	font-size:1.02rem;	}
								.reveal{	opacity:0;	transform:translateY(28px);	transition:opacity	.7s	ease,	transform	.7s	cubic-bezier(.2,.7,.3,1);	}
								.reveal.in{	opacity:1;	transform:translateY(0);	}
								/*	----	registration	card,	mirrors	blade-card	/	event-card	materials	----	*/
								.reg-wrap{	display:grid;	grid-template-columns:1.4fr	1fr;	gap:28px;	align-items:start;	}
								.reg-card{	padding:34px	clamp(20px,4vw,44px);	border:1px	solid	var(--line);	border-radius:20px;
										background:rgba(255,255,255,0.02);	position:relative;	overflow:hidden;	}
								.reg-card::before{	content:"";	position:absolute;	top:-40%;	right:-30%;	width:70%;	height:70%;
										background:radial-gradient(circle,	var(--blue)	0%,	transparent	70%);	opacity:0.16;	pointer-events:none;	}
								.reg-side{	padding:30px	26px;	border:1px	solid	var(--line);	border-radius:18px;	background:rgba(255,255,255,0.02);
										position:sticky;	top:110px;	}
								.reg-side	h3{	font-size:1.05rem;	margin-bottom:14px;	color:var(--paper);	}
								.reg-side	ul{	list-style:none;	padding:0;	margin:0;	display:flex;	flex-direction:column;	gap:14px;	}
								.reg-side	li{	display:flex;	flex-direction:column;	gap:2px;	font-size:0.88rem;	color:var(--ice);	opacity:0.85;	}
								.reg-side	.ev-date{	font-family:'JetBrains	Mono';	font-size:0.68rem;	letter-spacing:0.08em;	color:var(--amber);	text-transform:uppercase;	}
								.field-row{	display:grid;	grid-template-columns:1fr	1fr;	gap:20px;	}
								.field{	margin-bottom:22px;	}
								.field	label{	display:block;	font-family:'JetBrains	Mono';	font-size:0.72rem;	letter-spacing:0.08em;	text-transform:uppercase;
										color:var(--ice);	opacity:0.85;	margin-bottom:8px;	}
								.field	label	.req{	color:var(--amber);	}
								.field	input[type="text"],	.field	input[type="email"],	.field	input[type="tel"],	.field	select{
										width:100%;	padding:12px	14px;	border:1px	solid	var(--line);	border-radius:10px;	background:rgba(255,255,255,0.03);
										color:var(--paper);	font-family:'Inter';	font-size:0.94rem;	outline:none;	transition:border-color	.2s	ease,	box-shadow	.2s	ease;
								}
								.field	select	option{	background:var(--navy);	color:var(--paper);	}
								.field	input::placeholder{	color:var(--ice);	opacity:0.4;	}
								.field	input:focus,	.field	select:focus{	border-color:var(--blue-bright);	box-shadow:0	0	0	3px	rgba(63,169,245,0.16);	}
								.field.err	input,	.field.err	select{	border-color:#ff6b6b;	}
								.field	.msg{	font-family:'JetBrains	Mono';	font-size:0.72rem;	color:#ff8f8f;	margin-top:6px;	display:none;	}
								.field.err	.msg{	display:block;	}
								.legend{	font-family:'JetBrains	Mono';	font-size:0.72rem;	letter-spacing:0.08em;	text-transform:uppercase;
										color:var(--ice);	opacity:0.85;	margin-bottom:12px;	display:block;	}
								.chip-row{	display:flex;	flex-wrap:wrap;	gap:10px;	}
								.chip{	font-family:'JetBrains	Mono';	font-size:0.72rem;	letter-spacing:0.06em;	text-transform:uppercase;
										padding:9px	16px;	border-radius:999px;	border:1px	solid	var(--line);	background:transparent;	color:var(--ice);
										cursor:pointer;	transition:border-color	.2s	ease,	color	.2s	ease,	background	.2s	ease;	opacity:0.85;	}
								.chip:hover{	opacity:1;	}
								.chip.on{	color:var(--chip-glow,	var(--amber));	border-color:var(--chip-glow,	var(--amber));
										background:color-mix(in	srgb,	var(--chip-glow,	var(--amber))	14%,	transparent);	opacity:1;	}
								.field.err	.chip-row{	outline:1px	solid	#ff6b6b;	outline-offset:6px;	border-radius:12px;	}
								.consent{	display:flex;	align-items:flex-start;	gap:10px;	font-size:0.86rem;	color:var(--ice);	opacity:0.85;	}
								.consent	input{	margin-top:3px;	accent-color:var(--amber);	width:16px;	height:16px;	}
								.submit-row{	margin-top:8px;	}
								.submit-row	.btn{	padding:14px	30px;	font-size:0.82rem;	}
								/*	----	success	state,	reuses	sticker	vocabulary	----	*/
								.success-wrap{	position:relative;	text-align:center;	padding:20px	10px	40px;	}
								.success-wrap	h2{	font-size:clamp(1.8rem,4vw,2.4rem);	}
								.success-wrap	p{	color:var(--ice);	opacity:0.8;	margin-top:12px;	max-width:44ch;	margin-inline:auto;	}
								.reg-id{	display:inline-block;	margin-top:20px;	font-family:'JetBrains	Mono';	font-size:0.9rem;	letter-spacing:0.08em;
										border:1px	dashed	var(--amber);	color:var(--amber);	padding:10px	18px;	border-radius:10px;	}
								.sticker{	position:absolute;	z-index:6;	font-family:'Permanent	Marker',cursive;	font-size:0.92rem;
										padding:10px	16px;	border-radius:20px;	line-height:1.1;	white-space:nowrap;	transform:rotate(-6deg);
										box-shadow:0	10px	22px	rgba(0,0,0,0.35);	border:2px	solid	var(--navy-deep);	}
								.sticker--amber{	background:var(--amber);	color:var(--navy-deep);	}
								.sticker--blue{	background:var(--blue-bright);	color:var(--navy-deep);	}
								.sticker--ice{	background:var(--paper);	color:var(--navy-deep);	}
								.sticker.tail-left::after,	.sticker.tail-right::after,	.sticker.tail-bottom::after,	.sticker.tail-top::after{
										content:"";	position:absolute;	width:14px;	height:14px;	background:inherit;	border:2px	solid	var(--navy-deep);
										border-top:none;	border-left:none;
								}
								.sticker.tail-left::after{	left:14px;	bottom:-9px;	transform:rotate(45deg);	border-right:none;	border-bottom-color:var(--navy-deep);	}
								.sticker.tail-bottom::after{	left:50%;	bottom:-9px;	transform:translateX(-50%)	rotate(45deg);	}
								footer{	border-top:1px	solid	var(--line);	padding:40px	24px;	display:flex;	justify-content:space-between;	align-items:center;
										flex-wrap:wrap;	gap:16px;	font-family:'JetBrains	Mono';	font-size:0.76rem;	color:var(--ice);	opacity:0.6;	position:relative;	z-index:1;	}
								.confetti-layer{	position:fixed;	inset:0;	pointer-events:none;	z-index:999;	}
								.confetti-piece{	position:fixed;	animation:burst	900ms	cubic-bezier(.2,.7,.3,1)	forwards;	}
								@keyframes	burst{	from{	transform:translate(0,0)	rotate(0deg);	opacity:1;	}	to{	transform:translate(var(--dx),	var(--dy))	rotate(var(--rot));	opacity:0;	}	}
								@media	(max-width:920px){
										nav	ul{	display:none;	}	.burger{	display:block;	}
										.wrap{	padding:100px	20px	80px;	}
										.reg-wrap{	grid-template-columns:1fr;	}
										.reg-side{	position:static;	}
										.field-row{	grid-template-columns:1fr;	}
								}
								@media	(prefers-reduced-motion:	reduce){
										.tc-root	*{	animation-duration:0.001ms	!important;	animation-iteration-count:1	!important;	transition-duration:0.001ms	!important;	}
								}
						`}</style>
						<div	className="grid-bg"	/>
						<header>
								<a	href="#top"	className="brand">
										<BrandMark	/>
										<span	className="brand-text">
												TECHNICAL<span>.</span>CLUB
										</span>
								</a>
								<nav>
										<ul>
												<li><a	href="/#blades">What	We	Do</a></li>
												<li><a	href="/#events">Events</a></li>
												<li><a	href="/#gallery">Gallery</a></li>
												<li><a	href="/#team">Team</a></li>
												<li><a	href="/register"	className="active">Register</a></li>
										</ul>
								</nav>
								<div	className="nav-links">
										<a	href="/#join"	className="btn">Join	the	Club</a>
										<button	className={`burger	${menuOpen	?	"open"	:	""}`}	aria-label="Menu"	onClick={()	=>	setMenuOpen((v)	=>	!v)}>
												<span></span><span></span><span></span>
										</button>
								</div>
						</header>
						<div	className={`mobile-panel	${menuOpen	?	"open"	:	""}`}>
								<a	href="/#blades"	onClick={()	=>	setMenuOpen(false)}>What	We	Do</a>
								<a	href="/#events"	onClick={()	=>	setMenuOpen(false)}>Events</a>
								<a	href="/#gallery"	onClick={()	=>	setMenuOpen(false)}>Gallery</a>
								<a	href="/#team"	onClick={()	=>	setMenuOpen(false)}>Team</a>
								<a	href="/register"	onClick={()	=>	setMenuOpen(false)}>Register</a>
						</div>
						<section	className="wrap"	id="top">
								<Reveal	className="section-head">
										<div	className="eyebrow	mono">One	form,	every	blade</div>
										<h2>Grab	your	spot</h2>
										<p>Register	once	and	pick	whatever	you're	in	for	—	a	build	sprint,	a	solder	night,	or	the	arena	finals.	No	boring	forms,	promise.</p>
								</Reveal>
								{!submitted	&&	(
										<Reveal	className="reg-wrap">
												<div	className="reg-card">
														<form	onSubmit={handleSubmit}	noValidate>
																<div	className="field-row">
																		<div	className={`field	${errors.name	?	"err"	:	""}`}>
																				<label>Full	name	<span	className="req">*</span></label>
																				<input
																						type="text"
																						placeholder="e.g.	Ananya	Sharma"
																						value={form.name}
																						onChange={(e)	=>	setField("name",	e.target.value)}
																				/>
																				<div	className="msg	mono">{errors.name}</div>
																		</div>
																		<div	className={`field	${errors.rollNo	?	"err"	:	""}`}>
																				<label>Roll	no.	/	Student	ID	<span	className="req">*</span></label>
																				<input
																						type="text"
																						placeholder="e.g.	22CS045"
																						value={form.rollNo}
																						onChange={(e)	=>	setField("rollNo",	e.target.value)}
																				/>
																				<div	className="msg	mono">{errors.rollNo}</div>
																		</div>
																</div>
																<div	className="field-row">
																		<div	className={`field	${errors.branch	?	"err"	:	""}`}>
																				<label>Branch	/	Department	<span	className="req">*</span></label>
																				<input
																						type="text"
																						placeholder="e.g.	Computer	Science"
																						value={form.branch}
																						onChange={(e)	=>	setField("branch",	e.target.value)}
																				/>
																				<div	className="msg	mono">{errors.branch}</div>
																		</div>
																		<div	className={`field	${errors.year	?	"err"	:	""}`}>
																				<label>Year	<span	className="req">*</span></label>
																				<select	value={form.year}	onChange={(e)	=>	setField("year",	e.target.value)}>
																						<option	value="">Select	year</option>
																						<option>1st	Year</option>
																						<option>2nd	Year</option>
																						<option>3rd	Year</option>
																						<option>4th	Year</option>
																				</select>
																				<div	className="msg	mono">{errors.year}</div>
																		</div>
																</div>
																<div	className="field-row">
																		<div	className={`field	${errors.email	?	"err"	:	""}`}>
																				<label>Email	<span	className="req">*</span></label>
																				<input
																						type="email"
																						placeholder="you@college.edu"
																						value={form.email}
																						onChange={(e)	=>	setField("email",	e.target.value)}
																				/>
																				<div	className="msg	mono">{errors.email}</div>
																		</div>
																		<div	className={`field	${errors.phone	?	"err"	:	""}`}>
																				<label>Phone	<span	className="req">*</span></label>
																				<input
																						type="tel"
																						placeholder="10-digit	number"
																						value={form.phone}
																						onChange={(e)	=>	setField("phone",	e.target.value)}
																				/>
																				<div	className="msg	mono">{errors.phone}</div>
																		</div>
																</div>
																<div	className="field">
																		<span	className="legend">Which	blade	are	you	closest	to?</span>
																		<div	className="chip-row">
																				{blades.map((b)	=>	(
																						<button
																								type="button"
																								key={b.key}
																								className={`chip	${form.blade	===	b.key	?	"on"	:	""}`}
																								style={{	"--chip-glow":	b.glow	}}
																								onClick={()	=>	setField("blade",	form.blade	===	b.key	?	""	:	b.key)}
																						>
																								{b.title}
																						</button>
																				))}
																		</div>
																</div>
																<div	className={`field	${errors.picked	?	"err"	:	""}`}>
																		<span	className="legend">Which	event(s)?	<span	className="req">*</span></span>
																		<div	className="chip-row">
																				{events.map((ev)	=>	(
																						<button
																								type="button"
																								key={ev.key}
																								className={`chip	${form.picked.includes(ev.key)	?	"on"	:	""}`}
																								onClick={()	=>	toggleEvent(ev.key)}
																						>
																								{ev.title}
																						</button>
																				))}
																		</div>
																		<div	className="msg	mono">{errors.picked}</div>
																</div>
																<div	className="field">
																		<label>Team	name	<span	style={{	opacity:	0.6,	textTransform:	"none",	letterSpacing:	0	}}>(optional,	if	applicable)</span></label>
																		<input
																				type="text"
																				placeholder="Leave	blank	for	solo	entries"
																				value={form.team}
																				onChange={(e)	=>	setField("team",	e.target.value)}
																		/>
																</div>
																<div	className={`field	${errors.consent	?	"err"	:	""}`}	style={{	marginTop:	6	}}>
																		<label	className="consent"	style={{	textTransform:	"none",	fontFamily:	"Inter"	}}>
																				<input
																						type="checkbox"
																						checked={form.consent}
																						onChange={(e)	=>	setField("consent",	e.target.checked)}
																				/>
																				I	agree	to	follow	the	club's	rules	and	code	of	conduct.	<span	className="req">*</span>
																		</label>
																		<div	className="msg	mono">{errors.consent}</div>
																</div>
																<div	className="submit-row">
																		<button	type="submit"	className="btn">Lock	in	my	spot	→</button>
																</div>
														</form>
												</div>
												<div	className="reg-side">
														<h3>What's	on</h3>
														<ul>
																{events.map((ev)	=>	(
																		<li	key={ev.key}>
																				<span	className="ev-date	mono">{ev.date}</span>
																				<span>{ev.title}</span>
																		</li>
																))}
														</ul>
												</div>
										</Reveal>
								)}
								{submitted	&&	(
										<Reveal	className="success-wrap">
												<div	className="eyebrow	mono"	style={{	justifyContent:	"center"	}}>You're	in</div>
												<h2>Spot	locked,	{form.name.split("	")[0]	||	"champ"}.</h2>
												<p>Keep	an	eye	on	your	inbox	—	details	for	your	picked	event(s)	are	on	the	way.</p>
												<div	className="reg-id">{regId}</div>
												<Sticker	text="SEE	YOU	THERE	"	tone="amber"	tail="bottom"	style={{	top:	"-10px",	left:	"12%"	}}	/>
										</Reveal>
								)}
						</section>
						<footer>
								<div	className="brand-text">TECHNICAL<span	style={{	color:	"var(--amber)"	}}>.</span>CLUB</div>
								<div>Made	by	members,	for	members	·	©	2026</div>
						</footer>
						{confettiLayer}
				</div>
		);
}
