import React from 'react';

const LogoutButton = () => {
  const handleLogout = async () => {
    // Call your backend API to log out the user
    const response = await fetch('http://localhost:1337/api/logout', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (response.ok) {
      // Redirect the user to the login page or homepage
      localStorage.clear();
      window.location.href = '/login';
    } else {
      // Handle the error if the API call fails
      console.error('Failed to log out');
    }
  };

  return <button onClick={handleLogout}>Logout</button>;
};

export default LogoutButton;