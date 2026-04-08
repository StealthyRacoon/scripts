import { useEffect, useState } from "react";
import {
    Upload,
    Button,
    Progress,
    Typography,
    message,
    Table,
    Select,
    Tooltip,
    Tag,
    Modal,
    Space
} from "antd";
import { UploadOutlined, InboxOutlined, BellOutlined } from "@ant-design/icons";
import Papa from "papaparse";

import api from "../../utils/api";

const { Dragger } = Upload;
const { Text, Title } = Typography;

export default function AdminOwners() {
    const [fileList, setFileList] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [tableData, setTableData] = useState([]);
    const [columns, setColumns] = useState([]);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 5 });
    const [campaigns, setCampaigns] = useState([]);
    const [campaignId, setCampaignId] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [superOwners, setSuperOwners] = useState([]);
    const [locked, setLocked] = useState(false);



    useEffect(() => {
        // Fetch campaigns
        api.get("/campaigns").then((res) => {
            setCampaigns(res.data);

            // Auto-select the latest campaign by InitiatedAt
            const latest = res.data
                .filter(c => c.Status?.toLowerCase() !== "completed")
                .sort((a, b) => new Date(b.InitiatedAt) - new Date(a.InitiatedAt))[0];

            if (latest) {
                setCampaignId(latest.Id);
                fetchSuperOwners(latest.Id);
            }
        });
    }, []);

    useEffect(() => {
        if (!campaigns || campaigns.length === 0 || !campaignId) return;

        // Find the latest non-completed campaign
        const latestActive = campaigns
            .filter(c => c.Status?.toLowerCase() !== "completed")
            .sort((a, b) => new Date(b.InitiatedAt) - new Date(a.InitiatedAt))[0];

        // Lock if the selected campaign is NOT the latest active one
        setLocked(latestActive ? campaignId !== latestActive.Id : true);
    }, [campaignId, campaigns]);



    const fetchSuperOwners = async (campaignId) => {
        try {
            const res = await api.get(`/superowners`, { params: { campaignId } });
            setSuperOwners(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error(err);
            message.error("Failed to fetch super owners");
            setSuperOwners([]);
        }
    };

    const handleBeforeUpload = (file) => {
        if (file.type !== "text/csv" && !file.name.endsWith(".csv")) {
            message.error("Only CSV files are allowed");
            return Upload.LIST_IGNORE;
        }

        setFileList([file]);

        // Parse CSV
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                if (results.data.length === 0) {
                    message.warning("CSV file is empty");
                    setTableData([]);
                    setColumns([]);
                    return;
                }

                setTableData(
                    results.data.map((row, idx) => ({ key: idx, ...row }))
                );

                setColumns(
                    Object.keys(results.data[0]).filter(key =>
                        ["URL", "Name", "E-mail"].includes(key)
                    ).map((key) => ({
                        title: key,
                        dataIndex: key,
                        key,
                    }))
                );
            },
            error: (err) => {
                message.error("Failed to parse CSV");
                console.error(err);
            },
        });

        return false; // Prevent auto-upload
    };

    const handleRemove = () => {
        setFileList([]);
        setProgress(0);
        setTableData([]);
        setColumns([]);
        setPagination({ current: 1, pageSize: 5 });
    };

    const confirmImport = (onConfirm) => {
        Modal.confirm({
            title: "Existing data detected",
            content: "This campaign already has SuperOwners data. Importing will overwrite existing data. Are you sure you want to continue?",
            okText: "Yes, overwrite",
            cancelText: "Cancel",
            okType: "danger",
            onOk: onConfirm,
        });
    };

    const handleUpload = async () => {
        if (fileList.length === 0 || tableData.length === 0) {
            message.warning("Please select a file first");
            return;
        }
        if (!campaignId) {
            message.warning("Please select a campaign");
            return;
        }

        try {
            // ✅ Check if any existing SuperOwners for this campaign
            // const existingRes = await api.get(`/superowners`, { params: { campaignId } });
            const hasExisting = Array.isArray(superOwners) && superOwners.length > 0;

            const proceed = async () => {
                setUploading(true);
                setProgress(0);

                try {
                    const chunkSize = 100;

                    for (let i = 0; i < tableData.length; i += chunkSize) {
                        const chunk = tableData.slice(i, i + chunkSize);
                        const payload = chunk.map((row) => ({
                            URL: row.URL ?? null,
                            Name: row.Name ?? null,
                            Email: row.Email ?? null,
                            campaignId,
                        }));

                        await api.post("/superowners", {
                            rows: payload,
                            firstChunk: i === 0,
                        });

                        const percent = Math.round(((i + chunkSize) / tableData.length) * 100);
                        setProgress(Math.min(percent, 100));
                    }

                    message.success(`${fileList[0].name} uploaded successfully`);
                    handleRemove();
                } catch (err) {
                    console.error(err);
                    message.error("Upload failed");
                } finally {
                    setUploading(false);
                }
            };

            // ✅ Show confirmation if data exists
            if (hasExisting) {
                confirmImport(proceed);
            } else {
                await proceed();
            }
        } catch (err) {
            console.error(err);
            message.error("Failed to check existing data");
        }
    };

    // Table columns for existing super owners
    const superOwnerColumns = [
        {
            title: "URL",
            dataIndex: "URL",
            key: "URL",
            sorter: (a, b) => (a.URL || "").localeCompare(b.URL || ""),
            sortDirections: ["ascend", "descend"],
        },
        {
            title: "Name",
            dataIndex: "Name",
            key: "Name",
            sorter: (a, b) => (a.Name || "").localeCompare(b.Name || ""),
            sortDirections: ["ascend", "descend"],
        },
        {
            title: "Email",
            dataIndex: "Email",
            key: "Email",
            sorter: (a, b) => (a.Email || "").localeCompare(b.Email || ""),
            sortDirections: ["ascend", "descend"],
        },
        {
            title: "Secret",
            dataIndex: "Secret",
            key: "Secret",
        },
        {
            title: "Reminder",
            dataIndex: "Reminder",
            key: "Reminder",
            render: (_, row) => (
                <Button type="text" style={locked ? { color: "gray" } : { color: "orange" }} disabled={locked}>
                    <BellOutlined />
                </Button>
            ),
        },
    ];


    return (
        <div style={{ width: "100%" }}>
            <Title level={3}>Site Owners</Title>

            <Space style={{ marginBottom: 16 }}>
                <Select
                    placeholder="Select a campaign"
                    style={{ width: 400 }}
                    value={campaignId}
                    onChange={(value) => {
                        setCampaignId(value);
                        fetchSuperOwners(value);
                    }}
                    options={campaigns.map((c) => ({
                        value: c.Id,
                        label: (
                            <span>
                                <strong>#{c.Id}</strong> — {
                                    new Date(c.InitiatedAt).toLocaleDateString()} —
                                {c.Status === 'complete' ?
                                    <Tag color="green">{c.Status}</Tag> :
                                    <Tag color="orange">{c.Status}</Tag>}

                            </span>
                        ),
                        // disabled: c.Status?.toLowerCase() === "complete",
                    }))}
                />

                <Button type="primary" onClick={() => setModalVisible(true)} disabled={locked}>
                    Import CSV
                </Button>

                <Button type="primary" disabled={locked}>
                    Send Mass Campaign Email
                </Button>
            </Space>

            {/* Table of existing super owners */}
            <Table
                dataSource={(superOwners || []).map((row, idx) => ({ key: idx, ...row }))}
                columns={superOwnerColumns}
                size="small"
                scroll={{ x: "max-content" }}
                style={{ width: "100%" }}
            />

            {/* Upload Modal */}
            <Modal
                title="Import Super Owners"
                open={modalVisible}
                onCancel={() => setModalVisible(false)}
                footer={[
                    <Button key="cancel" onClick={() => setModalVisible(false)}>Cancel</Button>,
                    <Button
                        key="upload"
                        type="primary"
                        onClick={handleUpload}
                        disabled={fileList.length === 0 || tableData.length === 0}
                        loading={uploading}
                    >
                        Upload
                    </Button>
                ]}
                width={800}
            >
                {fileList.length === 0 && (
                    <Dragger
                        beforeUpload={handleBeforeUpload}
                        fileList={fileList}
                        onRemove={handleRemove}
                        multiple={false}
                        maxCount={1}
                        accept=".csv"
                        style={{ width: "100%" }}
                    >
                        <p className="ant-upload-drag-icon">
                            <InboxOutlined />
                        </p>
                        <p className="ant-upload-text">
                            Click or drag a CSV file to this area
                        </p>
                        <p className="ant-upload-hint">CSV files only</p>
                    </Dragger>
                )}

                {fileList.length > 0 && tableData.length > 0 && (
                    <div style={{ marginTop: 16, width: "100%" }}>
                        <Text strong>Preview:</Text>
                        <Table
                            dataSource={tableData}
                            columns={columns}
                            pagination={{
                                ...pagination,
                                showSizeChanger: true,
                                pageSizeOptions: ["5", "10", "20", "50"],
                                onChange: (page, pageSize) =>
                                    setPagination({ current: page, pageSize }),
                            }}
                            size="small"
                            scroll={{ x: "max-content" }}
                            style={{ marginTop: 8, width: "100%" }}
                        />
                    </div>
                )}

                {uploading && (
                    <div style={{ marginTop: 16 }}>
                        <Progress percent={progress} />
                    </div>
                )}
            </Modal>
        </div>
    );
}