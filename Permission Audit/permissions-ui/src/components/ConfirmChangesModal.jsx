import { Modal, Typography, Tag, Space, Button, Divider, Card, theme } from "antd";
import { CheckCircleOutlined, CloseCircleOutlined, UserAddOutlined } from "@ant-design/icons";

const { Text, Title } = Typography;

export default function ConfirmChangesModal({
  decisions,
  addedUsers,
  close,
  confirm,
  rowLookup,
}) {
  const { token } = theme.useToken();

  const addedByPermGroup = {};
  (addedUsers || []).forEach((u) => {
    const perm = u.perm || "No Permission";
    const group = u.group || "Direct";
    if (!addedByPermGroup[perm]) addedByPermGroup[perm] = {};
    if (!addedByPermGroup[perm][group]) addedByPermGroup[perm][group] = [];
    addedByPermGroup[perm][group].push(u);
  });
  const hasAdded = Object.keys(addedByPermGroup).length > 0;

  const approvedByPermGroup = {};
  const removedByPermGroup = {};

  Object.entries(decisions || {}).forEach(([key, value]) => {
    const [principal, idx] = key.split("-");
    const row = rowLookup?.[`${principal}-${idx}`];
    if (!row) return;

    const perm = row.permission || row.perm || "No Permission";
    const group = row.group || "Direct";

    const ensureBuckets = (container) => {
      if (!container[perm]) container[perm] = {};
      if (!container[perm][group]) container[perm][group] = [];
      return container[perm][group];
    };

    if (value === "Approve") {
      ensureBuckets(approvedByPermGroup).push(principal);
    } else if (value === "Remove") {
      ensureBuckets(removedByPermGroup).push(principal);
    }
  });

  const hasApproved = Object.keys(approvedByPermGroup).length > 0;
  const hasRemoved = Object.keys(removedByPermGroup).length > 0;

  const renderGroupSection = (perm, groups, type) => {
    const isAdded = type === "added";
    const isApproved = type === "approved";
    const isRemoved = type === "removed";

    const headerBg = isAdded
      ? token.colorBgContainer
      : isApproved
        ? token.colorSuccessBg
        : token.colorErrorBg;

    const borderColor = isAdded
      ? token.colorBorder
      : isApproved
        ? token.colorSuccessBorder
        : token.colorErrorBorder;

    const tagColor = isAdded
      ? "blue"
      : isApproved
        ? "green"
        : "red";

    return (
      <Card
        key={`${type}-${perm}`}
        size="small"
        style={{
          marginBottom: 12,
          borderColor,
        }}
        styles={{
          header: {
            background: headerBg,
          },
        }}
        title={<Text strong>Permission: {perm}</Text>}
      >
        {Object.entries(groups).map(([group, items]) => (
          <div key={`${type}-${perm}-${group}`} style={{ marginBottom: 10 }}>
            <Text strong>Group: {group}</Text>

            <div style={{ marginTop: 6, display: "flex", flexWrap: "wrap", gap: 6 }}>
              {items.map((item) => (
                <Tag key={isAdded ? item.email : item} color={tagColor}>
                  {isAdded ? item.name : item}
                </Tag>
              ))}
            </div>
          </div>
        ))}
      </Card>
    );
  };

  const addedSections = Object.entries(addedByPermGroup).map(([perm, groups]) =>
    renderGroupSection(perm, groups, "added")
  );

  const approvedSections = Object.entries(approvedByPermGroup).map(([perm, groups]) =>
    renderGroupSection(perm, groups, "approved")
  );

  const removedSections = Object.entries(removedByPermGroup).map(([perm, groups]) =>
    renderGroupSection(perm, groups, "removed")
  );

  return (
    <Modal
      open={true}
      onCancel={close}
      footer={null}
      title="Confirm Permission Changes"
      width={700}

      styles={{
        body: {
          maxHeight: 'calc(100vh - 30vh)', // header + footer + breathing room
          overflowY: 'auto',
        },
      }}

    >
      <Space orientation="vertical" style={{ width: "100%" }} size="middle">
        {hasAdded && (
          <div>
            <Space>
              <UserAddOutlined style={{ color: token.colorPrimary }} />
              <Title level={5} style={{ margin: 0 }}>
                Added Users
              </Title>
            </Space>
            <Divider style={{ margin: "8px 0" }} />
            {addedSections}
          </div>
        )}

        {hasApproved && (
          <div>
            <Space>
              <CheckCircleOutlined style={{ color: token.colorSuccess }} />
              <Title level={5} style={{ margin: 0 }}>
                Approved Permissions
              </Title>
            </Space>
            <Divider style={{ margin: "8px 0" }} />
            {approvedSections}
          </div>
        )}

        {hasRemoved && (
          <div>
            <Space>
              <CloseCircleOutlined style={{ color: token.colorError }} />
              <Title level={5} style={{ margin: 0 }}>
                Removed Permissions
              </Title>
            </Space>
            <Divider style={{ margin: "8px 0" }} />
            {removedSections}
          </div>
        )}

        <Divider />

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginBottom: "5vh" }}>
          <Button onClick={close}>Cancel</Button>
          <Button type="primary" onClick={confirm}>
            Confirm Changes
          </Button>
        </div>
      </Space>
    </Modal>

  );
}