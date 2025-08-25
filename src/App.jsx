import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  HashRouter,
  MemoryRouter,
  Routes,
  Route,
  Link,
  useLocation,
  NavLink,
  Navigate,
} from "react-router-dom";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  Instagram,
  Facebook,
  MapPin,
  Menu,
  X,
  ArrowRight,
  ArrowUpRight,
  ChevronDown,
  Camera,
  Heart,
  Star,
  Mail,
  Phone,
} from "lucide-react";

// ===== Formspree endpoint =====
const FORMSPREE_ENDPOINT = "https://formspree.io/f/mwpqjnnw";

/* =============================================================
   Moments by Sunny — Single-file React site (JSX)
   PERFORMANCE FINAL:
   - Disable progressive JPEGs (no blur-first)
   - Always-mounted (keep-alive) Portfolio to preserve decoded images
   - Tiny sharp placeholders via CSS background
   - No opacity gate on <img>
============================================================= */

// ---------------------------------------------
// Scroll to top on route change
// ---------------------------------------------
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pathname]);
  return null;
}

// ---------------------------------------------
// Brand & Images
// ---------------------------------------------
const BRAND = {
  name: "Moments by Sunny",
  tagline: "Capturing emotions in every frame",
};

// Site images used across sections
const IMAGES = {
  // hero image used on home (top aligned so faces are visible)
  heroMain:
    "https://res.cloudinary.com/dz9agtvev/image/upload/v1755440876/main-min_e83hkb.jpg",
  // about page portrait
  aboutMe:
    "https://res.cloudinary.com/dz9agtvev/image/upload/v1755440869/aboutme-min_h3pglb.jpg",
  // contact page background behind the form
  bookBg:
    "https://res.cloudinary.com/dz9agtvev/image/upload/v1755977327/98bc3f56-1556-49f0-8cbb-b1caf9dcd077_jtbb86.png",
};

// Favicon (separate from navbar logo so we can swap independently)
const FAVICON = "https://res.cloudinary.com/dz9agtvev/image/upload/v1755974985/8b5e04ec-5655-42a9-97ed-d2cc71e74ab3_atmweo.png";

// Cloudinary helpers (NO progressive JPEG)
const cld = (u) =>
  u.includes("/upload/")
    ? u.replace(
        "/upload/",
        "/upload/f_auto,q_auto,dpr_auto/"
      )
    : u;
const cldW = (u, w) =>
  u.includes("/upload/")
    ? u.replace(
        "/upload/",
        `/upload/f_auto,q_auto,dpr_auto,w_${w}/`
      )
    : u;
const cldSrcSet = (u, widths) =>
  widths.map((w) => `${cldW(u, w)} ${w}w`).join(", ");
// Tiny, sharp placeholder (no blur)
const tinyPlaceholder = (u) =>
  u.includes("/upload/")
    ? u.replace("/upload/", "/upload/f_auto,q_25,w_80/")
    : u;

// Width sets for srcSet
const HERO_WIDTHS = [1280, 1600, 2000, 2400];
const CARD_WIDTHS = [480, 640, 800, 1000];
const PORTRAIT_WIDTHS = [480, 640, 800, 1200];

// ---------------------------------------------
// Contact & Copy
// ---------------------------------------------
const CONTACT = {
  email: "contact@momentsbysunny.com",
  phoneLabel: "+1 469 431 2333",
  phoneHref: "tel:+14694312333",
  instagram: "https://www.instagram.com/moments_by_sunny/",
  facebook: "https://www.facebook.com/profile.php?id=61579898277926",
};
const COPY = {
  featuredSubtitle:
    "A few recent favorites—soft, candid, and full of feeling.",
  portfolioSubtitle:
    "A living archive of sessions—warm, candid, and softly lit. Browse the full collection below.",
};

// ---------------------------------------------
// Featured list
// ---------------------------------------------
const FEATURED_ITEMS = [
  {
    id: 2,
    title: "Family & Pet Portrait Session",
    src: "https://res.cloudinary.com/dz9agtvev/image/upload/v1755629795/PIX08137_1_-min_v0tyhq.jpg",
  },
  {
    id: 1,
    title: "Golden Hour Whispers",
    src: "https://res.cloudinary.com/dz9agtvev/image/upload/v1755440878/main1-min_g3h5wa.jpg",
  },
  {
    id: 3,
    title: "Golden Hour Laughter",
    src: "https://res.cloudinary.com/dz9agtvev/image/upload/v1755655618/PIX06633_2_1_vazk23.jpg",
  },
];

// ---------------------------------------------
// Layout & animation tokens
// ---------------------------------------------
const HERO_PAD = "pl-4 sm:pl-8 lg:pl-24 pt-4 md:pt-8 pb-8"; // tighter on phones
const FEATURED_TOP_PAD = "pt-12 md:pt-20 lg:pt-24"; // less top gap on phones
const HERO_EASE = [0.22, 1, 0.36, 1];
const heroContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};
const heroItem = {
  hidden: { opacity: 0, y: 20, filter: "blur(6px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.8, ease: HERO_EASE },
  },
};

// ---------------------------------------------
// Shared UI
// ---------------------------------------------
const ShimmerText = ({ children, className = "" }) => (
  <motion.span
    initial={{ backgroundPositionX: "0%" }}
    animate={{ backgroundPositionX: "100%" }}
    transition={{ duration: 1.6, ease: "easeInOut" }}
    style={{
      backgroundImage:
        "linear-gradient(90deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,1) 20%, rgba(255,255,255,0.55) 40%)",
      backgroundSize: "200% 100%",
      WebkitBackgroundClip: "text",
      color: "transparent",
      display: "inline-block",
    }}
    className={className}
  >
    {children}
  </motion.span>
);

function isHttpLikeProtocol(proto) {
  return proto === "http:" || proto === "https:";
}
const AdaptiveRouter = ({ children }) => {
  const proto = typeof window !== "undefined" ? window.location.protocol : "about:";
  const isHttp = isHttpLikeProtocol(proto);
  return isHttp ? (
    <HashRouter>{children}</HashRouter>
  ) : (
    <MemoryRouter initialEntries={["/"]}>{children}</MemoryRouter>
  );
};

const Container = ({ className = "", children, ...props }) => (
  <div className={`mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 ${className}`} {...props}>
    {children}
  </div>
);

const SectionTitle = ({ title, subtitle, center }) => (
  <div className={`mb-8 sm:mb-10 ${center ? "text-center" : ""}`}>
    <h2 className="text-[26px] sm:text-4xl font-serif tracking-tight text-[#3A342E] leading-tight">
      {title}
    </h2>
    {subtitle && (
      <p className="mt-2 sm:mt-3 text-[#5A544E] max-w-2xl mx-auto text-[15px] sm:text-base">
        {subtitle}
      </p>
    )}
    <div className="mt-5 h-[2px] w-20 sm:w-24 bg-[#C7A869] mx-auto" />
  </div>
);

const BTN_BASE = {
  solid: "bg-[#C7A869] text-white hover:bg-[#b29356]",
  ghost:
    "bg-transparent text-[#3A342E] hover:text-[#C7A869] border border-[#C7A869]/50",
  light:
    "bg-transparent text-white border border-white hover:bg-white hover:text-[#3A342E]",
};

const Button = ({
  to,
  children,
  onClick,
  variant = "solid",
  className = "",
}) => {
  const base = BTN_BASE[variant] ?? BTN_BASE.solid;
  const el = (
    <span
      className={`inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-[15px] sm:text-sm font-medium shadow-sm transition-all ${base} ${className}`}
      style={{ minHeight: 44 }}
    >
      {children}
    </span>
  );
  if (to)
    return (
      <Link
        to={to}
        className="group inline-block no-underline focus:outline-none"
      >
        {el}
      </Link>
    );
  return (
    <button onClick={onClick} className="group">
      {el}
    </button>
  );
};

const Tag = ({ children }) => (
  <span className="inline-flex items-center gap-2 rounded-full border border-[#C7A869]/30 bg-[#FAF7F2] px-3 py-1.5 text-xs sm:text-[13px] text-[#3A342E]">
    <Star className="h-3.5 w-3.5" /> {children}
  </span>
);

const FAQItem = ({ q, a }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-2xl border border-[#E9E2DA] bg-white">
      <button
        className="w-full flex items-center justify-between gap-4 px-4 py-3 text-left text-[#3A342E]"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span className="font-medium text-[15px] sm:text-base">{q}</span>
        <ChevronDown
          className={`h-5 w-5 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      <motion.div
        initial={false}
        animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }}
        className="overflow-hidden"
      >
        <div className="px-4 pb-4 text-[#5A544E] text-[15px] sm:text-base">{a}</div>
      </motion.div>
    </div>
  );
};

// ---------------------------------------------
// Navbar
// ---------------------------------------------
const Navbar = () => {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const [forceMobile, setForceMobile] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    document.body.style.touchAction = "none";
    return () => {
      document.body.style.overflow = overflow;
      document.body.style.touchAction = "auto";
    };
  }, [open]);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Detect touch devices (phones / iPad) so we show a full-screen sheet there
  useEffect(() => {
    const calc = () => {
      let touch = false;
      try {
        touch =
          "ontouchstart" in window ||
          (navigator && navigator.maxTouchPoints > 0) ||
          window.matchMedia("(hover: none)").matches ||
          window.matchMedia("(pointer: coarse)").matches;
      } catch {}
      setForceMobile(touch);
    };
    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, []);

  const desktopNavClass = forceMobile ? "hidden" : "hidden xl:flex";
  const mobileToggleClass = forceMobile ? "flex" : "xl:hidden";

  const SheetPortal = ({ children }) =>
    createPortal(
      <div className="fixed inset-0 z-[9999]">{children}</div>,
      document.body
    );

  return (
    <header className="sticky top-0 z-50 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b border-[#E9E2DA] bg-white">
      <Container className="flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-3 no-underline text-inherit">
          <img
            src={cldW(FAVICON, 96)}
            alt="Moments by Sunny logo"
            className="h-8 w-8 md:h-9 md:w-9 rounded-lg object-contain shrink-0"
            loading="eager"
            decoding="async"
          />
          <span className="font-serif text-xl text-[#3A342E]">Moments by Sunny</span>
        </Link>
        <nav className={`${desktopNavClass} items-center gap-8 text-[#3A342E]`}>
          {[
            ["Portfolio", "/portfolio"],
            ["About", "/about"],
            ["Services", "/services"],
          ].map(([label, href]) => (
            <NavLink
              key={href}
              to={href}
              className={({ isActive }) =>
                `no-underline text-sm hover:text-[#C7A869] transition ${isActive ? "text-[#C7A869]" : ""}`
              }
            >
              {label}
            </NavLink>
          ))}
          <Button to="/contact" variant="solid">
            Book Now <ArrowUpRight className="h-4 w-4" />
          </Button>
        </nav>
        <button
          className={`${mobileToggleClass} p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C7A869]/50`}
          onClick={() => setOpen(!open)}
          aria-label="Toggle Menu"
          aria-expanded={open}
          aria-controls="mobile-menu"
        >
          {open ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
        </button>
      </Container>

      {/* Full-screen sheet on touch devices, via portal to body */}
      {open && forceMobile && (
        <SheetPortal>
          <div className="absolute inset-0 bg-white" />
          <div className="absolute inset-0 flex flex-col">
            <div className="flex items-center justify-between h-16 px-4 border-b border-[#E9E2DA] bg-white">
              <span className="font-serif text-lg text-[#3A342E]">Menu</span>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C7A869]/50"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <nav className="p-6 overflow-y-auto">
              <div role="menu" className="divide-y divide-[#E9E2DA]/60 -mx-1">
                {[
                  ["Portfolio", "/portfolio"],
                  ["About", "/about"],
                  ["Services", "/services"],
                  ["Contact", "/contact"],
                ].map(([label, href]) => (
                  <Link
                    key={href}
                    to={href}
                    onClick={() => setOpen(false)}
                    className="block px-1 py-4 text-lg text-[#3A342E] no-underline transition-colors hover:text-[#C7A869] focus:outline-none focus:text-[#C7A869] active:opacity-80"
                  >
                    {label}
                  </Link>
                ))}
              </div>
              <div className="pt-6">
                <Button to="/contact" variant="solid" className="w-full">
                  Book Now
                </Button>
              </div>
            </nav>
          </div>
        </SheetPortal>
      )}

      {/* Right drawer for non-touch small screens */}
      {open && !forceMobile && (
        <SheetPortal>
          <button
            aria-hidden
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/20"
          />
          <aside
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            className="absolute inset-y-0 right-0 w-[85vw] max-w-sm border-l border-[#E9E2DA] bg-white shadow-xl"
          >
            <div className="flex items-center justify-between h-16 px-4 border-b border-[#E9E2DA]">
              <span className="font-serif text-lg text-[#3A342E]">Menu</span>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C7A869]/50"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <nav className="p-6">
              <div role="menu" className="divide-y divide-[#E9E2DA]/60 -mx-1">
                {[
                  ["Portfolio", "/portfolio"],
                  ["About", "/about"],
                  ["Services", "/services"],
                  ["Contact", "/contact"],
                ].map(([label, href]) => (
                  <Link
                    key={href}
                    to={href}
                    onClick={() => setOpen(false)}
                    className="block px-1 py-4 text-lg text-[#3A342E] no-underline transition-colors hover:text-[#C7A869] focus:outline-none focus:text-[#C7A869] active:opacity-80"
                  >
                    {label}
                  </Link>
                ))}
              </div>
              <div className="pt-6">
                <Button to="/contact" variant="solid" className="w-full">
                  Book Now
                </Button>
              </div>
            </nav>
          </aside>
        </SheetPortal>
      )}
    </header>
  );
};

// ---------------------------------------------
// Hero
// ---------------------------------------------
const Hero = () => {
  const reduce = useReducedMotion();
  return (
    <section className="relative">
      <div className="relative h-[78vh] sm:h-[88vh] md:h-[90vh]">
        <img
          src={cldW(IMAGES.heroMain, 1600)}
          srcSet={cldSrcSet(IMAGES.heroMain, HERO_WIDTHS)}
          sizes="100vw"
          alt="Warm, candid portrait from Moments by Sunny"
          className="absolute inset-0 h-full w-full object-cover object-[50%_20%] md:object-[50%_30%] select-none"
          loading="eager"
          decoding="async"
          fetchPriority="high"
          onContextMenu={(e) => e.preventDefault()}
          draggable={false}
          style={{ WebkitTouchCallout: "none", WebkitUserSelect: "none", userSelect: "none" }}
        />
        <div className="absolute inset-0 bg-black/30" />
        <Container>
          <div className="absolute inset-0 flex items-center">
            <motion.div
              variants={heroContainer}
              initial={reduce ? undefined : "hidden"}
              animate={reduce ? undefined : "show"}
              className={`max-w-2xl text-white ${HERO_PAD}`}
            >
              <motion.p
                variants={heroItem}
                className="uppercase tracking-[0.2em] text-xs mb-4"
              >
                <ShimmerText>{BRAND.tagline}</ShimmerText>
              </motion.p>
              <motion.h1
                variants={heroItem}
                className="font-serif text-4xl sm:text-6xl leading-tight drop-shadow bg-clip-text text-transparent bg-gradient-to-b from-white to-white/80"
              >
                Moments that feel like home.
              </motion.h1>
              <motion.p variants={heroItem} className="mt-4 text-lg text-white/90">
                Warm, candid, and intimate photography that preserves your story
                in soft, timeless tones.
              </motion.p>
              <motion.div variants={heroItem} className="mt-8 flex items-center gap-4">
                <Button to="/portfolio">
                  View Portfolio <ArrowRight className="h-4 w-4" />
                </Button>
                <Button to="/contact" variant="light">
                  Book a Session
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </Container>
      </div>
    </section>
  );
};

// ---------------------------------------------
// Featured
// ---------------------------------------------
const FeaturedGallery = () => (
  <Container className={`${FEATURED_TOP_PAD} pb-14 sm:pb-16`} style={{ contentVisibility: "auto" }}>
    <SectionTitle title="Featured Work" subtitle={COPY.featuredSubtitle} center />
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {FEATURED_ITEMS.map((it, idx) => (
        <motion.div
          key={it.id}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: idx * 0.05 }}
        >
          <Link to="/portfolio" className="group block no-underline">
            <div className="relative overflow-hidden rounded-3xl shadow-sm">
              <div className="before:block before:pb-[66%]" />
              <img
                src={cldW(it.src, 800)}
                srcSet={cldSrcSet(it.src, CARD_WIDTHS)}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                alt={it.title}
                loading="lazy"
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover select-none"
                onContextMenu={(e) => e.preventDefault()}
                draggable={false}
                style={{ WebkitTouchCallout: "none", WebkitUserSelect: "none", userSelect: "none" }}
              />
            </div>
            <div className="sr-only">{it.title}</div>
          </Link>
        </motion.div>
      ))}
    </div>
  </Container>
);

// ---------------------------------------------
// Portfolio (masonry)
// ---------------------------------------------
const buildImages = () => {
  const images = [];
  let id = 1;
  const push = (label, src) =>
    images.push({
      id: id++,
      label,
      category: "Lifestyle",
      location: "Cincinnati, OH",
      src: cld(src),
    });
  push(
    "Woman kneeling in grass, shaking paws with a small dog.",
    "https://res.cloudinary.com/dz9agtvev/image/upload/v1755647936/PIX08085_1_qqqwtm.jpg"
  );
  push(
    "Happy couple and two small dogs.",
    "https://res.cloudinary.com/dz9agtvev/image/upload/v1755645713/PIX06504_2-min_b5e1hs.jpg"
  );
  push(
    "Woman lying on green grass, looking at the camera.",
    "https://res.cloudinary.com/dz9agtvev/image/upload/v1755645710/main3-min_dywo1g.jpg"
  );
  push(
    "Natural-light couples portrait in a park.",
    "https://res.cloudinary.com/dz9agtvev/image/upload/v1755645713/PIX06619_2-min_sqcdpm.jpg"
  );
  push(
    "Woman on a sandy beach in a white shirt, looking back.",
    "https://res.cloudinary.com/dz9agtvev/image/upload/v1755645710/PIX05405-min_yusqqm.jpg"
  );
  push(
    "Graduate in cap and gown leaning on a campus mascot statue.",
    "https://res.cloudinary.com/dz9agtvev/image/upload/v1755645709/main2-min_bk9ofj.jpg"
  );
  push(
    "Woman in a sun hat looking back in a lush garden.",
    "https://res.cloudinary.com/dz9agtvev/image/upload/v1755645708/DSC04534-min_cm9l0h.jpg"
  );
  push(
    "Live band performing on stage in front of an audience.",
    "https://res.cloudinary.com/dz9agtvev/image/upload/v1755645711/PIX05611-min_syhqyz.jpg"
  );
  push(
    "Three friends smiling on a garden path.",
    "https://res.cloudinary.com/dz9agtvev/image/upload/v1755645709/DSC04852-min_gebutk.jpg"
  );
  push(
    "Graduate tossing cap by the river with a city skyline.",
    "https://res.cloudinary.com/dz9agtvev/image/upload/v1755645708/DSC00374-min-min_x60fyi.jpg"
  );
  push(
    "Woman smiling in a park, hand in hair.",
    "https://res.cloudinary.com/dz9agtvev/image/upload/v1755645709/DSC04920-min_wub3gr.jpg"
  );
  push(
    "Musician singing and playing electric guitar on stage.",
    "https://res.cloudinary.com/dz9agtvev/image/upload/v1755645711/PIX05751-min_wwyh3w.jpg"
  );
  push(
    "Woman in a white dress sitting on a rock by a pond, smiling back.",
    "https://res.cloudinary.com/dz9agtvev/image/upload/v1755645712/PIX06255_2-min_yovu0j.jpg"
  );
  push(
    "Couple posing on a park walkway by benches.",
    "https://res.cloudinary.com/dz9agtvev/image/upload/v1755645710/main5-min_urjtym.jpg"
  );
  push(
    "Woman in a pink dress smiling under a low branch in a garden.",
    "https://res.cloudinary.com/dz9agtvev/image/upload/v1755645710/main4-min-min_nqxtlb.jpg"
  );
  push(
    "Small dog with a colorful bandana sitting in grass.",
    "https://res.cloudinary.com/dz9agtvev/image/upload/v1755645712/PIX06494-min_hyolk7.jpg"
  );
  push(
    "Guitarist performing on stage with an electric guitar.",
    "https://res.cloudinary.com/dz9agtvev/image/upload/v1755645712/PIX05639-min_idraf9.jpg"
  );
  push(
    "Person kneeling at the shoreline, drawing a heart in wet sand.",
    "https://res.cloudinary.com/dz9agtvev/image/upload/v1755645710/PIX05461-min_gc0mqz.jpg"
  );
  push(
    "Woman smiling on a garden path, hand near chin.",
    "https://res.cloudinary.com/dz9agtvev/image/upload/v1755645709/DSC04854-min_iqkoxt.jpg"
  );
  return images;
};

const MasonryItem = ({ img, idx }) => {
  const widths = [320, 480, 640, 800];
  const eager = idx < 6; // more high-priority above the fold
  const [srcUrl, setSrcUrl] = useState(cldW(img.src, 640));

  // If the transformed URL fails or is too slow, fall back to the original
  useEffect(() => {
    setSrcUrl(cldW(img.src, 640));
    const slowFallback = setTimeout(() => {
      setSrcUrl((prev) => (prev === img.src ? prev : img.src));
    }, 2000);
    return () => clearTimeout(slowFallback);
  }, [img.src]);

  return (
    <div className="mb-4 sm:mb-6 break-inside-avoid">
      <div
        tabIndex={0}
        className="group relative block w-full focus:outline-none rounded-xl overflow-hidden shadow-sm transition-shadow duration-300 hover:shadow-md"
        style={{
          backgroundImage: `url(${tinyPlaceholder(img.src)})`,
          backgroundSize: "cover",
          backgroundPosition: "50% 0%",
        }}
      >
        <img
          src={srcUrl}
          srcSet={cldSrcSet(img.src, widths)}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          alt={img.label}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          fetchPriority={eager ? "high" : "low"}
          onError={() => {
            if (srcUrl !== img.src) setSrcUrl(img.src);
          }}
          className="w-full h-auto block select-none motion-safe:will-change-transform motion-safe:transition-transform motion-safe:duration-300 motion-safe:ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-[1.03]"
          style={{ transformOrigin: "50% 50%", backfaceVisibility: "hidden" }}
          onContextMenu={(e) => e.preventDefault()}
          draggable={false}
        />
      </div>
    </div>
  );
};

const MasonryColumns = ({ images }) => (
  <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 sm:gap-6 [column-fill:_balance]">
    {images.map((img, idx) => (
      <MasonryItem key={img.id} img={img} idx={idx} />
    ))}
  </div>
);

const PortfolioPage = () => {
  const images = useMemo(buildImages, []);
  const [visibleCount, setVisibleCount] = useState(12);
  const sentinelRef = useRef(null);

  useEffect(() => {
    const head = document.head;
    const preloadCount = Math.min(6, images.length);
    for (let i = 0; i < preloadCount; i++) {
      const link = document.createElement("link");
      link.rel = "preload";
      link.as = "image";
      link.href = cldW(images[i].src, 800);
      link.setAttribute("imagesrcset", cldSrcSet(images[i].src, [480, 640, 800]));
      link.setAttribute("imagesizes", "(max-width: 1024px) 50vw, 25vw");
      head.appendChild(link);
    }
    return () => {
      const links = Array.from(
        document.querySelectorAll('link[rel="preload"][as="image"]')
      );
      links.forEach((l) => l.parentElement?.removeChild(l));
    };
  }, [images]);

  useEffect(() => {
    if (!sentinelRef.current) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisibleCount((c) => Math.min(c + 8, images.length));
        }
      },
      { rootMargin: "600px 0px" }
    );
    io.observe(sentinelRef.current);
    return () => {
      io.disconnect();
    };
  }, [images.length]);

  return (
    <main className="bg-white" style={{ contentVisibility: "auto" }}>
      <Container className="py-8 sm:py-10" style={{ contentVisibility: "auto" }}>
        <SectionTitle
          title="Portfolio"
          subtitle={COPY.portfolioSubtitle}
          center
        />
        {images.length === 0 ? (
          <p className="text-center text-[#5A544E]">No work to show just yet.</p>
        ) : (
          <>
            <MasonryColumns images={images.slice(0, visibleCount)} />
            <div ref={sentinelRef} aria-hidden className="h-1" />
          </>
        )}
      </Container>
    </main>
  );
};

// ---------------------------------------------
// About
// ---------------------------------------------
const AboutPage = () => {
  const approach = [
    {
      icon: <Heart className="h-5 w-5 text-[#C7A869]" />,
      title: "Gentle Direction",
      text: "I guide lightly so you can relax into natural movement—never stiff, always you.",
    },
    {
      icon: <Camera className="h-5 w-5 text-[#C7A869]" />,
      title: "Natural Light",
      text: "Soft, true-to-life color and flattering light. Golden hour is my favorite collaborator.",
    },
    {
      icon: <Star className="h-5 w-5 text-[#C7A869]" />,
      title: "Story-First",
      text: "Images that hold feeling over perfection. Your connection drives every frame.",
    },
  ];
  const faqs = [
    {
      q: "Where are you based? Do you travel?",
      a: "I’m based in Cincinnati and happily travel throughout NKY and the Midwest. For farther sessions, travel is arranged at cost.",
    },
    {
      q: "How soon do we receive photos?",
      a: "Sneak peeks within 72 hours and full galleries typically within 2–3 weeks (weddings 6–8 weeks).",
    },
    {
      q: "What should we wear?",
      a: "Soft neutrals photograph beautifully—ivory, beige, warm gray. I’ll send a simple guide and we’ll coordinate together.",
    },
  ];
  return (
    <main className="bg-white" style={{ contentVisibility: "auto" }}>
      <section className="bg-gradient-to-b from-[#FAF7F2] to-white border-b border-[#E9E2DA]">
        <Container className="py-12 sm:py-14 text-center">
          <h1 className="font-serif text-3xl sm:text-5xl text-[#3A342E] leading-tight">
            About Sunny
          </h1>
          <p className="mt-3 text-[#5A544E] max-w-2xl mx-auto text-[15px] sm:text-base">
            A calm presence behind the camera—capturing laughter between lines,
            quiet hands held tight, and wind-tousled hair at golden hour.
          </p>
          <div className="mt-5 h-[2px] w-20 sm:w-24 bg-[#C7A869] mx-auto" />
        </Container>
      </section>
      <section>
        <Container className="py-10 sm:py-12 grid md:grid-cols-2 gap-8 sm:gap-10 items-center">
          <div>
            <h2 className="font-serif text-2xl text-[#3A342E]">A gentle, story-first approach</h2>
            <p className="mt-3 text-[#3A342E] leading-relaxed text-[15px] sm:text-base">
              I’m Sunny—a lifestyle photographer drawn to the soft, imperfect
              little moments that make a day feel like yours. I’ll guide just
              enough to keep you comfortable, then step back so real connection
              can unfold.
            </p>
            <p className="mt-4 text-[#3A342E] leading-relaxed text-[15px] sm:text-base">
              The heart of <em>Moments by Sunny</em> is simple: your photos
              should feel like home—warm, candid, and timeless.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Tag>Natural Light</Tag>
              <Tag>Gentle Direction</Tag>
              <Tag>Story-First</Tag>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button to="/portfolio">View Portfolio</Button>
              <Button to="/contact" variant="ghost">
                Book a Session
              </Button>
            </div>
          </div>
          <div className="flex justify-center md:justify-end">
            <img
              src={cldW(IMAGES.aboutMe, 800)}
              srcSet={cldSrcSet(IMAGES.aboutMe, PORTRAIT_WIDTHS)}
              sizes="(max-width: 768px) 100vw, 50vw"
              alt="Sunny, the photographer behind Moments by Sunny"
              loading="lazy"
              decoding="async"
              className="w-full max-w-md md:max-w-xl rounded-3xl object-cover shadow-sm select-none"
              onContextMenu={(e) => e.preventDefault()}
              draggable={false}
              style={{ WebkitTouchCallout: "none", WebkitUserSelect: "none", userSelect: "none" }}
            />
          </div>
        </Container>
      </section>
      <section>
        <Container className="py-8 sm:py-10" style={{ contentVisibility: "auto" }}>
          <h3 className="font-serif text-2xl text-[#3A342E] mb-5 sm:mb-6 text-center">
            My Approach
          </h3>
          <div className="grid md:grid-cols-3 gap-4 sm:gap-6">
            {approach.map((a) => (
              <div
                key={a.title}
                className="rounded-3xl border border-[#E9E2DA] bg-white p-5 sm:p-6"
              >
                <div className="flex items-center gap-3">
                  {a.icon}
                  <span className="font-medium text-[#3A342E]">{a.title}</span>
                </div>
                <p className="mt-3 text-[#5A544E] text-[15px] sm:text-base">{a.text}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>
      <section>
        <Container className="py-8 sm:py-10" style={{ contentVisibility: "auto" }}>
          <h3 className="font-serif text-2xl text-[#3A342E] mb-5 sm:mb-6 text-center">
            FAQs
          </h3>
          <div className="mx-auto max-w-3xl grid gap-3">
            {faqs.map((f) => (
              <FAQItem key={f.q} q={f.q} a={f.a} />
            ))}
          </div>
        </Container>
      </section>
    </main>
  );
};

// ---------------------------------------------
// Services
// ---------------------------------------------
const SERVICES = [
  {
    slug: "weddings",
    title: "Weddings",
    desc: "Honest, documentary coverage with gentle direction when you need it.",
    pkg: [
      "8–10 hours coverage",
      "Timeline help & location scouting",
      "Second photographer available",
      "Sneak peeks within 72 hours",
      "Online gallery with print rights",
    ],
  },
  {
    slug: "couples",
    title: "Couples & Engagements",
    desc: "Candid sessions for quiet moments and big laughs—sunset walks, city corners, coffee dates.",
    pkg: [
      "60–90 minutes",
      "Location & wardrobe guidance",
      "40–60 finished photographs",
      "Private gallery, print shop access",
    ],
  },
  {
    slug: "family",
    title: "Family & Lifestyle",
    desc: "At-home or outdoor sessions focused on connection over posing.",
    pkg: [
      "60 minutes",
      "Gentle direction",
      "50+ finished photographs",
      "Private online gallery",
    ],
  },
];

const ServicesPage = () => (
  <main className="bg-white" style={{ contentVisibility: "auto" }}>
    <div className="bg-white border-b border-[#E9E2DA]">
      <Container className="py-10 sm:py-12" style={{ contentVisibility: "auto" }}>
        <SectionTitle
          title="Let's Create Together"
          subtitle="Thoughtful collections—custom quotes after a quick chat."
          center
        />
        <div className="grid md:grid-cols-3 gap-4 sm:gap-6">
          {SERVICES.map((s, idx) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.05 }}
              className="rounded-3xl border border-[#E9E2DA] bg-white p-5 sm:p-6"
            >
              <div className="flex items-center gap-3">
                <Heart className="h-5 w-5 text-[#C7A869]" />
                <h3 className="font-serif text-lg sm:text-xl text-[#3A342E]">{s.title}</h3>
              </div>
              <p className="mt-2 text-[#5A544E] text-[15px] sm:text-base">{s.desc}</p>
              <ul className="mt-4 space-y-2 text-[15px] sm:text-sm text-[#3A342E]">
                {s.pkg.map((p) => (
                  <li key={p} className="flex items-start gap-2">
                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#C7A869]" /> {p}
                  </li>
                ))}
              </ul>
              <div className="mt-5">
                <Button to="/contact">
                  Inquire <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </Container>
    </div>
  </main>
);

// ---------------------------------------------
// Helpers for Contact formatting & tests
// ---------------------------------------------
function formatUSDateTime(localDate) {
  const pad2 = (n) => String(n).padStart(2, "0");
  const month = pad2(localDate.getMonth() + 1);
  const day = pad2(localDate.getDate());
  const year = localDate.getFullYear();
  const h24 = localDate.getHours();
  const mins2 = pad2(localDate.getMinutes());
  const ampm = h24 < 12 ? "AM" : "PM";
  const h12 = ((h24 + 11) % 12) + 1;
  return { dateUS: `${month}-${day}-${year}`, time12: `${h12}:${mins2} ${ampm}` };
}

function _devTests() {
  try {
    // Existing test
    const t = new Date(2025, 7, 22, 19, 30);
    const { dateUS, time12 } = formatUSDateTime(t);
    console.assert(
      dateUS === "08-22-2025" && time12 === "7:30 PM",
      "Date/time formatting failed",
      { dateUS, time12 }
    );

    // Additional tests (edge cases)
    const tMidnight = new Date(2025, 0, 1, 0, 0);
    const a1 = formatUSDateTime(tMidnight);
    console.assert(a1.dateUS === "01-01-2025" && a1.time12 === "12:00 AM", "Midnight formatting failed", a1);

    const tNoon = new Date(2025, 0, 1, 12, 0);
    const a2 = formatUSDateTime(tNoon);
    console.assert(a2.dateUS === "01-01-2025" && a2.time12 === "12:00 PM", "Noon formatting failed", a2);

    // New tests
    const tMorning = new Date(2025, 6, 4, 11, 5);
    const a3 = formatUSDateTime(tMorning);
    console.assert(a3.dateUS === "07-04-2025" && a3.time12 === "11:05 AM", "11:05 AM formatting failed", a3);

    const tLate = new Date(2025, 6, 4, 23, 59);
    const a4 = formatUSDateTime(tLate);
    console.assert(a4.dateUS === "07-04-2025" && a4.time12 === "11:59 PM", "11:59 PM formatting failed", a4);
  } catch {}
}

// ---------------------------------------------
// Contact (Book Now)
// ---------------------------------------------
const ContactPage = () => {
  const [submitted, setSubmitted] = useState(false);
  const [type, setType] = useState("General Inquiry");
  const [error, setError] = useState(null);
  const [phone, setPhone] = useState("");
  const [dateStr, setDateStr] = useState("");
  const [timeStr, setTimeStr] = useState("");

  const pad = (n) => String(n).padStart(2, "0");
  const todayStr = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const timeOptions = useMemo(() => {
    const opts = [];
    for (let h = 0; h < 24; h++) {
      for (let m of [0, 30]) {
        const value = `${pad(h)}:${pad(m)}`;
        const hour12 = ((h + 11) % 12) + 1;
        const ampm = h < 12 ? "AM" : "PM";
        opts.push({ value, label: `${hour12}:${pad(m)} ${ampm}` });
      }
    }
    return opts;
  }, []);

  const formatPhone = (raw) => {
    const digits = raw.replace(/[^0-9]/g, "");
    const a = digits.slice(0, 3);
    const b = digits.slice(3, 6);
    const c = digits.slice(6, 10);
    if (digits.length <= 3) return a;
    if (digits.length <= 6) return `(${a}) ${b}`;
    return `(${a}) ${b}-${c}`;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    const formEl = e.currentTarget;
    const fd = new FormData(formEl);
    if (String(fd.get("website") || "")) return; // honeypot

    const name = String(fd.get("name") || "").trim();
    const email = String(fd.get("email") || "").trim();
    const phoneRaw = String(fd.get("phone") || "");
    const message = String(fd.get("message") || "").trim();
    const inquiryType = String(fd.get("type") || type);
    const consentChecked = fd.get("consent") === "on";

    const dateFld = String(fd.get("date") || dateStr).trim();
    const timeFld = String(fd.get("time") || timeStr).trim();

    const digits = phoneRaw.replace(/[^0-9]/g, "");
    if (!name) return setError("Please enter your name.");
    if (!email) return setError("Please enter a valid email.");
    if (digits.length < 10) return setError("Please enter a valid phone number.");
    if (!dateFld || !timeFld) return setError("Please choose a date and time.");

    const [y, m, d] = dateFld.split("-").map(Number);
    const [hh, min] = timeFld.split(":").map(Number);
    const localDate = new Date(y, (m || 1) - 1, d || 1, hh || 0, min || 0, 0, 0);
    if (Number.isNaN(localDate.getTime()))
      return setError("Please choose a valid date & time.");
    if (localDate.getTime() < Date.now())
      return setError("Please choose a future date & time.");
    if (!consentChecked)
      return setError("Please agree to be contacted by email or SMS.");

    const { dateUS, time12 } = formatUSDateTime(localDate);

    const subject = `New ${inquiryType} inquiry from ${name} — ${dateUS} ${time12}`;
    const payload = {
      _subject: subject,
      name,
      email,
      phone: phoneRaw,
      inquiryType,
      preferredDate: dateUS,
      preferredTime: time12,
      message,
    };

    try {
      const res = await fetch(FORMSPREE_ENDPOINT, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      let json = {};
      try {
        json = await res.json();
      } catch {}
      if (!res.ok) {
        setError(json?.errors?.[0]?.message || "Something went wrong sending your message.");
        return;
      }
      setSubmitted(true);
      formEl.reset();
      setType("General Inquiry");
      setPhone("");
      setDateStr("");
      setTimeStr("");
      setTimeout(() => setSubmitted(false), 4000);
    } catch {
      setError("Network error—please try again in a moment.");
    }
  };

  useEffect(() => {
    try {
      new URL(IMAGES.bookBg);
    } catch {
      console.error("Invalid bookBg URL");
    }
  }, []);

  return (
    <main
      className="relative"
      style={{
        backgroundImage: `url(${cldW(IMAGES.bookBg, 1600)})`,
        backgroundSize: "cover",
        backgroundPosition: "50% 0%",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* stronger wash on phones for readability over image */}
      <div className="absolute inset-0 -z-10 backdrop-blur-[2px] sm:backdrop-blur-[3px] md:backdrop-blur-[4px] bg-white/50 sm:bg-white/35" />

      <div className="border-b border-[#E9E2DA]">
        <Container className="pt-10 sm:pt-12 pb-2">
          <SectionTitle
            title="Let's make something beautiful"
            subtitle="Tell me a little about you and your vision."
            center
          />
        </Container>
        <Container
          className="pb-3 md:pb-4 grid md:grid-cols-3 gap-6 sm:gap-8 items-start"
          style={{ contentVisibility: "auto" }}
        >
          {/* Form */}
          <div className="lg:col-span-2">
            <div className="rounded-3xl border border-[#E9E2DA] bg-gradient-to-br from-[#FAF7F2] via-white to-[#E9E2DA]/40 p-5 sm:p-6 shadow-sm">
              <form onSubmit={onSubmit} aria-label="Contact form" className="grid gap-4">
                <input type="text" name="website" className="hidden" tabIndex={-1} autoComplete="off" />
                <div>
                  <label className="text-sm text-[#5A544E]" htmlFor="name">
                    Name
                  </label>
                  <input
                    required
                    id="name"
                    name="name"
                    className="mt-1 w-full rounded-2xl border border-[#E9E2DA] bg-white/90 px-4 py-3 text-[16px] outline-none focus:ring-2 focus:ring-[#C7A869]/50"
                  />
                </div>
                <div>
                  <label className="text-sm text-[#5A544E]" htmlFor="email">
                    Email
                  </label>
                  <input
                    required
                    type="email"
                    id="email"
                    name="email"
                    className="mt-1 w-full rounded-2xl border border-[#E9E2DA] bg-white/90 px-4 py-3 text-[16px] outline-none focus:ring-2 focus:ring-[#C7A869]/50"
                  />
                </div>
                <div>
                  <label className="text-sm text-[#5A544E]" htmlFor="phone">
                    Phone
                  </label>
                  <input
                    required
                    type="tel"
                    id="phone"
                    name="phone"
                    placeholder="(555) 123-4567"
                    value={phone}
                    onChange={(e) => setPhone(formatPhone(e.target.value))}
                    className="mt-1 w-full rounded-2xl border border-[#E9E2DA] bg-white/90 px-4 py-3 text-[16px] outline-none focus:ring-2 focus:ring-[#C7A869]/50"
                  />
                </div>
                <div>
                  <label className="text-sm text-[#5A544E]" htmlFor="type">
                    Type of Inquiry
                  </label>
                  <select
                    id="type"
                    name="type"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="mt-1 w-full rounded-2xl border border-[#E9E2DA] bg-white/90 px-4 py-3 text-[16px] outline-none focus:ring-2 focus:ring-[#C7A869]/50"
                  >
                    {["General Inquiry", "Wedding", "Couples", "Family", "Lifestyle"].map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </div>

                {/* Date and Time */}
                <div>
                  <label className="text-sm text-[#5A544E]" htmlFor="date">
                    Preferred Date
                  </label>
                  <input
                    required
                    type="date"
                    id="date"
                    name="date"
                    min={todayStr}
                    value={dateStr}
                    onChange={(e) => setDateStr(e.target.value)}
                    className="mt-1 w-full rounded-2xl border border-[#E9E2DA] bg-white/90 px-4 py-3 text-[16px] outline-none focus:ring-2 focus:ring-[#C7A869]/50 appearance-none min-w-0 max-w-full"
                  />
                </div>
                <div>
                  <label className="text-sm text-[#5A544E]" htmlFor="time">
                    Preferred Time
                  </label>
                  <select
                    required
                    id="time"
                    name="time"
                    value={timeStr}
                    onChange={(e) => setTimeStr(e.target.value)}
                    className="mt-1 w-full rounded-2xl border border-[#E9E2DA] bg-white/90 px-4 py-3 text-[16px] outline-none focus:ring-2 focus:ring-[#C7A869]/50 appearance-none min-w-0 max-w-full"
                  >
                    <option value="" disabled>
                      Select a time
                    </option>
                    {timeOptions.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="text-sm text-[#5A544E]" htmlFor="message">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={5}
                    placeholder="Tell me about your session—location ideas, people involved, vibes…"
                    className="mt-1 w-full rounded-2xl border border-[#E9E2DA] bg-white/90 px-4 py-3 text-[16px] outline-none focus:ring-2 focus:ring-[#C7A869]/50"
                  ></textarea>
                </div>

                <div className="sm:col-span-2 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[#5A544E]">
                    <input
                      id="consent"
                      name="consent"
                      type="checkbox"
                      required
                      className="h-4 w-4 rounded border-[#E9E2DA]"
                    />
                    <label htmlFor="consent" className="text-sm">
                      I agree to be contacted by email or SMS.
                    </label>
                  </div>
                  <Button>
                    Send Message <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </form>
              <div role="status" aria-live="polite" className="mt-3">
                {error ? (
                  <span className="text-red-600">{error}</span>
                ) : (
                  submitted && (
                    <span className="text-[#3A342E]">
                      Thank you! I’ll be in touch within 24–48 hours.
                    </span>
                  )
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="lg:sticky lg:top-24 self-start">
            <div className="mb-6">
              <h2 className="text-2xl sm:text-3xl font-serif tracking-tight text-[#3A342E]">
                Service Area
              </h2>
              <div className="mt-2 h-[3px] w-10 rounded bg-[#C7A869]/70"></div>
            </div>
            <div className="rounded-3xl border border-[#E9E2DA] bg-gradient-to-br from-[#FAF7F2] via-white to-[#E9E2DA]/40 p-5 shadow-sm">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-[#C7A869]" />
                <p className="text-[#3A342E]">
                  Serving Cincinnati, NKY, and beyond. <span className="whitespace-nowrap">Travel welcome.</span>
                </p>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {["Cincinnati • NKY", "Travel welcome", "Replies within 24–48h"].map(
                  (b) => (
                    <span
                      key={b}
                      className="inline-flex items-center px-3 py-1 rounded-full border border-[#E9E2DA] bg-white text-xs text-[#3A342E]"
                    >
                      {b}
                    </span>
                  )
                )}
              </div>
              <div className="mt-5 flex gap-4">
                <a
                  className="inline-flex items-center hover:text-[#C7A869] no-underline"
                  href={CONTACT.instagram}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label="Instagram"
                >
                  <Instagram className="h-6 w-6" />
                </a>
                <a
                  className="inline-flex items-center hover:text-[#C7A869] no-underline"
                  href={CONTACT.facebook}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label="Facebook"
                >
                  <Facebook className="h-6 w-6" />
                </a>
              </div>
            </div>
          </aside>
        </Container>
      </div>

      <AnimatePresence>
        {submitted && (
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
          >
            <div className="rounded-full bg-[#3A342E] text-white px-4 py-2 shadow-lg flex items-center gap-2">
              <Heart className="h-4 w-4 text-[#C7A869]" />
              Message received — I’ll reply within 24–48h.
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
};

// ---------------------------------------------
// Home
// ---------------------------------------------
const HomePage = () => (
  <main className="bg-white" style={{ contentVisibility: "auto" }}>
    <Hero />
    <FeaturedGallery />
    <div className="bg-gradient-to-r from-[#FAF7F2] to-white border-y border-[#E9E2DA]">
      <Container className="py-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h3 className="font-serif text-2xl text-[#3A342E]">
            Ready to make something beautiful?
          </h3>
          <p className="text-[#5A544E]">
            Warm, candid, and intimate photography—crafted around your story.
          </p>
        </div>
        <div className="flex gap-3">
          <Button to="/contact">Book a Session</Button>
          <Button to="/services" variant="ghost">
            View Packages
          </Button>
        </div>
      </Container>
    </div>
  </main>
);

// ---------------------------------------------
// Footer (centered & refined)
// ---------------------------------------------
const Footer = () => (
  <footer className="border-t border-[#E9E2DA] bg-white">
    {/* Top block */}
    <Container className="py-10 grid md:grid-cols-3 gap-10 items-start text-center md:text-left">
      {/* Brand + tagline */}
      <div className="flex flex-col items-center md:items-start">
        <div className="inline-flex items-center gap-2">
          <Camera className="h-5 w-5 text-[#C7A869]" />
          <span className="font-serif text-lg text-[#3A342E]">
            Moments by Sunny
          </span>
        </div>
        <p className="mt-3 text-[#5A544E] max-w-sm">
          Capturing emotions in every frame. Warm, romantic, nostalgic, authentic.
        </p>
      </div>

      {/* Navigate */}
      <div>
        <h4 className="font-medium text-[#3A342E] mb-3">Navigate</h4>
        <div className="grid gap-2 text-[#5A544E]">
          <Link className="no-underline hover:text-[#C7A869]" to="/">Home</Link>
          <Link className="no-underline hover:text-[#C7A869]" to="/portfolio">Portfolio</Link>
          <Link className="no-underline hover:text-[#C7A869]" to="/about">About</Link>
          <Link className="no-underline hover:text-[#C7A869]" to="/services">Services</Link>
          <Link className="no-underline hover:text-[#C7A869]" to="/contact">Contact</Link>
        </div>
      </div>

      {/* Connect */}
      <div className="flex flex-col items-center md:items-start">
        <h4 className="font-medium text-[#3A342E] mb-3">Connect</h4>
        <div className="grid gap-3 text-[#5A544E]">
          <a
            className="inline-flex items-center gap-2 hover:text-[#C7A869] no-underline"
            href={`mailto:${CONTACT.email}`}
          >
            <Mail className="h-4 w-4" /> {CONTACT.email}
          </a>
          <a
            className="inline-flex items-center gap-2 hover:text-[#C7A869] no-underline"
            href={CONTACT.phoneHref}
          >
            <Phone className="h-4 w-4" /> {CONTACT.phoneLabel}
          </a>
          <div className="flex items-center gap-4">
            <a
              className="inline-flex items-center hover:text-[#C7A869] no-underline"
              href={CONTACT.instagram}
              target="_blank"
              rel="noreferrer noopener"
              aria-label="Instagram"
            >
              <Instagram className="h-6 w-6" />
            </a>
            <a
              className="inline-flex items-center hover:text-[#C7A869] no-underline"
              href={CONTACT.facebook}
              target="_blank"
              rel="noreferrer noopener"
              aria-label="Facebook"
            >
              <Facebook className="h-6 w-6" />
            </a>
          </div>
        </div>
      </div>

    </Container>

    {/* Centered CTA band (subtle, elegant) */}
    <div className="border-t border-[#E9E2DA] bg-gradient-to-r from-[#FAF7F2] to-white">
      <Container className="py-6">
        <div className="flex justify-center">
          <Link to="/contact" className="no-underline">
            <span className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-base font-medium shadow-sm bg-[#C7A869] text-white hover:bg-[#b29356] transition">
              Book a Session
              <ArrowUpRight className="h-5 w-5" />
            </span>
          </Link>
        </div>
      </Container>
    </div>

    {/* Copyright */}
    <div className="py-6 text-center text-sm text-[#5A544E] bg-[#FAF7F2]">
      © {new Date().getFullYear()} Moments by Sunny. All rights reserved. Site by Sunny.
    </div>
  </footer>
);

// ---------------------------------------------
// Portfolio Keep-Alive (always mounted, toggled visible)
// ---------------------------------------------
function PortfolioCache({ visible }) {
  return (
    <div style={{ display: visible ? "block" : "none" }} aria-hidden={!visible}>
      <PortfolioPage />
    </div>
  );
}

// ---------------------------------------------
// App Shell & Routes
// ---------------------------------------------
const AppShell = () => {
  const { pathname } = useLocation();
  const isPortfolio = pathname === "/portfolio";

  useEffect(() => {
    // Preconnect to Cloudinary
    const origins = ["https://res.cloudinary.com"];
    origins.forEach((href) => {
      const link1 = document.createElement("link");
      link1.rel = "preconnect";
      link1.href = href;
      link1.crossOrigin = "anonymous";
      document.head.appendChild(link1);
      const link2 = document.createElement("link");
      link2.rel = "dns-prefetch";
      link2.href = href;
      document.head.appendChild(link2);
    });
    _devTests();
  }, []);
  // Inject favicon/logo & theme color
  useEffect(() => {
    try {
      const remove = document.querySelectorAll(
        'link[rel="icon"], link[rel="shortcut icon"], link[rel="apple-touch-icon"]'
      );
      remove.forEach((n) => n.parentElement?.removeChild(n));
      const mk = (rel, sizes, href) => {
        const l = document.createElement("link");
        l.rel = rel;
        if (sizes) l.sizes = sizes;
        l.href = href;
        document.head.appendChild(l);
      };
      mk("icon", "16x16", cldW(FAVICON, 16));
      mk("icon", "32x32", cldW(FAVICON, 32));
      mk("apple-touch-icon", "180x180", cldW(FAVICON, 180));

      let theme = document.querySelector('meta[name="theme-color"]');
      if (!theme) {
        theme = document.createElement("meta");
        theme.setAttribute("name", "theme-color");
        document.head.appendChild(theme);
      }
      theme.setAttribute("content", "#C7A869");
    } catch {}
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <div className="flex-1">
        <ScrollToTop />
        {/* Routes: render nothing for /portfolio (the cache below shows it) */}
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/portfolio" element={<div />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
        {/* Always-mounted Portfolio keeps images decoded between navigations */}
        <PortfolioCache visible={isPortfolio} />
      </div>
      <Footer />
    </div>
  );
};

export default function App() {
  return (
    <AdaptiveRouter>
      <AppShell />
    </AdaptiveRouter>
  );
}
