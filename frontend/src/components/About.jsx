import React from 'react';

const About = () => {
  return (
    <div className="container-xxl py-5">
      <div className="container">
        <div className="row g-5 align-items-center">
          <div className="col-lg-6 wow animate__animated animate__fadeIn" data-wow-delay="0.1s">
            <div className="about-img position-relative overflow-hidden p-5 pe-0">
              <img className="img-fluid w-100" src="/assets/img/about.jpg" alt="" />
            </div>
          </div>
          <div className="col-lg-6 wow animate__animated animate__fadeIn" data-wow-delay="0.5s">
          <h1 class="mb-4">Find the Perfect Property for Your Needs</h1>
                <p class="mb-4">We provide top-notch real estate services, helping you find, buy, or rent properties in prime locations. Whether you're looking for a family home, investment property, or commercial space, we've got you covered.</p>
                <p><i class="fa fa-check text-primary me-3"></i>Premium Locations</p>
                <p><i class="fa fa-check text-primary me-3"></i>Verified Listings</p>
                <p><i class="fa fa-check text-primary me-3"></i>Expert Real Estate Agents</p>
                <a class="btn btn-primary py-3 px-5 mt-3" href="">Learn More</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;