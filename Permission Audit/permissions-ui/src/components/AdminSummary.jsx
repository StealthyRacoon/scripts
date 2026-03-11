import { useState, useMemo } from "react";

export default function AdminSummary({ summary, onOpenLibrary }) {
    const [expanded, setExpanded] = useState({});
    const [search, setSearch] = useState("");

    const grouped = summary || {};

    const cardStyle = (bg) => ({
        background: bg,
        color: "white",
        padding: 14,
        borderRadius: 8,
        flex: 1,
        textAlign: "center",
        boxShadow: "0 3px 6px rgba(0,0,0,0.1)",
    });

    /* ---------------- GLOBAL STATS ---------------- */

    const globalStats = useMemo(() => {
        let totalSites = 0;
        let needReview = 0;

        Object.values(grouped).forEach((sites) => {
            Object.entries(sites).forEach(([site, libs]) => {
                totalSites++;

                const hasRisk = Object.values(libs).some(
                    (lib) => lib.directCount > 0
                );

                if (hasRisk) needReview++;
            });
        });

        return {
            totalSites,
            needReview,
            ok: totalSites - needReview,
        };
    }, [grouped]);

    /* ---------------- SEARCH FILTER ---------------- */

const filtered = useMemo(() => {
    if (!search) return grouped;

    return Object.fromEntries(
        Object.entries(grouped).filter(([superOwner]) =>
            superOwner.toLowerCase().includes(search.toLowerCase())
        )
    );
}, [search, grouped]);

    return (
        <div style={{ marginBottom: 40 }}>

            {/* SEARCH BAR */}

            <input
                placeholder="🔍 Search sites..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                    padding: 10,
                    width: 320,
                    marginBottom: 20,
                    border: "1px solid #ccc",
                    borderRadius: 6,
                }}
            />

            {/* GLOBAL STATS */}

            <div style={{ display: "flex", gap: 15, marginBottom: 30 }}>

                <div style={cardStyle("#1976d2")}>
                    <div style={{ fontSize: 24, fontWeight: "bold" }}>
                        {globalStats.totalSites}
                    </div>
                    Total Sites
                </div>

                <div style={cardStyle("#dc3545")}>
                    <div style={{ fontSize: 24, fontWeight: "bold" }}>
                        {globalStats.needReview}
                    </div>
                    ⚠ Need Review
                </div>

                <div style={cardStyle("#2e7d32")}>
                    <div style={{ fontSize: 24, fontWeight: "bold" }}>
                        {globalStats.ok}
                    </div>
                    ✔ OK
                </div>
            </div>

            {/* SUPEROWNER GROUPS */}

            {Object.entries(filtered)
            .sort(([a],[b]) => a.localeCompare(b))
            .map(([superOwner, sites]) => {

                const siteNames = Object.keys(sites);

                const sitesNeedReview = siteNames.filter((site) =>
                    Object.values(sites[site]).some(
                        (lib) => lib.directCount > 0
                    )
                ).length;

                const sitesOk = siteNames.length - sitesNeedReview;

                const isOpen = expanded[superOwner];

                return (
                    <div
                        key={superOwner}
                        style={{
                            marginBottom: 14,
                            border: "1px solid #ddd",
                            borderRadius: 8,
                            overflow: "hidden",
                        }}
                    >

                        {/* SUPEROWNER HEADER */}

                        <div
                            onClick={() =>
                                setExpanded((prev) => ({
                                    ...prev,
                                    [superOwner]: !prev[superOwner],
                                }))
                            }
                            style={{
                                padding: 14,
                                background: "#f5f7fa",
                                cursor: "pointer",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                fontWeight: 600,
                            }}
                        >
                            <div>
                                {isOpen ? "▼" : "▶"} {superOwner}
                            </div>

                            {/* ROW LEVEL STATS */}

                            <div style={{ display: "flex", gap: 15, fontSize: 13 }}>

                                <span style={{ color: "#1976d2" }}>
                                    🌐 {siteNames.length}
                                </span>

                                <span style={{ color: "#dc3545" }}>
                                    ⚠ {sitesNeedReview}
                                </span>

                                <span style={{ color: "#2e7d32" }}>
                                    ✔ {sitesOk}
                                </span>

                            </div>
                        </div>

                        {/* SITES */}

                        {isOpen && (
                            <div
                                style={{
                                    padding: 15,
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 10,
                                }}
                            >
                                {siteNames.map((site) => {

                                    const hasRisk = Object.values(
                                        sites[site]
                                    ).some((lib) => lib.directCount > 0);

                                    return (
                                        <div
                                            key={site}
                                            onClick={() => {
                                                const firstLibrary = Object.keys(sites[site])[0];
                                                if (firstLibrary)
                                                    onOpenLibrary(superOwner, site, firstLibrary);
                                            }}
                                            style={{
                                                padding: 12,
                                                border: "1px solid #ccc",
                                                borderRadius: 6,
                                                background: hasRisk
                                                    ? "#fff3cd"
                                                    : "#e6f4ea",
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: "center",
                                                cursor: "pointer",
                                            }}
                                        >
                                            <div>
                                                <div style={{ fontSize: 14 }}>
                                                    {site}
                                                </div>
                                                <div
                                                    style={{
                                                        fontSize: 12,
                                                        color: "#777",
                                                    }}
                                                >
                                                    {Object.keys(sites[site]).length} libraries
                                                </div>
                                            </div>

                                            <span
                                                style={{
                                                    padding: "4px 10px",
                                                    borderRadius: 12,
                                                    fontWeight: 500,
                                                    background: hasRisk
                                                        ? "#dc3545"
                                                        : "#2e7d32",
                                                    color: "white",
                                                    fontSize: 12,
                                                }}
                                            >
                                                {hasRisk
                                                    ? "Needs Review"
                                                    : "OK"}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}