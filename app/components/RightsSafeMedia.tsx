type RightsStatus = "approved" | "pending";

type RightsSafeMediaProps = {
  src?: string;
  alt: string;
  width: number;
  height: number;
  rights: RightsStatus;
  aiGenerated?: boolean;
  className?: string;
};

export default function RightsSafeMedia({ src, alt, width, height, rights, aiGenerated = false, className = "" }: RightsSafeMediaProps) {
  if (rights !== "approved" || !src) {
    return (
      <div className={`rights-media rights-media--placeholder ${className}`.trim()} role="img" aria-label={`${alt}. Медиа ожидает подтверждения прав.`}>
        <span>MEDIA / RIGHTS PENDING</span>
        <strong>Материал появится после подтверждения прав</strong>
      </div>
    );
  }

  return (
    <figure className={`rights-media ${className}`.trim()}>
      <img src={src} alt={alt} width={width} height={height} loading="lazy" decoding="async" />
      {aiGenerated && <figcaption>Создано с помощью ИИ</figcaption>}
    </figure>
  );
}
