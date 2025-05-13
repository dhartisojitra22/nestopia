import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./components/Login";
import Register from "./components/Register";
import Navbar from "./components/Navbar";  // Import Navbar
import Footer from "./components/Footer";  // Import Footer
import PublicRouteGuard from "./components/PublicRouteGuard";
import './App.css'; 

import EditProfile from "./components/EditProfile";
import AddProperty from "./components/Addproperty";
import PropertyList from "./components/PropertyList";
import EditProperty from "./components/Editproperty";
import PropertyDetails from "./components/PropertyDetails";
import PropertyAgent from "./components/Propertyagent";
import PropertyType from "./components/Propertytype";
import Contact from "./components/Contact";
import About from "./components/About";
// import BookingPage from "./pages/Bookingpage";
import Testimonial from "./components/Testimonial";
import Team from "./components/Team";
import Wishlist from "./components/Wishlist";
import MyProperties from "./components/Myproperties";
// import AdminRoutes from './routes/AdminRoutes';
// import AdminDashboard from "./components/admin/AdminDashboard "; 
import AdminRoutes from "./routes/AdminRoutes";
import BookProperty from "./pages/BookProperty";
import ErrorPage from "./pages/ErrorPage";
import MyBookings from "./pages/MyBookings";
import BookingDetails from "./pages/BookingDetails";
import PropertyOrders from "./components/PropertyOrders";
import ContactOwner from "./components/ContactOwner";
import Chatbot from './components/Chatbot/Chatbot';


function Layout({ children }) {
    return (
        <>
            <Navbar />  {/* Navbar shown on all pages except login & signup */}
            <main>{children}</main>
            <Footer />  {/* Footer shown on all pages except login & signup */}
        </>
    );
}

function App() {
    return (
        <Router>
            <Routes>
                {/* Public Routes Without Navbar & Footer */}
                <Route element={<PublicRouteGuard />}>
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Register />} />
                </Route>

                {/* Routes with Navbar & Footer */}
                <Route path="/" element={<Layout><Home /></Layout>} />
                <Route path="/about" element={<Layout><About /></Layout>} />
                <Route path="/contact" element={<Layout><Contact /></Layout>} />
                <Route path="/addproperty" element={<Layout><AddProperty /></Layout>} />
                <Route path="/myproperties" element={<Layout><MyProperties /></Layout>} />

                <Route path="/property-list" element={<Layout><PropertyList /></Layout>} />
                <Route path="/wishlist" element={<Layout><Wishlist /></Layout>} />
                <Route path="/property-agents" element={<Layout><Team /></Layout>} />
                <Route path="/bookings/:id" element={<Layout><BookProperty /></Layout>} />
                <Route path="/my-bookings"  element={<Layout><MyBookings /></Layout>} />
                <Route path="/property-orders/:id" element={<Layout><PropertyOrders /></Layout>} />
                <Route path="/bookings/:id" element={<Layout><BookingDetails /></Layout>} />
                <Route path="/property/:id" element={<Layout><PropertyDetails /></Layout>} />
                <Route path="/editprop/:id" element={<Layout><EditProperty /></Layout>} />
                <Route path="/testimonial" element={<Layout><Testimonial /></Layout>} />
                <Route path="/property-agent" element={<Layout><PropertyAgent /></Layout>} />
                <Route path="/property-type" element={<Layout><PropertyType /></Layout>} />
                <Route path="/edit-profile" element={<Layout><EditProfile /></Layout>} />
                <Route path="/contact-owner/:id" element={<Layout><ContactOwner /></Layout>} />
                <Route path="/admin/*" element={<AdminRoutes />} />
                // In your App.js or routing file
<Route path="/booking-details/:id" element={<BookingDetails />} />
                <Route path="*" element={<ErrorPage/>} />
            </Routes>
            <Chatbot />
        </Router>
    );
}

export default App;
