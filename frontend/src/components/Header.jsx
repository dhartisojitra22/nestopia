import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import 'owl.carousel/dist/assets/owl.carousel.css';
import 'owl.carousel/dist/assets/owl.theme.default.css';
import 'owl.carousel';


const Header = () => {
  const location = useLocation();

  useEffect(() => {
    if (typeof window !== 'undefined' && window.$) {
      $(".header-carousel").owlCarousel({
        items: 1,
        loop: true,
        autoplay: true,
        autoplayTimeout: 5000,
        autoplayHoverPause: true,
        nav: true,
        dots: false,
        navText: [
          '<i class="fas fa-chevron-left"></i>',
          '<i class="fas fa-chevron-right"></i>',
        ],
      });
    }
  }, []);

  return (
    <div className="container-fluid header bg-white p-0">
      <div className="row g-0 align-items-center flex-column-reverse flex-md-row">
        <div className="col-md-6 p-5 mt-lg-5">
          {location.pathname === '/' ? (
            <>
              <h1 className="display-5 wow animate__animated animate__fadeIn mb-4">
                Find A <span className="text-primary">Perfect Home</span> To Live With Your Family
              </h1>
              <p className="wow animate__animated animate__fadeIn mb-4 pb-2">
                Discover your dream home with our extensive selection of properties. From modern apartments to luxurious villas, we offer the perfect living spaces for every lifestyle. Our expert team is dedicated to helping you find a home that matches your needs and exceeds your expectations.
              </p>
              <Link to="/get-started" className="btn btn-primary py-3 px-5 me-3 wow animate__animated animate__fadeIn">
                Get Started
              </Link>
            </>
          ) : location.pathname === '/about' ? (
            <>
              <h1 className="display-5 wow animate__animated animate__fadeIn mb-4">
                About Us
              </h1>
              <p className="wow animate__animated animate__fadeIn mb-4 pb-2">
                We are a trusted real estate agency with years of experience in helping clients find their perfect homes. Our team of dedicated professionals is committed to providing exceptional service and expert guidance throughout your property journey.
              </p>
            </>
          ) : location.pathname === '/contact' ? (
            <>
              <h1 className="display-5 wow animate__animated animate__fadeIn mb-4">
                Contact Us
              </h1>
              <p className="wow animate__animated animate__fadeIn mb-4 pb-2">
                Get in touch with our team of real estate experts. Whether you're looking to buy, sell, or rent a property, we're here to assist you with personalized solutions and professional advice.
              </p>
            </>
          ) : null}
        </div>
        <div className="col-md-6 wow animate__animated animate__fadeIn">
          <div className="owl-carousel header-carousel">
            <div className="owl-carousel-item">
              <img className="img-fluid" src="/assets/img/carousel-1.jpg" alt="" />
            </div>
            <div className="owl-carousel-item">
              <img className="img-fluid" src="/assets/img/carousel-2.jpg" alt="" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
