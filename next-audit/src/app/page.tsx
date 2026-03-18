'use client';

import { useEffect, useState } from 'react';
import { Table, Tag, Space, Typography, App as AntApp } from 'antd';
import { CheckCircleTwoTone } from '@ant-design/icons';

const { Title } = Typography;

type SharePointPermission = {
  Id: number;
  URL: string;
  SharePointObject: string;
  ObjectType: string;
  InheritsPermissions: string;
  Name: string;
  SensitivityLabel: string;
  RetentionLabel: string;
  Email: string;
  PrincipalType: string;
  IsExternalUser: string;
  IsDeleted: string;
  IsLicensed: string;
  SignInStatus: string;
  GivenThrough: string;
  Department: string;
  JobTitle: string;
  Permission: string;
};

export default function HomePage() {
  const { message } = AntApp.useApp?.() ?? { message: { success: () => {} } };
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<SharePointPermission[]>([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/sharepoint-permissions'); // your API endpoint
      const result = await res.json();
      setData(result);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Grouping data by Site -> Permission -> Users
  const groupedData = data
    .filter((item) => item.ObjectType === 'Site')
    .map((site) => {
      // find all permissions for this site
      const permissions = data
        .filter((item) => item.URL === site.URL && item.ObjectType !== 'Site')
        .reduce<Record<string, SharePointPermission[]>>((acc, curr) => {
          if (!acc[curr.Permission]) acc[curr.Permission] = [];
          acc[curr.Permission].push(curr);
          return acc;
        }, {});

      return {
        key: site.Id,
        siteName: site.SharePointObject,
        children: Object.entries(permissions).map(([permName, users]) => ({
          key: `${site.Id}-${permName}`,
          permissionName: permName,
          children: users.map((user) => ({
            key: user.Id,
            userName: user.Name,
            email: user.Email,
            principalType: user.PrincipalType,
            isExternal: user.IsExternalUser,
            signInStatus: user.SignInStatus,
          })),
        })),
      };
    });

  const columns = [
    {
      title: 'Name',
      dataIndex: 'siteName',
      key: 'name',
      render: (_: any, record: any) => record.siteName || record.permissionName || record.userName,
    },
    {
      title: 'Email / Type',
      dataIndex: 'email',
      key: 'email',
      render: (_: any, record: any) => record.email || record.principalType || '-',
    },
    {
      title: 'External',
      dataIndex: 'isExternal',
      key: 'isExternal',
      render: (_: any, record: any) =>
        record.isExternal ? <Tag color="red">External</Tag> : <Tag color="green">Internal</Tag>,
    },
    {
      title: 'Sign-In Status',
      dataIndex: 'signInStatus',
      key: 'signInStatus',
      render: (_: any, record: any) => record.signInStatus || '-',
    },
  ];

  return (
    <div style={{ padding: 20 }}>
      <Title level={3}>SharePoint Permissions</Title>
      <Table
        columns={columns}
        dataSource={groupedData}
        pagination={false}
        loading={loading}
        expandable={{ defaultExpandAllRows: false }}
      />
    </div>
  );
}