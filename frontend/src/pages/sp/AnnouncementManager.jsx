import { useState, useEffect } from "react";
import { superAdminService } from "../../services/superAdminService";

const AnnouncementManager = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [form, setForm] = useState({ title: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadAnnouncements = async () => {
    try {
      const data = await superAdminService.getAnnouncements();
      setAnnouncements(data);
    } catch (error) {
      setError("Failed to load announcements");
      console.error("Error loading announcements:", error);
    }
  };

  useEffect(() => {
    const load = async () => {
      await loadAnnouncements();
    };
    load();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await superAdminService.createAnnouncement(form);
      setForm({ title: "", message: "" });
      loadAnnouncements();
    } catch (error) {
      setError("Failed to create announcement");
      console.error("Error creating announcement:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleActive = async (id, is_active) => {
    try {
      await superAdminService.updateAnnouncement(id, { is_active: !is_active });
      loadAnnouncements();
    } catch (error) {
      setError("Failed to update announcement");
      console.error("Error updating announcement:", error);
    }
  };

  return (
    <div className="sp-container">
      <h2>System Announcements</h2>

      {error && <div className="sp-error">{error}</div>}

      <form onSubmit={handleSubmit} className="sp-form">
        <div className="sp-form-group">
          <label>Title</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />
        </div>
        <div className="sp-form-group">
          <label>Message</label>
          <textarea
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            required
            rows="4"
          />
        </div>
        <button type="submit" disabled={loading} className="sp-btn">
          {loading ? "Creating..." : "Create Announcement"}
        </button>
      </form>

      <div className="sp-table-container">
        <table className="sp-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Message</th>
              <th>Status</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {announcements.map((announcement) => (
              <tr key={announcement.id}>
                <td>{announcement.title}</td>
                <td>{announcement.message}</td>
                <td>
                  <span
                    className={
                      announcement.is_active
                        ? "status-active"
                        : "status-inactive"
                    }
                  >
                    {announcement.is_active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td>
                  {new Date(announcement.created_at).toLocaleDateString()}
                </td>
                <td>
                  <button
                    onClick={() =>
                      toggleActive(announcement.id, announcement.is_active)
                    }
                    className="sp-btn-small"
                  >
                    {announcement.is_active ? "Deactivate" : "Activate"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AnnouncementManager;
