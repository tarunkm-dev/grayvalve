import Image from "next/image";

type Props = {
  src: string;
  alt: string;
  priority?: boolean;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
};

/** A real Grayvalve capture (1280×2856) inside a device frame. Children render over the screen. */
export function Phone({ src, alt, priority, className, style, children }: Props) {
  return (
    <div className={`phone ${className ?? ""}`} style={style}>
      <div className="phone-screen">
        <Image src={src} alt={alt} width={640} height={1428} priority={priority} sizes="(max-width: 640px) 70vw, 320px" />
        {children}
      </div>
    </div>
  );
}
