import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";

export const Header = ({ currentPath, onNavigate, onToggleSidebar }) => {
  const { user, token, logout } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const dropdownRef = useRef(null);
  const profileRef = useRef(null);
  const [hoverToggle, setHoverToggle] = useState(false);

  const fetchNotifications = async () => {
    if (!token) return;
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unread_count || 0);
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 12000);
    return () => clearInterval(interval);
  }, [token]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileModal(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAsRead = async (id, actionUrl) => {
    try {
      await fetch(`http://127.0.0.1:8000/api/notifications/${id}/read`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchNotifications();
      if (actionUrl && onNavigate) {
        setShowDropdown(false);
        onNavigate(actionUrl);
      }
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
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
      console.error("Failed to mark all as read:", err);
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
      console.error("Failed to delete notification:", err);
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
      console.error("Failed to clear all notifications:", err);
    }
  };

  const getRoleInfo = (role) => {
    switch (role) {
      case "officer":
        return {
          icon: "🛡️",
          label: "OFFICER",
          title: "Legal Metrology Inspector",
          dept: "Enforcement Directorate • Dept of Consumer Affairs",
          bg: "rgba(99, 102, 241, 0.2)",
          text: "#a5b4fc",
          border: "#818cf8",
          glow: "rgba(129, 140, 248, 0.5)"
        };
      case "manufacturer":
        return {
          icon: "🏢",
          label: "MANUFACTURER",
          title: "Packer & Manufacturer Unit",
          dept: `${user?.company_name || "ABC Foods Pvt Ltd"} • Facility Operations`,
          bg: "rgba(16, 185, 129, 0.2)",
          text: "#6ee7b7",
          border: "#34d399",
          glow: "rgba(52, 211, 153, 0.5)"
        };
      case "user":
      default:
        return {
          icon: "👤",
          label: "CONSUMER",
          title: "Consumer / Public User",
          dept: "Consumer Redressal & Verification Desk",
          bg: "rgba(56, 189, 248, 0.2)",
          text: "#7dd3fc",
          border: "#38bdf8",
          glow: "rgba(56, 189, 248, 0.5)"
        };
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

  const roleInfo = getRoleInfo(user?.role);

  return (
    <header style={{
      backgroundColor: "transparent",
      padding: "1rem 2rem 0.5rem 2rem",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      position: "relative",
      zIndex: 50
    }}>
      {/* Left branding with 3-line Toggle */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (onToggleSidebar) onToggleSidebar();
          }}
          onMouseEnter={() => setHoverToggle(true)}
          onMouseLeave={() => setHoverToggle(false)}
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: "4px",
            width: "38px",
            height: "38px",
            background: hoverToggle ? "rgba(56, 189, 248, 0.2)" : "rgba(15, 23, 42, 0.6)",
            border: "1px solid rgba(255, 255, 255, 0.12)",
            borderRadius: "8px",
            padding: "8px 9px",
            cursor: "pointer",
            backdropFilter: "blur(8px)",
            transition: "all 0.2s ease"
          }}
          title="Toggle Navigation Menu"
        >
          <span style={{ width: "100%", height: "2px", backgroundColor: "#38bdf8", borderRadius: "2px" }} />
          <span style={{ width: "100%", height: "2px", backgroundColor: "#38bdf8", borderRadius: "2px" }} />
          <span style={{ width: "100%", height: "2px", backgroundColor: "#38bdf8", borderRadius: "2px" }} />
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", cursor: "pointer" }} onClick={() => onNavigate && onNavigate(`/${user?.role || 'user'}/dashboard`)}>
          <div style={{
            width: "36px",
            height: "36px",
            borderRadius: "8px",
            background: "linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)",
            color: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 900,
            fontSize: "1.1rem",
            boxShadow: "0 0 16px rgba(6, 182, 212, 0.45)"
          }}>
            LM
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <h1 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 800, color: "#ffffff", letterSpacing: "0.01em" }}>
                Legal Metrology Enforcement System
              </h1>
              <span style={{
                fontSize: "0.68rem",
                padding: "0.12rem 0.45rem",
                borderRadius: "4px",
                backgroundColor: "rgba(56, 189, 248, 0.15)",
                color: "#38bdf8",
                border: "1px solid rgba(56, 189, 248, 0.3)",
                fontWeight: 700
              }}>
                PCR-2011 Neural Core
              </span>
            </div>
            <p style={{ margin: 0, fontSize: "0.76rem", color: "#94a3b8" }}>
              Integrated 3-Stakeholder Compliance & Verification Platform
            </p>
          </div>
        </div>
      </div>

      {/* Right Actions: Notifications & Customer Profile Symbol */}
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        {/* Notification Bell */}
        {user && (
          <div style={{ position: "relative" }} ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              style={{
                position: "relative",
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                backgroundColor: showDropdown ? "rgba(56, 189, 248, 0.2)" : "rgba(15, 23, 42, 0.6)",
                color: "#f8fafc",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.15rem",
                cursor: "pointer",
                backdropFilter: "blur(8px)",
                transition: "all 0.2s ease"
              }}
              title="Notifications"
            >
              🔔
              {unreadCount > 0 && (
                <span style={{
                  position: "absolute",
                  top: "-2px",
                  right: "-2px",
                  backgroundColor: "#ef4444",
                  color: "#ffffff",
                  fontSize: "0.68rem",
                  fontWeight: 900,
                  width: "18px",
                  height: "18px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "2px solid #070b14",
                  boxShadow: "0 0 10px rgba(239, 68, 68, 0.8)"
                }}>
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {showDropdown && (
              <div style={{
                position: "absolute",
                top: "48px",
                right: 0,
                width: "360px",
                backgroundColor: "#0f172a",
                borderRadius: "12px",
                boxShadow: "0 20px 40px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.1)",
                zIndex: 100,
                overflow: "hidden",
                display: "flex",
                flexDirection: "column"
              }}>
                <div style={{
                  padding: "0.85rem 1rem",
                  borderBottom: "1px solid #1e293b",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  backgroundColor: "#0b1120"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span style={{ fontWeight: 800, fontSize: "0.88rem", color: "#f8fafc" }}>Notifications</span>
                    {unreadCount > 0 && (
                      <span style={{
                        fontSize: "0.7rem",
                        padding: "0.1rem 0.4rem",
                        borderRadius: "999px",
                        backgroundColor: "#fee2e2",
                        color: "#991b1b",
                        fontWeight: 700
                      }}>
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        style={{
                          background: "none",
                          border: "none",
                          fontSize: "0.74rem",
                          color: "#38bdf8",
                          fontWeight: 700,
                          cursor: "pointer"
                        }}
                      >
                        Mark read
                      </button>
                    )}
                    {notifications.length > 0 && (
                      <button
                        onClick={clearAllNotifications}
                        style={{
                          background: "none",
                          border: "none",
                          fontSize: "0.74rem",
                          color: "#f87171",
                          fontWeight: 700,
                          cursor: "pointer"
                        }}
                      >
                        Clear all
                      </button>
                    )}
                  </div>
                </div>

                <div style={{ overflowY: "auto", flex: 1, maxHeight: "320px" }}>
                  {notifications.length === 0 ? (
                    <div style={{ padding: "2rem", textAlign: "center", color: "#64748b", fontSize: "0.85rem" }}>
                      No notifications yet
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => markAsRead(n.id, n.action_url)}
                        style={{
                          padding: "0.75rem 1rem",
                          borderBottom: "1px solid #1e293b",
                          backgroundColor: n.is_read ? "#0f172a" : "rgba(30, 58, 138, 0.25)",
                          cursor: "pointer",
                          display: "flex",
                          gap: "0.75rem",
                          alignItems: "flex-start",
                          transition: "background-color 0.15s ease"
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgba(56, 189, 248, 0.1)"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = n.is_read ? "#0f172a" : "rgba(30, 58, 138, 0.25)"; }}
                      >
                        <span style={{ fontSize: "1.1rem", marginTop: "2px" }}>
                          {getNotificationIcon(n.type)}
                        </span>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                            <strong style={{ fontSize: "0.82rem", color: "#f8fafc" }}>
                              {n.title}
                            </strong>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                              <span style={{ fontSize: "0.7rem", color: "#64748b" }}>
                                {n.created_at || "Recent"}
                              </span>
                              <button
                                onClick={(e) => deleteNotification(e, n.id)}
                                style={{
                                  background: "none",
                                  border: "none",
                                  color: "#94a3b8",
                                  fontSize: "0.75rem",
                                  cursor: "pointer",
                                  padding: "0 2px"
                                }}
                                title="Delete notification"
                              >
                                ✕
                              </button>
                            </div>
                          </div>
                          <p style={{ margin: "2px 0 0 0", fontSize: "0.76rem", color: "#cbd5e1", lineHeight: 1.3 }}>
                            {n.message}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div style={{
                  padding: "0.6rem",
                  borderTop: "1px solid #1e293b",
                  textAlign: "center",
                  backgroundColor: "#0b1120"
                }}>
                  <button
                    onClick={() => { setShowDropdown(false); onNavigate && onNavigate("/notifications"); }}
                    style={{
                      background: "none",
                      border: "none",
                      fontSize: "0.78rem",
                      color: "#38bdf8",
                      fontWeight: 700,
                      cursor: "pointer"
                    }}
                  >
                    View All Notifications →
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* CUSTOMER / USER PROFILE SYMBOL BUTTON */}
        {user && (
          <div style={{ position: "relative" }} ref={profileRef}>
            <button
              onClick={() => setShowProfileModal(!showProfileModal)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.6rem",
                padding: "0.3rem 0.6rem 0.3rem 0.35rem",
                backgroundColor: showProfileModal ? "rgba(56, 189, 248, 0.2)" : "rgba(15, 23, 42, 0.6)",
                border: `1.5px solid ${showProfileModal ? roleInfo.border : "rgba(255, 255, 255, 0.12)"}`,
                borderRadius: "999px",
                cursor: "pointer",
                backdropFilter: "blur(8px)",
                boxShadow: showProfileModal ? `0 0 16px ${roleInfo.glow}` : "none",
                transition: "all 0.2s ease"
              }}
              title="Click to view Customer Account Details"
            >
              {/* Glowing Customer Avatar Orb */}
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  backgroundColor: roleInfo.bg,
                  border: `1.5px solid ${roleInfo.border}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.1rem",
                  boxShadow: `0 0 10px ${roleInfo.glow}`
                }}
              >
                {roleInfo.icon}
              </div>

              {/* Stakeholder Pill Tag */}
              <span style={{
                fontSize: "0.74rem",
                fontWeight: 800,
                color: roleInfo.text,
                letterSpacing: "0.04em"
              }}>
                {user.name?.split(" ")[0] || roleInfo.label}
              </span>

              <span style={{ fontSize: "0.65rem", color: "#94a3b8" }}>▼</span>
            </button>

            {/* CUSTOMER DETAILS POPOVER MODAL */}
            {showProfileModal && (
              <div
                style={{
                  position: "absolute",
                  top: "48px",
                  right: 0,
                  width: "320px",
                  backgroundColor: "#0f172a",
                  borderRadius: "16px",
                  border: `1.5px solid ${roleInfo.border}`,
                  boxShadow: `0 20px 45px rgba(0, 0, 0, 0.85), 0 0 25px ${roleInfo.glow}`,
                  padding: "1.5rem",
                  zIndex: 110,
                  animation: "fadeIn 0.2s ease-out"
                }}
              >
                {/* Profile Header */}
                <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.25rem" }}>
                  <div
                    style={{
                      width: "52px",
                      height: "52px",
                      borderRadius: "50%",
                      backgroundColor: roleInfo.bg,
                      border: `2px solid ${roleInfo.border}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1.8rem",
                      boxShadow: `0 0 15px ${roleInfo.glow}`
                    }}
                  >
                    {roleInfo.icon}
                  </div>
                  <div>
                    <h3 style={{ margin: "0 0 2px 0", fontSize: "1.05rem", fontWeight: 800, color: "#ffffff" }}>
                      {user.name}
                    </h3>
                    <span style={{
                      fontSize: "0.72rem",
                      fontWeight: 800,
                      color: roleInfo.text,
                      backgroundColor: roleInfo.bg,
                      padding: "0.15rem 0.55rem",
                      borderRadius: "999px",
                      border: `1px solid ${roleInfo.border}`,
                      display: "inline-block"
                    }}>
                      {roleInfo.label}
                    </span>
                  </div>
                </div>

                {/* Details Fields */}
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "1.5rem" }}>
                  <div style={{ backgroundColor: "#0b1120", padding: "0.65rem 0.85rem", borderRadius: "8px", border: "1px solid #1e293b" }}>
                    <div style={{ fontSize: "0.68rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
                      Official Email
                    </div>
                    <div style={{ fontSize: "0.82rem", fontWeight: 600, color: "#f8fafc", marginTop: "2px", wordBreak: "break-all" }}>
                      {user.email || "user@demo.com"}
                    </div>
                  </div>

                  <div style={{ backgroundColor: "#0b1120", padding: "0.65rem 0.85rem", borderRadius: "8px", border: "1px solid #1e293b" }}>
                    <div style={{ fontSize: "0.68rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
                      Stakeholder Designation
                    </div>
                    <div style={{ fontSize: "0.82rem", fontWeight: 600, color: "#38bdf8", marginTop: "2px" }}>
                      {roleInfo.title}
                    </div>
                    <div style={{ fontSize: "0.72rem", color: "#94a3b8", marginTop: "2px" }}>
                      {roleInfo.dept}
                    </div>
                  </div>

                  <div style={{ backgroundColor: "#0b1120", padding: "0.65rem 0.85rem", borderRadius: "8px", border: "1px solid #1e293b", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div>
                      <div style={{ fontSize: "0.68rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
                        Compliance Verification
                      </div>
                      <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "#34d399", marginTop: "2px" }}>
                        ● PCR-2011 Verified Active
                      </div>
                    </div>
                    <span style={{ fontSize: "1.2rem" }}>⚖️</span>
                  </div>
                </div>

                {/* Sign Out Button */}
                <button
                  onClick={() => {
                    setShowProfileModal(false);
                    logout();
                  }}
                  style={{
                    width: "100%",
                    padding: "0.65rem",
                    backgroundColor: "rgba(239, 68, 68, 0.15)",
                    border: "1px solid rgba(239, 68, 68, 0.4)",
                    borderRadius: "8px",
                    color: "#f87171",
                    fontSize: "0.84rem",
                    fontWeight: 800,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.5rem",
                    transition: "all 0.15s ease"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#ef4444";
                    e.currentTarget.style.color = "#ffffff";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "rgba(239, 68, 68, 0.15)";
                    e.currentTarget.style.color = "#f87171";
                  }}
                >
                  <span>🚪</span>
                  <span>Sign Out / Switch Stakeholder</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};