import { useState } from "react";

export default function PermissionTable({
  data,
  site,
  library,
  selectedRows,
  toggleRow,
  toggleSelectAll,
  decisions,
  saveDecision,
}) {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") direction = "desc";
    setSortConfig({ key, direction });
  };

  const sortedData = [...data].sort((a, b) => {
    if (!sortConfig.key) return 0;
    let aVal = a[sortConfig.key];
    let bVal = b[sortConfig.key];
    if (typeof aVal === "string") {
      aVal = aVal.toLowerCase();
      bVal = bVal.toLowerCase();
    }
    if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
    if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

  const thStyle = (align = "left") => ({
    border: "1px solid #ccc",
    padding: 10,
    textAlign: align,
    fontWeight: 600,
    cursor: "pointer",
  });

  const tdStyle = (align = "left") => ({
    border: "1px solid #ddd",
    padding: 8,
    textAlign: align,
  });

  const sortIcon = (key) => {
    if (sortConfig.key !== key) return "↕";
    return sortConfig.direction === "asc" ? "▲" : "▼";
  };

  return (
    <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #ccc" }}>
      <thead>
        <tr style={{ background: "#e9ecef" }}>
          <th style={thStyle("center")}>
            <input type="checkbox" onChange={toggleSelectAll} />
          </th>
          <th style={thStyle("left")} onClick={() => handleSort("principal")}>
            Principal {sortIcon("principal")}
          </th>
          <th style={thStyle("left")} onClick={() => handleSort("permission")}>
            Permission {sortIcon("permission")}
          </th>
          <th style={thStyle("left")} onClick={() => handleSort("group")}>
            Given Through {sortIcon("group")}
          </th>
          <th style={thStyle("center")} onClick={() => handleSort("isDirect")}>
            Direct {sortIcon("isDirect")}
          </th>
          <th style={thStyle("center")}>Decision</th>
        </tr>
      </thead>
      <tbody>
        {sortedData.map((row, idx) => {
          const key = site + library + row.principal + idx;
          const isSelected = selectedRows[key];

          return (
            <tr
              key={idx}
              onClick={() => toggleRow(key)}
              style={{
                background: isSelected ? "#d0ebff" : idx % 2 === 0 ? "#ffffff" : "#f8f9fa",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#cfe2ff")}
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = isSelected ? "#d0ebff" : idx % 2 === 0 ? "#ffffff" : "#f8f9fa")
              }
            >
              <td style={tdStyle("center")}>
                <input
                  type="checkbox"
                  checked={!!isSelected}
                  readOnly
                />
              </td>
              <td style={tdStyle("left")}>{row.principal}</td>
              <td style={tdStyle("left")}>{row.permission}</td>
              <td style={tdStyle("left")}>{row.group || "-"}</td>
              <td style={tdStyle("center")}>{row.isDirect ? "⚠" : ""}</td>
              <td style={tdStyle("center")}>
                <select
                  value={decisions[key] || ""}
                  onChange={(e) => saveDecision({ ...decisions, [key]: e.target.value })}
                  onClick={(e) => e.stopPropagation()}
                >
                  <option value="">Select</option>
                  <option value="Keep">Keep</option>
                  <option value="Remove">Remove</option>
                  <option value="MoveToGroup">Move to Group</option>
                  <option value="Reduce">Reduce Permission</option>
                </select>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}