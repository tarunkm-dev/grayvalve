import { getViewer } from "@/lib/session";
import { PageHeader } from "../PageHeader";
import { ProfileForm } from "./ProfileForm";
import s from "../dashboard.module.css";

export const metadata = { title: "Account" };

export default async function AccountPage() {
  const viewer = await getViewer();
  return (
    <div className={s.page}>
      <PageHeader title="Account" mode="plain" />
      <div className={s.grid}>
        <section className={`${s.card} ${s.w6}`}>
          <span className={s.label}>Profile</span>
          <ProfileForm name={viewer.name} email={viewer.email} preview={viewer.preview} />
        </section>

        <section className={`${s.card} ${s.w6}`}>
          <span className={s.label}>Your data</span>
          <ul className={s.steps} style={{ counterReset: "none" }}>
            <li style={{ counterIncrement: "none" }}>
              <span>
                <strong>Stored with your account:</strong> your email, display name, paired devices and short-lived pairing codes.
              </span>
            </li>
            <li style={{ counterIncrement: "none" }}>
              <span>
                <strong>Not stored:</strong> health records, journal entries, check-in notes or anything from the app, until you pair a phone and turn on sync.
              </span>
            </li>
          </ul>
          <p className={s.note} style={{ margin: 0 }}>
            Self-serve account deletion arrives here with data sync; until then, ask the Grayvalve team and we&apos;ll remove your account and
            everything linked to it. Data inside the app is erased from Profile › Erase everything.
          </p>
          {!viewer.preview && (
            <form action="/auth/signout" method="post">
              <button type="submit" className="btn btn-glass btn-sm">
                Sign out
              </button>
            </form>
          )}
        </section>
      </div>
    </div>
  );
}
