import React from 'react';
import Header from '../components/Header';
import Search from '../components/Search';
import Category from '../components/Category';
import About from '../components/About';
import PropertyList from '../components/PropertyList';
import CallToAction from '../components/CallToAction';
import Team from '../components/Team';
// import Navbar from '../components/Navbar';
// import Footer from '../components/Footer';
import Testimonial from '../components/Testimonial';

const Home = () => {
  return (
    <div>
        {/* <Navbar/> */}
      <Header />
      {/* <Search /> */}
      <Category />
      <About />
      <PropertyList />
      <CallToAction />
      <Team />
      <Testimonial/>
      {/* <Footer/> */}
    </div>
  );
};

export default Home;