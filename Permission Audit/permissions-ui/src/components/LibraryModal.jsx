import { useState, useMemo } from "react";
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
  const [addedUsers, setAddedUsers] = useState({});
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
  // console.log(libraryData)
  const togglePermissionExpand = (perm) => {
    setExpandedPermissions((prev) => ({ ...prev, [perm]: !prev[perm] }));
  };

  const toggleGroupExpand = (perm, group) => {
    const key = `${perm}-${group}`;
    setExpandedGroups((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleAddUsers = (users) => {
    const key = `${activeGroup.perm}-${activeGroup.group}`;
    setAddedUsers((prev) => ({
      ...prev,
      [key]: [...(prev[key] || []), ...users],
    }));
  };

const handleConfirmChanges = () => {
  const normalizedLog = [];

  // Process individual decisions
  Object.entries(decisions).forEach(([key, decision]) => {
    const [principal, idx] = key.split("-");
    const row = libraryData.find(
      (r) => r.principal === principal && r._idx?.toString() === idx
    );
    if (row) {
      normalizedLog.push({
        site: row.site,
        library: row.library,
        user: row.email,
        decision,
      });
    }
  });

  // Process added users
  Object.entries(addedUsers).forEach(([groupKey, users]) => {
    users.forEach((user) => {
      normalizedLog.push({
        site: selectedLibrary.site,
        library: selectedLibrary.library,
        user: user.email,
        decision: "Add",
      });
    });
  });

  console.log("Normalized Log:", normalizedLog);
  setShowConfirmModal(false);
  closeModal();
};

  const groupKey = `${activeGroup?.perm}-${activeGroup?.group}`;

  const setGroupSelectedUsers = (users) => {
    setAddedUsers((prev) => ({
      ...prev,
      [groupKey]: users,
    }));
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
                  const groupAddedUsers = addedUsers[keyGroup] || [];

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
                            addedUsers={addedUsers[groupKey] || []}
                            setSelectedUsers={setAddedUsers}
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
          perm={activeGroup?.perm}
          group={activeGroup?.group}
          close={() => setShowAddUserModal(false)}
          onAdd={handleAddUsers}
          allUsers={allUsers}
          selectedUsers={addedUsers[`${activeGroup?.perm}-${activeGroup?.group}`] || []}
          setSelectedUsers={setGroupSelectedUsers}
        />
      )}

      {showConfirmModal && (
        <ConfirmChangesModal
          decisions={decisions}
          addedUsers={addedUsers}
          close={() => setShowConfirmModal(false)}
          confirm={handleConfirmChanges}
        />
      )}
    </>
  );
}