import { useState, useMemo } from "react";
import { Modal, Button, Typography, Collapse, Space } from "antd";
import { PlusOutlined, RightOutlined, DownOutlined } from "@ant-design/icons";

import PermissionTable from "./PermissionTable";
import AddUserModal from "./AddUserModal";
import ConfirmChangesModal from "./ConfirmChangesModal";

import api from "../utils/api";
import { useStatus } from "../providers/StatusProvider";

const { Title } = Typography;

export default function LibraryModal({
    libraryName,
    libraryData = [],
    closeModal,
    decisions,
    setDecisions,
    allUsers,
    selectedLibrary,
    loading,
    setLoading,
    campaignId
}) {
    const [expandedGroups, setExpandedGroups] = useState({});
    const [selectedRows, setSelectedRows] = useState({});
    const [showAddUserModal, setShowAddUserModal] = useState(false);
    const [activeGroup, setActiveGroup] = useState(null);
    const [addedUsers, setAddedUsers] = useState([]);
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    const { notify } = useStatus();

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

    const handleConfirmChanges = async () => {
        const normalizedLog = [];

        Object.entries(decisions || {}).forEach(([key, decision]) => {
            const [principal, idx] = key.split("-");
            const row = libraryData.find(
                (r) => r.principal === principal && r._idx?.toString() === idx
            );
            if (!row) return;

            normalizedLog.push({
                principal,
                site: row.site,
                library: row.library,
                UPN: row.email,
                Permission: row.permission || row.perm || "No Permission",
                GroupName: row.group || "Direct",
                Decision: decision,
                campaignId, // ✅ ADDED
            });
        });

        (addedUsers || []).forEach((u) => {
            normalizedLog.push({
                principal: u.name || u.email,
                site: u.site,
                library: selectedLibrary.library,
                UPN: u.email,
                Permission: u.perm,
                GroupName: u.group,
                Decision: "Add",
                campaignId, // ✅ ADDED
            });
        });

        setLoading({ showMessage: true, isLoading: true, color: "#faad14" });

        try {
            await api.post("/audit", normalizedLog);
            notify.success("Changes submitted and audit log saved!");
        } catch (error) {
            setLoading({ showMessage: true, isLoading: false, color: "#f5222d" });
        } finally {
            setLoading({ showMessage: false, isLoading: false });
            setShowConfirmModal(false);
            closeModal();
        }
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
                    <Collapse
                        accordion
                        items={Object.entries(groupedData).map(([perm, groupObj]) => ({
                            key: perm,
                            label: perm,
                            children: (
                                <Space orientation="vertical" style={{ width: "100%" }}>
                                    {Object.entries(groupObj).map(([group, rows]) => {
                                        const keyGroup = `${perm}-${group}`;
                                        const isExpanded = expandedGroups[keyGroup];

                                        return (
                                            <div key={group}>
                                                <Button
                                                    type="text"
                                                    icon={isExpanded ? <DownOutlined /> : <RightOutlined />}
                                                    onClick={() => toggleGroupExpand(perm, group)}
                                                >
                                                    {group}
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
                            ),
                        }))}
                    />
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