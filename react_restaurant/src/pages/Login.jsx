import { useState } from 'react';
import { api } from '../services/api';

export default function Login({ setAuth }) {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [userRole, setUserRole] = useState('');


 const handleLogin = async (e) => {
  e.preventDefault();
  try {
    const res = await api.login(credentials);

    console.log(res.data); // ✅ YOU WILL SEE ID HERE

    const { access_token, role, admin_id, restaurant_id } = res.data;

    localStorage.setItem("token", access_token);
    localStorage.setItem("role", role);

    if (role === "admin") {
      localStorage.setItem("admin_id", admin_id);
    }

    if (role === "restaurant") {
      localStorage.setItem("restaurant_id", restaurant_id);
    }

    setAuth(true);
  } catch (err) {
    setError("Invalid username or password");
  }
};


  return (
    <div className="login-container">
      <form onSubmit={handleLogin} className="login-form">
        <h1>Admin Login</h1>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <input 
          type="text" 
          placeholder="Username"
          onChange={(e) => setCredentials({...credentials, username: e.target.value})}
        />
        <input 
          type="password" 
          placeholder="Password"
          onChange={(e) => setCredentials({...credentials, password: e.target.value})}
        />
        <button type="submit">Login</button>
      </form>
    </div>
  );
}