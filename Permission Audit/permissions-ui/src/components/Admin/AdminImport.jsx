import { useState } from "react";
import { Upload, Button, Progress, Typography, message } from "antd";
import { UploadOutlined, InboxOutlined } from "@ant-design/icons";

const { Dragger } = Upload;
const { Text } = Typography;

export default function AdminImport() {
  const [fileList, setFileList] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleBeforeUpload = (file) => {
    // Prevent auto upload
    setFileList([file]);
    return false;
  };

  const handleRemove = () => {
    setFileList([]);
    setProgress(0);
  };

  const handleUpload = async () => {
    if (fileList.length === 0) {
      message.warning("Please select a file first");
      return;
    }

    const file = fileList[0];
    setUploading(true);
    setProgress(0);

    try {
      // Simulated upload (replace with real API call)
      const simulateUpload = () =>
        new Promise((resolve) => {
          let percent = 0;
          const interval = setInterval(() => {
            percent += 10;
            setProgress(percent);
            if (percent >= 100) {
              clearInterval(interval);
              resolve();
            }
          }, 200);
        });

      await simulateUpload();

      message.success(`${file.name} uploaded successfully`);
      setFileList([]);
    } catch (err) {
      message.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ maxWidth: 600 }}>
      <Typography.Title level={3}>Import Data</Typography.Title>

      <Dragger
        beforeUpload={handleBeforeUpload}
        fileList={fileList}
        onRemove={handleRemove}
        multiple={false}
        maxCount={1}
      >
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">
          Click or drag a file to this area to upload
        </p>
        <p className="ant-upload-hint">
          Support for a single file upload. (CSV, JSON, etc.)
        </p>
      </Dragger>

      {fileList.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <Text strong>Selected file:</Text> {fileList[0].name}
        </div>
      )}

      {uploading && (
        <div style={{ marginTop: 16 }}>
          <Progress percent={progress} />
        </div>
      )}

      <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
        <Button
          type="primary"
          icon={<UploadOutlined />}
          onClick={handleUpload}
          disabled={fileList.length === 0}
          loading={uploading}
        >
          Upload
        </Button>

        <Button onClick={handleRemove} disabled={fileList.length === 0}>
          Clear
        </Button>
      </div>
    </div>
  );
}