import { PageHeader } from "../PageHeader";
import { SyncedAnalytics } from "./AnalyticsViews";
import s from "../dashboard.module.css";

export const metadata = { title: "Analytics" };

export default function AnalyticsPage() {
  return (
    <div className={s.page}>
      <PageHeader title="Analytics" />
      <div className={s.grid}>
        <SyncedAnalytics />
      </div>
    </div>
  );
}
