import { FaCheckCircle, FaTimesCircle, FaUserPlus } from "react-icons/fa";

export default function ConfirmChangesModal({
  decisions,
  addedUsers,
  close,
  confirm,
}) {


  const approved = [];
  const removed = [];

  Object.entries(decisions).forEach(([key, value]) => {
    const principal = key.split("-")[0];

    if (value === "Approve") approved.push(principal);
    if (value === "Remove") removed.push(principal);
  });

  const added = Object.values(addedUsers || {}).flat();

  return (
    <div
      style={{
        position: "fixed",
        top: "20%",
        left: "30%",
        width: "40%",
        maxHeight: "65vh",
        background: "white",
        border: "1px solid #999",
        borderRadius: 8,
        boxShadow: "0 12px 30px rgba(0,0,0,0.25)",
        display: "flex",
        flexDirection: "column"
      }}
    >

      {/* Header */}
      <div
        style={{
          padding: 16,
          borderBottom: "1px solid #ddd",
          fontWeight: 600,
          fontSize: 18,
          background: "#f5f5f5"
        }}
      >
        Confirm Permission Changes
      </div>

      {/* Body */}
      <div
        style={{
          padding: 16,
          overflowY: "auto",
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: 20
        }}
      >

        {/* Added Users */}
        {added.length > 0 && (
          <div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontWeight: 600,
                marginBottom: 6
              }}
            >
              <FaUserPlus color="#0d6efd" />
              Added Users
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {added.map((user) => (
                <span
                  key={user.email}
                  style={{
                    padding: "4px 8px",
                    borderRadius: 4,
                    background: "#e7f3ff",
                    border: "1px solid #b6daff",
                    fontSize: 13
                  }}
                >
                  {user.name}
                </span>
              ))}
            </div>

          </div>
        )}

        {/* Approved */}
        {approved.length > 0 && (
          <div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontWeight: 600,
                marginBottom: 6
              }}
            >
              <FaCheckCircle color="#28a745" />
              Approved Permissions
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {approved.map((user) => (
                <span
                  key={user}
                  style={{
                    padding: "4px 8px",
                    borderRadius: 4,
                    background: "#e8f7ee",
                    border: "1px solid #b7e4c7",
                    fontSize: 13
                  }}
                >
                  {user}
                </span>
              ))}
            </div>

          </div>
        )}

        {/* Removed */}
        {removed.length > 0 && (
          <div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontWeight: 600,
                marginBottom: 6
              }}
            >
              <FaTimesCircle color="#dc3545" />
              Removed Permissions
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {removed.map((user) => (
                <span
                  key={user}
                  style={{
                    padding: "4px 8px",
                    borderRadius: 4,
                    background: "#fdeaea",
                    border: "1px solid #f5b5b5",
                    fontSize: 13
                  }}
                >
                  {user}
                </span>
              ))}
            </div>

          </div>
        )}

      </div>

      {/* Footer */}
      <div
        style={{
          padding: 14,
          borderTop: "1px solid #ddd",
          display: "flex",
          justifyContent: "flex-end",
          gap: 10,
          background: "#f5f5f5"
        }}
      >

        <button
          onClick={close}
          style={{
            padding: "6px 14px",
            borderRadius: 4,
            border: "1px solid #ccc",
            background: "#f1f1f1",
            cursor: "pointer"
          }}
        >
          Cancel
        </button>

        <button
          onClick={confirm}
          style={{
            padding: "6px 14px",
            borderRadius: 4,
            border: "none",
            background: "#0d6efd",
            color: "white",
            cursor: "pointer",
            fontWeight: 500
          }}
        >
          Confirm Changes
        </button>

      </div>

    </div>
  );
}