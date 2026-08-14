type LoadingSkeletonProps = {
  rows?: number;
  label?: string;
};

export default function LoadingSkeleton({ rows = 3, label = "Загрузка содержимого" }: LoadingSkeletonProps) {
  return (
    <div className="loading-skeleton" role="status" aria-live="polite" aria-label={label}>
      <span className="sr-only">{label}</span>
      {Array.from({ length: rows }, (_, index) => (
        <div className="loading-skeleton__row" aria-hidden="true" key={index}>
          <i />
          <span><b /><b /></span>
        </div>
      ))}
    </div>
  );
}
