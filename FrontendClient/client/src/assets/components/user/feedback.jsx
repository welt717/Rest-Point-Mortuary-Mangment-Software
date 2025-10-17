import React, { useState } from 'react';
import styled from 'styled-components';
import { FaStar, FaRegStar } from 'react-icons/fa';
import { motion } from 'framer-motion';

// --- Styled Components ---

const PageWrapper = styled.div`
  background: #f0f4f8;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px 20px;
  font-family: 'Poppins', sans-serif;
  color: #2d3748;
`;

const FormContainer = styled(motion.div)`
  max-width: 750px;
  width: 100%;
  padding: 50px;
  background: #ffffff;
  border-radius: 20px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  overflow: hidden;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 40px;
`;

const Title = styled.h2`
  font-size: 2.8em;
  font-weight: 700;
  color: #1a202c;
  margin: 0;
`;

const Subtitle = styled.p`
  font-size: 1.1em;
  color: #718096;
  margin-top: 10px;
  font-weight: 400;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 30px;
`;

const QuestionSection = styled(motion.div)`
  background: #f7fafc;
  padding: 25px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
`;

const Label = styled.label`
  font-weight: 600;
  display: block;
  margin-bottom: 15px;
  font-size: 1.1em;
  color: #2d3748;
`;

const RatingWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const StarButton = styled(motion.button)`
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  color: ${props => props.selected ? '#ffc107' : '#e2e8f0'};
  font-size: 2.5em;
  transition: color 0.2s, transform 0.2s;

  &:hover {
    color: #ffb300;
    transform: scale(1.1);
  }
`;

const OptionContainer = styled.div`
  display: flex;
  gap: 25px;
  
  label {
    display: flex;
    align-items: center;
    cursor: pointer;
    font-size: 1em;
    color: #4a5568;
    transition: color 0.2s;
    
    &:hover {
      color: #2d3748;
    }
  }

  input[type="radio"] {
    appearance: none;
    width: 22px;
    height: 22px;
    border-radius: 50%;
    border: 2px solid #cbd5e0;
    margin-right: 10px;
    position: relative;
    cursor: pointer;
    transition: all 0.2s ease;

    &:checked {
      border-color: #3182ce;
      background-color: #3182ce;
      &:after {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background: #ffffff;
        transform: translate(-50%, -50%);
      }
    }
  }
`;

const Input = styled.input`
  padding: 15px;
  width: 100%;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  font-size: 1em;
  box-shadow: inset 0 1px 2px rgba(0,0,0,0.05);
  transition: border-color 0.3s, box-shadow 0.3s;

  &:focus {
    outline: none;
    border-color: #3182ce;
    box-shadow: 0 0 0 3px rgba(49, 130, 206, 0.2);
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  height: 150px;
  padding: 15px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  font-size: 1em;
  resize: vertical;
  box-shadow: inset 0 1px 2px rgba(0,0,0,0.05);
  transition: border-color 0.3s, box-shadow 0.3s;

  &:focus {
    outline: none;
    border-color: #3182ce;
    box-shadow: 0 0 0 3px rgba(49, 130, 206, 0.2);
  }
`;

const SubmitButton = styled(motion.button)`
  background: #3182ce;
  color: white;
  padding: 18px 30px;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-size: 1.3em;
  font-weight: 600;
  width: 100%;
  margin-top: 20px;
  box-shadow: 0 4px 15px rgba(49, 130, 206, 0.3);
  transition: background 0.3s ease;
  
  &:hover {
    background: #2b6cb0;
  }

  &:active {
    background: #2c5282;
  }
`;

// --- Questionnaire Data ---
const questions = [
  { id: 1, text: "How satisfied were you with the overall service?", type: "rating" },
  { id: 2, text: "Did our staff treat you and your family with respect and compassion?", type: "yes_no" },
  { id: 3, text: "How would you rate the timeliness of our services?", type: "rating" },
  { id: 4, text: "Was the funeral home clean and comfortable?", type: "yes_no" },
  { id: 5, text: "How satisfied were you with the arrangements and ambiance?", type: "rating" },
  { id: 6, text: "How well did we communicate the process and available options?", type: "rating" },
  { id: 7, text: "Did you receive timely updates throughout the process?", type: "yes_no" },
  { id: 8, text: "Would you recommend our funeral home to others?", type: "yes_no" },
  { id: 9, text: "Do you have any suggestions for improvement?", type: "text" }
];

// --- Component ---
const FuneralFeedbackForm = () => {
  const [responses, setResponses] = useState({});

  const handleChange = (id, value) => {
    setResponses(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Submitted Responses:", responses);
    alert("Thank you for your valuable feedback! We appreciate you taking the time to help us improve.");
    setResponses({});
  };

  return (
    <PageWrapper>
      <FormContainer
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <Header>
          <Title>Feedback Form</Title>
          <Subtitle>Your valuable insights help us improve our services.</Subtitle>
        </Header>
        <Form onSubmit={handleSubmit}>
          {questions.map((q, index) => (
            <QuestionSection
              key={q.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 * index, duration: 0.5 }}
            >
              <Label>{q.text}</Label>
              {q.type === "rating" && (
                <RatingWrapper>
                  {[1, 2, 3, 4, 5].map(n => (
                    <StarButton
                      key={n}
                      type="button"
                      selected={responses[q.id] >= n}
                      onClick={() => handleChange(q.id, n)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      {responses[q.id] >= n ? <FaStar /> : <FaRegStar />}
                    </StarButton>
                  ))}
                </RatingWrapper>
              )}
              {q.type === "yes_no" && (
                <OptionContainer>
                  <label>
                    <input
                      type="radio"
                      name={`q${q.id}`}
                      value="Yes"
                      checked={responses[q.id] === "Yes"}
                      onChange={e => handleChange(q.id, e.target.value)}
                    /> Yes
                  </label>
                  <label>
                    <input
                      type="radio"
                      name={`q${q.id}`}
                      value="No"
                      checked={responses[q.id] === "No"}
                      onChange={e => handleChange(q.id, e.target.value)}
                    /> No
                  </label>
                </OptionContainer>
              )}
              {q.type === "text" && (
                <TextArea
                  value={responses[q.id] || ""}
                  onChange={e => handleChange(q.id, e.target.value)}
                  placeholder="Share your suggestions for improvement..."
                />
              )}
            </QuestionSection>
          ))}
          <SubmitButton 
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.2 }}
          >
            Submit Feedback
          </SubmitButton>
        </Form>
      </FormContainer>
    </PageWrapper>
  );
};

export default FuneralFeedbackForm;