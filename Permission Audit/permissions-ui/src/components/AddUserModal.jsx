import { useState, useMemo } from "react";
import { FaCheck, FaUser } from "react-icons/fa";

export default function AddUserModal({
  perm,
  group,
  close,
  onAdd,
  allUsers,
  selectedUsers = [],
  setSelectedUsers
}) {

  const [search, setSearch] = useState("");

  const filteredUsers = useMemo(() => {
    return allUsers.filter(
      (u) =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, allUsers]);

  const toggleUser = (user) => {

    const exists = selectedUsers.some((u) => u.email === user.email);

    const updated = exists
      ? selectedUsers.filter((u) => u.email !== user.email)
      : [...selectedUsers, user];

    setSelectedUsers(updated);
  };

  const handleAdd = () => {
    if (!selectedUsers.length) return;
    // onAdd(selectedUsers);
    close();
  };

  return (
    <div
      style={{
        position: "fixed",
        top: "20%",
        left: "35%",
        width: "30%",
        maxHeight: "65vh",
        background: "white",
        border: "1px solid #999",
        borderRadius: 6,
        boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
        display: "flex",
        flexDirection: "column",
      }}
    >

      {/* Header */}
      <div
        style={{
          padding: 12,
          borderBottom: "1px solid #ccc",
          fontWeight: 600,
          background: "#f5f5f5"
        }}
      >
        Add Users to {group} ({perm})
      </div>

      {/* Body */}
      <div
        style={{
          padding: 12,
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden"
        }}
      >

        {/* Search */}
        <input
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: "100%",
            padding: 8,
            border: "1px solid #ccc",
            borderRadius: 4,
            marginBottom: 10
          }}
        />

        {/* Selected users */}
        {selectedUsers.length > 0 && (
          <div
            style={{
              marginBottom: 10,
              maxHeight: 80,
              overflowY: "auto",
              border: "1px solid #eee",
              padding: 6,
              borderRadius: 4
            }}
          >
            <strong>Selected:</strong>

            <div style={{ marginTop: 6 }}>
              {selectedUsers.map((user) => (
                <div key={user.email} style={{ padding: "2px 4px" }}>
                  {user.name}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* User list */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            border: "1px solid #ddd",
            borderRadius: 4,
            minHeight: 0
          }}
        >
          {filteredUsers.map((user) => {

            const selected = selectedUsers.some(
              (u) => u.email === user.email
            );

            return (
              <div
                key={user.email}
                onClick={() => toggleUser(user)}
                style={{
                  padding: 8,
                  cursor: "pointer",
                  borderBottom: "1px solid #eee",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  background: selected ? "#d0ebff" : "white"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <FaUser size={12} />
                  {user.name}
                </div>

                {selected && <FaCheck color="#28a745" />}
              </div>
            );
          })}
        </div>

      </div>

      {/* Footer */}
      <div
        style={{
          padding: 10,
          borderTop: "1px solid #ccc",
          display: "flex",
          justifyContent: "flex-end",
          gap: 10
        }}
      >

        <button
          onClick={close}
          style={{
            padding: "6px 12px",
            borderRadius: 4,
            border: "1px solid #ccc",
            background: "#f5f5f5",
            cursor: "pointer"
          }}
        >
          Cancel
        </button>

        <button
          disabled={!selectedUsers.length}
          onClick={handleAdd}
          style={{
            padding: "6px 14px",
            borderRadius: 4,
            border: "none",
            background: selectedUsers.length ? "#0d6efd" : "#bcd4ff",
            color: "white",
            cursor: selectedUsers.length ? "pointer" : "not-allowed"
          }}
        >
          Add {selectedUsers.length || ""}
        </button>

      </div>

    </div>
  );
}