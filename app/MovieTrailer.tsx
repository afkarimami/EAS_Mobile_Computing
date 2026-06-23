import React from 'react';
import YoutubePlayer from 'react-native-youtube-iframe';

export default function MovieTrailer({ videoId }: { videoId: string }) {
  return (
    <YoutubePlayer
      height={220}
      videoId={videoId}
      play={false}
    />
  );
}