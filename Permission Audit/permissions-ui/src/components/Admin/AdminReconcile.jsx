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

export default function AdminReconcile() {
    const [campaigns, setCampaigns] = useState([]);
    const [campaignId, setCampaignId] = useState(null);

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
            }
        });
    }, []);

    useEffect(() => {
        if (!campaigns || campaigns.length === 0 || !campaignId) return;

        // Find the latest non-completed campaign
        const latestActive = campaigns
            .filter(c => c.Status?.toLowerCase() !== "completed")
            .sort((a, b) => new Date(b.InitiatedAt) - new Date(a.InitiatedAt))[0];

    }, [campaignId, campaigns]);


    return (
        <div style={{ width: "100%" }}>
            <Title level={3}>Reconcile SharePoint Permissions</Title>

            <Space style={{ marginBottom: 16 }}>
                <Select
                    placeholder="Select a campaign"
                    style={{ width: 400 }}
                    value={campaignId}
                    onChange={(value) => {
                        setCampaignId(value);
                        
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

                <Button type="primary"  >
                    Import CSV
                </Button>

                <Button type="primary" >
                    Send Mass Campaign Email
                </Button>

                <Button type="primary">
                    Assign Secrets
                </Button>
            </Space>


        </div>
    );
}