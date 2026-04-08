import { useEffect, useState } from "react";
import { Upload, Button, Progress, Typography, message, Table, Select, Tooltip, Tag, Modal } from "antd";
import { UploadOutlined, InboxOutlined } from "@ant-design/icons";
import Papa from "papaparse";

import api from "../../utils/api";

const { Dragger } = Upload;
const { Text, Title } = Typography;

export default function AdminImport() {
  const [fileList, setFileList] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [tableData, setTableData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 5 });
  const [campaigns, setCampaigns] = useState([]);
  const [campaignId, setCampaignId] = useState(null);

  

  useEffect(() => {
    api.get("/campaigns").then((res) => setCampaigns(res.data));
  }, []);



  const handleBeforeUpload = (file) => {
    if (file.type !== "text/csv" && !file.name.endsWith(".csv")) {
      message.error("Only CSV files are allowed");
      return Upload.LIST_IGNORE;
    }

    setFileList([file]);

    // Parse CSV
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.data.length === 0) {
          message.warning("CSV file is empty");
          setTableData([]);
          setColumns([]);
          return;
        }

        setTableData(
          results.data.map((row, idx) => ({ key: idx, ...row }))
        );

        setColumns(
          Object.keys(results.data[0]).map((key) => ({
            title: key,
            dataIndex: key,
            key,
          }))
        );
      },
      error: (err) => {
        message.error("Failed to parse CSV");
        console.error(err);
      },
    });

    return false; // Prevent auto-upload
  };

  const handleRemove = () => {
    setFileList([]);
    setProgress(0);
    setTableData([]);
    setColumns([]);
    setPagination({ current: 1, pageSize: 5 });
  };


const handleUpload = async () => {
  if (fileList.length === 0 || tableData.length === 0) {
    message.warning("Please select a file first");
    return;
  }
  if (!campaignId) {
    message.warning("Please select a campaign");
    return;
  }

  try {
    // ✅ Check if any existing data for this campaign
    const existingRes = await api.get("/superowners", { params: { campaignId } });
    const hasExisting = Array.isArray(existingRes.data) && existingRes.data.length > 0;

    const proceedUpload = async () => {
      setUploading(true);
      setProgress(0);

      try {
        const chunkSize = 100;
        for (let i = 0; i < tableData.length; i += chunkSize) {
          const chunk = tableData.slice(i, i + chunkSize);
          const payload = chunk.map((row) => ({
            URL: row.URL ?? null,
            Name: row.Name ?? null,
            Email: row.Email ?? null,
            campaignId,
          }));

          await api.post("/superowners", {
            rows: payload,
            firstChunk: i === 0,
          });

          const percent = Math.round(((i + chunkSize) / tableData.length) * 100);
          setProgress(Math.min(percent, 100));
        }

        message.success(`${fileList[0].name} uploaded successfully`);
        handleRemove();
      } catch (err) {
        console.error(err);
        message.error("Upload failed");
      } finally {
        setUploading(false);
      }
    };

    if (hasExisting) {
      // Show confirmation modal
      Modal.confirm({
        title: "Data already exists for this campaign",
        content: "Uploading will overwrite existing data. Are you sure you want to continue?",
        okText: "Yes, upload",
        cancelText: "Cancel",
        onOk: proceedUpload,
      });
    } else {
      await proceedUpload();
    }
  } catch (err) {
    console.error(err);
    message.error("Failed to check existing data");
  }
};

  return (
    <div style={{ width: "100%" }}>
      <Title level={3}>Import Data</Title>
      <Select
        placeholder="Select a campaign"
        style={{ width: 400, marginBottom: 16 }}
        value={campaignId}
        onChange={(value) => setCampaignId(value)}
        options={campaigns.map((c) => ({

          value: c.Id,
          label: (
            <span>
              <strong>#{c.Id}</strong> — {
                new Date(c.InitiatedAt).toLocaleDateString()} —
              {c.Status === 'complete' ?
                <Tag color="green">{c.Status}</Tag> :
                <Tag color="orange">{c.Status}</Tag>}

            </span>
          ),
          disabled: c.Status?.toLowerCase() === "complete",
        }))}
      />

      {/* Only show dragger if no file selected */}
      {fileList.length === 0 && (
        <Dragger
          beforeUpload={handleBeforeUpload}
          fileList={fileList}
          onRemove={handleRemove}
          multiple={false}
          maxCount={1}
          accept=".csv"
          style={{ width: "100%" }}
        >
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">
            Click or drag a CSV file to this area
          </p>
          <p className="ant-upload-hint">CSV files only</p>
        </Dragger>
      )}

      {/* Table preview */}
      {fileList.length > 0 && tableData.length > 0 && (
        <div style={{ marginTop: 16, width: "100%" }}>
          <Text strong>Preview:</Text>
          <Table
            dataSource={tableData}
            columns={columns}
            pagination={{
              ...pagination,
              showSizeChanger: true,
              pageSizeOptions: ["5", "10", "20", "50"],
              onChange: (page, pageSize) =>
                setPagination({ current: page, pageSize }),
            }}
            size="small"
            scroll={{ x: "max-content" }}
            style={{ marginTop: 8, width: "100%" }}
          />
        </div>
      )}

      {uploading && (
        <div style={{ marginTop: 16 }}>
          <Progress percent={progress} />
        </div>
      )}

      {/* Action buttons */}
      {fileList.length > 0 && (
        <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
          <Tooltip
            title={!campaignId ? "Please select a campaign first" : ""}
          >
            <span>
              <Button
                type="primary"
                icon={<UploadOutlined />}
                onClick={handleUpload}
                disabled={
                  fileList.length === 0 ||
                  tableData.length === 0 ||
                  !campaignId
                }
                loading={uploading}
              >
                Upload
              </Button>
            </span>
          </Tooltip>

          <Button onClick={handleRemove} disabled={fileList.length === 0}>
            Clear
          </Button>
        </div>
      )}
    </div>
  );
}