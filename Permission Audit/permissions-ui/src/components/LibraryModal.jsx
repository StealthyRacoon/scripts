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
    campaignId,
    updateDecision,
    addedUsers,
    setAddedUsers,
}) {
    const [expandedGroups, setExpandedGroups] = useState({});
    const [selectedRows, setSelectedRows] = useState({});
    const [showAddUserModal, setShowAddUserModal] = useState(false);
    const [activeGroup, setActiveGroup] = useState(null);
    
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


    // move this to the parent component
    const handleConfirmChanges = async () => {
        const changedRows = (libraryData || []).filter(
            (row) => row.decision != null
        );

        const normalizedLog = changedRows.map((row) => ({
            principal: row.principal,
            site: row.site,
            library: row.library,
            UPN: row.email,
            Permission: row.permission || row.perm || "No Permission",
            GroupName: row.group || "Direct",
            Decision: row.decision,
            campaignId,
        }));


        if (normalizedLog.length === 0) {
            console.log("No changes to submit");
            return;
        }

        try {
            await api.post("/audit", normalizedLog);
            notify.success("Changes submitted!");
        } catch (err) {
            notify.error(err.response?.data?.message || "Failed to submit changes");
            console.error(err);
        }

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
                                                            updateDecision={updateDecision}
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
                    libraryData={libraryData}
                    addedUsers={addedUsers}
                    close={() => setShowConfirmModal(false)}
                    confirm={handleConfirmChanges}
                />

            )}
        </>
    );
}