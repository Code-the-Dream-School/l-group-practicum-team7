import Video from "../assets/video.mp4";
import "./Home.css";

const Home = ({ onStartHere }) => {
  return (
    <div className="home-container">
      <div className="video-container">
        <video
          src={Video}
          autoPlay
          loop
          muted
          playsInline
          className="background-video"
        />
      </div>

      <div className="overlay"></div>

      <div className="hero">
        <h1 className="hero-title">PulseMind</h1>

        <p className="hero-subtitle">
          Monitor stress, sleep, and daily wellness with personalized insights.
        </p>

        <button className="start-here" onClick={onStartHere}>
          Start Here
        </button>
      </div>
    </div>
  );
};

export default Home;
