import { useState } from 'react';

// Click-to-load facade: shows the YouTube thumbnail until clicked, then swaps
// in the privacy-enhanced iframe. Always offers "Open on YouTube" (handled by
// the app-level external-link delegate → system browser) as the fallback for
// production builds where embeds hit YouTube's referer check (Tauri #14422).
export function VideoEmbed({ youtubeId, title }: { youtubeId: string; title?: string }) {
  const [playing, setPlaying] = useState(false);
  return (
    <div className="video-embed">
      {playing ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1`}
          title={title ?? 'YouTube video'}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      ) : (
        <button className="video-facade" onClick={() => setPlaying(true)}>
          <img src={`https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`} alt="" loading="lazy" />
          <span className="video-play">▶</span>
        </button>
      )}
      <a className="video-external" href={`https://www.youtube.com/watch?v=${youtubeId}`}>
        Open on YouTube ↗
      </a>
    </div>
  );
}
