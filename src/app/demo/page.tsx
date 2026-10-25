import { getViewer } from "@/lib/session";
import { PageHeader } from "../dashboard/PageHeader";
import { DemoOverview } from "./DemoViews";
import s from "../dashboard/dashboard.module.css";

export default async function DemoOverviewPage() {
  const viewer = await getViewer("/demo");
  return (
    <div className={s.page}>
      <PageHeader name={viewer.name} mode="demo" />
      <div className={s.grid}>
        <DemoOverview />
      </div>
    </div>
  );
}
