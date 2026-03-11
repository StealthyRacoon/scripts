import { useEffect, useState } from "react";
import axios from "axios";

import LibraryModal from "../components/LibraryModal";
import AdminSummary from "../components/AdminSummary";

export default function OwnerPage() {

  const [summary, setSummary] = useState({});
  const [selectedLibrary, setSelectedLibrary] = useState(null);
  const [decisions, setDecisions] = useState({});
  const owner = "Admin"

  useEffect(() => {

    axios
      .get(`http://localhost:4000/api/sites`)
      .then((res) => buildSummary(res.data))
      .catch(console.error);
  }, []);

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

//   const openLibrary = (superOwner, site, library) => {
//     console.log(superOwner, site, library);

//     setSelectedSuperOwner(superOwner);
//     setSelectedSite(site);
//     setSelectedLibrary(library);

//     setModalOpen(true);
// };

  const closeLibraryModal = () => setSelectedLibrary(null);

  return (
    <div style={{ padding: 40, fontFamily: "Segoe UI, sans-serif" }}>
      <h1>SharePoint Permission Review for Admin</h1>

      <AdminSummary
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
        />
      )}
    </div>
  );
}