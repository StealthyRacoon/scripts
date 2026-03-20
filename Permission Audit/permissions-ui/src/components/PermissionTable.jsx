import { Table, Button, Space, Checkbox, Tag, Tooltip } from "antd";
import { CheckOutlined, DeleteOutlined } from "@ant-design/icons";

export default function PermissionTable({
  data = [],
  selectedRows,
  setSelectedRows,
  decisions,
  setDecisions,
  addedUsers = [],
  setAddedUsers,
  site,
  perm,
  group
}) {
  const getRowKey = (row) => `${row.email}-${row._idx}`;
  const getDecisionKey = (row) => `${row.principal}-${row._idx}`;

  const toggleSelectRow = (row) => {
    const key = getRowKey(row);
    setSelectedRows((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleSelectAll = (checked) => {
    const updated = { ...selectedRows };
    data.forEach((r) => {
      updated[getRowKey(r)] = checked;
    });
    setSelectedRows(updated);
  };

  const setDecision = (row, value) => {
    const key = getDecisionKey(row);
    setDecisions((prev) => ({ ...prev, [key]: value }));
  };

  const selectedCount = data.filter(
    (r) => selectedRows[getRowKey(r)]
  ).length;

  const removeAddedUser = (email) => {
    setAddedUsers((prev) =>
      prev.filter(
        (item) =>
          !(item.perm === perm && item.group === group && item.email === email)
      )
    );
  };

  const filteredAddedUsers = addedUsers.filter(
    (u) => u.site === site && u.perm === perm && u.group === group
  );

  const columns = [
    {
      title: (
        <Checkbox
          onChange={(e) => toggleSelectAll(e.target.checked)}
          checked={data.length > 0 && data.every((r) => selectedRows[getRowKey(r)])}
        />
      ),
      dataIndex: "select",
      render: (_, record) => (
        <Checkbox
          checked={!!selectedRows[getRowKey(record)]}
          onChange={() => toggleSelectRow(record)}
        />
      ),
      width: 60,
    },
    {
      title: "Principal",
      dataIndex: "principal",
    },
    {
      title: (
        selectedCount > 0 ? (
          <Space>
            <Tooltip title="Approve selected">
              <Button
                type={data
                  .filter((r) => selectedRows[getRowKey(r)])
                  .every((r) => decisions[getDecisionKey(r)] === "Approve") &&
                  data.some((r) => selectedRows[getRowKey(r)])
                  ? "primary"
                  : "default"}
                icon={<CheckOutlined />}
                onClick={() =>
                  data.forEach((r) => {
                    if (selectedRows[getRowKey(r)]) {
                      setDecision(r, "Approve");
                    }
                  })
                }
              />
            </Tooltip>

            <Tooltip title="Remove selected">
              <Button
                danger
                type={data
                  .filter((r) => selectedRows[getRowKey(r)])
                  .every((r) => decisions[getDecisionKey(r)] === "Remove") &&
                  data.some((r) => selectedRows[getRowKey(r)])
                  ? "primary"
                  : "default"}
                icon={<DeleteOutlined />}
                onClick={() =>
                  data.forEach((r) => {
                    if (selectedRows[getRowKey(r)]) {
                      setDecision(r, "Remove");
                    }
                  })
                }
              />
            </Tooltip>
          </Space>
        ) : (
          "Decision"
        )
      ),
      render: (_, record) => {
        const decisionKey = getDecisionKey(record);

        return (
          <Space>
            <Button
              type={decisions[decisionKey] === "Approve" ? "primary" : "default"}
              icon={<CheckOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                setDecision(record, "Approve");
              }}
            />
            <Button
              danger
              type={decisions[decisionKey] === "Remove" ? "primary" : "default"}
              icon={<DeleteOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                setDecision(record, "Remove");
              }}
            />
          </Space>
        );
      },
    },
  ];

  return (
    <div style={{ marginTop: 10 }}>
      <Table
        rowKey={(record) => getRowKey(record)}
        columns={columns}
        dataSource={data}
        pagination={false}
        size="small"
        onRow={(record) => ({
          onClick: () => toggleSelectRow(record),
        })}
      />

      {/* Added Users */}
      {filteredAddedUsers.length > 0 && (
        <div style={{ marginTop: 12 }}>
          <strong>Added Users:</strong>
          <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 6 }}>
            {filteredAddedUsers.map((user) => (
              <Tag
                key={user.email}
                closable
                onClose={() => removeAddedUser(user.email)}
              >
                {user.name}
              </Tag>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}