export function DetailPanel({
  selection,
  trail = [],
  onSelect,
  onClose,
}: {
  selection: Selection | null;
  trail?: Selection[];
  onSelect: (sel: Selection) => void;
  onClose: () => void;
}) {
  const subject = selection ? toSubject(selection) : null;
  const crumbs = trail.length ? trail : selection ? [selection] : [];
