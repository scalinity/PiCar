import { entryOf, type LoadedPack, type StepEntry } from '../assets/pack';
const name = (pack: LoadedPack, id: string): string => entryOf(pack.manifest, id)?.name ?? id;

// Contact identity comes from the packed component metadata, independently of overlap size.
export function displayNotes(pack: LoadedPack, entry: StepEntry): string[] {
  const notes: string[] = [];
  for (const check of entry.displayChecks) {
    const model = pack.manifest.definitions[check.definitionId].name.split(';')[0];
    if (check.status === 'NOT_CHECKED') {
      notes.push(`Detailed view: the detailed ${model} was not checked against this state, so any overlap it has here is unmeasured.`);
      continue;
    }
    for (const c of check.overlaps.filter((o) => o.volumeMm3 > 10)) {
      notes.push(`Detailed view: the ${name(pack, c.instanceId)} overlaps the detailed ${model} by ${Math.round(c.volumeMm3)} mm³. Its step pose was checked against a simpler shape, so this is recorded for the assembly work rather than hidden.`);
    }
    const small = check.overlaps.filter((o) => o.volumeMm3 <= 10);
    for (const category of ['standoff', 'screw', 'other']) {
      const contacts = small.filter((c) => {
        const kind = entryOf(pack.manifest, c.instanceId)?.componentClass;
        return (kind === 'standoff' || kind === 'screw' ? kind : 'other') === category;
      });
      if (!contacts.length) continue;
      const amount = Math.max(...contacts.map((c) => c.volumeMm3)).toFixed(1);
      if (category === 'standoff') notes.push(`Standoff studs touch the mounting-hole walls (up to ${amount} mm³), the hole-clearance case the assembly checks already record.`);
      else notes.push(`${category === 'screw' ? 'Screw contacts' : 'Component contacts'} with the detailed ${model} (up to ${amount} mm³) are recorded display overlaps; they do not establish physical fit.`);
    }
  }
  return notes;
}
