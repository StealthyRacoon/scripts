import LibraryTable from "./LibraryTable";

export default function SiteSection({ site, libraries, onOpenLibrary }) {
  return (
    <div style={{ marginBottom: 50 }}>
      <h2 style={{ borderBottom: "2px solid #ccc", paddingBottom: 5 }}>
        {site}
      </h2>

      <LibraryTable
        libraries={libraries}
        onOpenLibrary={onOpenLibrary}
      />
    </div>
  );
}