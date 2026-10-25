import { getViewer } from "@/lib/session";
import { PageHeader } from "./PageHeader";
import { SyncedOverview } from "./synced/SyncedViews";
import s from "./dashboard.module.css";

export default async function Overview() {
  const viewer = await getViewer();
  // The person's own summaries, live from their paired phone and decrypted in this tab only.
  return (
    <div className={s.page}>
      <PageHeader name={viewer.name} />
      <div className={s.grid}>
        <SyncedOverview />
      </div>
    </div>
  );
}
