
import { Layout, Table } from 'antd';



export default function Owner() {




  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Table
        columns={[
          { title: 'ID', dataIndex: 'id', key: 'id' },
          { title: 'Name', dataIndex: 'name', key: 'name' },
        ]}
      />
    </Layout>
  );
}
