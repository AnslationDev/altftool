import approachImg from '../assets/approach.png';
import './Approach.css';

export default function Approach() {
  return (
    <section className="approach">
      <div className="container">
        <div className="approach-content reveal">
          <div className="section-title">
            <span className="section-sub-title">Our Approach</span>
            <h2>Creating safe, hygienic, and pest-free spaces for your home and business</h2>
          </div>
          <p>We follow a step-by-step pest control process starting with inspection, identifying the problem, and applying the most effective treatment. Our approach focuses on safety, long-term prevention, and ensuring complete customer satisfaction every time.</p>

          <div className="approach-items">
            <div className="approach-item">
              <div className="approach-item-icon"><i className="fa-solid fa-bullseye"></i></div>
              <div>
                <h3>Our Mission</h3>
                <p>Our mission is to provide safe, effective, and affordable pest control services for every home.</p>
              </div>
            </div>
            <div className="approach-item">
              <div className="approach-item-icon"><i className="fa-solid fa-eye"></i></div>
              <div>
                <h3>Our Vision</h3>
                <p>Our vision is to become a trusted name in pest control by delivering consistent quality service.</p>
              </div>
            </div>
            <div className="approach-item">
              <div className="approach-item-icon"><i className="fa-solid fa-heart"></i></div>
              <div>
                <h3>Our Values</h3>
                <p>We believe in honesty, safety, customer satisfaction, and providing reliable pest control solutions every time.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="approach-image reveal">
          <img src={approachImg?.src || approachImg} alt="Our Approach" />
        </div>
      </div>
    </section>
  );
}
