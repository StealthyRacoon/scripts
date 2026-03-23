import { useState, useMemo, useCallback } from "react";
import { Modal, Input, Typography, Button, Space, Tag, theme } from "antd";
import { CheckOutlined, UserOutlined } from "@ant-design/icons";
import debounce from "lodash/debounce";
import React from "react";

const { Text } = Typography;

// ✅ Memoized row component
const UserRow = React.memo(({ user, selected, onToggle, token }) => {
  return (
    <div
      onClick={() => onToggle(user)}
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "8px 12px",
        marginBottom: 4,
        cursor: "pointer",
        borderRadius: token.borderRadiusSM,
        background: selected
          ? token.colorPrimaryBg
          : token.colorBgContainer,
      }}
    >
      <Space>
        <UserOutlined />
        <div>
          <div>{user.name}</div>
          <Text type="secondary">{user.email}</Text>
        </div>
      </Space>

      {selected && (
        <CheckOutlined style={{ color: token.colorPrimary }} />
      )}
    </div>
  );
});

export default function AddUserModal({
  site,
  perm,
  group,
  addedUsers,
  setAddedUsers,
  close,
  allUsers,
}) {
  const [search, setSearch] = useState("");
  const { token } = theme.useToken();

  // ✅ Debounced search
  const debouncedSetSearch = useMemo(
    () => debounce((value) => setSearch(value.toLowerCase()), 200),
    []
  );

  // ✅ Selected users (filtered once)
  const selectedUsers = useMemo(() => {
    return addedUsers.filter(
      (u) => u.site === site && u.perm === perm && u.group === group
    );
  }, [addedUsers, site, perm, group]);

  // ✅ O(1) lookup set
  const selectedSet = useMemo(() => {
    return new Set(selectedUsers.map((u) => u.email));
  }, [selectedUsers]);

  // ✅ Filter + limit results
  const filteredUsers = useMemo(() => {
    if (!search) return allUsers.slice(0, 100);

    return allUsers
      .filter(
        (u) =>
          u.name.toLowerCase().includes(search) ||
          u.email.toLowerCase().includes(search)
      )
      .slice(0, 100); // 🚀 limit for performance
  }, [search, allUsers]);

  // ✅ Optimized toggle
  const toggleUser = useCallback(
    (user) => {
      setAddedUsers((prev) => {
        const exists = prev.some(
          (u) =>
            u.site === site &&
            u.perm === perm &&
            u.group === group &&
            u.email === user.email
        );

        if (exists) {
          return prev.filter(
            (u) =>
              !(
                u.site === site &&
                u.perm === perm &&
                u.group === group &&
                u.email === user.email
              )
          );
        }

        return [
          ...prev,
          {
            site,
            perm,
            group,
            email: user.email,
            name: user.name,
          },
        ];
      });
    },
    [setAddedUsers, site, perm, group]
  );

  return (
    <Modal
      open={true}
      onCancel={close}
      footer={null}
      title={`Add Users to ${group} (${perm}) — ${site}`}
      width={500}
    >
      <Space orientation="vertical" style={{ width: "100%" }} size="middle">
        {/* Search */}
        <Input
          placeholder="Search users..."
          onChange={(e) => debouncedSetSearch(e.target.value)}
          allowClear
        />

        {/* Selected users */}
        {selectedUsers.length > 0 && (
          <div
            style={{
              maxHeight: 120,
              overflowY: "auto",
              border: `1px solid ${token.colorBorder}`,
              padding: 10,
              borderRadius: 6,
              background: token.colorBgContainer,
            }}
          >
            <Text strong>Selected:</Text>
            <div
              style={{
                marginTop: 8,
                display: "flex",
                flexWrap: "wrap",
                gap: 6,
              }}
            >
              {selectedUsers.map((user) => (
                <Tag key={user.email} icon={<CheckOutlined />} color="blue">
                  {user.name}
                </Tag>
              ))}
            </div>
          </div>
        )}

        {/* User list */}
        <div
          style={{
            maxHeight: 320,
            overflowY: "auto",
            background: token.colorBgContainer,
            border: `1px solid ${token.colorBorder}`,
            borderRadius: token.borderRadius,
            padding: 8,
          }}
        >
          {filteredUsers.map((user) => (
            <UserRow
              key={user.email}
              user={user}
              selected={selectedSet.has(user.email)}
              onToggle={toggleUser}
              token={token}
            />
          ))}
        </div>

        {/* Footer actions */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <Button onClick={close}>Cancel</Button>
          <Button
            type="primary"
            onClick={close}
            disabled={!selectedUsers.length}
          >
            Add {selectedUsers.length || ""}
          </Button>
        </div>
      </Space>
    </Modal>
  );
}