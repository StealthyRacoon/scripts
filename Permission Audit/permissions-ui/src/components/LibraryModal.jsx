import { useState, useMemo } from "react";

export default function LibraryModal({
    site,
    libraryName,
    libraryData,
    closeModal,
    decisions,
    setDecisions,
}) {
    const [expandedPermissions, setExpandedPermissions] = useState({});
    const [expandedGroups, setExpandedGroups] = useState({});
    const [selectedRows, setSelectedRows] = useState({});
    const [bulkAction, setBulkAction] = useState("");

    // Group data: permission → group → rows
    const groupedData = useMemo(() => {
        const permGroups = {};
        libraryData.forEach((row, idx) => {
            const perm = row.permission || "No Permission";
            const group = row.group || "Direct";

            if (!permGroups[perm]) permGroups[perm] = {};
            if (!permGroups[perm][group]) permGroups[perm][group] = [];
            permGroups[perm][group].push({ ...row, _idx: idx });
        });
        return permGroups;
    }, [libraryData]);

    const toggleSelectRow = (key) => {
        setSelectedRows((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    const toggleSelectAllInGroup = (rows) => {
        const allSelected = rows.every((r) => selectedRows[`${r.principal}-${r._idx}`]);
        const newSelection = { ...selectedRows };
        rows.forEach((r) => {
            newSelection[`${r.principal}-${r._idx}`] = !allSelected;
        });
        setSelectedRows(newSelection);
    };

    const togglePermissionExpand = (perm) => {
        setExpandedPermissions((prev) => ({ ...prev, [perm]: !prev[perm] }));
    };

    const toggleGroupExpand = (perm, group) => {
        const key = `${perm}-${group}`;
        setExpandedGroups((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    const applyBulkAction = () => {
        if (!bulkAction) return;
        const updated = { ...decisions };
        Object.values(groupedData).forEach((groupObj) => {
            Object.values(groupObj).forEach((rows) => {
                rows.forEach((row) => {
                    const key = `${row.principal}-${row._idx}`;
                    if (selectedRows[key]) updated[key] = bulkAction;
                });
            });
        });
        setDecisions(updated);
        setBulkAction("");
    };

    const saveDecision = (key, value) => {
        setDecisions((prev) => ({ ...prev, [key]: value }));
    };

    const submitDecisions = () => {
        console.log("Decisions submitted:", decisions);
        closeModal();
    };

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
                <button onClick={closeModal} style={{ border: "none", background: "transparent", fontSize: 18, cursor: "pointer", fontWeight: "bold" }}>✖</button>
            </div>

            {/* Body */}
            <div style={{ padding: 20, overflowY: "auto", flex: 1 }}>


                {/* Grouped Table */}
                {Object.entries(groupedData).map(([perm, groupObj]) => {
                    const isPermExpanded = expandedPermissions[perm];
                    const permRows = Object.values(groupObj).flat();
                    const allSelectedPerm = permRows.every((r) => selectedRows[`${r.principal}-${r._idx}`]);

                    return (
                        <div key={perm} style={{ marginBottom: 20, border: "1px solid #ccc", borderRadius: 4 }}>
                            {/* Permission Header */}
                            <div
                                onClick={() => togglePermissionExpand(perm)}
                                style={{
                                    padding: "8px 12px",
                                    background: "#eee",
                                    fontWeight: "bold",
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    cursor: "pointer",
                                }}
                            >
                                <div >
                                    {isPermExpanded ? "▼" : "▶"} {perm}
                                </div>
                                {/* <button
                                    onClick={() => toggleSelectAllInGroup(permRows)}
                                    style={{ padding: "2px 6px", cursor: "pointer" }}
                                >
                                    {allSelectedPerm ? "Deselect All" : "Select All"}
                                </button> */}
                            </div>

                            {isPermExpanded &&
                                Object.entries(groupObj).map(([group, rows]) => {
                                    const keyGroup = `${perm}-${group}`;
                                    const isGroupExpanded = expandedGroups[keyGroup];
                                    const allSelectedGroup = rows.every((r) => selectedRows[`${r.principal}-${r._idx}`]);

                                    return (
                                        <div key={group} style={{ marginLeft: 15, marginTop: 8, marginBottom: 8 }}>
                                            {/* Group Header */}
                                            <div
                                                onClick={() => toggleGroupExpand(perm, group)}
                                                style={{
                                                    padding: "6px 10px",
                                                    background: "#f5f5f5",
                                                    display: "flex",
                                                    justifyContent: "space-between",
                                                    alignItems: "center",
                                                    cursor: "pointer",
                                                    fontWeight: 500,
                                                }}
                                            >
                                                <div >
                                                    {isGroupExpanded ? "▼" : "▶"} {group}
                                                </div>
                                                {/* <button
                                                    onClick={() => toggleSelectAllInGroup(rows)}
                                                    style={{ padding: "2px 6px", cursor: "pointer" }}
                                                >
                                                    {allSelectedGroup ? "Deselect All" : "Select All"}
                                                </button> */}
                                            </div>

                                            {/* Rows */}
                                            {isGroupExpanded &&
                                                <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 4 }}>
                                                    <thead>
                                                        <tr style={{ background: "#fff", borderBottom: "1px solid #ccc" }}>                                        
                                                            <th style={{ border: "1px solid #ccc", padding: 6 }}><input type="checkbox" onClick={() => toggleSelectAllInGroup(rows)} /></th>
                                                            <th style={{ border: "1px solid #ccc", padding: 6 }}>Principal</th>
                                                            <th style={{ border: "1px solid #ccc", padding: 6 }}>Decision</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {rows.map((row) => {
                                                            const key = `${row.principal}-${row._idx}`;
                                                            return (
                                                                <tr key={key} onClick={() => toggleSelectRow(key)} style={{ background: selectedRows[key] ? "#d0ebff" : "#fff", cursor: "pointer" }}>
                                                                    <td style={{ textAlign: "center" }}>
                                                                        <input type="checkbox" checked={!!selectedRows[key]} readOnly />
                                                                    </td>
                                                                    <td style={{ padding: 6 }}>{row.principal}</td>
                                                                    <td style={{ textAlign: "center", padding: 6 }}>
                                                                        <select value={decisions[key] || ""} onChange={(e) => saveDecision(key, e.target.value)} onClick={(e) => e.stopPropagation()}>
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
                                            }
                                        </div>
                                    );
                                })}
                        </div>
                    );
                })}
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

                {/* Bulk Action */}
                <div style={{ marginBottom: 15, display: "flex", gap: 10 }}>
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
                        style={{ padding: "6px 14px", borderRadius: 4, border: "1px solid #ccc", background: "#f1f1f1", cursor: "pointer" }}
                    >
                        Apply
                    </button>
                </div>
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
        </div>
    );
}