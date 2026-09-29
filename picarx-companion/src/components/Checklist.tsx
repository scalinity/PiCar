import { toggleCheck, useProgress } from '../lib/progress-store';

export function Checklist({ stepId, items }: { stepId: string; items: { id: string; label: string }[] }) {
  const { checks } = useProgress();
  return (
    <ul className="checklist">
      {items.map((item) => {
        const key = `${stepId}.${item.id}`;
        return (
          <li key={item.id}>
            <label>
              <input type="checkbox" checked={!!checks[key]} onChange={() => toggleCheck(key)} />
              <span>{item.label}</span>
            </label>
          </li>
        );
      })}
    </ul>
  );
}
