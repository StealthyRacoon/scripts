You’re building a **SharePoint permissions auditing and governance system** that:

* **Ingests raw permissions data** from SharePoint/Microsoft Graph and stores it in a database as normalized records.
* Maintains a **clean snapshot of effective permissions** (users, groups, sites, and their relationships) separate from the noisy source data.
* Provides a **React-based UI** where departments can:

  * View current permissions from the snapshot
  * Propose changes (add/remove users, adjust access)
* Treats each change as a **tracked request** with a lifecycle (pending → processed → success/failed).
* Uses a **Node.js backend** to:

  * Execute permission changes via Microsoft Graph
  * Log results and errors
  * Handle retries and failures
* Runs **periodic audits** where users validate permissions, and the system:

  * Compares desired state (DB) vs actual state (Graph)
  * Detects discrepancies
  * Logs and highlights issues
* Includes an **admin layer** to review failures, reconcile discrepancies, and fix nested or inconsistent permissions.
* Supports **historical analysis** by storing audit logs, enabling queries like “who had access at a given time.”

Overall, it’s a **permission governance + audit + enforcement platform** that combines:

* Snapshot-based current state
* Append-only audit history
* Async change execution
* Reconciliation and discrepancy detection
