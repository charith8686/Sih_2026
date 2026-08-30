import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

export const NotificationsView = ({ onNavigate }) => {
  const { token, user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // 'all', 'unread'

  const fetchNotifications = () => {
    setLoading(true);
    fetch(`http://127.0.0.1:8000/api/notifications`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((data) => {
        setNotifications(data.notifications || []);
        setUnreadCount(data.unread_count || 0);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchNotifications();
  }, [token]);

  const markAsRead = async (id, actionUrl) => {
    try {
      await fetch(`http://127.0.0.1:8000/api/notifications/${id}/read`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchNotifications();
      if (actionUrl && onNavigate) {
        onNavigate(actionUrl);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch(`http://127.0.0.1:8000/api/notifications/read-all`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteNotification = async (e, id) => {
    e.stopPropagation();
    try {
      await fetch(`http://127.0.0.1:8000/api/notifications/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const clearAllNotifications = async () => {
    if (!window.confirm("Clear all notifications?")) return;
    try {
      await fetch(`http://127.0.0.1:8000/api/notifications`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "NEW_COMPLAINT": return "📝";
      case "VIOLATION_CREATED": return "⚠️";
      case "CORRECTIVE_ACTION_SUBMITTED": return "📄";
      case "CORRECTIVE_ACTION_APPROVED": return "✅";
      case "CORRECTIVE_ACTION_DENIED": return "❌";
      case "REVISION_REQUIRED": return "🔄";
      case "VIOLATION_ESCALATED": return "🚨";
      case "COMPLAINT_RESOLVED": return "🎉";
      default: return "🔔";
    }
  };

  const filteredNotifs = filter === "unread" ? notifications.filter(n => !n.is_read) : notifications;

  return (
    <div style={{ padding: "1.5rem", maxWidth: "900px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <div>
          <h2 style={{ margin: "0 0 0.25rem 0", fontSize: "1.3rem", fontWeight: 800, color: "#0f172a" }}>
            Notifications & Enforcement Alerts
          </h2>
          <p style={{ margin: 0, fontSize: "0.85rem", color: "#64748b" }}>
            Real-time updates across the integrated 3-stakeholder enforcement workflow.
          </p>
        </div>

        <div style={{ display: "flex", gap: "0.5rem" }}>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              style={{
                padding: "0.5rem 0.85rem",
                backgroundColor: "#ffffff",
                border: "1px solid #cbd5e1",
                borderRadius: "6px",
                fontSize: "0.8rem",
                fontWeight: 600,
                color: "#1e3a8a",
                cursor: "pointer"
              }}
            >
              Mark all as read
            </button>
          )}
          {notifications.length > 0 && (
            <button
              onClick={clearAllNotifications}
              style={{
                padding: "0.5rem 0.85rem",
                backgroundColor: "#fef2f2",
                border: "1px solid #fecaca",
                borderRadius: "6px",
                fontSize: "0.8rem",
                fontWeight: 600,
                color: "#b91c1c",
                cursor: "pointer"
              }}
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
        <button
          onClick={() => setFilter("all")}
          style={{
            padding: "0.4rem 0.9rem",
            borderRadius: "6px",
            border: "none",
            fontSize: "0.8rem",
            fontWeight: 700,
            cursor: "pointer",
            backgroundColor: filter === "all" ? "#1e3a8a" : "#f1f5f9",
            color: filter === "all" ? "#ffffff" : "#64748b"
          }}
        >
          All Notifications ({notifications.length})
        </button>
        <button
          onClick={() => setFilter("unread")}
          style={{
            padding: "0.4rem 0.9rem",
            borderRadius: "6px",
            border: "none",
            fontSize: "0.8rem",
            fontWeight: 700,
            cursor: "pointer",
            backgroundColor: filter === "unread" ? "#1e3a8a" : "#f1f5f9",
            color: filter === "unread" ? "#ffffff" : "#64748b"
          }}
        >
          Unread ({unreadCount})
        </button>
      </div>

      {/* Notifications List */}
      <div style={{
        backgroundColor: "#ffffff",
        borderRadius: "10px",
        border: "1px solid #e2e8f0",
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        overflow: "hidden"
      }}>
        {filteredNotifs.length > 0 ? (
          filteredNotifs.map((n) => (
            <div
              key={n.id}
              onClick={() => markAsRead(n.id, n.action_url)}
              style={{
                padding: "1rem 1.25rem",
                borderBottom: "1px solid #f1f5f9",
                backgroundColor: n.is_read ? "#ffffff" : "#f0f9ff",
                display: "flex",
                alignItems: "flex-start",
                gap: "1rem",
                cursor: "pointer",
                transition: "background-color 0.15s ease",
                position: "relative"
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = n.is_read ? "#f8fafc" : "#e0f2fe"}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = n.is_read ? "#ffffff" : "#f0f9ff"}
            >
              <span style={{ fontSize: "1.4rem", marginTop: "2px" }}>
                {getNotificationIcon(n.type)}
              </span>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "0.88rem", fontWeight: n.is_read ? 600 : 700, color: "#0f172a" }}>
                    {n.title}
                  </span>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span style={{ fontSize: "0.74rem", color: "#94a3b8" }}>
                      {n.created_at}
                    </span>
                    <button
                      onClick={(e) => deleteNotification(e, n.id)}
                      style={{
                        background: "none",
                        border: "none",
                        fontSize: "0.8rem",
                        color: "#94a3b8",
                        cursor: "pointer",
                        padding: "2px"
                      }}
                      title="Delete notification"
                    >
                      ✕
                    </button>
                  </div>
                </div>
                <p style={{ margin: "4px 0 0 0", fontSize: "0.82rem", color: "#334155", lineHeight: 1.4 }}>
                  {n.message}
                </p>
                {n.entity_id && (
                  <span style={{ display: "inline-block", marginTop: "6px", fontSize: "0.72rem", color: "#1e3a8a", fontWeight: 600 }}>
                    Reference: {n.entity_id} →
                  </span>
                )}
              </div>
            </div>
          ))
        ) : (
          <div style={{ padding: "3rem", textAlign: "center", color: "#94a3b8" }}>
            {loading ? "Loading notifications..." : "No notifications to display."}
          </div>
        )}
      </div>
    </div>
  );
};