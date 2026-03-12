import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

import OwnerSearch from "../components/OwnerSearch";
import LibraryModal from "../components/LibraryModal";

export default function OwnerPage() {
  const { owner } = useParams();

  const [summary, setSummary] = useState({});
  const [selectedLibrary, setSelectedLibrary] = useState(null);
  const [decisions, setDecisions] = useState({});
  const [superOwner, setSuperOwner] = useState();
  const [allUsers, setAllUsers] = useState([]);

  useEffect(() => {
    if (!owner) return;

    axios
      .get(`http://localhost:4000/api/superownerspermissions?owner=${encodeURIComponent(owner)}`)
      .then((res) => buildSummary(res.data))
      .catch(console.error);
  }, [owner]);

  useEffect(() => {
    axios.get("http://localhost:4000/api/users")
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
    setSuperOwner(rows[0].superOwner)

    rows.forEach((row) => {
      const site = row.URL;
      const library = row.SharePointObject;

      if (!site || !library) return;

      if (!grouped[site]) grouped[site] = {};
      if (!grouped[site][library]) grouped[site][library] = { permissions: [], directCount: 0 };

      const isDirect = !row.GivenThrough || row.GivenThrough === row.Name;

      if (isDirect) grouped[site][library].directCount++;

      grouped[site][library].permissions.push({
        principal: row.Name,
        group: row.GivenThrough,
        email: row.Email,
        permission: row.Permission,
        isDirect,
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
      <h1>SharePoint Permission Review for {superOwner}</h1>

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
        />
      )}
    </div>
  );
}