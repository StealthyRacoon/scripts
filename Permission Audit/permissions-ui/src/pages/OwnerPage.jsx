import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../utils/api";


import OwnerSearch from "../components/OwnerSearch";
import LibraryModal from "../components/LibraryModal";
import { set } from "lodash";


export default function OwnerPage() {
  const { owner } = useParams();

  const [summary, setSummary] = useState({});
  const [selectedLibrary, setSelectedLibrary] = useState(null);
  const [decisions, setDecisions] = useState({});
  const [superOwner, setSuperOwner] = useState();
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [campaignId, setCampaignId] = useState(null);

  useEffect(() => {
    if (!owner) return;

    api
      .get(`/superownerspermissions?owner=${encodeURIComponent(owner)}`)
      .then((res) => {
        setCampaignId(res.data.campaignId);
        buildSummary(res.data.rows)
      })
      .catch(console.error);
  }, [owner]);

  useEffect(() => {
    api.get("/users")
      .then((res) => {
        const formatted = res.data.map(u => ({ name: u.Name, email: u.Email }));
        const uniqueUsers = deduplicateUsers(formatted);
        setAllUsers(uniqueUsers);
      })
      .catch(console.error);
  }, []);

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


  const buildSummary = (rows) => {
    if (!rows?.length) return;

    const grouped = {};

    // SuperOwner context
    setSuperOwner(rows[0].superOwner);

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

    setSummary(grouped);
  };

  const openLibrary = (site, library) => {
    setSelectedLibrary({
      site,
      library,
      data: summary[site][library].permissions.map((row, idx) => ({
        ...row,
        _idx: idx,        // assign _idx here
        site,             // keep full site info
        library           // keep full library name
      })),
    });
  };

  const closeLibraryModal = () => setSelectedLibrary(null);

  return (
    <div style={{ padding: 40, fontFamily: "Segoe UI, sans-serif" }}>


      <h1>{superOwner}</h1>
      <OwnerSearch
        owner={superOwner}
        setOwner={() => { }}
        summary={summary}
        onOpenLibrary={openLibrary}
      />

      {selectedLibrary && (
        <LibraryModal
          site={selectedLibrary.site}
          libraryName={selectedLibrary.library}
          libraryData={selectedLibrary.data}
          closeModal={closeLibraryModal}
          decisions={decisions}
          setDecisions={setDecisions}
          allUsers={allUsers}
          selectedLibrary={selectedLibrary}
          loading={loading}
          setLoading={setLoading}
          campaignId={campaignId}
        />
      )}
    </div>
  );
}