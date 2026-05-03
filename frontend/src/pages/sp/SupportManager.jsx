import { useState, useEffect } from "react";
import { superAdminService } from "../../services/superAdminService";

const SupportManager = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadTickets = async () => {
    try {
      const data = await superAdminService.getSupportTickets();
      setTickets(data);
    } catch (error) {
      setError("Failed to load support tickets");
      console.error("Error loading tickets:", error);
    }
  };

  useEffect(() => {
    const load = async () => {
      await loadTickets();
    };
    load();
  }, []);

  const updateStatus = async (id, status) => {
    setLoading(true);
    setError("");
    try {
      await superAdminService.updateTicketStatus(id, { status });
      loadTickets();
    } catch (error) {
      setError("Failed to update ticket status");
      console.error("Error updating ticket:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "open":
        return "status-open";
      case "in_progress":
        return "status-progress";
      case "resolved":
        return "status-resolved";
      case "closed":
        return "status-closed";
      default:
        return "";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "low":
        return "priority-low";
      case "medium":
        return "priority-medium";
      case "high":
        return "priority-high";
      case "urgent":
        return "priority-urgent";
      default:
        return "";
    }
  };

  return (
    <div className="sp-container">
      <h2>Support Tickets</h2>

      {error && <div className="sp-error">{error}</div>}

      <div className="sp-table-container">
        <table className="sp-table">
          <thead>
            <tr>
              <th>School</th>
              <th>Submitted By</th>
              <th>Subject</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((ticket) => (
              <tr key={ticket.id}>
                <td>{ticket.school_name}</td>
                <td>{ticket.submitted_by_name}</td>
                <td>{ticket.subject}</td>
                <td className={getPriorityColor(ticket.priority)}>
                  {ticket.priority}
                </td>
                <td className={getStatusColor(ticket.status)}>
                  {ticket.status.replace("_", " ")}
                </td>
                <td>{new Date(ticket.created_at).toLocaleDateString()}</td>
                <td>
                  <select
                    value={ticket.status}
                    onChange={(e) => updateStatus(ticket.id, e.target.value)}
                    disabled={loading}
                    className="sp-select"
                  >
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SupportManager;
