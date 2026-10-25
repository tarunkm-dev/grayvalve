import { PageHeader } from "../../dashboard/PageHeader";
import { DemoBody } from "../DemoViews";
import s from "../../dashboard/dashboard.module.css";

export const metadata = { title: "Body" };

export default function DemoBodyPage() {
  return (
    <div className={s.page}>
      <PageHeader title="Body" mode="demo" />
      <div className={s.grid}>
        <DemoBody />
      </div>
    </div>
  );
}
