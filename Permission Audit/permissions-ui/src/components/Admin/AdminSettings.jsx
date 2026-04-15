import React, { useEffect, useState } from "react";
import {
    Form,
    Input,
    Button,
    Space,
    Tooltip,
    Typography,
    Divider
} from "antd";

import {
    EyeOutlined,
    EyeInvisibleOutlined,
    DownloadOutlined
} from "@ant-design/icons";

import { useStatus } from "../../providers/StatusProvider";
import api from "../../utils/api";

const { Title } = Typography;

/**
 * =========================
 * SECRET FIELD (CONTROLLED)
 * =========================
 */
const SecretField = ({
    label,
    name,
    value,
    onChange,
    onReveal,
}) => {
    const [loading, setLoading] = useState(false);
    const [visible, setVisible] = useState(false);

    const { notify } = useStatus();

    const handleReveal = async () => {
        try {
            setLoading(true);

            const secretValue = await onReveal(name);

            onChange(name, secretValue); 

        } catch (err) {
            console.error(err);
            notify.error("Failed to load secret");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Form.Item label={label}>
            <Space.Compact style={{ width: "100%" }}>

                <Input
                    style={{ width: "100%" }}
                    type={visible ? "text" : "password"}
                    value={value || ""}
                    onChange={(e) => onChange(name, e.target.value)}
                    autoComplete="new-password"
                />

                <Tooltip title={visible ? "Hide value" : "Show value"}>
                    <Button
                        icon={visible ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                        onClick={() => setVisible(v => !v)}
                    />
                </Tooltip>

                <Tooltip title="Load from server">
                    <Button
                        loading={loading}
                        icon={<DownloadOutlined />}
                        onClick={handleReveal}
                    />
                </Tooltip>

            </Space.Compact>
        </Form.Item>
    );
};

/**
 * =========================
 * SETTINGS PAGE
 * =========================
 */
const SettingsPage = () => {
    const [form] = Form.useForm();

    const [saving, setSaving] = useState(false);
    const [testing, setTesting] = useState(false);

    /**
     * 🔐 SINGLE SOURCE OF TRUTH
     */
    const [secrets, setSecrets] = useState({
        tenantId: "",
        clientId: "",
        clientSecret: "",
        certThumbprint: "",
        authorityUrl: "",
        spUrl: "",
    });

    const { notify } = useStatus();

    /**
     * Update helper
     */
    const updateSecret = (key, value) => {
        setSecrets(prev => ({
            ...prev,
            [key]: value
        }));

        // keep form in sync
        form.setFieldsValue({
            [key]: value
        });
    };

    /**
     * Fetch secret from backend
     */
    const handleReveal = async (key) => {
        const res = await api.get(`/settings/config/${key}`, {
            silent: true
        });

        return res.data?.value;
    };

    /**
     * Submit settings
     */
    const handleSubmit = async (values) => {
        try {
            setSaving(true);

            const filtered = Object.fromEntries(
                Object.entries(values).filter(
                    ([_, v]) => v && v.trim() !== ""
                )
            );

            if (!Object.keys(filtered).length) {
                notify.info("No changes to save");
                return;
            }

            const res = await api.post("/settings", secrets);


            if (!res.data?.success) {
                throw new Error("Save failed");
            }

            notify.success("Settings saved successfully");

        } catch (err) {
            console.error(err);
            notify.error("Failed to save settings");
        } finally {
            setSaving(false);
        }
    };

    /**
     * Test connection
     */
    const handleTestConnection = async () => {
        try {
            setTesting(true);

            const res = await api.get("/settings/testcon");

            if (res.statusText === "OK") {
                notify.success("Connection successful");
                console.log(res.request.response)
            } else {
                console.log(res)
                notify.error(
                    res.data?.error?.message ||
                    "Connection failed"
                );
            }

        } catch (err) {
            console.error(err);
            notify.error(
                err.response?.data?.error?.message ||
                "Connection test failed"
            );
        } finally {
            setTesting(false);
        }
    };


    return (
        <div style={{ maxWidth: 700 }}>
            <Title level={3}>
                Microsoft Integration Settings
            </Title>

            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                autoComplete="off"
                initialValues={secrets}
            >
                <Title level={5}>Core Configuration</Title>

                <SecretField
                    label="Tenant ID"
                    name="tenantId"
                    value={secrets.tenantId}
                    onChange={updateSecret}
                    onReveal={handleReveal}
                />

                <SecretField
                    label="Client ID"
                    name="clientId"
                    value={secrets.clientId}
                    onChange={updateSecret}
                    onReveal={handleReveal}
                />

                <SecretField
                    label="Client Secret"
                    name="clientSecret"
                    value={secrets.clientSecret}
                    onChange={updateSecret}
                    onReveal={handleReveal}
                />

                <Form.Item
                    label="SharePoint Tenant URL"
                    name="spUrl"
                    rules={[
                        {
                            type: "url",
                            message: "Enter a valid URL"
                        }
                    ]}
                >
                    <Input
                        value={secrets.spUrl}
                        onChange={(e) =>
                            updateSecret("spUrl", e.target.value)
                        }
                        placeholder="https://your-org.sharepoint.com"
                    />
                </Form.Item>

                <Divider />

                <Title level={5}>Optional</Title>

                <SecretField
                    label="Certificate Thumbprint"
                    name="certThumbprint"
                    value={secrets.certThumbprint}
                    onChange={updateSecret}
                    onReveal={handleReveal}
                />

                <SecretField
                    label="Authority URL"
                    name="authorityUrl"
                    value={secrets.authorityUrl}
                    onChange={updateSecret}
                    onReveal={handleReveal}
                />

                <Divider />

                <Space>
                    <Button
                        type="primary"
                        htmlType="submit"
                        loading={saving}
                    >
                        Save Settings
                    </Button>

                    <Button
                        onClick={() => {
                            setSecrets({});
                            form.resetFields();
                        }}
                    >
                        Reset
                    </Button>

                    <Button
                        loading={testing}
                        onClick={handleTestConnection}
                    >
                        Test Connection
                    </Button>
                </Space>
            </Form>
        </div>
    );
};

export default SettingsPage;