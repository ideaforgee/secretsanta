import React, { useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { loginHandler } from '../../../services/authService.js';
import { useAlert } from './../../../context/AlertContext.js';
import { useAuth } from './../../../context/AuthContext';
import logoutTheme from  '../../../assets/logoutTheme.png';
import "./LoginPage.css";

const Login = () => {
  const navigate = useNavigate();
  const { user, login } = useAuth();
  const { showAlert } = useAlert();

  useEffect(() => {
    if (user) {
      navigate('/secret-santa');
    }
  }, [user, navigate]);

  const formik = useFormik({
    initialValues: {
      email: '',
      password: ''
    },
    validationSchema: Yup.object({
      email: Yup.string().email('Invalid email address').required('Required'),
      password: Yup.string().min(6, 'Password must be at least 6 characters').required('Required')
    }),
    onSubmit: async (values) => {
      try {
        const response = await loginHandler(values.email, values.password);
        showAlert('Login successful!', 'success');

        login(response);

        navigate('/secret-santa');
      } catch (error) {
        showAlert(error.data ?? error.message ?? 'Login failed', 'error');
      }
    }
  });

  const handleSignUpClick = () => {
    navigate('/register');
  };

  const backgroundStyle = {
    backgroundImage: `url(${logoutTheme})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    height: '100vh',
    width: '100%'
  };

  return (
    <div className="container" >
      <form onSubmit={formik.handleSubmit}>
        <div className="input-container">
          <input
            type="email"
            id="email"
            name="email"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.email}
            placeholder="Email"
          />
          {formik.touched.email && formik.errors.email && <div>{formik.errors.email}</div>}
        </div>

        <div className="input-container">
          <input
            type="password"
            id="password"
            name="password"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.password}
            placeholder="Password"
          />
          {formik.touched.password && formik.errors.password && <div>{formik.errors.password}</div>}
        </div>

        <button type="submit" className="submit-btn">
          Log In
        </button>
        <button type='button' className="submit-btn signup" onClick={handleSignUpClick}>
          Don't have an account? Sign Up
        </button>
      </form>
    </div>
  );
};

export default Login;
