import React from 'react'
import './OnDemand.css'
import LiteYouTubeEmbed from 'react-lite-youtube-embed';
import 'react-lite-youtube-embed/dist/LiteYouTubeEmbed.css';

const videoData = [
    {
      id: 'pP_beo3Xs1E',
      title: 'Linear Algebra',
      playlistUrl: 'https://www.youtube.com/playlist?list=PLVRSnqjPL5owKde4xDYiozYV4jjZVV-zA'
    },
    {
      id: 'BDY65VoRzKo', 
      title: 'Discrete Math',
      playlistUrl: 'https://www.youtube.com/playlist?list=PLVRSnqjPL5oxt_pWZDefgXHXz-vqlgVy2'
    },
    {
      id: 'L5fJJhQh8o4',
      title: 'Other',
      playlistUrl: 'https://www.youtube.com/playlist?list=PLVRSnqjPL5ow1TSu03aPpWIqhnSXFlBB0'
    }
  ];
  
  const OnDemand = () => {
    return (
      <div className="onDemand">
        {videoData.map((video, index) => (
          <div className="videoWrapper" key={index}>
            <LiteYouTubeEmbed id={video.id} title={video.title} />
            <div
              className="videoOverlay"
              onClick={() => window.open(video.playlistUrl, '_blank')}
            >
              <span className="overlayText">{video.title}</span>
            </div>
          </div>
        ))}
      </div>
    );
  };

export default OnDemand
