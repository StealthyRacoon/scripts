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

  useEffect(() => {
    if (!owner) return;

    axios
      .get(`http://localhost:4000/api/superownerspermissions?owner=${encodeURIComponent(owner)}`)
      .then((res) => buildSummary(res.data))
      .catch(console.error);
  }, [owner]);

  const buildSummary = (rows) => {
    const grouped = {};

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
      data: summary[site][library].permissions,
    });
  };

  const closeLibraryModal = () => setSelectedLibrary(null);

  return (
    <div style={{ padding: 40, fontFamily: "Segoe UI, sans-serif" }}>
      <h1>SharePoint Permission Review for {owner}</h1>

      <OwnerSearch
        owner={owner}
        setOwner={() => {}}
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