import { useEffect, useState } from "react";
import { Row, Col, Card, Typography } from "antd";
import api from "../utils/api";

const { Title, Text } = Typography;

export default function Dashboard() {
    const [summary, setSummary] = useState({});
    const [campaigns, setCampaigns] = useState([]);

    useEffect(() => {
        api.get("/sites").then((res) => setSummary(res.data));
        api.get("/campaigns").then((res) => setCampaigns(res.data));
    }, []);

    const stats = {
        totalSites: Object.keys(summary || {}).length,
        reviewedSites: campaigns.filter(c => c.Status === "completed").length,
        inProgress: campaigns.filter(c => c.Status === "pending").length,
    };

    return (
        <Row gutter={16} style={{ marginBottom: 16 }}>
            <Col xs={24} md={8}>
                <Card styles={{ body: { textAlign: "center" } }}>
                    <Title level={3} style={{ margin: 0 }}>
                        {stats.totalSites || 0}
                    </Title>
                    <Text type="secondary">Total Sites</Text>
                </Card>
            </Col>

            <Col xs={24} md={8}>
                <Card styles={{ body: { textAlign: "center" } }}>
                    <Title level={3} style={{ margin: 0, color: "#2e7d32" }}>
                        {stats.reviewedSites || 0}
                    </Title>
                    <Text type="secondary">Reviewed (Completed Campaigns)</Text>
                </Card>
            </Col>

            <Col xs={24} md={8}>
                <Card styles={{ body: { textAlign: "center" } }}>
                    <Title level={3} style={{ margin: 0, color: "#dc3545" }}>
                        {stats.inProgress || 0}
                    </Title>
                    <Text type="secondary">In Progress</Text>
                </Card>
            </Col>
        </Row>
    );
}