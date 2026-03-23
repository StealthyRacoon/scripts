import { useEffect, useState } from "react";
import api from "../utils/api";

import LibraryModal from "../components/LibraryModal";
import AdminSummary from "../components/AdminSummary";
import OwnerSearch from "../components/OwnerSearch";

export default function OwnerPage() {

  const [summary, setSummary] = useState({});
  const [selectedLibrary, setSelectedLibrary] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [decisions, setDecisions] = useState({});
  const [loading, setLoading] = useState(false);

  const owner = "Admin"

  useEffect(() => {

    api
      .get(`http://localhost:4000/api/sites`)
      .then((res) => buildSummary(res.data))
      .catch(console.error);
  }, []);

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
    const grouped = {};

    rows.forEach((row) => {
      const superOwner = row.superOwner || "Unknown";
      const site = row.URL;
      const library = row.SharePointObject;

      if (!superOwner || !site || !library) return;

      if (!grouped[superOwner]) grouped[superOwner] = {};
      if (!grouped[superOwner][site]) grouped[superOwner][site] = {};
      if (!grouped[superOwner][site][library]) {
        grouped[superOwner][site][library] = {
          permissions: [],
          directCount: 0,
        };
      }

      const isDirect = !row.GivenThrough || row.GivenThrough === row.Name;

      if (isDirect) grouped[superOwner][site][library].directCount++;

      grouped[superOwner][site][library].permissions.push({
        principal: row.Name,
        group: row.GivenThrough,
        permission: row.Permission,
        isDirect,
      });
    });

    setSummary(grouped);
  };

  const openLibrary = (superOwner, site, library) => {
    setSelectedLibrary({
      site,
      library,
      data: summary[superOwner][site][library].permissions,
    });
  };



  const closeLibraryModal = () => setSelectedLibrary(null);

  return (
    <div style={{ padding: 40, fontFamily: "Segoe UI, sans-serif" }}>
      <h1>SharePoint Permission Review for Admin</h1>

      <OwnerSearch
        owner={owner}
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
        />
      )}
    </div>
  );
}