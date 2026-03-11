export default function OwnerSearch({ owner, setOwner, summary, onOpenLibrary }) {
    // Compute summary numbers
    const totalSites = Object.keys(summary).length;
    const sitesNeedReview = Object.values(summary).filter((libs) =>
        Object.values(libs).some((lib) => lib.directCount > 0)
    ).length;
    const sitesOk = totalSites - sitesNeedReview;

    const cardStyle = (bgColor) => ({
        background: bgColor,
        color: "white",
        padding: 15,
        borderRadius: 8,
        flex: 1,
        textAlign: "center",
        boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
    });

    return (
        <div style={{ marginBottom: 30 }}>
            {/* Owner input */}
            {/* <input
                placeholder="Enter Owner Name"
                value={owner}
                onChange={(e) => setOwner(e.target.value)}
                style={{
                    padding: 10,
                    width: 320,
                    marginBottom: 20,
                    border: "1px solid #ccc",
                    borderRadius: 6,
                }}
            /> */}

            {/* Summary cards */}
            {totalSites > 0 ?
                <div style={{ display: "flex", gap: 15, marginBottom: 25 }}>
                    <div style={cardStyle("#1976d2")}>
                        <div style={{ fontSize: 24, fontWeight: "bold" }}>{totalSites}</div>
                        <div>Total Sites</div>
                    </div>
                    <div style={cardStyle("#dc3545")}>
                        <div style={{ fontSize: 24, fontWeight: "bold" }}>{sitesNeedReview}</div>
                        <div>Need Review</div>
                    </div>
                    <div style={cardStyle("#2e7d32")}>
                        <div style={{ fontSize: 24, fontWeight: "bold" }}>{sitesOk}</div>
                        <div>OK</div>
                    </div>
                </div>

                : <></>}

            {/* Sites list */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {Object.keys(summary).map((site) => {
                    const hasRisk = Object.values(summary[site]).some(
                        (lib) => lib.directCount > 0
                    );

                    return (
                        <div
                            key={site}
                            style={{
                                padding: 12,
                                border: "1px solid #ccc",
                                borderRadius: 6,
                                background: hasRisk ? "#fff3cd" : "#e6f4ea",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                cursor: "pointer",
                                transition: "all 0.2s",
                            }}
                            onMouseEnter={(e) =>
                                (e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)")
                            }
                            onMouseLeave={(e) =>
                                (e.currentTarget.style.boxShadow = "none")
                            }
                            onClick={() => {
                                // Open modal for first library by default
                                const firstLibrary = Object.keys(summary[site])[0];
                                if (firstLibrary) onOpenLibrary(site, firstLibrary);
                            }}
                        >
                            <div>
                                <div style={{ fontSize: 14, color: "#555" }}>{site}</div>
                                <div style={{ fontSize: 12, color: "#888" }}>
                                    {Object.keys(summary[site]).length} libraries
                                </div>
                            </div>

                            <div>
                                <span
                                    style={{
                                        padding: "4px 10px",
                                        borderRadius: 12,
                                        fontWeight: 500,
                                        background: hasRisk ? "#dc3545" : "#2e7d32",
                                        color: "white",
                                        fontSize: 12,
                                    }}
                                >
                                    {hasRisk ? "Needs Review" : "OK"}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}