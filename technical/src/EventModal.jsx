import React, { useEffect } from 'react';
import { X, MapPin, Users, Clock, Award } from 'lucide-react';
import './EventModal.css';

export default function EventModal({ event, onClose }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!event) return null;

  const highlights = event.highlights && event.highlights.length > 0 ? event.highlights : null;

  return (
    <div className="event-modal-backdrop" onClick={onClose}>
      <div className="event-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Close button */}
        <button className="event-modal-close" onClick={onClose} aria-label="Close modal">
          <X size={20} />
        </button>

        {/* Content Section */}
        <div className="event-modal-content" style={{ borderRadius: 'inherit' }}>
          <div className="event-modal-header-row">
            <span className="event-modal-date mono">{event.date}</span>
            {event.tag && <span className="event-modal-tag mono">{event.tag}</span>}
          </div>

          <h2 className="event-modal-title">{event.title}</h2>

          <div className="event-modal-meta-row">
            {event.loc && event.loc !== 'TBA' && (
              <div className="event-modal-meta-item">
                <MapPin size={15} />
                <span>{event.loc}</span>
              </div>
            )}
            {event.meta && event.meta !== 'TBA' && (
              <div className="event-modal-meta-item">
                <Users size={15} />
                <span>{event.meta}</span>
              </div>
            )}
          </div>

          <div className="event-modal-body">
            <h3>About This Event</h3>
            <p>{event.desc || event.description}</p>

            {highlights && (
              <div className="event-modal-highlights">
                {highlights.map((item, i) => (
                  <div className="highlight-item" key={i}>
                    <Award size={16} className="highlight-icon" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="event-modal-footer">
            <button className="btn primary event-rsvp-btn" onClick={() => alert(`RSVP confirmed for ${event.title}!`)}>
              RSVP For Event →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
