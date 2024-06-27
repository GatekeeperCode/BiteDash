import React from "react";
import { useMsal } from "@azure/msal-react";
import { loginRequest } from "../../authConfig";
import { Button, Container, Typography, Box } from '@mui/material';
import { styled } from '@mui/system';

const LoginButton = styled(Button)({
  backgroundColor: '#cc0000',
  color: 'white',
  '&:hover': {
    backgroundColor: 'gray',
  },
  borderRadius: '20px', // Rounded edges for the button
  width: '100%', // Button spans the entirety of the card
});

const CardBox = styled(Box)({
  backgroundColor: '#f0f0f0', // Very light grey color
  borderRadius: '20px', // Rounded edges for the card
  padding: '2rem',
  width: '100%',
  boxSizing: 'border-box', // Makes sure padding doesn't affect the width
});

export const PreLogin = () => {
    const { instance } = useMsal();

    const handleLogin = () => {
        instance.loginRedirect(loginRequest).catch((e) => {
            console.log(e);
        });
    };

    return (
        <Container
            sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                backgroundColor: '#d6deeb',
            }}
        >
            <CardBox>
                <Typography variant="h2" align="center" gutterBottom>
                    BiteDash
                    <Typography variant="body2" color="text.secondary" align="center" >
                    -Not Affiliated With Parkhurst Dining-
                </Typography>
                </Typography>
              
                <Typography variant="body1" align="center" paragraph>
                    Log in with your GCC Microsoft Account to continue 
                </Typography>
                <LoginButton variant="contained" onClick={handleLogin}>
                    Log In
                </LoginButton>
            </CardBox>
        </Container>
    );
};

export default PreLogin;