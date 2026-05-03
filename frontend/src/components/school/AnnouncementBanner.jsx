import { useState, useEffect } from "react";
import axios from "axios";

const AnnouncementBanner = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5001/api/public/announcements",
        );
        setAnnouncements(response.data.filter((ann) => ann.is_active));
      } catch (error) {
        console.error("Error loading announcements:", error);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (announcements.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % announcements.length);
      }, 10000); // Rotate every 10 seconds
      return () => clearInterval(interval);
    }
  }, [announcements]);

  if (announcements.length === 0) return null;

  const currentAnnouncement = announcements[currentIndex];

  return (
    <div className="announcement-banner">
      <div className="announcement-content">
        <strong>{currentAnnouncement.title}</strong>:{" "}
        {currentAnnouncement.message}
      </div>
      {announcements.length > 1 && (
        <div className="announcement-indicators">
          {announcements.map((_, index) => (
            <span
              key={index}
              className={`indicator ${index === currentIndex ? "active" : ""}`}
              onClick={() => setCurrentIndex(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AnnouncementBanner;
