import React from "react";
import { FaCheck, FaTrash } from "react-icons/fa";

export default function PermissionTable({
  data = [],
  selectedRows,
  setSelectedRows,
  decisions,
  setDecisions,
  groupKey, // for addedUsers
  addedUsers = [],
  setAddedUsers,
  selectedUsers,
  setSelectedUsers,
}) {
  // Keys
  const getRowKey = (row) => `${row.email}-${row._idx}`;
  const getDecisionKey = (row) => `${row.principal}-${row._idx}`;

  // Toggle a single row selection
  const toggleSelectRow = (row) => {
    const key = getRowKey(row);
    setSelectedRows((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Toggle all rows
  const toggleSelectAll = () => {
    const allSelected = data.every((r) => selectedRows[getRowKey(r)]);
    const updated = { ...selectedRows };
    data.forEach((r) => {
      updated[getRowKey(r)] = !allSelected;
    });
    setSelectedRows(updated);
  };

  // Set decision for a row
  const setDecision = (row, value) => {
    const key = getDecisionKey(row);
    setDecisions((prev) => ({ ...prev, [key]: value }));
  };

  const selectedCount = data.filter((r) => selectedRows[getRowKey(r)]).length;

  // Remove added user
  const removeAddedUser = (email) => {
    setSelectedUsers((prev) => ({
      ...prev,
      [groupKey]: (prev[groupKey] || []).filter((u) => u.email !== email),
    }));
  };

  return (
    <div style={{ marginTop: 10 }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ border: "1px solid #ccc", padding: 6 }}>
              <input
                type="checkbox"
                onChange={toggleSelectAll}
                checked={data.length > 0 && data.every((r) => selectedRows[getRowKey(r)])}
              />
            </th>
            <th style={{ border: "1px solid #ccc", padding: 6 }}>Principal</th>
            <th style={{ border: "1px solid #ccc", padding: 6 }}>
              {selectedCount > 0 ? (
                <div style={{ display: "flex", justifyContent: "center", gap: 6 }}>
                  <button
                    onClick={() =>
                      data.forEach((r) =>
                        selectedRows[getRowKey(r)] && setDecision(r, "Approve")
                      )
                    }
                    style={{
                      padding: "6px 10px",
                      borderRadius: 4,
                      border: "1px solid #28a745",
                      background: "#28a745",
                      color: "white",
                      cursor: "pointer",
                    }}
                  >
                    <FaCheck />
                  </button>
                  <button
                    onClick={() =>
                      data.forEach((r) =>
                        selectedRows[getRowKey(r)] && setDecision(r, "Remove")
                      )
                    }
                    style={{
                      padding: "6px 10px",
                      borderRadius: 4,
                      border: "1px solid #dc3545",
                      background: "#dc3545",
                      color: "white",
                      cursor: "pointer",
                    }}
                  >
                    <FaTrash />
                  </button>
                </div>
              ) : (
                "Decision"
              )}
            </th>
          </tr>
        </thead>

        <tbody>
          {data.map((row) => {
            const key = getRowKey(row);
            const decisionKey = getDecisionKey(row);
            return (
              <tr
                key={key}
                style={{
                  background: selectedRows[key] ? "#d0ebff" : "white",
                  cursor: "pointer",
                }}
                onClick={() => toggleSelectRow(row)}
              >
                <td style={{ textAlign: "center" }}>
                  <input type="checkbox" checked={!!selectedRows[key]} readOnly />
                </td>
                <td style={{ padding: 6 }}>{row.principal}</td>
                <td style={{ padding: 6 }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDecision(row, "Approve");
                    }}
                    style={{
                      marginRight: 6,
                      padding: "6px 10px",
                      borderRadius: 4,
                      border: "1px solid #28a745",
                      background: decisions[decisionKey] === "Approve" ? "#28a745" : "white",
                      color: decisions[decisionKey] === "Approve" ? "white" : "#28a745",
                      cursor: "pointer",
                    }}
                  >
                    <FaCheck />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDecision(row, "Remove");
                    }}
                    style={{
                      padding: "6px 10px",
                      borderRadius: 4,
                      border: "1px solid #dc3545",
                      background: decisions[decisionKey] === "Remove" ? "#dc3545" : "white",
                      color: decisions[decisionKey] === "Remove" ? "white" : "#dc3545",
                      cursor: "pointer",
                    }}
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Added Users */}
      {addedUsers.length > 0 && (
        <div style={{ marginTop: 10 }}>
          <strong>Added Users:</strong>
          <div style={{ marginTop: 6, display: "flex", flexWrap: "wrap", gap: 6 }}>
            {addedUsers.map((user) => (
              <span
                key={user.email}
                style={{
                  padding: "4px 8px",
                  background: "#e7f3ff",
                  border: "1px solid #b6daff",
                  borderRadius: 4,
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                {user.name}
                <button
                  onClick={() => removeAddedUser(user.email)}
                  style={{
                    border: "none",
                    background: "transparent",
                    cursor: "pointer",
                    fontWeight: "bold",
                    color: "#dc3545",
                  }}
                >
                  ✖
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}