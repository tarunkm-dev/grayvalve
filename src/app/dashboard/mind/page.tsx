import { PageHeader } from "../PageHeader";
import { SyncedMind } from "../synced/SyncedViews";
import s from "../dashboard.module.css";

export const metadata = { title: "Mind" };

export default function MindPage() {
  return (
    <div className={s.page}>
      <PageHeader title="Mind" />
      <div className={s.grid}>
        <SyncedMind />
      </div>
    </div>
  );
}
