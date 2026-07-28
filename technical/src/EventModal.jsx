import React, { useState, useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, MapPin, Users, Calendar, Clock, Award } from 'lucide-react';
import './EventModal.css';

const DEFAULT_IMAGES = [
  '1.jpeg',
  '2.jpeg',
  '3.jpeg',
  '4.jpeg',
  'ground.jpeg'
];

export default function EventModal({ event, onClose }) {
  const [currentIdx, setCurrentIdx] = useState(0);

  const images = event?.images && event.images.length > 0
    ? event.images
    : [
        '1.jpeg',
        'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=1000&q=80'
      ];

  const prevSlide = useCallback(() => {
    setCurrentIdx((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  }, [images.length]);

  const nextSlide = useCallback(() => {
    setCurrentIdx((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  }, [images.length]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') prevSlide();
      if (e.key === 'ArrowRight') nextSlide();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, prevSlide, nextSlide]);

  if (!event) return null;

  return (
    <div className="event-modal-backdrop" onClick={onClose}>
      <div className="event-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Close button */}
        <button className="event-modal-close" onClick={onClose} aria-label="Close modal">
          <X size={20} />
        </button>

        {/* Top Image Carousel */}
        <div className="event-modal-carousel">
          <div
            className="event-modal-carousel-track"
            style={{ transform: `translateX(-${currentIdx * 100}%)` }}
          >
            {images.map((imgUrl, i) => (
              <div key={i} className="event-modal-slide">
                <img src={imgUrl} alt={`${event.title} screenshot ${i + 1}`} />
              </div>
            ))}
          </div>

          {images.length > 1 && (
            <>
              <button className="event-modal-nav prev" onClick={prevSlide} aria-label="Previous image">
                <ChevronLeft size={22} />
              </button>
              <button className="event-modal-nav next" onClick={nextSlide} aria-label="Next image">
                <ChevronRight size={22} />
              </button>

              <div className="event-modal-dots">
                {images.map((_, i) => (
                  <button
                    key={i}
                    className={`event-modal-dot ${i === currentIdx ? 'active' : ''}`}
                    onClick={() => setCurrentIdx(i)}
                    aria-label={`Go to slide ${i + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Bottom Content Section */}
        <div className="event-modal-content">
          <div className="event-modal-header-row">
            <span className="event-modal-date mono">{event.date}</span>
            {event.tag && <span className="event-modal-tag mono">{event.tag}</span>}
          </div>

          <h2 className="event-modal-title">{event.title}</h2>

          <div className="event-modal-meta-row">
            {event.loc && (
              <div className="event-modal-meta-item">
                <MapPin size={15} />
                <span>{event.loc}</span>
              </div>
            )}
            {event.meta && (
              <div className="event-modal-meta-item">
                <Users size={15} />
                <span>{event.meta}</span>
              </div>
            )}
            <div className="event-modal-meta-item">
              <Clock size={15} />
              <span>6:00 PM - Late</span>
            </div>
          </div>

          <div className="event-modal-body">
            <h3>About This Build</h3>
            <p>{event.desc || event.description}</p>

            <div className="event-modal-highlights">
              <div className="highlight-item">
                <Award size={16} className="highlight-icon" />
                <span>Free hardware kits, solder stations &amp; microcontrollers provided on site.</span>
              </div>
              <div className="highlight-item">
                <Calendar size={16} className="highlight-icon" />
                <span>Mentors available for embedded C++, PCB routing &amp; 3D printing support.</span>
              </div>
            </div>
          </div>

          <div className="event-modal-footer">
            <button className="btn primary event-rsvp-btn" onClick={() => alert(`RSVP confirmed for ${event.title}!`)}>
              RSVP For Event →
            </button>
            <button className="btn ghost event-cal-btn" onClick={() => alert("Added to your calendar!")}>
              + Add to Calendar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
