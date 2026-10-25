import { PageHeader } from "../PageHeader";
import { SyncedBody } from "../synced/SyncedViews";
import s from "../dashboard.module.css";

export const metadata = { title: "Body" };

export default function BodyPage() {
  return (
    <div className={s.page}>
      <PageHeader title="Body" />
      <div className={s.grid}>
        <SyncedBody />
      </div>
    </div>
  );
}
