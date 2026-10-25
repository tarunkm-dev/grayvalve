import { PageHeader } from "../../dashboard/PageHeader";
import { DemoMind } from "../DemoViews";
import s from "../../dashboard/dashboard.module.css";

export const metadata = { title: "Mind" };

export default function DemoMindPage() {
  return (
    <div className={s.page}>
      <PageHeader title="Mind" mode="demo" />
      <div className={s.grid}>
        <DemoMind />
      </div>
    </div>
  );
}
