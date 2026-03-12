import { FaCheck, FaTrash } from "react-icons/fa";

export default function PermissionRow({
    row,
    rowKey,
    selectedRows,
    setSelectedRows,
    decisions,
    setDecisions
}) {

    const selected = selectedRows[rowKey];

    return (
        <tr
            onClick={() =>
                setSelectedRows(p => ({ ...p, [rowKey]: !selected }))
            }
        >
            <td>
                <input type="checkbox" checked={!!selected} readOnly />
            </td>

            <td>{row.principal}</td>

            <td>

                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        setDecisions(p => ({ ...p, [rowKey]: "Approve" }));
                    }}
                >
                    <FaCheck />
                </button>

                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        setDecisions(p => ({ ...p, [rowKey]: "Remove" }));
                    }}
                >
                    <FaTrash />
                </button>

            </td>

        </tr>
    );
}