import { useEffect, useState } from "react";
import axios from "axios";

import OwnerSearch from "./components/OwnerSearch";
import SiteSection from "./components/SiteSection";
import LibraryModal from "./components/LibraryModal";

export default function App() {
  const [owner, setOwner] = useState("");
  const [summary, setSummary] = useState({});
  const [selectedLibrary, setSelectedLibrary] = useState(null);
  const [decisions, setDecisions] = useState({});

  // Fetch sites for the owner
  useEffect(() => {
    if (!owner) {
      setSummary({});
      return;
    }

    axios
      .get(`http://localhost:4000/api/sites?owner=${owner}`)
      .then((res) => buildSummary(res.data))
      .catch((err) => console.error(err));
  }, [owner]);

  // Build summary: site -> libraries -> permissions
  const buildSummary = (rows) => {
    const grouped = rows.reduce((acc, row) => {
      if (!row.ObjectType?.toLowerCase().includes("library")) return acc;

      const site = row.URL;
      const library = row.SharePointObject;

      if (!acc[site]) acc[site] = {};
      if (!acc[site][library]) {
        acc[site][library] = {
          permissions: [],
          directCount: 0,
        };
      }

      const isDirect = !row.GivenThrough || row.GivenThrough === row.Name;
      if (isDirect) acc[site][library].directCount++;

      acc[site][library].permissions.push({
        principal: row.Name,
        group: row.GivenThrough,
        permission: row.Permission,
        isDirect,
      });

      return acc;
    }, {});

    setSummary(grouped);
  };

  // Open library modal
  const openLibrary = (site, library) => {
    setSelectedLibrary({
      site,
      library,
      data: summary[site][library].permissions,
    });
  };

  const closeLibraryModal = () => setSelectedLibrary(null);

  return (
    <div style={{ padding: 40, fontFamily: "Segoe UI, sans-serif" }}>
      <h1 style={{ marginBottom: 20 }}>SharePoint Permission Review</h1>

      {/* Owner search input */}

      <OwnerSearch
        owner={owner}
        setOwner={setOwner}
        summary={summary}
        onOpenLibrary={(site, library) => openLibrary(site, library)}
      />


      {/* Library modal */}
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