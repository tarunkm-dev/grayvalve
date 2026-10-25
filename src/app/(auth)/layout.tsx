import Image from "next/image";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { DotMatrix } from "@/components/DotMatrix";
import { RangeBand, WaveLine } from "@/components/charts";
import { Aurora } from "@/components/motion/Aurora";
import { AuthStage } from "./AuthStage";
import s from "./auth.module.css";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={s.shell}>
      <Aurora stops={["#8d74f0", "#e2fc5b", "#4a7ef2"]} amplitude={0.9} className={s.aurora} />
      <main id="main" className={s.formSide}>
        <Link href="/" className={s.brand} aria-label="Grayvalve home">
          <Logo size={20} />
        </Link>
        <div className={s.formWrap}>
          <div className={s.formCard}>{children}</div>
        </div>
        <p className={s.legal}>Wellbeing guidance, not medical advice. Your health data stays on your phone unless you choose to pair it.</p>
      </main>
      <aside className={s.artSide} aria-hidden="true">
        <Image src="/art/lime-swirl.webp" alt="" fill priority sizes="50vw" style={{ objectFit: "cover" }} />
        <div className={s.artShade} />
        <AuthStage positions={[s.cardA, s.cardB, s.cardC]}>
          <div className={`aura aura-graphite ${s.artCard}`}>
            <span className={s.artLabel}>Readiness</span>
            <DotMatrix value="78" dot={10} reflect color="#fff" />
            <span className={s.artSub}>Estimated · 3 of 4 inputs</span>
          </div>
          <div className={`aura aura-jade ${s.artCard}`}>
            <span className={s.artLabel}>HRV</span>
            <span className={s.artNum}>
              62<small>ms</small>
            </span>
            <RangeBand value={62} low={48} high={66} min={30} max={80} label="" />
          </div>
          <div className={`aura aura-violet ${s.artCard}`}>
            <span className={s.artLabel}>Mood · 7 days</span>
            <WaveLine data={[3, 3, 4, 2, 4, 5, 4]} min={1} max={5} color="#fff" height={56} label="" />
          </div>
        </AuthStage>
        <p className={s.artQuote}>
          Your dashboard, everywhere you sign in.
          <span>End-to-end encrypted. Nothing about your health is stored on our servers.</span>
        </p>
      </aside>
    </div>
  );
}
