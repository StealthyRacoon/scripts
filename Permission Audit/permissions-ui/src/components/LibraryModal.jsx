import { useState, useMemo, useEffect } from "react";
import { Modal, Button, Typography, Collapse, Space } from "antd";
import { PlusOutlined } from "@ant-design/icons";

import PermissionTable from "./PermissionTable";
import AddUserModal from "./AddUserModal";
import ConfirmChangesModal from "./ConfirmChangesModal";

const { Title, Text } = Typography;
const { Panel } = Collapse;

export default function LibraryModal({
  libraryName,
  libraryData = [],
  closeModal,
  decisions,
  setDecisions,
  allUsers,
  selectedLibrary
}) {
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

  const toggleGroupExpand = (perm, group) => {
    const key = `${perm}-${group}`;
    setExpandedGroups((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const rowLookup = useMemo(() => {
    const map = {};
    (libraryData || []).forEach((row, idx) => {
      map[`${row.principal}-${idx}`] = { ...row, _idx: idx };
    });
    return map;
  }, [libraryData]);

  const handleConfirmChanges = () => {
    const normalizedLog = [];

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
        decision,
      });
    });

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

    setShowConfirmModal(false);
    closeModal();
  };

  return (
    <>
      <Modal
        open={true}
        onCancel={closeModal}
        footer={[
          <Button key="submit" type="primary" onClick={() => setShowConfirmModal(true)}>
            Submit
          </Button>,
        ]}
        width="90%"
        style={{ top: 20 }}
        title={<Title level={4} style={{ margin: 0 }}>{libraryName}</Title>}
      >
        <div style={{ maxHeight: "70vh", overflowY: "auto" }}>
          <Collapse accordion>
            {Object.entries(groupedData).map(([perm, groupObj]) => (
              <Panel header={perm} key={perm}>
                <Space orientation="vertical" style={{ width: "100%" }}>
                  {Object.entries(groupObj).map(([group, rows]) => {
                    const keyGroup = `${perm}-${group}`;
                    const isExpanded = expandedGroups[keyGroup];

                    return (
                      <div key={group}>
                        <Button
                          type="text"
                          onClick={() => toggleGroupExpand(perm, group)}
                        >
                          {isExpanded ? "▼" : "▶"} {group}
                        </Button>

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

                            <Button
                              icon={<PlusOutlined />}
                              type="primary"
                              size="small"
                              style={{ marginTop: 10 }}
                              onClick={() => {
                                setActiveGroup({ perm, group });
                                setShowAddUserModal(true);
                              }}
                            >
                              Add User
                            </Button>
                          </>
                        )}
                      </div>
                    );
                  })}
                </Space>
              </Panel>
            ))}
          </Collapse>
        </div>
      </Modal>

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
          rowLookup={rowLookup}
        />
      )}
    </>
  );
}