import React, { useState } from "react";
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { forgetPasswordHandler } from '../../../services/authService.js';
import { useAlert } from './../../../context/AlertContext.js';
import * as Constant from '../../../constants/secretSantaConstants.js';

const ForgotPassword = () => {
    const navigate = useNavigate();
    const { showAlert } = useAlert();

  const formik = useFormik({
      initialValues: {
        email: ''
      },
      validationSchema: Yup.object({
        email: Yup.string().email('Invalid email address').required('Required')
      }),
      onSubmit: async (values) => {
        try {
            const response = await forgetPasswordHandler(values.email);
            showAlert('Verification link sent to your mail. Only valid For 5 minutes', Constant.SUCCESS);
  
          navigate(Constant.ROUTE_PATH.LOGIN);
        } catch (error) {
          showAlert(error.data ?? error.message ?? 'failed', Constant.ERROR);
        }
      }
    });

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

        <button type="submit" className="submit-btn">
          Send Verification Code
        </button>
      </form>
    </div>
  );
};

export default ForgotPassword;
