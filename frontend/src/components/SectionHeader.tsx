const SectionHeader = ({ label }: { label: string }) => (
  <div className="flex items-center gap-3 mb-4">
    <span className="text-xs font-medium text-ink-muted tracking-[0.01em]">{label}</span>
    <div className="flex-1 h-px bg-border" />
  </div>
);

export default SectionHeader;
