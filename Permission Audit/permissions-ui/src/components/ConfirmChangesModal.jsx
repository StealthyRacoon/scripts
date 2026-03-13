import { FaCheckCircle, FaTimesCircle, FaUserPlus } from "react-icons/fa";

export default function ConfirmChangesModal({
  decisions,
  addedUsers,
  close,
  confirm,
  rowLookup, // { `${principal}-${idx}`: rowWithPermGroup }
}) {
  // --- Group ADDED users by perm -> group (flat array) ---
  const addedByPermGroup = {};
  (addedUsers || []).forEach((u) => {
    const perm = u.perm || "No Permission";
    const group = u.group || "Direct";
    if (!addedByPermGroup[perm]) addedByPermGroup[perm] = {};
    if (!addedByPermGroup[perm][group]) addedByPermGroup[perm][group] = [];
    addedByPermGroup[perm][group].push(u);
  });
  const hasAdded = Object.keys(addedByPermGroup).length > 0;

  // --- Group APPROVED and REMOVED by perm -> group (using rowLookup) ---
  const approvedByPermGroup = {};
  const removedByPermGroup = {};

  Object.entries(decisions || {}).forEach(([key, value]) => {
    const [principal, idx] = key.split("-");
    const row = rowLookup?.[`${principal}-${idx}`];
    if (!row) return;

    const perm = row.permission || row.perm || "No Permission";
    const group = row.group || "Direct";

    const ensureBuckets = (container) => {
      if (!container[perm]) container[perm] = {};
      if (!container[perm][group]) container[perm][group] = [];
      return container[perm][group];
    };

    if (value === "Approve") {
      ensureBuckets(approvedByPermGroup).push(principal);
    } else if (value === "Remove") {
      ensureBuckets(removedByPermGroup).push(principal);
    }
  });

  const hasApproved = Object.keys(approvedByPermGroup).length > 0;
  const hasRemoved  = Object.keys(removedByPermGroup).length > 0;

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
        {/* Added Users grouped by Permission & Group */}
        {hasAdded && (
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

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {Object.entries(addedByPermGroup).map(([perm, groups]) => (
                <div key={`added-${perm}`} style={{ border: "1px solid #e5e5e5", borderRadius: 6 }}>
                  <div
                    style={{
                      padding: "8px 10px",
                      background: "#f7fbff",
                      borderBottom: "1px solid #e5e5e5",
                      fontWeight: 600
                    }}
                  >
                    Permission: {perm}
                  </div>

                  <div style={{ padding: 10, display: "flex", flexDirection: "column", gap: 10 }}>
                    {Object.entries(groups).map(([group, users]) => (
                      <div key={`added-${perm}-${group}`}>
                        <div style={{ fontWeight: 500, marginBottom: 6 }}>
                          Group: {group}
                        </div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                          {users.map((user) => (
                            <span
                              key={`${user.email}-${user.site}-${user.perm}-${user.group}`}
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
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Approved grouped by Permission & Group */}
        {hasApproved && (
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

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {Object.entries(approvedByPermGroup).map(([perm, groups]) => (
                <div key={`approved-${perm}`} style={{ border: "1px solid #e5e5e5", borderRadius: 6 }}>
                  <div
                    style={{
                      padding: "8px 10px",
                      background: "#e8f7ee",
                      borderBottom: "1px solid #e5e5e5",
                      fontWeight: 600
                    }}
                  >
                    Permission: {perm}
                  </div>

                  <div style={{ padding: 10, display: "flex", flexDirection: "column", gap: 10 }}>
                    {Object.entries(groups).map(([group, principals]) => (
                      <div key={`approved-${perm}-${group}`}>
                        <div style={{ fontWeight: 500, marginBottom: 6 }}>
                          Group: {group}
                        </div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                          {principals.map((p) => (
                            <span
                              key={`${p}-${perm}-${group}`}
                              style={{
                                padding: "4px 8px",
                                borderRadius: 4,
                                background: "#e8f7ee",
                                border: "1px solid #b7e4c7",
                                fontSize: 13
                              }}
                            >
                              {p}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Removed grouped by Permission & Group */}
        {hasRemoved && (
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

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {Object.entries(removedByPermGroup).map(([perm, groups]) => (
                <div key={`removed-${perm}`} style={{ border: "1px solid #e5e5e5", borderRadius: 6 }}>
                  <div
                    style={{
                      padding: "8px 10px",
                      background: "#fdeaea",
                      borderBottom: "1px solid #e5e5e5",
                      fontWeight: 600
                    }}
                  >
                    Permission: {perm}
                  </div>

                  <div style={{ padding: 10, display: "flex", flexDirection: "column", gap: 10 }}>
                    {Object.entries(groups).map(([group, principals]) => (
                      <div key={`removed-${perm}-${group}`}>
                        <div style={{ fontWeight: 500, marginBottom: 6 }}>
                          Group: {group}
                        </div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                          {principals.map((p) => (
                            <span
                              key={`${p}-${perm}-${group}`}
                              style={{
                                padding: "4px 8px",
                                borderRadius: 4,
                                background: "#fdeaea",
                                border: "1px solid #f5b5b5",
                                fontSize: 13
                              }}
                            >
                              {p}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
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