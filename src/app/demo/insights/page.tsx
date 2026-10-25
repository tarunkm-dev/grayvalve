import { PageHeader } from "../../dashboard/PageHeader";
import { DemoAnalytics } from "../DemoViews";
import s from "../../dashboard/dashboard.module.css";

export const metadata = { title: "Analytics" };

export default function DemoAnalyticsPage() {
  return (
    <div className={s.page}>
      <PageHeader title="Analytics" mode="demo" />
      <div className={s.grid}>
        <DemoAnalytics />
      </div>
    </div>
  );
}
