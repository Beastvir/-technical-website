import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GalleryPage from './gallery.jsx';

/* ─── inline styles so no extra CSS file needed ─── */
const styles = {
  backdrop: {
    position: 'fixed',
    inset: 0,
    zIndex: 9999,
    background: 'rgba(4, 12, 22, 0.88)',
    backdropFilter: 'blur(14px)',
    WebkitBackdropFilter: 'blur(14px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
    animation: 'csModalIn 0.3s cubic-bezier(0.16,1,0.3,1)',
  },
  card: {
    position: 'relative',
    width: 'min(480px, 92vw)',
    background: 'linear-gradient(135deg, #081b30 0%, #0f2c4c 100%)',
    border: '1px solid rgba(191,230,255,0.18)',
    borderRadius: '26px',
    padding: '56px 44px 48px',
    textAlign: 'center',
    boxShadow: '0 40px 90px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,183,3,0.12)',
    animation: 'csCardIn 0.35s cubic-bezier(0.16,1,0.3,1)',
  },
  closeBtn: {
    position: 'absolute',
    top: '16px',
    right: '16px',
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    border: '1px solid rgba(191,230,255,0.2)',
    background: 'rgba(15,44,76,0.6)',
    color: '#eef4f9',
    fontSize: '18px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    lineHeight: 1,
  },
  eyebrow: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: '0.72rem',
    letterSpacing: '0.18em',
    color: '#ffb703',
    textTransform: 'uppercase',
    marginBottom: '18px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
  },
  title: {
    fontFamily: "'Chakra Petch', sans-serif",
    fontWeight: 700,
    fontSize: 'clamp(2rem, 6vw, 2.8rem)',
    color: '#eef4f9',
    letterSpacing: '0.02em',
    textTransform: 'uppercase',
    margin: '0 0 16px',
    lineHeight: 1.1,
  },
  subtitle: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '1rem',
    color: '#bfe6ff',
    opacity: 0.8,
    lineHeight: 1.6,
    margin: '0 0 36px',
  },
  backBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: '0.78rem',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    padding: '12px 28px',
    borderRadius: '999px',
    border: '1px solid #ffb703',
    color: '#081b30',
    background: '#ffb703',
    cursor: 'pointer',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    textDecoration: 'none',
  },
  dots: {
    display: 'flex',
    justifyContent: 'center',
    gap: '8px',
    marginBottom: '32px',
  },
  dot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: 'rgba(191,230,255,0.25)',
  },
  dotActive: {
    width: '24px',
    borderRadius: '999px',
    background: '#ffb703',
  },
};

const keyframeStyle = `
  @keyframes csModalIn { from { opacity:0 } to { opacity:1 } }
  @keyframes csCardIn  { from { opacity:0; transform:scale(0.9) translateY(20px) } to { opacity:1; transform:scale(1) translateY(0) } }
`;

export default function GalleryComingSoon() {
  const [open, setOpen] = useState(true);
  const navigate = useNavigate();

  const handleClose = () => {
    setOpen(false);
    navigate('/');
  };

  return (
    <>
      {/* Keep GalleryPage rendered but hidden so the code is preserved */}
      <div style={{ visibility: 'hidden', pointerEvents: 'none', position: 'fixed' }}>
        <GalleryPage />
      </div>

      {open && (
        <div style={styles.backdrop} onClick={handleClose}>
          <style>{keyframeStyle}</style>
          <div style={styles.card} onClick={(e) => e.stopPropagation()}>
            {/* Close × */}
            <button
              style={styles.closeBtn}
              onClick={handleClose}
              aria-label="Close"
              onMouseEnter={(e) => { e.currentTarget.style.background = '#ffb703'; e.currentTarget.style.color = '#081b30'; e.currentTarget.style.borderColor = '#ffb703'; e.currentTarget.style.transform = 'rotate(90deg) scale(1.05)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(15,44,76,0.6)'; e.currentTarget.style.color = '#eef4f9'; e.currentTarget.style.borderColor = 'rgba(191,230,255,0.2)'; e.currentTarget.style.transform = 'none'; }}
            >
              ×
            </button>

            {/* Decorative dots */}
            <div style={styles.dots}>
              <div style={{ ...styles.dot, ...styles.dotActive }} />
              <div style={styles.dot} />
              <div style={styles.dot} />
            </div>

            {/* Eyebrow */}
            <div style={styles.eyebrow}>
              <span style={{ width: '24px', height: '1px', background: '#ffb703', display: 'inline-block' }} />
              Gallery
              <span style={{ width: '24px', height: '1px', background: '#ffb703', display: 'inline-block' }} />
            </div>

            {/* Headline */}
            <h2 style={styles.title}>Coming Soon</h2>

            {/* Body */}
            <p style={styles.subtitle}>
              We're curating the best moments from our events.<br />
              The gallery will be live shortly — stay tuned!
            </p>

            {/* Back button */}
            <button
              style={styles.backBtn}
              onClick={handleClose}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 24px rgba(255,183,3,0.3)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              ← Back to Home
            </button>
          </div>
        </div>
      )}
    </>
  );
}
