import React from 'react';

const Team = () => {
    const teamMembers = [
        {
            _id: 1,
            name: "John Smith",
            designation: "Senior Property Agent",
            img: "/assets/img/team-1.jpg",
            facebookUsername: "john.smith",
            experience: "10+ years in real estate"
        },
        {
            _id: 2,
            name: "Emma Johnson",
            designation: "Luxury Property Specialist",
            img: "/assets/img/team-2.jpg",
            facebookUsername: "emma.johnson",
            experience: "8+ years in luxury properties"
        },
        {
            _id: 3,
            name: "Michael Brown",
            designation: "Commercial Property Expert",
            img: "/assets/img/team-3.jpg",
            facebookUsername: "michael.brown",
            experience: "12+ years in commercial real estate"
        },
        {
            _id: 4,
            name: "Sarah Wilson",
            designation: "Residential Property Advisor",
            img: "/assets/img/team-4.jpg",
            facebookUsername: "sarah.wilson",
            experience: "7+ years in residential properties"
        }
    ];

    return (
        <div className="container-xxl py-5">
            <div className="container">
                <div className="text-center mx-auto mb-5 wow fadeInUp" data-wow-delay="0.1s" style={{ maxWidth: '600px' }}>
                    <h1 className="mb-3">Meet Our Expert Property Agents</h1>
                    <p>
                        Our dedicated team of experienced real estate agents is here to help you find the perfect property 
                        or sell your home with confidence. With deep market knowledge and a commitment to customer satisfaction, 
                        we are your trusted partners in every real estate transaction.
                    </p>
                </div>
                <div className="row g-4">
                    {teamMembers.map((member, index) => (
                        <div key={member._id} className="col-lg-3 col-md-6 wow fadeInUp" data-wow-delay={`${0.1 * (index + 1)}s`}>
                            <div className="team-item rounded overflow-hidden">
                                <div className="position-relative">
                                    <img 
                                        className="img-fluid" 
                                        src={member.img}
                                        alt={member.name}
                                        style={{ height: '300px', width: '100%', objectFit: 'cover' }}
                                        onError={(e) => {
                                            e.target.src = '/assets/img/team-1.jpg';
                                        }}
                                    />
                                    <div className="position-absolute start-50 top-100 translate-middle d-flex align-items-center">
                                        {member.facebookUsername && (
                                            <a
                                                className="btn btn-square mx-1"
                                                href={`https://facebook.com/${member.facebookUsername}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                <i className="fab fa-facebook-f"></i>
                                            </a>
                                        )}
                                        <a className="btn btn-square mx-1" href="#"><i className="fab fa-twitter"></i></a>
                                        <a className="btn btn-square mx-1" href="#"><i className="fab fa-instagram"></i></a>
                                    </div>
                                </div>
                                <div className="text-center p-4 mt-3">
                                    <h5 className="fw-bold mb-0">{member.name}</h5>
                                    <small>{member.designation}</small>
                                    <p className="text-muted mt-2 small">{member.experience}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Team;
