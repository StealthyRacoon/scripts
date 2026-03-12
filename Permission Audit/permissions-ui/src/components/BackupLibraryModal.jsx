import { useState, useMemo } from "react";
import { FaCheck, FaTrash, FaUserPlus } from "react-icons/fa";

import ConfirmChangesModal from "./ConfirmChangesModal";
import AddUserModal from "./AddUserModal";

export default function LibraryModal({
    libraryName,
    libraryData,
    closeModal,
    decisions,
    setDecisions,
}) {

    const [expandedPermissions, setExpandedPermissions] = useState({});
    const [expandedGroups, setExpandedGroups] = useState({});
    const [selectedRows, setSelectedRows] = useState({});
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    const [showAddUserModal, setShowAddUserModal] = useState(false);
    const [activeGroup, setActiveGroup] = useState(null);

    const [addedUsers, setAddedUsers] = useState({});

    // Group existing permission data
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


    const togglePermissionExpand = (perm) => {
        setExpandedPermissions(prev => ({ ...prev, [perm]: !prev[perm] }));
    };

    const toggleGroupExpand = (perm, group) => {
        const key = `${perm}-${group}`;
        setExpandedGroups(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const toggleSelectRow = (key) => {
        setSelectedRows(prev => ({ ...prev, [key]: !prev[key] }));
    };


    const toggleSelectAll = (rows) => {

        const allSelected = rows.every(
            r => selectedRows[`${r.principal}-${r._idx}`]
        );

        const updated = { ...selectedRows };

        rows.forEach(r => {
            updated[`${r.principal}-${r._idx}`] = !allSelected;
        });

        setSelectedRows(updated);
    };


    const setDecision = (key, value) => {
        setDecisions(prev => ({ ...prev, [key]: value }));
    };


    const applyBulkDecision = (rows, value) => {

        const updated = { ...decisions };

        rows.forEach(row => {

            const key = `${row.principal}-${row._idx}`;

            if (selectedRows[key]) {
                updated[key] = value;
            }

        });

        setDecisions(updated);
    };


    const handleSubmit = () => {
        setShowConfirmModal(true);
    };


    const handleAddUsers = (users) => {

        const key = `${activeGroup.perm}-${activeGroup.group}`;

        setAddedUsers(prev => {

            const existing = prev[key] || [];

            const uniqueUsers = users.filter(
                user => !existing.includes(user)
            );

            return {
                ...prev,
                [key]: [...existing, ...uniqueUsers]
            };

        });

    };


    return (
        <>
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
                        padding: 15,
                        borderBottom: "1px solid #ccc",
                        background: "#f5f5f5",
                    }}
                >
                    <h2 style={{ margin: 0 }}>{libraryName}</h2>
                    <button onClick={closeModal}>✖</button>
                </div>


                {/* Body */}
                <div style={{ padding: 20, overflowY: "auto", flex: 1 }}>

                    {Object.entries(groupedData).map(([perm, groupObj]) => (

                        <div key={perm} style={{ border: "1px solid #ccc", marginBottom: 20 }}>

                            {/* Permission Header */}
                            <div
                                onClick={() => togglePermissionExpand(perm)}
                                style={{
                                    padding: 10,
                                    background: "#eee",
                                    cursor: "pointer",
                                    fontWeight: "bold",
                                }}
                            >
                                {expandedPermissions[perm] ? "▼" : "▶"} {perm}
                            </div>


                            {expandedPermissions[perm] &&
                                Object.entries(groupObj).map(([group, rows]) => {

                                    const keyGroup = `${perm}-${group}`;
                                    const isExpanded = expandedGroups[keyGroup];

                                    const selectedCount = rows.filter(
                                        r => selectedRows[`${r.principal}-${r._idx}`]
                                    ).length;

                                    const addedKey = `${perm}-${group}`;
                                    const groupAddedUsers = addedUsers[addedKey] || [];

                                    return (

                                        <div key={group} style={{ marginLeft: 20, marginTop: 10 }}>

                                            {/* Group Header */}
                                            <div
                                                onClick={() => toggleGroupExpand(perm, group)}
                                                style={{
                                                    padding: 8,
                                                    background: "#f3f3f3",
                                                    cursor: "pointer",
                                                    fontWeight: 500,
                                                }}
                                            >
                                                {isExpanded ? "▼" : "▶"} {group}
                                            </div>


                                            {isExpanded && (
                                                <>

                                                    {/* Table */}
                                                    <table
                                                        style={{
                                                            width: "100%",
                                                            borderCollapse: "collapse",
                                                            marginTop: 6,
                                                        }}
                                                    >
                                                        <thead>
                                                            <tr>

                                                                <th style={{ border: "1px solid #ccc" }}>
                                                                    <input
                                                                        type="checkbox"
                                                                        onChange={() => toggleSelectAll(rows)}
                                                                    />
                                                                </th>

                                                                <th style={{ border: "1px solid #ccc" }}>
                                                                    Principal
                                                                </th>

                                                                <th style={{ border: "1px solid #ccc" }}>
                                                                    {selectedCount > 0 ? (

                                                                        <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>

                                                                            <button
                                                                                onClick={() => applyBulkDecision(rows, "Approve")}
                                                                                style={{
                                                                                    padding: "6px 10px",
                                                                                    borderRadius: 4,
                                                                                    border: "1px solid #28a745",
                                                                                    background: "#28a745",
                                                                                    color: "white",
                                                                                    cursor: "pointer"
                                                                                }}
                                                                            >
                                                                                <FaCheck />
                                                                            </button>

                                                                            <button
                                                                                onClick={() => applyBulkDecision(rows, "Remove")}
                                                                                style={{
                                                                                    padding: "6px 10px",
                                                                                    borderRadius: 4,
                                                                                    border: "1px solid #dc3545",
                                                                                    background: "#dc3545",
                                                                                    color: "white",
                                                                                    cursor: "pointer"
                                                                                }}
                                                                            >
                                                                                <FaTrash />
                                                                            </button>

                                                                        </div>

                                                                    ) : "Decision"}
                                                                </th>

                                                            </tr>
                                                        </thead>


                                                        <tbody>
                                                            {rows.map(row => {

                                                                const key = `${row.principal}-${row._idx}`;

                                                                return (

                                                                    <tr
                                                                        key={key}
                                                                        style={{
                                                                            background: selectedRows[key] ? "#d0ebff" : "white",
                                                                            cursor: "pointer",
                                                                        }}
                                                                        onClick={() => toggleSelectRow(key)}
                                                                    >

                                                                        <td style={{ textAlign: "center" }}>
                                                                            <input
                                                                                type="checkbox"
                                                                                checked={!!selectedRows[key]}
                                                                                readOnly
                                                                            />
                                                                        </td>

                                                                        <td style={{ padding: 6 }}>
                                                                            {row.principal}
                                                                        </td>

                                                                        <td style={{ padding: 6 }}>

                                                                            <button
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    setDecision(key, "Approve");
                                                                                }}
                                                                                style={{
                                                                                    marginRight: 6,
                                                                                    padding: "6px 10px",
                                                                                    borderRadius: 4,
                                                                                    border: "1px solid #28a745",
                                                                                    background: decisions[key] === "Approve" ? "#28a745" : "white",
                                                                                    color: decisions[key] === "Approve" ? "white" : "#28a745",
                                                                                    cursor: "pointer"
                                                                                }}
                                                                            >
                                                                                <FaCheck />
                                                                            </button>

                                                                            <button
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    setDecision(key, "Remove");
                                                                                }}
                                                                                style={{
                                                                                    padding: "6px 10px",
                                                                                    borderRadius: 4,
                                                                                    border: "1px solid #dc3545",
                                                                                    background: decisions[key] === "Remove" ? "#dc3545" : "white",
                                                                                    color: decisions[key] === "Remove" ? "white" : "#dc3545",
                                                                                    cursor: "pointer"
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
                                                    {groupAddedUsers.length > 0 && (
                                                        <div style={{ marginTop: 10 }}>
                                                            <strong>Added Users:</strong>

                                                            <div style={{ marginTop: 6 }}>

                                                                {groupAddedUsers.map(user => (

                                                                    <span
                                                                        key={user}
                                                                        style={{
                                                                            padding: "4px 8px",
                                                                            background: "#e7f3ff",
                                                                            border: "1px solid #b6daff",
                                                                            borderRadius: 4,
                                                                            marginRight: 6,
                                                                            display: "inline-block"
                                                                        }}
                                                                    >
                                                                        {user}
                                                                    </span>

                                                                ))}

                                                            </div>
                                                        </div>
                                                    )}


                                                    {/* Add User Button */}
                                                    <div style={{ marginTop: 10 }}>
                                                        <button
                                                            onClick={() => {
                                                                setActiveGroup({ perm, group });
                                                                setShowAddUserModal(true);
                                                            }}
                                                            style={{
                                                                padding: "6px 12px",
                                                                borderRadius: 4,
                                                                border: "1px solid #0d6efd",
                                                                background: "#0d6efd",
                                                                color: "white",
                                                                cursor: "pointer",
                                                                display: "flex",
                                                                alignItems: "center",
                                                                gap: 6
                                                            }}
                                                        >
                                                            <FaUserPlus />
                                                            Add User
                                                        </button>
                                                    </div>

                                                </>
                                            )}

                                        </div>

                                    );

                                })}

                        </div>

                    ))}

                </div>


                {/* Footer */}
                <div
                    style={{
                        padding: 15,
                        borderTop: "1px solid #ccc",
                        display: "flex",
                        justifyContent: "flex-end",
                        background: "#f5f5f5",
                    }}
                >
                    <button
                        onClick={handleSubmit}
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


            {/* Add User Modal */}
            {showAddUserModal && (
                <AddUserModal
                    perm={activeGroup?.perm}
                    group={activeGroup?.group}
                    close={() => setShowAddUserModal(false)}
                    onAdd={handleAddUsers}
                />
            )}


            {/* Confirm Modal */}
            {showConfirmModal && (
                <ConfirmChangesModal
                    decisions={decisions}
                    addedUsers={addedUsers}
                    close={() => setShowConfirmModal(false)}
                    confirm={() => {
                        console.log("Confirmed changes:", decisions);
                        setShowConfirmModal(false);
                        closeModal();
                    }}
                />
            )}

        </>
    );
}