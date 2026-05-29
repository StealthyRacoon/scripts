import { useEffect, useState, useMemo } from "react";
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
    Space,
    Card,
    Input,
    Popconfirm
} from "antd";
import { InboxOutlined, BellOutlined, PlusOutlined, ExportOutlined, SnippetsOutlined } from "@ant-design/icons";
import Papa from "papaparse";
import api from "../../utils/api";

const { Dragger } = Upload;
const { Text, Title } = Typography;
const { Search } = Input;

export default function AdminOwners() {
    const [campaigns, setCampaigns] = useState([]);
    const [campaignId, setCampaignId] = useState(null);
    const [locked, setLocked] = useState(false);

    const [superOwners, setSuperOwners] = useState([]);
    const [editingKey, setEditingKey] = useState("");

    const [searchText, setSearchText] = useState("");

    const [fileList, setFileList] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [tableData, setTableData] = useState([]);
    const [columns, setColumns] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);

    // =========================
    // INIT
    // =========================

    useEffect(() => {
        api.get("/campaigns").then((res) => {
            setCampaigns(res.data);

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
        if (!campaigns.length || !campaignId) return;

        const latestActive = campaigns
            .filter(c => c.Status?.toLowerCase() !== "completed")
            .sort((a, b) => new Date(b.InitiatedAt) - new Date(a.InitiatedAt))[0];

        setLocked(latestActive ? campaignId !== latestActive.Id : true);
    }, [campaignId, campaigns]);

    const fetchSuperOwners = async (id) => {
        try {
            const res = await api.get("/superowners", { params: { campaignId: id } });
            setSuperOwners((res.data || []).map((r, i) => ({ key: i, ...r })));
        } catch {
            message.error("Failed to fetch super owners");
        }
    };

    // =========================
    // SEARCH FILTER
    // =========================

    const filteredData = useMemo(() => {
        if (!searchText) return superOwners;

        const lower = searchText.toLowerCase();

        return superOwners.filter(r =>
            (r.Name || "").toLowerCase().includes(lower) ||
            (r.URL || "").toLowerCase().includes(lower)
        );
    }, [searchText, superOwners]);

    // =========================
    // CRUD
    // =========================

    const isEditing = (record) => record.key === editingKey;

    const edit = (record) => setEditingKey(record.key);

    const cancel = () => {
        setEditingKey("");
        fetchSuperOwners(campaignId);
    };

    const save = async (record) => {
        try {
            await api.post("/updatesuperowner", { ...record, campaignId });
            message.success("Updated");
            setEditingKey("");
            fetchSuperOwners(campaignId);
        } catch {
            message.error("Update failed");
        }
    };

    const handleDelete = async (record) => {
        try {
            await api.post("/deletesuperowner", { ...record, campaignId });
            message.success("Deleted");
            fetchSuperOwners(campaignId);
        } catch {
            message.error("Delete failed");
        }
    };

    const handleAdd = () => {
        const newRow = {
            key: Date.now(),
            URL: "",
            Name: "",
            Email: "",
            isNew: true
        };

        setSuperOwners([newRow, ...superOwners]);
        setEditingKey(newRow.key);
    };

    const handleCreate = async (record) => {
        try {
            await api.post("/addsuperowner", { ...record, campaignId });
            message.success("Created");
            setEditingKey("");
            fetchSuperOwners(campaignId);
        } catch {
            message.error("Create failed");
        }
    };

    // =========================
    // EDITABLE CELL
    // =========================

    const EditableCell = ({ editing, dataIndex, record, children, ...rest }) => (
        <td {...rest}>
            {editing ? (
                <Input
                    value={record[dataIndex]}
                    onChange={(e) => {
                        const newData = [...superOwners];
                        const index = newData.findIndex(i => i.key === record.key);
                        newData[index][dataIndex] = e.target.value;
                        setSuperOwners(newData);
                    }}
                />
            ) : children}
        </td>
    );

    // =========================
    // TABLE COLUMNS
    // =========================

    const columnsDef = [
        {
            title: "URL",
            dataIndex: "URL",
            editable: true,
            sorter: (a, b) => (a.URL || "").localeCompare(b.URL || "")
        },
        {
            title: "Name",
            dataIndex: "Name",
            editable: true,
            sorter: (a, b) => (a.Name || "").localeCompare(b.Name || "")
        },
        {
            title: "Email",
            dataIndex: "Email",
            editable: true,
            sorter: (a, b) => (a.Email || "").localeCompare(b.Email || "")
        },
        {
            title: "Secret",
            dataIndex: "Secret",
            editable: true,
            align: "center",
            render: (_, record) => {
                if (!record.Secret) return "-";

                const url = `${window.location.origin}/${record.Secret}`;

                return (
                    <Space>
                        <Tooltip title="Open secret link">
                            <Button
                                type="text"
                                icon={<ExportOutlined />}
                                href={url}
                                target="_blank"
                            />
                        </Tooltip>

                        <Tooltip title="Copy secret">
                            <Button
                                type="text"
                                icon={<SnippetsOutlined />}
                                onClick={() => {
                                    navigator.clipboard.writeText(record.Secret);
                                    message.success("Secret copied");
                                }}
                            />
                        </Tooltip>
                    </Space>
                );
            }
        },
        {
            title: "Reminder",
            render: () => (
                <Button type="text" icon={<BellOutlined />} disabled={locked} />
            )
        },
        {
            title: "Actions",
            render: (_, record) => {
                const editable = isEditing(record);

                return editable ? (
                    <Space>
                        <Button
                            type="link"
                            onClick={() =>
                                record.isNew ? handleCreate(record) : save(record)
                            }
                        >
                            Save
                        </Button>
                        <Button onClick={cancel}>Cancel</Button>
                    </Space>
                ) : (
                    <Space>
                        <Button
                            onClick={() => edit(record)}
                            disabled={editingKey !== ""}
                        >
                            Edit
                        </Button>

                        <Popconfirm
                            title="Delete this record?"
                            onConfirm={() => handleDelete(record)}
                        >
                            <Button danger>Delete</Button>
                        </Popconfirm>
                    </Space>
                );
            }
        }
    ];

    const mergedColumns = columnsDef.map((col) => {
        if (!col.editable) return col;

        return {
            ...col,
            onCell: (record) => ({
                record,
                dataIndex: col.dataIndex,
                editing: isEditing(record),
            }),
        };
    });

    // =========================
    // CSV IMPORT
    // =========================

    const confirmImport = (onConfirm) => {
        Modal.confirm({
            title: "Overwrite existing data?",
            content: "This will replace all existing SuperOwners for this campaign.",
            okType: "danger",
            onOk: onConfirm,
        });
    };

    const handleBeforeUpload = (file) => {
        setFileList([file]);

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                setTableData(results.data.map((r, i) => ({ key: i, ...r })));
                setColumns(Object.keys(results.data[0] || {}).map(k => ({
                    title: k,
                    dataIndex: k
                })));
            }
        });

        return false;
    };

    const handleUpload = async () => {
        const hasExisting = superOwners.length > 0;

        const proceed = async () => {
            setUploading(true);

            try {
                for (let i = 0; i < tableData.length; i += 100) {
                    const chunk = tableData.slice(i, i + 100);

                    await api.post("/superowners", {
                        rows: chunk.map(r => ({
                            URL: r.URL,
                            Name: r.Name,
                            Email: r.Email,
                            campaignId
                        }))
                    });
                }

                message.success("Upload complete");
                setModalVisible(false);
                fetchSuperOwners(campaignId);
            } catch {
                message.error("Upload failed");
            } finally {
                setUploading(false);
            }
        };

        if (hasExisting) confirmImport(proceed);
        else proceed();
    };

    // =========================
    // ASSIGN SECRETS
    // =========================

    const confirmAssignSecrets = () => {
        Modal.confirm({
            title: "Assign new secrets?",
            content: "This will overwrite all existing secrets.",
            okType: "danger",
            onOk: handleAssignSecrets
        });
    };

    const handleAssignSecrets = async () => {
        try {
            await api.get("/changesecrets");
            message.success("Secrets assigned");
            fetchSuperOwners(campaignId);
        } catch {
            message.error("Failed to assign secrets");
        }
    };

    const handleSendEmail = async () => {
        try {
            const res = await api.post("/sendcampaignemail", {
                shouldSend: false
            });

            console.log(res)

            message.success("Email sent");
            fetchSuperOwners(campaignId);
        } catch {
            message.error("Failed to send email");
        }
    }

    // =========================
    // UI
    // =========================

    return (
        <div style={{ width: "100%" }}>
            <Title level={3}>Site Owners</Title>

            <Space style={{ marginBottom: 16 }}>
                <Select
                    style={{ width: 400 }}
                    value={campaignId}
                    onChange={(val) => {
                        setCampaignId(val);
                        fetchSuperOwners(val);
                    }}
                    options={campaigns.map(c => ({
                        value: c.Id,
                        label: (
                            <>
                                #{c.Id} — {new Date(c.InitiatedAt).toLocaleDateString()} —
                                <Tag color={c.Status === "complete" ? "green" : "orange"}>
                                    {c.Status}
                                </Tag>
                            </>
                        )
                    }))}
                />

                <Search
                    placeholder="Search Name or URL"
                    allowClear
                    onChange={(e) => setSearchText(e.target.value)}
                    style={{ width: 300 }}
                />
            </Space>

            <Card
                title="Super Owners"
                extra={
                    <Space>
                        <Button onClick={() => setModalVisible(true)} disabled={locked}>
                            Import CSV
                        </Button>

                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={handleAdd}
                            disabled={locked}
                        >
                            Add Owner
                        </Button>

                        <Button onClick={confirmAssignSecrets} disabled={locked}>
                            Assign Secrets
                        </Button>

                        <Button onClick={handleSendEmail} disabled={locked}>
                            Send Email
                        </Button>
                    </Space>
                }
            >
                <div style={{ overflowX: "auto" }}>
                    <Table
                        components={{ body: { cell: EditableCell } }}
                        dataSource={filteredData}
                        columns={mergedColumns}
                        size="small"
                        scroll={{ x: 800 }}
                    />
                </div>
            </Card>

            <Modal
                title="Import Super Owners"
                open={modalVisible}
                onCancel={() => setModalVisible(false)}
                width={800}
                footer={[
                    <Button key="cancel" onClick={() => setModalVisible(false)}>Cancel</Button>,
                    <Button key="upload" type="primary" onClick={handleUpload}>
                        Upload
                    </Button>
                ]}
            >
                <Dragger beforeUpload={handleBeforeUpload} fileList={fileList}>
                    <p>Click or drag CSV</p>
                </Dragger>

                {tableData.length > 0 && (
                    <>
                        <Text strong>Preview</Text>
                        <Table
                            dataSource={tableData}
                            columns={columns}
                            scroll={{ x: 800 }}
                        />
                    </>
                )}

                {uploading && <Progress percent={progress} />}
            </Modal>
        </div>
    );
}