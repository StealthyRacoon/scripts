import { useEffect, useState } from "react";
import { Row, Col, Card, Typography, Badge } from "antd";
import api from "../utils/api";

import LibraryModal from "../components/LibraryModal";
import SitePermissions from "../components/Admin/SitePermissions";

const { Title, Text } = Typography;

export default function Dashboard() {
    const [summary, setSummary] = useState({});
    const [campaigns, setCampaigns] = useState([]);
    const [campaignId, setCampaignId] = useState(null);
    const [decisions, setDecisions] = useState({});
    const [selectedLibrary, setSelectedLibrary] = useState(null);
    const [data, setData] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [addedUsers, setAddedUsers] = useState([]);


    useEffect(() => {
        api.get("/adminsites").then((res) => setSummary(res.data));
        api.get("/campaigns").then((res) => setCampaigns(res.data));
        api.get("/users")
            .then((res) => {
                const formatted = res.data.map(u => ({ name: u.Name, email: u.Email }));
                const uniqueUsers = deduplicateUsers(formatted);
                setAllUsers(uniqueUsers);
            })
            .catch(console.error);
        api.get("/adminpermissions").then((res) => {
            buildData(res.data.rows);
            setCampaignId(res.data.campaignId);
        });

    }, []);


    const updateDecision = (site, library, idx, newDecision) => {
        setData((prev) => {
            const updated = { ...prev };

            const permission = updated[site][library].permissions[idx];
            permission.decision = newDecision;

            return { ...updated };
        });
    };

    const deduplicateUsers = (rawUsers) => {
        const emailMap = {};

        rawUsers.forEach((user) => {
            if (!user.email) return;

            // If email not seen yet, or current name doesn't include "Owners"
            if (!emailMap[user.email] || !emailMap[user.email].name.includes("Owners")) {
                // Prefer non-"Owners" name if possible
                if (!user.name.includes("Owners") || !emailMap[user.email]) {
                    emailMap[user.email] = user;
                }
            }
        });

        return Object.values(emailMap);
    };
    const libraryData =
        selectedLibrary &&
        data[selectedLibrary.site]?.[selectedLibrary.library]?.permissions.map(
            (row, idx) => ({
                ...row,
                _idx: idx,
                site: selectedLibrary.site,
                library: selectedLibrary.library,
            })
        );



    const openLibrary = (site, library) => {
        setSelectedLibrary({ site, library, });
    };
    const buildData = (rows) => {
        if (!rows?.length) return;

        const grouped = {};


        rows.forEach((row) => {
            const site = row.URL;
            const library = row.SharePointObject;

            if (!site || !library) return;

            if (!grouped[site]) grouped[site] = {};
            if (!grouped[site][library]) {
                grouped[site][library] = {
                    permissions: [],
                    directCount: 0,
                };
            }

            const isDirect = !row.GivenThrough || row.GivenThrough === row.Name;
            if (isDirect) grouped[site][library].directCount++;

            grouped[site][library].permissions.push({
                /* === Existing permission data === */
                permissionId: row.Id,
                principal: row.Name,
                group: row.GivenThrough,
                email: row.Email,
                permission: row.Permission,
                principalType: row.PrincipalType,
                isExternalUser: row.IsExternalUser,
                department: row.Department,
                jobTitle: row.JobTitle,
                isDirect,

                /* === Audit persistence data === */
                auditId: row.auditId ?? null,
                decision: row.Decision ?? null,
                adminApproved: row.adminApproved ?? null,
                adminApprovedTimestamp: row.adminApprovedTimestamp ?? null,
                auditTimestamp: row.auditTimestamp ?? null,
                groupName: row.GroupName ?? null,
                campaignId: row.campaignId ?? null,
            });
        });

        setData(grouped);
    };



    // const stats = {
    //     totalSites: summary.sites ? summary.sites.length : 0,
    //     reviewedSites: progress.reviewed,
    //     inProgress: progress.inProgress,
    // };


    const stats = {
        totalSites: summary.sites ? summary.sites.length : 0,
        reviewedSites: campaigns.filter(c => c.Status === "completed").length,
        inProgress: campaigns.filter(c => c.Status === "pending").length,
    };


    return (
        <>

            <div style={{ marginBottom: 16 }}>
                <Badge
                    color={ "gold"}
                    text={
                        <Text type="secondary" style={{ marginLeft: 8 }}>
                            In progress ({stats.inProgress || 0} / {stats.totalSites})
                        </Text>
                    }
                />
            </div>

            {/* Change this - total sites is fine, the reviewed and in progress needs to be a live indicator showing whether or no a campaign is in progress */}
            <Row gutter={16} style={{ marginBottom: 16 }}>
                <Col xs={24} md={8}>
                    <Card styles={{ body: { textAlign: "center" } }}>
                        <Title level={3} style={{ margin: 0 }}>
                            {stats.totalSites || 0}
                        </Title>
                        <Text type="secondary">Total Sites</Text>
                    </Card>
                </Col>

                {/* These cards need to show how many sites have been reviewed or are in progress in the current campaign */}
                <Col xs={24} md={8}>
                    <Card styles={{ body: { textAlign: "center" } }}>
                        <Title level={3} style={{ margin: 0, color: "#2e7d32" }}>
                            {stats.reviewedSites || 0}
                        </Title>
                        <Text type="secondary">Reviewed (Completed Campaigns)</Text>
                    </Card>
                </Col>

                <Col xs={24} md={8}>
                    <Card styles={{ body: { textAlign: "center" } }}>
                        <Title level={3} style={{ margin: 0, color: "#dc3545" }}>
                            {stats.inProgress || 0}
                        </Title>
                        <Text type="secondary">In Progress</Text>
                    </Card>
                </Col>
            </Row>

            <SitePermissions data={data} onOpenLibrary={openLibrary} />

            {selectedLibrary && libraryData && (
                <LibraryModal
                    site={selectedLibrary.site}
                    libraryName={selectedLibrary.library}
                    libraryData={libraryData}
                    closeModal={() => setSelectedLibrary(null)}
                    decisions={decisions}
                    setDecisions={setDecisions}
                    allUsers={allUsers}
                    selectedLibrary={selectedLibrary}
                    loading={loading}
                    setLoading={setLoading}
                    campaignId={campaignId}
                    updateDecision={updateDecision}
                    addedUsers={addedUsers}
                    setAddedUsers={setAddedUsers}
                />
            )}
        </>
    );
}