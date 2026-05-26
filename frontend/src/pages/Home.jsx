import Video from "../assets/video.mp4";
import "./Home.css";

const Home = ({ user, onStartHere }) => {
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
        {user ? (
          <>
            <h1 className="hero-title">WELCOME</h1>
            <p className="hero-subtitle">
              Track your wellbeing and view your burnout insights.
            </p>
          </>
        ) : (
          <>
            <h1 className="hero-title">Burnout Tracker</h1>

            <p className="hero-subtitle">
              Monitor stress, sleep, and daily wellness with personalized
              insights.
            </p>

            <button className="start-here" onClick={onStartHere}>
              Start Here
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Home;
