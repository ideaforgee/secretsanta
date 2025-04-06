import React, { useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { loginHandler } from '../../../services/authService.js';
import { useAlert } from './../../../context/AlertContext.js';
import { useAuth } from './../../../context/AuthContext';
import * as Constant from '../../../constants/secretSantaConstants.js';
import { registerServiceWorker, requestNotificationPermission } from '../../../services/notificationService.js';
import "./LoginPage.css";

const Login = () => {
  const navigate = useNavigate();
  const { user, login } = useAuth();
  const { showAlert } = useAlert();

  useEffect(() => {
    if (user) {
      navigate('/fun-zone');
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

        navigate('/fun-zone');
        registerServiceWorker(response.userId);
        requestNotificationPermission();
      } catch (error) {
        showAlert(error.data ?? error.message ?? 'Login failed', 'error');
      }
    }
  });

  const handleSignUpClick = () => {
    navigate('/register');
  };

  const handleForgetPasswordClick = () => {
    navigate(Constant.ROUTE_PATH.FORGET_PASSWORD);
  }

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
        <a onClick={handleForgetPasswordClick} style={ {fontWeight: 600,}}>Forgot Password ? (Click Here)</a>
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
