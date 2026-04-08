import { useEffect, useState } from "react";
import { Table, Button, Typography, Space, message, Tag, Modal, Input, DatePicker, Tooltip } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import api from "../../utils/api";
import dayjs from "dayjs";

const { Title } = Typography;

export default function AdminCampaign() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modal & form state
  const [modalOpen, setModalOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [newSite, setNewSite] = useState("");
  const [dueAt, setDueAt] = useState(null);

  // Fetch campaigns from server
  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const res = await api.get("/campaigns");
      setCampaigns(res.data);
    } catch (err) {
      console.error(err);
      message.error(err.response?.data?.message || "Failed to fetch campaigns");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  // Determine if there are pending campaigns
  const hasPending = campaigns.some(c => c.Status?.toLowerCase() === "pending");

  // Add new campaign
  const handleAddCampaign = async () => {
    if (!newSite.trim()) {
      message.warning("Campaign name is required");
      return;
    }

    try {
      setAdding(true);
      const res = await api.post("/campaigns", {
        Name: newSite,
        dueAt: dueAt ? dueAt.format("YYYY-MM-DD HH:mm:ss") : null,
      });

      message.success(res.data.message || "Campaign added successfully");
      setNewSite("");
      setDueAt(null);
      setModalOpen(false);
      fetchCampaigns();
    } catch (err) {
      console.error(err);
      message.error(err.response?.data?.message || "Failed to add campaign");
    } finally {
      setAdding(false);
    }
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "Id",
      key: "Id",
      width: 80,
    },
    {
      title: "Site",
      dataIndex: "Site",
      key: "Site",
    },
    {
      title: "Time Commenced",
      dataIndex: "InitiatedAt",
      key: "InitiatedAt",
      render: val => val ? dayjs(val).format("YYYY-MM-DD HH:mm") : "",
    },
    {
      title: "Due",
      dataIndex: "DueAt",
      key: "DueAt",
      render: val => val ? dayjs(val).format("YYYY-MM-DD HH:mm") : "",
    },
    {
      title: "Completed",
      dataIndex: "CompletedAt",
      key: "CompletedAt",
      render: val => val ? dayjs(val).format("YYYY-MM-DD HH:mm") : "",
    },
    {
      title: "Status",
      dataIndex: "Status",
      key: "Status",
      render: status => {
        let color = "default";
        if (status?.toLowerCase() === "pending") color = "orange";
        else if (status?.toLowerCase() === "complete") color = "green";
        else if (status?.toLowerCase() === "failed") color = "red";

        return <Tag color={color}>{status}</Tag>;
      },
    },
  ];

  return (
    <div style={{ width: "100%" }}>
      <Title level={3}>Campaigns</Title>

      <Space style={{ marginBottom: 16 }}>
        <Tooltip title={hasPending ? "Cannot add new campaign while a campaign is pending" : ""}>
          <span>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setModalOpen(true)}
              disabled={hasPending}
              title={hasPending ? "Cannot add new campaign while a campaign is pending" : ""}
            >
              Add Campaign
            </Button>
          </span>
        </Tooltip>
      </Space>

      <Table
        rowKey="Id"
        columns={columns}
        dataSource={campaigns.map(c => ({ key: c.Id, ...c }))}
        loading={loading}
        pagination={{ pageSize: 5 }}
      />

      {/* Modal for adding new campaign */}
      <Modal
        title="Add New Campaign"
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleAddCampaign}
        okText="Add"
        confirmLoading={adding} // Only shows loading during API call
      >
        <Input
          placeholder="Enter campaign name"
          value={newSite}
          onChange={e => setNewSite(e.target.value)}
          style={{ marginBottom: 12 }}
        />
        <DatePicker
          showTime
          placeholder="Select due date (optional)"
          value={dueAt}
          onChange={setDueAt}
          style={{ width: "100%" }}
        />
      </Modal>
    </div>
  );
}