import { useState } from "react";

export default function LibraryModal({
    site,
    libraryName,
    libraryData,
    closeModal,
    decisions,
    setDecisions,
}) {
    const [selectedRows, setSelectedRows] = useState({});
    const [bulkAction, setBulkAction] = useState("");
    const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

    const handleSort = (key) => {
        let direction = "asc";
        if (sortConfig.key === key && sortConfig.direction === "asc") direction = "desc";
        setSortConfig({ key, direction });
    };

    const sortData = (data) => {
        if (!sortConfig.key) return data;
        return [...data].sort((a, b) => {
            let aVal = a[sortConfig.key] || "";
            let bVal = b[sortConfig.key] || "";
            if (typeof aVal === "string") {
                aVal = aVal.toLowerCase();
                bVal = bVal.toLowerCase();
            }
            if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
            if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
            return 0;
        });
    };

    const toggleRow = (key) => {
        setSelectedRows((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    const toggleSelectAll = () => {
        const allSelected = libraryData.every((row, idx) => selectedRows[`${row.principal}-${idx}`]);
        const newSelection = {};
        libraryData.forEach((row, idx) => {
            const key = `${row.principal}-${idx}`;
            newSelection[key] = !allSelected;
        });
        setSelectedRows(newSelection);
    };

    const saveDecision = (key, decision) => {
        setDecisions((prev) => ({ ...prev, [key]: decision }));
    };

    const applyBulkAction = () => {
        if (!bulkAction) return;
        const updated = { ...decisions };
        libraryData.forEach((row, idx) => {
            const key = `${row.principal}-${idx}`;
            if (selectedRows[key]) updated[key] = bulkAction;
        });
        setDecisions(updated);
        setBulkAction(""); // reset
    };

    const submitDecisions = () => {
        console.log("Decisions submitted:", decisions);
        closeModal();
    };

    const thStyle = { border: "1px solid #ccc", padding: 8, textAlign: "left" };
    const tdStyle = { border: "1px solid #ddd", padding: 8, textAlign: "left" };

    const sortIndicator = (key) => {
        if (sortConfig.key !== key) return "⇅";
        return sortConfig.direction === "asc" ? "▲" : "▼";
    };

    const anySelected = Object.values(selectedRows).some(Boolean);

    return (
        <div
            style={{
                position: "fixed",
                top: 40,
                left: "5%",
                width: "90%",
                maxHeight: "85vh",
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
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "15px 20px",
                    borderBottom: "1px solid #ccc",
                    background: "#f5f5f5",
                    borderTopLeftRadius: 6,
                    borderTopRightRadius: 6,
                }}
            >
                <h2 style={{ margin: 0, fontSize: 18 }}>{libraryName}</h2>
                <button
                    onClick={closeModal}
                    style={{
                        border: "none",
                        background: "transparent",
                        fontSize: 18,
                        cursor: "pointer",
                        fontWeight: "bold",
                    }}
                >
                    ✖
                </button>
            </div>

            {/* Body */}
            <div style={{ padding: 20, overflowY: "auto", flex: 1 }}>
                {/* Bulk Actions */}


                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                        <tr style={{ background: "#eee" }}>
                            <th style={thStyle}>
                                <input type="checkbox" onChange={toggleSelectAll} />
                            </th>
                            <th style={thStyle} onClick={() => handleSort("principal")}>
                                Principal {sortIndicator("principal")}
                            </th>
                            <th style={thStyle} onClick={() => handleSort("permission")}>
                                Permission {sortIndicator("permission")}
                            </th>
                            <th style={thStyle} onClick={() => handleSort("group")}>
                                Given Through {sortIndicator("group")}
                            </th>
                            <th style={thStyle} onClick={() => handleSort("isDirect")}>
                                Direct {sortIndicator("isDirect")}
                            </th>
                            <th style={thStyle}>Decision</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortData(libraryData).map((row, idx) => {
                            const key = `${row.principal}-${idx}`;
                            return (
                                <tr
                                    key={key}
                                    onClick={() => toggleRow(key)}
                                    style={{
                                        background: idx % 2 === 0 ? "#fff" : "#f9f9f9",
                                        cursor: "pointer",
                                    }}
                                    onMouseEnter={(e) => (e.currentTarget.style.background = "#dbe9ff")}
                                    onMouseLeave={(e) =>
                                        (e.currentTarget.style.background = idx % 2 === 0 ? "#fff" : "#f9f9f9")
                                    }
                                >
                                    <td style={{ textAlign: "center" }}>
                                        <input
                                            type="checkbox"
                                            checked={!!selectedRows[key]}
                                            onChange={(e) => {
                                                e.stopPropagation();
                                                toggleRow(key);
                                            }}
                                        />
                                    </td>
                                    <td style={tdStyle}>{row.principal}</td>
                                    <td style={tdStyle}>{row.permission}</td>
                                    <td style={tdStyle}>{row.group || "-"}</td>
                                    <td style={{ ...tdStyle, textAlign: "center" }}>{row.isDirect ? "⚠" : ""}</td>
                                    <td style={{ ...tdStyle, textAlign: "center" }}>
                                        <select
                                            value={decisions[key] || ""}
                                            onChange={(e) => saveDecision(key, e.target.value)}
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
            </div>

            {/* Footer */}
            <div
                style={{
                    padding: 15,
                    borderTop: "1px solid #ccc",
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: 10,
                    background: "#f5f5f5",
                    borderBottomLeftRadius: 6,
                    borderBottomRightRadius: 6,
                }}
            >

    
                {anySelected && (
                    <div style={{ marginBottom: 15, display: "flex", gap: 10, alignItems: "center" }}>
                        <select
                            value={bulkAction}
                            onChange={(e) => setBulkAction(e.target.value)}
                            style={{ padding: 6, borderRadius: 4, border: "1px solid #ccc" }}
                        >
                            <option value="">Bulk Action</option>
                            <option value="Keep">Keep</option>
                            <option value="Remove">Remove</option>
                            <option value="MoveToGroup">Move to Group</option>
                            <option value="Reduce">Reduce Permission</option>
                        </select>
                        <button
                            onClick={applyBulkAction}
                            style={{
                                padding: "6px 14px",
                                borderRadius: 4,
                                border: "1px solid #ccc",
                                background: "#f1f1f1",
                                cursor: "pointer",
                            }}
                        >
                            Apply
                        </button>
                    </div>
                )}

                <button
                    onClick={submitDecisions}
                    style={{
                        padding: "8px 18px",
                        background: "#0d6efd",
                        color: "white",
                        border: "none",
                        borderRadius: 4,
                        cursor: "pointer",
                    }}
                >
                    Submit
                </button>
            </div>
        </div >
    );
}