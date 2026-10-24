import Image from "next/image";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { DotMatrix } from "@/components/DotMatrix";
import s from "./auth.module.css";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={s.shell}>
      <main id="main" className={s.formSide}>
        <Link href="/" className={s.brand} aria-label="Grayvalve home">
          <Logo size={20} />
        </Link>
        <div className={s.formWrap}>{children}</div>
        <p className={s.legal}>Wellbeing guidance, not medical advice. Your health data stays on your phone unless you choose to pair it.</p>
      </main>
      <aside className={s.artSide} aria-hidden="true">
        <Image src="/art/lime-swirl.webp" alt="" fill priority sizes="50vw" style={{ objectFit: "cover" }} />
        <div className={s.artShade} />
        <div className={`aura aura-graphite ${s.artCard}`}>
          <span className={s.artLabel}>Readiness</span>
          <DotMatrix value="78" dot={11} reflect color="#fff" />
          <span className={s.artSub}>Your dashboard, everywhere you sign in.</span>
        </div>
      </aside>
    </div>
  );
}
