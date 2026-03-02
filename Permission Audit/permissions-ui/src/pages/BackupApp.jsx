import { useEffect, useMemo, useState } from "react";
import axios from "axios";

export default function App() {
  const [owner, setOwner] = useState("");
  const [summary, setSummary] = useState({});
  const [selectedLibrary, setSelectedLibrary] = useState(null);
  const [decisions, setDecisions] = useState({});
  const [bulkAction, setBulkAction] = useState("");
  const [selectedRows, setSelectedRows] = useState({});
  const [librarySort, setLibrarySort] = useState({ key: null, direction: "asc" });
  const [modalSort, setModalSort] = useState({ key: null, direction: "asc" });

  // =========================
  // Fetch Data
  // =========================
  useEffect(() => {
    if (!owner) return;

    axios
      .get(`http://localhost:4000/api/sites?owner=${owner}`)
      .then((res) => buildSummary(res.data))
      .catch((err) => console.error(err));
  }, [owner]);

  const buildSummary = (rows) => {
    const grouped = rows.reduce((acc, row) => {
      if (!row.ObjectType?.toLowerCase().includes("library")) return acc;

      const site = row.URL;
      const library = row.SharePointObject;

      if (!acc[site]) acc[site] = {};
      if (!acc[site][library]) {
        acc[site][library] = {
          permissions: [],
          directCount: 0,
        };
      }

      const isDirect =
        !row.GivenThrough || row.GivenThrough === row.Name;

      if (isDirect) acc[site][library].directCount++;

      acc[site][library].permissions.push({
        id: `${row.Name}-${row.Permission}-${row.GivenThrough}`,
        principal: row.Name,
        group: row.GivenThrough,
        permission: row.Permission,
        isDirect,
      });

      return acc;
    }, {});

    setSummary(grouped);
  };

  // =========================
  // Sorting Helpers
  // =========================
  const sortArray = (data, config) => {
    if (!config.key) return data;

    return [...data].sort((a, b) => {
      let aVal = a[config.key];
      let bVal = b[config.key];

      if (typeof aVal === "string") {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

      if (aVal < bVal) return config.direction === "asc" ? -1 : 1;
      if (aVal > bVal) return config.direction === "asc" ? 1 : -1;
      return 0;
    });
  };

  const toggleSort = (key, setter, current) => {
    let direction = "asc";
    if (current.key === key && current.direction === "asc") {
      direction = "desc";
    }
    setter({ key, direction });
  };

  const sortIcon = (key, config) => {
    if (config.key !== key) return "↕";
    return config.direction === "asc" ? "▲" : "▼";
  };

  // =========================
  // Modal Logic
  // =========================
  const openLibrary = (site, library) => {
    setSelectedRows({});
    setModalSort({ key: null, direction: "asc" });

    setSelectedLibrary({
      site,
      library,
      data: summary[site][library].permissions,
    });
  };

  const toggleRow = (id) => {
    setSelectedRows((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const allSelected = useMemo(() => {
    if (!selectedLibrary) return false;
    return selectedLibrary.data.every((r) => selectedRows[r.id]);
  }, [selectedRows, selectedLibrary]);

  const toggleSelectAll = () => {
    if (!selectedLibrary) return;

    const newSelection = {};
    if (!allSelected) {
      selectedLibrary.data.forEach((row) => {
        newSelection[row.id] = true;
      });
    }

    setSelectedRows(newSelection);
  };

  const saveDecision = (id, decision) => {
    setDecisions((prev) => ({
      ...prev,
      [id]: decision,
    }));
  };

  const applyBulkAction = () => {
    if (!bulkAction) return;

    const updated = { ...decisions };

    Object.keys(selectedRows).forEach((id) => {
      if (selectedRows[id]) {
        updated[id] = bulkAction;
      }
    });

    setDecisions(updated);
  };

  // =========================
  // Styles
  // =========================
  const th = (align = "left") => ({
    border: "1px solid #ccc",
    padding: 10,
    textAlign: align,
    fontWeight: 600,
    cursor: "pointer",
  });

  const td = (align = "left") => ({
    border: "1px solid #ddd",
    padding: 8,
    textAlign: align,
  });

  // =========================
  // Render
  // =========================
  return (
    <div style={{ padding: 40, fontFamily: "Segoe UI, sans-serif" }}>
      <h1>SharePoint Permission Review</h1>

      <input
        placeholder="Enter Owner Name"
        value={owner}
        onChange={(e) => setOwner(e.target.value)}
        style={{
          padding: 8,
          width: 300,
          marginBottom: 30,
          border: "1px solid #ccc",
          borderRadius: 4,
        }}
      />

      {Object.keys(summary).map((site) => {
        const libraries = Object.entries(summary[site]).map(
          ([library, info]) => ({
            library,
            ...info,
          })
        );

        const sortedLibraries = sortArray(libraries, librarySort);

        return (
          <div key={site} style={{ marginBottom: 50 }}>
            <h2 style={{ borderBottom: "2px solid #ccc" }}>{site}</h2>

            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                border: "1px solid #ccc",
              }}
            >
              <thead>
                <tr style={{ background: "#e9ecef" }}>
                  <th
                    style={th("left")}
                    onClick={() =>
                      toggleSort("library", setLibrarySort, librarySort)
                    }
                  >
                    Library {sortIcon("library", librarySort)}
                  </th>
                  <th
                    style={th("right")}
                    onClick={() =>
                      toggleSort("directCount", setLibrarySort, librarySort)
                    }
                  >
                    Direct Users {sortIcon("directCount", librarySort)}
                  </th>
                  <th
                    style={th("right")}
                    onClick={() =>
                      toggleSort("permissions", setLibrarySort, librarySort)
                    }
                  >
                    Total Permissions {sortIcon("permissions", librarySort)}
                  </th>
                  <th style={th("center")}>Status</th>
                  <th style={th("center")}></th>
                </tr>
              </thead>

              <tbody>
                {sortedLibraries.map((row, index) => {
                  const hasRisk = row.directCount > 0;

                  return (
                    <tr
                      key={row.library}
                      style={{
                        background:
                          index % 2 === 0 ? "#ffffff" : "#f8f9fa",
                      }}
                    >
                      <td style={td("left")}>{row.library}</td>
                      <td style={td("right")}>{row.directCount}</td>
                      <td style={td("right")}>
                        {row.permissions.length}
                      </td>
                      <td style={td("center")}>
                        <span
                          style={{
                            padding: "4px 10px",
                            borderRadius: 12,
                            background: hasRisk
                              ? "#dc3545"
                              : "#198754",
                            color: "white",
                            fontSize: 12,
                          }}
                        >
                          {hasRisk ? "Needs Review" : "OK"}
                        </span>
                      </td>
                      <td style={td("center")}>
                        <button
                          onClick={() =>
                            openLibrary(site, row.library)
                          }
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
          </div>
        );
      })}

      {selectedLibrary && (
        <div
          style={{
            position: "fixed",
            top: 40,
            left: "5%",
            width: "90%",
            background: "white",
            border: "1px solid #999",
            padding: 25,
            maxHeight: "85vh",
            overflowY: "auto",
            boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
          }}
        >
          <h2>{selectedLibrary.library}</h2>

          <div style={{ marginBottom: 20 }}>
            <select
              value={bulkAction}
              onChange={(e) => setBulkAction(e.target.value)}
            >
              <option value="">Bulk Action</option>
              <option value="Keep">Keep</option>
              <option value="Remove">Remove</option>
              <option value="MoveToGroup">Move to Group</option>
              <option value="Reduce">Reduce Permission</option>
            </select>

            <button
              onClick={applyBulkAction}
              style={{ marginLeft: 10 }}
            >
              Apply to Selected
            </button>
          </div>

          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              border: "1px solid #ccc",
            }}
          >
            <thead>
              <tr style={{ background: "#e9ecef" }}>
                <th style={th("center")}>
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleSelectAll}
                  />
                </th>
                <th
                  style={th("left")}
                  onClick={() =>
                    toggleSort("principal", setModalSort, modalSort)
                  }
                >
                  Principal {sortIcon("principal", modalSort)}
                </th>
                <th
                  style={th("left")}
                  onClick={() =>
                    toggleSort("permission", setModalSort, modalSort)
                  }
                >
                  Permission {sortIcon("permission", modalSort)}
                </th>
                <th
                  style={th("left")}
                  onClick={() =>
                    toggleSort("group", setModalSort, modalSort)
                  }
                >
                  Given Through {sortIcon("group", modalSort)}
                </th>
                <th
                  style={th("center")}
                  onClick={() =>
                    toggleSort("isDirect", setModalSort, modalSort)
                  }
                >
                  Direct {sortIcon("isDirect", modalSort)}
                </th>
                <th style={th("center")}>Decision</th>
              </tr>
            </thead>

            <tbody>
              {sortArray(selectedLibrary.data, modalSort).map(
                (row, index) => (
                  <tr
                    key={row.id}
                    style={{
                      background:
                        index % 2 === 0 ? "#ffffff" : "#f8f9fa",
                    }}
                  >
                    <td style={td("center")}>
                      <input
                        type="checkbox"
                        checked={!!selectedRows[row.id]}
                        onChange={() => toggleRow(row.id)}
                      />
                    </td>
                    <td style={td("left")}>{row.principal}</td>
                    <td style={td("left")}>{row.permission}</td>
                    <td style={td("left")}>
                      {row.group || "-"}
                    </td>
                    <td style={td("center")}>
                      {row.isDirect ? "⚠" : ""}
                    </td>
                    <td style={td("center")}>
                      <select
                        value={decisions[row.id] || ""}
                        onChange={(e) =>
                          saveDecision(row.id, e.target.value)
                        }
                      >
                        <option value="">Select</option>
                        <option value="Keep">Keep</option>
                        <option value="Remove">Remove</option>
                        <option value="MoveToGroup">
                          Move to Group
                        </option>
                        <option value="Reduce">
                          Reduce Permission
                        </option>
                      </select>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>

          <div style={{ marginTop: 25 }}>
            <button
              onClick={() => setSelectedLibrary(null)}
              style={{
                padding: "8px 18px",
                background: "#6c757d",
                color: "white",
                border: "none",
                borderRadius: 4,
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}