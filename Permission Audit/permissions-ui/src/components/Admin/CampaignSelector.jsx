// CampaignSelector.jsx
import { Select, Spin } from "antd";
import { useEffect, useState } from "react";
import api from "../utils/api";

export default function CampaignSelector({ value, onChange, onLockedChange }) {
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get("/campaigns").then((res) => {
            setCampaigns(res.data);
            setLoading(false);

            // Auto-select latest pending campaign if none selected
            if (!value) {
                const latest = res.data
                    .filter(c => c.Status?.toLowerCase() !== "completed")
                    .sort((a,b) => new Date(b.InitiatedAt) - new Date(a.InitiatedAt))[0];
                if (latest) {
                    onChange(latest.Id);
                    onLockedChange(false);
                }
            }
        });
    }, []);

    if (loading) return <Spin size="small" />;

    return (
        <Select
            value={value}
            onChange={(val) => {
                const selected = campaigns.find(c => c.Id === val);
                onChange(val);
                onLockedChange(selected.Status?.toLowerCase() === "completed");
            }}
            options={campaigns.map(c => ({
                value: c.Id,
                label: `${c.Site} - ${new Date(c.InitiatedAt).toLocaleDateString()} (${c.Status})`,
                disabled: false
            }))}
            style={{ minWidth: 250 }}
        />
    );
}