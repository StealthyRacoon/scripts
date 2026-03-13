import { useState, useMemo, useEffect } from "react";
import { FaUserPlus } from "react-icons/fa";
import PermissionTable from "./PermissionTable";
import AddUserModal from "./AddUserModal";
import ConfirmChangesModal from "./ConfirmChangesModal";

export default function LibraryModal({
    libraryName,
    libraryData = [],
    closeModal,
    decisions,
    setDecisions,
    allUsers,
    selectedLibrary
}) {

    const [expandedPermissions, setExpandedPermissions] = useState({});
    const [expandedGroups, setExpandedGroups] = useState({});
    const [selectedRows, setSelectedRows] = useState({});
    const [showAddUserModal, setShowAddUserModal] = useState(false);
    const [activeGroup, setActiveGroup] = useState(null);
    const [addedUsers, setAddedUsers] = useState([]);
    const [showConfirmModal, setShowConfirmModal] = useState(false);

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
        setExpandedPermissions((prev) => ({ ...prev, [perm]: !prev[perm] }));
    };

    const toggleGroupExpand = (perm, group) => {
        const key = `${perm}-${group}`;
        setExpandedGroups((prev) => ({ ...prev, [key]: !prev[key] }));
    };


    const handleConfirmChanges = () => {
        const normalizedLog = [];

        // From decisions (Approve/Remove)
        Object.entries(decisions || {}).forEach(([key, decision]) => {
            const [principal, idx] = key.split("-");
            const row = libraryData.find(
                (r) => r.principal === principal && r._idx?.toString() === idx
            );
            if (!row) return;

            normalizedLog.push({
                site: row.site,
                library: row.library,
                user: row.email,
                perm: row.permission || row.perm || "No Permission",
                group: row.group || "Direct",
                decision, // "Approve" | "Remove"
            });
        });

        // From added users (flat array)
        (addedUsers || []).forEach((u) => {
            normalizedLog.push({
                site: u.site,
                library: selectedLibrary.library,
                user: u.email,
                perm: u.perm,
                group: u.group,
                decision: "Add",
            });
        });

        // Persist snapshot for this site/library
        setChangeLogs((prev) => ({
            ...prev,
            [siteLibKey]: {
                normalizedLog,
                decisions,   // to re-edit later
                addedUsers,  // to re-edit later
                updatedAt: new Date().toISOString(),
            },
        }));

        console.log("Normalized Log:", normalizedLog);
        setShowConfirmModal(false);
        closeModal();
    };


    const rowLookup = useMemo(() => {
        const map = {};
        (libraryData || []).forEach((row, idx) => {
            map[`${row.principal}-${idx}`] = { ...row, _idx: idx };
        });
        return map;
    }, [libraryData]);



    const [changeLogs, setChangeLogs] = useState(() => {
        try { return JSON.parse(localStorage.getItem("changeLogs") || "{}"); }
        catch { return {}; }
    });

    useEffect(() => {
        localStorage.setItem("changeLogs", JSON.stringify(changeLogs));
    }, [changeLogs]);

    const siteLibKey = `${selectedLibrary.site}::${selectedLibrary.library}`;

    useEffect(() => {
        const saved = changeLogs[siteLibKey];
        if (saved) {
            setDecisions(saved.decisions || {});
            setAddedUsers(saved.addedUsers || []);
        }
    }, [siteLibKey])


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


                                    return (
                                        <div key={group} style={{ marginLeft: 20, marginTop: 10, marginBottom: 10 }}>
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
                                                    <PermissionTable
                                                        data={rows}
                                                        selectedRows={selectedRows}
                                                        setSelectedRows={setSelectedRows}
                                                        decisions={decisions}
                                                        setDecisions={setDecisions}
                                                        groupKey={keyGroup}
                                                        addedUsers={addedUsers}
                                                        setAddedUsers={setAddedUsers}
                                                        site={selectedLibrary.site}
                                                        perm={perm}
                                                        group={group}
                                                    />

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
                                                                gap: 6,
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
                        onClick={() => setShowConfirmModal(true)}
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

            {showAddUserModal && (
                <AddUserModal
                    site={selectedLibrary.site}
                    perm={activeGroup?.perm}
                    group={activeGroup?.group}
                    allUsers={allUsers}
                    addedUsers={addedUsers}
                    setAddedUsers={setAddedUsers}
                    close={() => setShowAddUserModal(false)}
                />
            )}


            {showConfirmModal && (
                <ConfirmChangesModal
                    decisions={decisions}
                    addedUsers={addedUsers}
                    close={() => setShowConfirmModal(false)}
                    confirm={handleConfirmChanges}
                    rowLookup={rowLookup} // <— pass lookup
                />
            )}

        </>
    )
}