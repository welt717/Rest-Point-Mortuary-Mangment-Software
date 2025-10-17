import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios"; // Keep axios for simplicity, but fetch API could also be used
import styled, { keyframes } from "styled-components";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { UserCheck, LogIn, Loader2 } from "lucide-react"; // Using Lucide icons

// --- Color Palette (Consistent with previous sleek design) ---
const Colors = {
  primaryDark: '#2C3E50', // Main dark background, now a touch richer
  accentTeal: '#00B894', // A more vibrant, slightly darker teal for primary actions
  accentOrange: '#FFA500', // A pure, bright orange for accents
  white: '#F8F9FA', // Off-white for general text and backgrounds
  lightGray: '#F2F4F7', // Very subtle background for the app layout
  mediumGray: '#BDC3C7', // For borders and subtle lines
  darkGray: '#34495E', // General text, a slightly warmer dark
  successGreen: '#2ECC71', // Standard green for success
  dangerRed: '#E74C3C', // Standard red for errors/danger
  inputBorder: '#CED4DA', // Bootstrap default input border
  inputFocus: '#80BDFF', // Bootstrap default input focus
};

// --- Keyframe Animations ---
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const bounce = keyframes`
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-8px); /* More pronounced bounce for header icon */
  }
`;

const spin = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

// --- Styled Components ---

const PageWrapper = styled.div`
  min-height: 100vh;
  background-color: ${Colors.lightGray};
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2.5rem;
  font-family: 'Inter', 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  animation: ${fadeIn} 0.8s ease-out; /* Slower fade-in for the whole page */
`;

const AuthContainer = styled.div`
  max-width: 650px; /* Slightly narrower for a sleeker look */
  width: 100%;
  background: ${Colors.white};
  padding: 2.5rem; /* Ample padding */
  border-radius: 1.2rem; /* More rounded corners */
  box-shadow: 0 15px 30px -5px rgba(0, 0, 0, 0.15),
              0 6px 12px -4px rgba(0, 0, 0, 0.1); /* Deeper, modern shadow */
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1); /* Smooth transition for hover */

  &:hover {
    transform: translateY(-0.4rem); /* Subtle lift on hover */
    box-shadow: 0 20px 40px -8px rgba(0, 0, 0, 0.2),
                0 8px 16px -4px rgba(0, 0, 0, 0.15); /* Enhanced shadow on hover */
  }
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 2rem; /* More space below header */
`;

const HeaderIcon = styled(UserCheck)`
  color: ${Colors.accentTeal};
  font-size: 3.8rem; /* Larger icon */
  margin-bottom: 1rem; /* Space below icon */
  animation: ${bounce} 2s infinite ease-in-out; /* Gentle bounce animation */
`;

const H1 = styled.h1`
  font-size: 2.8rem; /* Larger, more impactful heading */
  font-weight: 700;
  color: ${Colors.primaryDark};
  margin: 0.5rem 0;
  letter-spacing: -0.03em; /* Tighter letter spacing */
  text-shadow: 1px 1px 2px rgba(0,0,0,0.03); /* Subtle text shadow */
`;

const Subtitle = styled.p`
  font-size: 1.1rem;
  color: ${Colors.darkGray};
  margin-top: 0.5rem;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem; /* More vertical space between form groups */
  display: flex;
  flex-direction: column;

  label {
    font-weight: 600;
    color: ${Colors.darkGray};
    margin-bottom: 0.6rem; /* Space between label and input */
    font-size: 0.95rem; /* Slightly smaller label font */
  }
`;

const Input = styled(Field)`
  padding: 0.8rem 1rem; /* Ample padding inside input */
  font-size: 1rem;
  border: 1px solid ${Colors.mediumGray}; /* Softer border color */
  border-radius: 0.6rem; /* More rounded input fields */
  transition: all 0.2s ease-in-out; /* Smooth transition for focus */
  box-shadow: inset 0 1px 2px rgba(0,0,0,0.04); /* Subtle inner shadow */
  color: ${Colors.darkGray}; /* Input text color */

  &:focus {
    outline: none;
    border-color: ${Colors.accentTeal}; /* Teal border on focus */
    box-shadow: 0 0 0 0.25rem rgba(0,184,148,0.25); /* Teal glow on focus */
  }
`;

const ErrorText = styled.div`
  color: ${Colors.dangerRed};
  font-size: 0.85rem;
  margin-top: 0.4rem; /* Space above error message */
`;

const SuccessMsg = styled.div`
  color: ${Colors.successGreen};
  font-size: 1rem;
  font-weight: 600;
  text-align: center;
  margin-top: 1.5rem; /* Space above success message */
`;

const SubmitButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.7rem; /* Space between icon and text */
  background-color: ${Colors.accentTeal};
  color: ${Colors.white};
  padding: 0.9rem 1.8rem; /* Generous padding */
  border: none;
  border-radius: 0.6rem; /* Rounded corners */
  cursor: pointer;
  font-size: 1.1rem;
  font-weight: 600;
  transition: all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1); /* Smooth hover transition */
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1); /* Subtle shadow */
  width: 100%; /* Full width button */

  &:hover {
    background-color: #0097a7; /* Darker teal on hover */
    transform: translateY(-2px); /* Slight lift on hover */
    box-shadow: 0 9px 16px rgba(0, 0, 0, 0.15); /* More prominent shadow on hover */
  }
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }

  svg {
    animation: ${(props) => (props.isSubmitting ? spin : 'none')} 1s linear infinite; /* Spin loader */
    font-size: 1.4rem;
  }
`;

const LoginUser = () => {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const BASE_URL = "http://localhost:5000/api/v1/restpoint";

  const initialValues = {
    work_id: "",
  };

  const validationSchema = Yup.object({
    work_id: Yup.string().required("Work ID is required"),
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    setServerError("");
    setSuccessMessage(""); // Clear previous success message
    try {
      const response = await axios.post(`${BASE_URL}/login-user`, values);

      if (response.status === 200 && response.data.user_id) {
        localStorage.setItem("user_id", response.data.user_id);
        localStorage.setItem("session_id", response.data.session_id);

        setSuccessMessage("🎉 Login successful! Redirecting to dashboard...");
        setTimeout(() => {
          navigate("/all-deceased"); // Redirect to /all-deceased as a common starting point
        }, 1500);
      } else {
        setServerError("Login failed. Please check your Work ID.");
      }
    } catch (error) {
      setServerError(error.response?.data?.message || "Server error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageWrapper>
      <AuthContainer>
        <Header>
          <HeaderIcon />
          <H1>Welcome Back!</H1>
          <Subtitle>Please log in with your Work ID to continue.</Subtitle>
        </Header>

        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form>
              <FormGroup>
                <label htmlFor="work_id">Work ID</label>
                <Input name="work_id" id="work_id" placeholder="Enter your Work ID" />
                <ErrorMessage name="work_id" component={ErrorText} />
              </FormGroup>

              <SubmitButton type="submit" disabled={isSubmitting} isSubmitting={isSubmitting}>
                {isSubmitting ? <Loader2 /> : <LogIn />}
                {isSubmitting ? 'Logging In...' : 'Log In'}
              </SubmitButton>

              {successMessage && <SuccessMsg>{successMessage}</SuccessMsg>}
              {serverError && <ErrorText>{serverError}</ErrorText>}
            </Form>
          )}
        </Formik>
      </AuthContainer>
    </PageWrapper>
  );
};

export default LoginUser;