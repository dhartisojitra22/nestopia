import React from "react";

const PropertyAgent = () => {
  const agents = [
    {
      id: 1,
      name: "John Doe",
      img: "/assets/img/team-1.jpg",
      phone: "+1 234 567 890",
      email: "john.doe@example.com",
      experience: "10 years of experience",
    },
    {
      id: 2,
      name: "Emma Williams",
      img: "/assets/img/team-2.jpg",
      phone: "+1 987 654 321",
      email: "emma.williams@example.com",
      experience: "5 years of experience",
    },
    {
      id: 3,
      name: "Michael Smith",
      img: "/assets/img/team-3.jpg",
      phone: "+1 555 678 999",
      email: "michael.smith@example.com",
      experience: "7 years of experience",
    },
    {
      id: 4,
      name: "Sophia Johnson",
      img: "/assets/img/team-4.jpg",
      phone: "+1 321 654 098",
      email: "sophia.johnson@example.com",
      experience: "8 years of experience",
    },
  ];

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">Meet Our Property Agents</h2>
      <div className="row g-4">
        {agents.map((agent) => (
          <div className="col-lg-3 col-md-6" key={agent.id}>
            <div className="card shadow-sm text-center">
              <img
                src={agent.img}
                alt={agent.name}
                className="card-img-top"
                style={{ height: "250px", objectFit: "cover" }}
                onError={(e) => {
                  e.target.src = "/assets/img/team-1.jpg"; // Fallback image
                }}
              />
              <div className="card-body">
                <h5 className="card-title">{agent.name}</h5>
                <p className="card-text">{agent.experience}</p>
                <p><strong>Phone:</strong> {agent.phone}</p>
                <p><strong>Email:</strong> {agent.email}</p>
                <a href='/contact' className="btn btn-primary">
                  Contact Agent
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PropertyAgent;
