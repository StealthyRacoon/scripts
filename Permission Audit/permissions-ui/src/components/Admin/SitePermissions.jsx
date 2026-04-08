import {
  Card,
  Row,
  Col,
  Typography,
  Tag,
  Space,
  Button,
} from "antd";
import { LinkOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

export default function SitePermissions({ data, onOpenLibrary }) {
  
    const siteEntries = Object.entries(data);



  /* ---------- helpers ---------- */

  const getLibraryStatus = (lib) => {
    const total = lib.permissions.length;

    const decided = lib.permissions.filter(
      (p) => p.decision !== null && p.decision !== undefined
    ).length;

    if (decided === 0) return "needs-review";
    if (decided < total) return "pending";
    return "complete";
  };

  const getSiteStatus = (libs) => {
    const statuses = Object.values(libs).map(getLibraryStatus);

    if (statuses.includes("needs-review")) return "needs-review";
    if (statuses.includes("pending")) return "pending";
    return "complete";
  };

  /* ✅ NEW: count decisions per library */
  const getLibraryMeta = (lib) => {
    const total = lib.permissions.length;

    const decided = lib.permissions.filter(
      (p) => p.decision != null
    ).length;

    return { total, decided };
  };

  /* ---------- summary counts ---------- */

 

  /* ---------- render ---------- */

  return (
    <div style={{ marginBottom: 30 }}>
     

      {/* Sites list */}
      <Space orientation="vertical" style={{ width: "100%" }} size="middle">
        {siteEntries.map(([site, libs]) => {
          const status = getSiteStatus(libs);
          const firstLibrary = Object.keys(libs)[0];

          const firstLibData = libs[firstLibrary];
          const meta = firstLibData ? getLibraryMeta(firstLibData) : { decided: 0 };

          const tagConfig = {
            "needs-review": { color: "red", label: "Needs Review" },
            pending: { color: "orange", label: "Pending" },
            complete: { color: "green", label: "Complete" },
          }[status];

          return (
            <Card
              key={site}
              hoverable
              onClick={() => {
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
              <Space orientation="vertical" size={0}>
                {/* Main heading */}
                <Text strong style={{ fontSize: 16 }}>
                  {firstLibrary}
                </Text>

                {/* Subheading */}
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {site}
                </Text>

                {/* Open button */}
                <Button
                  size="small"
                  icon={<LinkOutlined />}
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(site, "_blank", "noopener,noreferrer");
                  }}
                  style={{ marginTop: 4 }}
                >
                  Open
                </Button>
              </Space>

              <Tag color={tagConfig.color}>
                {tagConfig.label}
                {meta.decided > 0 && ` (${meta.decided})`}
              </Tag>
            </Card>
          );
        })}
      </Space>
    </div>
  );
}