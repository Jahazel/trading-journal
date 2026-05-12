interface LoadingSpinnerProps {
  message?: string;
}

const LoadingSpinner = ({ message }: LoadingSpinnerProps) => (
  <div className="flex-1 flex flex-col items-center justify-center gap-4 min-h-[400px]">
    <div className="w-10 h-10 border-3 border-border border-t-accent rounded-full animate-spin" />
    {message && <p className="text-sm text-ink-secondary">{message}</p>}
  </div>
);

export default LoadingSpinner;
