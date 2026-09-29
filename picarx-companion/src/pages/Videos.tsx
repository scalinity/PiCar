import { pages, videoBySlug, videos } from '../content';
import { refHref } from '../lib/router';
import { VideoEmbed } from '../components/VideoEmbed';

export function Videos({ slug }: { slug?: string }) {
  const video = slug ? videoBySlug(slug) : undefined;

  if (video) {
    const lesson = video.lessonPage ? pages.get(video.lessonPage) : undefined;
    return (
      <main className="page doc">
        <div className="doc-body">
          <p className="wizard-crumb">
            <a href="#/videos">← All videos</a>
          </p>
          <h1>{video.title}</h1>
          <VideoEmbed youtubeId={video.youtubeId} title={video.title} />
          {lesson && (
            <p className="video-lesson-link">
              Follow along in text: <a href={refHref(lesson.id)}>{lesson.title}</a>
            </p>
          )}
        </div>
      </main>
    );
  }

  const ordered = [...videos].sort((a, b) => a.order - b.order);
  return (
    <main className="page doc">
      <div className="doc-body wide">
        <h1>Video Course</h1>
        <p className="home-sub">
          SunFounder's official video walkthroughs, each linked to its matching text lesson.
        </p>
        <div className="video-grid">
          {ordered.map((v) => (
            <a key={v.slug} className="video-card card" href={`#/videos/${v.slug}`}>
              <img src={`https://i.ytimg.com/vi/${v.youtubeId}/mqdefault.jpg`} alt="" loading="lazy" />
              <span className="video-card-title">{v.title}</span>
            </a>
          ))}
        </div>
      </div>
    </main>
  );
}
