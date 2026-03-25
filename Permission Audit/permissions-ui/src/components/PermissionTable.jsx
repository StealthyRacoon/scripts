import { Table, Button, Space, Checkbox, Tag, Tooltip } from "antd";
import { CheckOutlined, DeleteOutlined } from "@ant-design/icons";

export default function PermissionTable({
  data = [],
  selectedRows,
  setSelectedRows,
  addedUsers = [],
  setAddedUsers,
  site,
  perm,
  group,
  updateDecision, // ✅ required
}) {
  const getRowKey = (row) => `${row.email}-${row._idx}`;

  // remove duplicates (same email + decision) - can happen when ms teams and sharepoint groups overlap
  const uniqueData = [];
  const seen = new Set();
  data.forEach((item) => {
    const identifier = `${item.email}-${item.decision}`;
    if (!seen.has(identifier)) {
      seen.add(identifier);
      uniqueData.push(item);
    }
  });

  data = uniqueData

  /* ---------- selection helpers ---------- */

  const toggleSelectRow = (row) => {
    if (row.adminApproved) return;

    const key = getRowKey(row);
    setSelectedRows((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleSelectAll = (checked) => {
    const updated = { ...selectedRows };
    data.forEach((r) => {
      if (!r.adminApproved) {
        updated[getRowKey(r)] = checked;
      }
    });
    setSelectedRows(updated);
  };

  /* ---------- decision handler (SINGLE SOURCE OF TRUTH) ---------- */

  const handleDecision = (row, value) => {
    if (row.adminApproved) return;

    const rowKey = getRowKey(row);

    // mark selected (UI only)
    setSelectedRows((prev) => ({ ...prev, [rowKey]: true }));

    // ✅ update global summary directly
    updateDecision(row.site, row.library, row._idx, value);
  };

  const selectedCount = data.filter(
    (r) => selectedRows[getRowKey(r)]
  ).length;

  /* ---------- added users ---------- */

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

  /* ---------- columns ---------- */

  const columns = [
    {
      title: (
        <Checkbox
          onChange={(e) => toggleSelectAll(e.target.checked)}
          checked={
            data.length > 0 &&
            data.every(
              (r) =>
                r.adminApproved ||
                selectedRows[getRowKey(r)]
            )
          }
        />
      ),
      render: (_, record) => (
        <Checkbox
          checked={!!selectedRows[getRowKey(record)]}
          disabled={record.adminApproved}
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
      title:
        selectedCount > 0 ? (
          <Space>
            <Tooltip title="Approve selected">
              <Button
                icon={<CheckOutlined />}
                onClick={() =>
                  data.forEach(
                    (r) =>
                      selectedRows[getRowKey(r)] &&
                      handleDecision(r, "Approve")
                  )
                }
              />
            </Tooltip>

            <Tooltip title="Remove selected">
              <Button
                danger
                icon={<DeleteOutlined />}
                onClick={() =>
                  data.forEach(
                    (r) =>
                      selectedRows[getRowKey(r)] &&
                      handleDecision(r, "Remove")
                  )
                }
              />
            </Tooltip>
          </Space>
        ) : (
          "Decision"
        ),
      render: (_, record) => {
        const locked = record.adminApproved;

        return (
          <Space>
            <Button
              disabled={locked}
              type={record.decision === "Approve" ? "primary" : "default"}
              icon={<CheckOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                handleDecision(record, "Approve");
              }}
            />
            <Button
              disabled={locked}
              danger
              type={record.decision === "Remove" ? "primary" : "default"}
              icon={<DeleteOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                handleDecision(record, "Remove");
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
        rowKey={(r) => getRowKey(r)}
        columns={columns}
        dataSource={data}
        pagination={false}
        size="small"
        onRow={(record) => ({
          onClick: () => toggleSelectRow(record),
        })}
        rowClassName={(record) =>
          record.adminApproved ? "approved-row" : ""
        }
      />

      {filteredAddedUsers.length > 0 && (
        <div style={{ marginTop: 12 }}>
          <strong>Added Users:</strong>
          <div
            style={{
              marginTop: 8,
              display: "flex",
              gap: 6,
              flexWrap: "wrap",
            }}
          >
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