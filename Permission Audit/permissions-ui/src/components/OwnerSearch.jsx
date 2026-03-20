import { Card, Row, Col, Typography, Tag, Input, Space } from "antd";

const { Title, Text } = Typography;

export default function OwnerSearch({ owner, setOwner, summary, onOpenLibrary }) {
  const totalSites = Object.keys(summary).length;

  const sitesNeedReview = Object.values(summary).filter((libs) =>
    Object.values(libs).some((lib) => lib.directCount > 0)
  ).length;

  const sitesOk = totalSites - sitesNeedReview;

  return (
    <div style={{ marginBottom: 30 }}>
      {/* Summary cards */}
      {totalSites > 0 && (
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={8}>
            <Card>
              <Title level={3} style={{ margin: 0 }}>
                {totalSites}
              </Title>
              <Text>Total Sites</Text>
            </Card>
          </Col>

          <Col span={8}>
            <Card>
              <Title level={3} style={{ margin: 0, color: "#dc3545" }}>
                {sitesNeedReview}
              </Title>
              <Text>Need Review</Text>
            </Card>
          </Col>

          <Col span={8}>
            <Card>
              <Title level={3} style={{ margin: 0, color: "#2e7d32" }}>
                {sitesOk}
              </Title>
              <Text>OK</Text>
            </Card>
          </Col>
        </Row>
      )}

      {/* Sites list (no List component) */}
      <Space orientation="vertical" style={{ width: "100%" }} size="middle">
        {Object.keys(summary).map((site) => {
          const hasRisk = Object.values(summary[site]).some(
            (lib) => lib.directCount > 0
          );

          return (
            <Card
              key={site}
              hoverable
              onClick={() => {
                const firstLibrary = Object.keys(summary[site])[0];
                if (firstLibrary) onOpenLibrary(site, firstLibrary);
              }}
              styles={{
                body: {
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                },
              }}
            >
              <Text>{site}</Text>
              <Tag color={hasRisk ? "red" : "green"}>
                {hasRisk ? "Needs Review" : "OK"}
              </Tag>
            </Card>
          );
        })}
      </Space>
    </div>
  );
}