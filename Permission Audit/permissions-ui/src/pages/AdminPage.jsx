import { useEffect, useState, useMemo } from "react";
import { Card, Row, Col, Button, Table, Typography, Space, Tag, Collapse, Flex } from "antd";
import api from "../utils/api";
import LibraryModal from "../components/LibraryModal";

const { Title, Text } = Typography;
const { Panel } = Collapse;

export default function AdminAuditPage() {
  /* ---------------- RAW DATA ---------------- */

  const [rows, setRows] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [summary, setSummary] = useState({});
  const [selectedLibrary, setSelectedLibrary] = useState(null);
  // const { token } = theme.useToken();


  /* ---------------- LOAD ---------------- */

  useEffect(() => {
    api.get("/sites").then((res) => buildSummary(res.data));
    api.get("/campaigns").then((res) => setCampaigns(res.data));
  }, []);

  /* ---------------- YOUR EXISTING TRANSFORM ---------------- */

  const buildSummary = (rows) => {
    const grouped = {};

    rows.forEach((row) => {
      const superOwner = row.superOwner || "Unknown";
      const site = row.URL;
      const library = row.SharePointObject;

      if (!superOwner || !site || !library) return;

      if (!grouped[superOwner]) grouped[superOwner] = {};
      if (!grouped[superOwner][site]) grouped[superOwner][site] = {};
      if (!grouped[superOwner][site][library]) {
        grouped[superOwner][site][library] = {
          permissions: [],
          directCount: 0,
        };
      }

      const isDirect =
        !row.GivenThrough || row.GivenThrough === row.Name;

      if (isDirect) grouped[superOwner][site][library].directCount++;

      grouped[superOwner][site][library].permissions.push({
        principal: row.Name,
        group: row.GivenThrough,
        permission: row.Permission,
        isDirect,
      });
    });

    setSummary(grouped);
  };

  /* ---------------- OPEN MODAL ---------------- */

  const openLibrary = (site, library) => {
    setSelectedLibrary({
      site,
      library,
      data: summary[site][library].permissions.map((row, idx) => ({
        ...row,
        _idx: idx,
        site,
        library
      })),
    });
  };

  /* ---------------- CAMPAIGN HELPERS ---------------- */

  const latestCampaign = campaigns?.[0];

  const stats = useMemo(() => {
    const totalSites = Object.values(summary)
      .flatMap((s) => Object.keys(s)).length;

    const reviewedSites = campaigns.filter(
      (c) => c.Status === "completed"
    ).length;

    return {
      totalSites,
      reviewedSites,
      inProgress: campaigns.filter((c) => c.Status === "pending").length,
    };
  }, [summary, campaigns]);

  /* ---------------- START AUDIT ---------------- */

  const startAudit = async () => {
    await api.post("/campaigns", {
      site: "ALL", // or per-site later
    });

    const res = await api.get("/campaigns");
    setCampaigns(res.data);
  };

  const completeAudit = async (id) => {
    await api.post(`/campaigns/${id}/complete`);
    const res = await api.get("/campaigns");
    setCampaigns(res.data);
  };

  /* ---------------- UI ---------------- */

return (
  <div style={{ padding: 24, background: "#f5f5f5", minHeight: "100vh" }}>

    {/* ================= TOP CONTROLS ================= */}
    <Card
      styles={{ body: { padding: 16 } }}
      style={{ marginBottom: 16, borderRadius: 8 }}
    >
      <Space>
        <Button type="primary" onClick={startAudit}>
          Start New Audit
        </Button>

        {latestCampaign && (
          <Button onClick={() => completeAudit(latestCampaign.Id)}>
            Complete Current Audit
          </Button>
        )}
      </Space>
    </Card>

    {/* ================= SUMMARY CARDS ================= */}
    <Row gutter={16} style={{ marginBottom: 16 }}>
      <Col xs={24} md={8}>
        <Card styles={{ body: { textAlign: "center" } }}>
          <Title level={3} style={{ margin: 0 }}>
            {stats.totalSites}
          </Title>
          <Text type="secondary">Total Sites</Text>
        </Card>
      </Col>

      <Col xs={24} md={8}>
        <Card styles={{ body: { textAlign: "center" } }}>
          <Title level={3} style={{ margin: 0, color: "#2e7d32" }}>
            {stats.reviewedSites}
          </Title>
          <Text type="secondary">Reviewed (Completed Campaigns)</Text>
        </Card>
      </Col>

      <Col xs={24} md={8}>
        <Card styles={{ body: { textAlign: "center" } }}>
          <Title level={3} style={{ margin: 0, color: "#dc3545" }}>
            {stats.inProgress}
          </Title>
          <Text type="secondary">In Progress</Text>
        </Card>
      </Col>
    </Row>

    {/* ================= CAMPAIGN STATUS ================= */}
    <Card
      styles={{ body: { padding: 16 } }}
      style={{ marginBottom: 16, borderRadius: 8 }}
    >
      <Space>
        <Text strong>Latest Campaign:</Text>
        <Tag color={latestCampaign?.Status === "completed" ? "green" : "orange"}>
          {latestCampaign?.Status || "None"}
        </Tag>
      </Space>
    </Card>

    {/* ================= HIERARCHY ================= */}
    <Card
      title="Sites Hierarchy"
      styles={{ body: { padding: 0 } }}
      style={{ borderRadius: 8 }}
    >
      <Collapse accordion bordered={false}>
        {Object.entries(summary).map(([superOwner, sites]) => (
          <Panel header={superOwner} key={superOwner}>
            <Space direction="vertical" style={{ width: "100%" }} size={0}>
              {Object.entries(sites).map(([site, libraries]) => {
                const hasRisk = Object.values(libraries).some(
                  (lib) => lib.directCount > 0
                );

                return (
                  <div
                    key={site}
                    onClick={() => openLibrary(superOwner, site)}
                    style={{
                      padding: "12px 16px",
                      cursor: "pointer",
                      borderBottom: "1px solid #f0f0f0",
                      transition: "background 0.2s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "#fafafa")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "transparent")
                    }
                  >
                    <Flex justify="space-between" align="center">
                      <Text>{site}</Text>
                      <Tag color={hasRisk ? "red" : "green"}>
                        {hasRisk ? "Needs Review" : "OK"}
                      </Tag>
                    </Flex>
                  </div>
                );
              })}
            </Space>
          </Panel>
        ))}
      </Collapse>
    </Card>

    {/* ================= MODAL ================= */}
    {selectedLibrary && (
      <LibraryModal
        {...selectedLibrary}
        onClose={() => setSelectedLibrary(null)}
      />
    )}
  </div>
);
}