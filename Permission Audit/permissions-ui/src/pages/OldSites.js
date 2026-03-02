import { useEffect, useState } from "react";
import axios from "axios";
import Modal from "react-modal";

Modal.setAppElement("#root"); // Required for accessibility

export default function OldSites() {
  const [data, setData] = useState([]);
    const [expandedSites, setExpandedSites] = useState({});
  const [expandedLibraries, setExpandedLibraries] = useState({});
  const [expandedGroups, setExpandedGroups] = useState({});

  useEffect(() => {
    axios
      // .get("http://localhost:4000/api/permissions?site=https://sustainabletimbertasmania.sharepoint.com/teams/GRP_ExecutiveAssistants")
      .get("http://localhost:4000/api/permissions")
      .then((res) => setData(res.data))
      .catch((err) => console.error(err));
  }, []);

  // Group by Site → Library → Groups + Permissions
    const grouped = data.reduce((acc, row) => {
    const site = row.URL;
    const library = row["SharePointObject"];
    const group = row.GivenThrough;
    const name = row.Name;

    if (!acc[site]) acc[site] = {};
    if (!acc[site][library]) acc[site][library] = {};
    if (!acc[site][library][group]) acc[site][library][group] = [];
    acc[site][library][group].push(name);

    return acc;
  }, {});

  // Toggle helpers
  const toggleSite = (site) => setExpandedSites((prev) => ({ ...prev, [site]: !prev[site] }));
  const toggleLibrary = (site, library) => {
    const key = `${site}-${library}`;
    setExpandedLibraries((prev) => ({ ...prev, [key]: !prev[key] }));
  };
  const toggleGroup = (site, library, group) => {
    const key = `${site}-${library}-${group}`;
    setExpandedGroups((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div>
      {Object.entries(grouped).map(([site, libraries]) => (
        <div key={site}>
          <div onClick={() => toggleSite(site)} style={{ cursor: "pointer", fontWeight: "bold" }}>
            {site} {expandedSites[site] ? "▼" : "▶"}
          </div>

          {expandedSites[site] &&
            Object.entries(libraries).map(([library, groups]) => {
              const libKey = `${site}-${library}`;
              return (
                <div key={library} style={{ paddingLeft: 20 }}>
                  <div onClick={() => toggleLibrary(site, library)} style={{ cursor: "pointer" }}>
                    {library} {expandedLibraries[libKey] ? "▼" : "▶"}
                  </div>

                  {expandedLibraries[libKey] &&
                    Object.entries(groups).map(([group, names]) => {
                      const groupKey = `${site}-${library}-${group}`;
                      return (
                        <div key={group} style={{ paddingLeft: 20 }}>
                          <div onClick={() => toggleGroup(site, library, group)} style={{ cursor: "pointer" }}>
                            {group} {expandedGroups[groupKey] ? "▼" : "▶"}
                          </div>

                          {expandedGroups[groupKey] &&
                            <div style={{ paddingLeft: 20 }}>
                              {names.map((name, idx) => (
                                <div key={idx}>{name}</div>
                              ))}
                            </div>
                          }
                        </div>
                      );
                    })
                  }
                </div>
              );
            })
          }
        </div>
      ))}
    </div>
  );
}