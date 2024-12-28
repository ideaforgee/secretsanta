import React, { useState, useEffect } from "react";
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { useAlert } from './../../../context/AlertContext.js';
import { isTokenValid, resetPasswordHandler } from '../../../services/authService.js';
import * as Constant from "../../../constants/secretSantaConstants.js";

const ResetPassword = () => {
    const navigate = useNavigate();
    const { showAlert } = useAlert();
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const [userId, setUserId] = useState('');

    useEffect(() => {
        if (!token) {
            showAlert('Invalid or missing token', Constant.ERROR);
            navigate(Constant.ROUTE_PATH.LOGIN);
            return undefined;
        }

        const tokenValid = isTokenValid(token); 

        if (!tokenValid) {
            showAlert('Token has expired', Constant.ERROR);
            navigate(Constant.ROUTE_PATH.LOGIN);
            return undefined;
        }

        const decodedToken = jwtDecode(token);
        setUserId(decodedToken.id);
    }, [token, navigate]);
   
    const formik = useFormik({
        initialValues: {
            newPassword: '',
            confirmPassword: ''
        },
        validationSchema: Yup.object({
            newPassword: Yup.string().min(6, 'Password must be at least 6 characters').required('Required'),
            confirmPassword: Yup.string()
            .oneOf([Yup.ref('newPassword'), null], 'Passwords must match')
            .required('Required'),
        }),
        onSubmit: async (values) => {
            try {
                const response = await resetPasswordHandler(values.newPassword, userId);
                showAlert('Password Reset Successfully', Constant.SUCCESS);

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
                        type="password"
                        id="newPassword"
                        name="newPassword"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.newPassword}
                        placeholder="New Password"
                    />
                    {formik.touched.newPassword && formik.errors.newPassword && <div>{formik.errors.newPassword}</div>}
                </div>
                <div className="input-container">
                    <input
                        type="text"
                        id="confirm-password"
                        name="confirmPassword"
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        value={formik.values.confirmPassword}
                        placeholder="Confirm Password"
                    />
                    {formik.touched.confirmPassword && formik.errors.confirmPassword && <div>{formik.errors.confirmPassword}</div>}
                </div>
                <button type="submit" className="submit-btn">
                Reset Password
                </button>
            </form>
        </div>
    );
};

export default ResetPassword;
