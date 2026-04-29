import { Link } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import "../home.css";

export function LandingPage() {
  const restaurants = [
    {
      id: 1,
      name: "Lomin with Sauce",
      desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.",
      image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=400&q=80",
      rating: "4.8"
    },
    {
      id: 2,
      name: "Fish and Veggie",
      desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.",
      image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=400&q=80",
      rating: "4.7"
    },
    {
      id: 3,
      name: "Tofu Chili",
      desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.",
      image: "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=400&q=80",
      rating: "4.9"
    },
    {
      id: 4,
      name: "Egg and Cucumber",
      desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.",
      image: "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=400&q=80",
      rating: "4.2"
    }
  ];

  return (
    <div className="home-page">
      <Navbar showSearch={true} />

      {/* Hero Section */}
      <section className="home-hero">
        <div className="home-hero-content">
          <h1>We provide the<br/>best restaurants<br/>for you</h1>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </p>
          <div className="home-social-links">
            <a href="#" className="home-social-circle">f</a>
            <a href="#" className="home-social-circle">in</a>
            <a href="#" className="home-social-circle">t</a>
            <div className="home-social-line"></div>
          </div>
        </div>
        <div className="home-hero-image-wrapper">
          <img src="https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=800&q=80" alt="Restaurant Interior" className="home-hero-main-img" />
          <img src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80" alt="Food Plate" className="home-hero-overlay-img" />
        </div>
      </section>

      {/* Most Rated Section */}
      <section className="home-most-rated">
        <h2>Most Rated Restaurants</h2>
        <div className="home-cards-grid">
          {restaurants.map(restaurant => (
            <div className="home-card" key={restaurant.id}>
              <div className="home-card-img-wrapper">
                <img src={restaurant.image} alt={restaurant.name} className="home-card-img" />
                <div className="home-card-rating">{restaurant.rating}</div>
              </div>
              <h3>{restaurant.name}</h3>
              <p>{restaurant.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
