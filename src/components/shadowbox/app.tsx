  const [view, setView] = useState<View>("case");
  const [selection, setSelection] = useState<Selection | null>(null);
  const [tour] = useState<TourFocus | null>(null);
  const open = (kind: Kind, id: string) => setSelection({ kind, id });