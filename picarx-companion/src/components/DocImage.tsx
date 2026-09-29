import { useState } from 'react';

export function DocImage({ src, width, align }: { src: string; width?: string; align?: string }) {
  const [zoomed, setZoomed] = useState(false);
  const w = width && /^\d+$/.test(width) ? `${width}px` : width;
  return (
    <>
      <figure className={`doc-image ${align === 'center' ? 'center' : ''}`}>
        <img src={src} style={w ? { width: w } : undefined} onClick={() => setZoomed(true)} loading="lazy" />
      </figure>
      {zoomed && (
        <div className="lightbox" onClick={() => setZoomed(false)}>
          <img src={src} />
        </div>
      )}
    </>
  );
}
