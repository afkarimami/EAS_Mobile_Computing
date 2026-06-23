import React from 'react';

export default function MovieTrailer({ videoId }: { videoId: string }) {
  return (
    <iframe
      width="100%"
      height="250"
      src={`https://www.youtube.com/embed/${videoId}`}
      frameBorder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
      style={{ borderRadius: 12, border: 'none' }}
    />
  );
}