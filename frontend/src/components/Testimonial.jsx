// import React from 'react';
// import OwlCarousel from 'react-owl-carousel';
// import 'owl.carousel/dist/assets/owl.carousel.css';
// import 'owl.carousel/dist/assets/owl.theme.default.css';

// const Testimonial = () => {
//     const testimonials = [
//         { id: 1, name: 'Alice Johnson', profession: 'Designer', img: '/assets/img/testimonial-1.jpg', feedback: 'Tempor stet labore dolor clita stet diam amet ipsum dolor duo ipsum rebum stet dolor amet diam stet. Est stet ea lorem amet est kasd kasd erat eos.' },
//         { id: 2, name: 'Michael Smith', profession: 'Developer', img: '/assets/img/testimonial-2.jpg', feedback: 'Dolor sit amet, consectetur adipiscing elit. Integer posuere erat a ante venenatis dapibus posuere velit aliquet.' },
//         { id: 3, name: 'Sophia Brown', profession: 'Marketing Manager', img: '/assets/img/testimonial-3.jpg', feedback: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam quis risus eget urna mollis ornare vel eu leo.' }
//     ];

//     return (
//         <div className="container-xxl py-5">
//             <div className="container">
//                 <div className="text-center mx-auto mb-5 wow fadeInUp" data-wow-delay="0.1s" style={{ maxWidth: '600px' }}>
//                 <h1 class="mb-3">What Our Clients Say</h1>
//             <p>We have helped thousands of people find their dream homes. Hear from our satisfied customers.</p>
//         </div>
//                 </div>
//                 <OwlCarousel className="owl-carousel testimonial-carousel wow fadeInUp" data-wow-delay="0.1s" loop margin={10} nav items={1}>
//                     {testimonials.map((testimonial) => (
//                         <div key={testimonial.id} className="testimonial-item bg-light rounded p-3">
//                             <div className="bg-white border rounded p-4">
//                                 <p>{testimonial.feedback}</p>
//                                 <div className="d-flex align-items-center">
//                                     <img className="img-fluid flex-shrink-0 rounded" src={testimonial.img} style={{ width: '45px', height: '45px' }} alt={testimonial.name} />
//                                     <div className="ps-3">
//                                         <h6 className="fw-bold mb-1">{testimonial.name}</h6>
//                                         <small>{testimonial.profession}</small>
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>
//                     ))}
//                 </OwlCarousel>
//             </div>
//     );
// };

// export default Testimonial;


import React from 'react';
import OwlCarousel from 'react-owl-carousel';
import 'owl.carousel/dist/assets/owl.carousel.css';
import 'owl.carousel/dist/assets/owl.theme.default.css';

const Testimonial = () => {
    const testimonials = [
        { 
            id: 1, 
            name: 'Alice Johnson', 
            profession: 'Designer', 
            img: '/assets/img/testimonial-1.jpg', 
            feedback: 'I had an amazing experience finding my dream home with this company. The process was seamless, and the team was incredibly supportive throughout!' 
        },
        { 
            id: 2, 
            name: 'Michael Smith', 
            profession: 'Developer', 
            img: '/assets/img/testimonial-2.jpg', 
            feedback: 'Professional, reliable, and efficient. They helped me secure a great property at the best price. Highly recommended!' 
        },
        { 
            id: 3, 
            name: 'Sophia Brown', 
            profession: 'Marketing Manager', 
            img: '/assets/img/testimonial-3.jpg', 
            feedback: 'From start to finish, the experience was fantastic. The team understood my requirements and provided exceptional service!' 
        }
    ];

    return (
        <div className="container-xxl py-5">
            <div className="container">
                <div className="text-center mx-auto mb-5 wow fadeInUp" data-wow-delay="0.1s" style={{ maxWidth: '600px' }}>
                    <h1 className="mb-3">What Our Clients Say</h1>
                    <p>We have helped thousands of people find their dream homes. Hear from our satisfied customers.</p>
                </div>
            </div>
            <OwlCarousel className="owl-carousel testimonial-carousel wow fadeInUp" data-wow-delay="0.1s" loop margin={10} nav items={1}>
                {testimonials.map((testimonial) => (
                    <div key={testimonial.id} className="testimonial-item bg-light rounded p-3">
                        <div className="bg-white border rounded p-4">
                            <p>{testimonial.feedback}</p>
                            <div className="d-flex align-items-center">
                                <img className="img-fluid flex-shrink-0 rounded" src={testimonial.img} style={{ width: '45px', height: '45px' }} alt={testimonial.name} />
                                <div className="ps-3">
                                    <h6 className="fw-bold mb-1">{testimonial.name}</h6>
                                    <small>{testimonial.profession}</small>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </OwlCarousel>
        </div>
    );
};

export default Testimonial;
