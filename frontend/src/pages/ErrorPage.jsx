import React from "react";
import { useNavigate } from "react-router-dom";
import { Button, Container, Row, Col } from "react-bootstrap";
// import errorImage from ""; // Replace with your image path

const ErrorPage = () => {
  const navigate = useNavigate();

  return (
    <Container fluid className="d-flex align-items-center justify-content-center vh-100 bg-light">
      <Row className="align-items-center">
        <Col md={6} className="text-center text-md-start mb-5 mb-md-0">
          <h1 className="display-1 fw-bold text-primary">404</h1>
          <h2 className="display-5 fw-bold mb-3">Page Not Found</h2>
          <p className="lead text-muted mb-4">
            Oops! The page you're looking for doesn't exist or has been moved. 
            Don't worry, let's get you back on track.
          </p>
          <div className="d-flex flex-wrap gap-3 justify-content-center justify-content-md-start">
            <Button 
              variant="primary" 
              size="lg"
              onClick={() => navigate(-1)}
              className="px-4 py-2"
            >
              <i className="bi bi-arrow-left me-2"></i>Go Back
            </Button>
            <Button 
              variant="outline-primary" 
              size="lg"
              onClick={() => navigate("/")}
              className="px-4 py-2"
            >
              <i className="bi bi-house-door me-2"></i>Return Home
            </Button>
          </div>
        </Col>
        <Col md={6} className="text-center">
          <img 
            src={'https://img.freepik.com/free-vector/monster-404-error-concept-illustration_114360-1879.jpg?t=st=1743990951~exp=1743994551~hmac=ac8c72276713f46f33da94f'} 
            alt="404 Error" 
            className="img-fluid" 
            style={{ maxHeight: "400px" }}
          />
        </Col>
      </Row>
    </Container>
  );
};

export default ErrorPage;