import { useState } from "react";

export default function LibraryTable({ libraries, onOpenLibrary }) {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") direction = "desc";
    setSortConfig({ key, direction });
  };

  const sortArray = (data) => {
    if (!sortConfig.key) return data;

    return [...data].sort((a, b) => {
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
  };

  const sortedLibraries = sortArray(libraries);

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
          <th style={thStyle("left")} onClick={() => handleSort("library")}>
            Library {sortIcon("library")}
          </th>
          <th style={thStyle("right")} onClick={() => handleSort("directCount")}>
            Direct Users {sortIcon("directCount")}
          </th>
          <th style={thStyle("right")} onClick={() => handleSort("permissions")}>
            Total Permissions {sortIcon("permissions")}
          </th>
          <th style={thStyle("center")}>Status</th>
          <th style={thStyle("center")}></th>
        </tr>
      </thead>
      <tbody>
        {sortedLibraries.map((row, index) => {
          const hasRisk = row.directCount > 0;
          return (
            <tr key={row.library} style={{ background: index % 2 === 0 ? "#ffffff" : "#f8f9fa" }}>
              <td style={tdStyle("left")}>{row.library}</td>
              <td style={tdStyle("right")}>{row.directCount}</td>
              <td style={tdStyle("right")}>{row.permissions.length}</td>
              <td style={tdStyle("center")}>
                <span
                  style={{
                    padding: "4px 10px",
                    borderRadius: 12,
                    background: hasRisk ? "#dc3545" : "#198754",
                    color: "white",
                    fontSize: 12,
                  }}
                >
                  {hasRisk ? "Needs Review" : "OK"}
                </span>
              </td>
              <td style={tdStyle("center")}>
                <button
                  onClick={() => onOpenLibrary(row.library)}
                  style={{
                    padding: "6px 14px",
                    background: "#0d6efd",
                    color: "white",
                    border: "none",
                    borderRadius: 4,
                    cursor: "pointer",
                  }}
                >
                  Review
                </button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}