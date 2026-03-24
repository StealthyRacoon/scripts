import { Table, Button, Space, Checkbox, Tag, Tooltip } from "antd";
import { CheckOutlined, DeleteOutlined } from "@ant-design/icons";
import { useEffect } from "react";

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
  group,
}) {
  const getRowKey = (row) => `${row.email}-${row._idx}`;
  const getDecisionKey = (row) => `${row.principal}-${row._idx}`;

  /* ✅ HYDRATE state from DB on first load */
  useEffect(() => {
    if (!data.length) return;

    setDecisions((prev) => {
      const next = { ...prev };

      data.forEach((row) => {
        const key = getDecisionKey(row);
        if (row.decision && !next[key]) {
          next[key] = row.decision;
        }
      });

      return next;
    });
  }, [data, setSelectedRows, setDecisions]);

  /* ---------- helpers ---------- */

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

  const setDecision = (row, value) => {
    if (row.adminApproved) return;

    const decisionKey = getDecisionKey(row);
    const rowKey = getRowKey(row);

    setSelectedRows((prev) => ({ ...prev, [rowKey]: true }));
    setDecisions((prev) => ({ ...prev, [decisionKey]: value }));
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
          checked={
            !!selectedRows[getRowKey(record)]
          }
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
                      setDecision(r, "Approve")
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
                      setDecision(r, "Remove")
                  )
                }
              />
            </Tooltip>
          </Space>
        ) : (
          "Decision"
        ),
      render: (_, record) => {
        const decisionKey = getDecisionKey(record);
        const currentDecision =
          decisions[decisionKey] ?? record.decision;

        const locked = record.adminApproved;

        return (
          <Space>
            <Button
              disabled={locked}
              type={currentDecision === "Approve" ? "primary" : "default"}
              icon={<CheckOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                setDecision(record, "Approve");
              }}
            />
            <Button
              disabled={locked}
              danger
              type={currentDecision === "Remove" ? "primary" : "default"}
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
          <div style={{ marginTop: 8, display: "flex", gap: 6, flexWrap: "wrap" }}>
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