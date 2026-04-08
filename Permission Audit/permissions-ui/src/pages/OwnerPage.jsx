import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../utils/api";


import OwnerSearch from "../components/OwnerSearch";
import LibraryModal from "../components/LibraryModal";


export default function OwnerPage() {
  const { owner } = useParams();

  const [summary, setSummary] = useState({});
  const [selectedLibrary, setSelectedLibrary] = useState(null);
  const [decisions, setDecisions] = useState({});
  const [superOwner, setSuperOwner] = useState();
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [campaignId, setCampaignId] = useState(null);
  const [addedUsers, setAddedUsers] = useState([]);

  useEffect(() => {
    if (!owner) return;

    api
      .get(`/superownerspermissions?owner=${encodeURIComponent(owner)}`)
      .then((res) => {
        console.log()
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

  const updateDecision = (site, library, idx, newDecision) => {
    setSummary((prev) => {
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


  const buildSummary = (rows) => {
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

      if (row.Secret === encodeURIComponent(owner)) {
        setSuperOwner(row.superOwner);

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
    setSelectedLibrary({ site, library, });
  };

  const libraryData =
    selectedLibrary &&
    summary[selectedLibrary.site]?.[selectedLibrary.library]?.permissions.map(
      (row, idx) => ({
        ...row,
        _idx: idx,
        site: selectedLibrary.site,
        library: selectedLibrary.library,
      })
    );


  return (
    <div style={{ padding: 40, fontFamily: "Segoe UI, sans-serif" }}>


      <h1>{superOwner}</h1>
      <OwnerSearch
        owner={superOwner}
        setOwner={() => { }}
        summary={summary}
        onOpenLibrary={openLibrary}
      />

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
    </div>
  );
}