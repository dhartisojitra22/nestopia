import React from 'react';

const CallToAction = () => {
    return (
        <div className="container-xxl py-5">
            <div className="container">
                <div className="bg-light rounded p-3">
                    <div className="bg-white rounded p-4" style={{ border: '1px dashed rgba(0, 185, 142, .3)' }}>
                        <div className="row g-5 align-items-center">
                            <div className="col-lg-6 wow fadeIn" data-wow-delay="0.1s">
                                <img className="img-fluid rounded w-100" src="/assets/img/call-to-action.jpg" alt="" />
                            </div>
                            <div className="col-lg-6 wow fadeIn" data-wow-delay="0.5s">
                                <div className="mb-4">
                                <h1 class="mb-3">Talk to Our Real Estate Experts</h1>
                                <p>Get personalized assistance for buying, selling, or renting properties. Our certified agents are here to help you make the best decision.</p>
                                </div>
                                <a href="" class="btn btn-primary py-3 px-4 me-2"><i class="fa fa-phone-alt me-2"></i>Contact Us</a>
                                <a href="" class="btn btn-dark py-3 px-4"><i class="fa fa-calendar-alt me-2"></i>Schedule a Visit</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CallToAction;