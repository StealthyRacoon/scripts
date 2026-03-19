import { Card, Row, Col, Typography, Tag, List, Input } from "antd";

const { Title, Text } = Typography;

export default function OwnerSearch({ owner, setOwner, summary, onOpenLibrary }) {
  const totalSites = Object.keys(summary).length;

  const sitesNeedReview = Object.values(summary).filter((libs) =>
    Object.values(libs).some((lib) => lib.directCount > 0)
  ).length;

  const sitesOk = totalSites - sitesNeedReview;

  return (
    <div style={{ marginBottom: 30 }}>
      {/* Owner input */}
      {/* <div style={{ marginBottom: 20, maxWidth: 320 }}>
        <Input
          placeholder="Enter Owner Name"
          value={owner}
          onChange={(e) => setOwner(e.target.value)}
        />
      </div> */}

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

      {/* Sites list */}
      <List
        dataSource={Object.keys(summary)}
        renderItem={(site) => {
          const hasRisk = Object.values(summary[site]).some(
            (lib) => lib.directCount > 0
          );

          return (
            <List.Item
              style={{
                cursor: "pointer",
                padding: 0,
                border: "none",
              }}
              onClick={() => {
                const firstLibrary = Object.keys(summary[site])[0];
                if (firstLibrary) onOpenLibrary(site, firstLibrary);
              }}
            >
              <Card
                hoverable
                style={{ width: "100%" }}
                styles={{ body: { display: "flex", justifyContent: "space-between", alignItems: "center" } }}
              >
                <div>
                  <div>
                    <Text>{site}</Text>
                  </div>
                </div>

                <Tag color={hasRisk ? "red" : "green"}>
                  {hasRisk ? "Needs Review" : "OK"}
                </Tag>
              </Card>
            </List.Item>
          );
        }}
      />
    </div>
  );
}