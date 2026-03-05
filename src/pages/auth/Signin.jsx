import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import SCLOGO from "../../assets/img/sl-logo.jpeg";
import { useNavigate } from 'react-router-dom'
import { ApiCall } from "../../helper/axios"
import { Button, TextField } from "@shopify/polaris";
import { getCookies, setCookie } from "../../helper/commonFunctions";
import { useFormik } from "formik";
import * as Yup from "yup";

const Signin = () => {
  const navigate = useNavigate();
  const [loader, setLoader] = useState(false)

  const [initialValues, setInitialValues] = useState({
    userName: "",
    password: ""
  })

  let validationSchema = Yup.object().shape({
    userName: Yup.string().required('Username is required'),
    password: Yup.string().required('Password is required'),
  })

  const formik = useFormik({
    initialValues: initialValues,
    validationSchema: validationSchema,
    onSubmit: (values) => {
      handleSave(values)
    }
  });

  useEffect(() => {
    let userData = getCookies('userData');
    let token = getCookies('token');
    if (userData && token) {
      let user = JSON.parse(userData)?.user
      if (user == "1") {
        navigate("/admin/dashboard");
      } else {
        navigate("/topic-list");
      }
    }
  }, [navigate])

  const handleSave = async (values) => {
    setLoader(true)
    let data = {
      user_name: values.userName,
      password: values.password
    }

    try {
      const res = await ApiCall('POST', `/sign-in`, data)
      let response = res?.data

      console.log("Login response:", response); // Debug log

      if (response?.statusCode === 200 && response?.status == "success") {
        // Store user data and token
        localStorage.setItem("userData", JSON.stringify(response.data.user_data));
        localStorage.setItem("token", response.data.token); // Don't double stringify
        setCookie('userData', JSON.stringify(response.data.user_data))
        setCookie('token', response.data.token) // Don't double stringify

        console.log("Login successful!"); // Debug log
        console.log("Token stored:", response.data.token.substring(0, 20) + '...'); // Debug log
        console.log("User type:", response.data.user_data.user); // Debug log
        console.log("Token in localStorage:", localStorage.getItem('token')?.substring(0, 20) + '...'); // Debug log

        // Redirect based on user type
        if (response.data.user_data.user == 1) {
          console.log("Redirecting to admin dashboard"); // Debug log
          navigate('/admin/dashboard')
        } else {
          console.log("Redirecting to topic list"); // Debug log
          navigate('/topic-list')
        }
      } else {
        console.error("Login failed:", response);
        alert(response?.message || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("Login failed. Please try again.");
    }

    setLoader(false)
  }

  const onKeyDown = (event) => {
    if (event.key === 'Enter') {
      formik.handleSubmit()
    }
  }

  return (
    <>
      <div className="auth-multi-layout">
        <div className="auth-box">
          <div className="auth-header">
            <div className="auth-header-logo ts-logo">
              <img src={SCLOGO} alt="" className="auth-header-logo-img" />
            </div>
            <p className="auth-header-subtitle">
              Sign-in to your account
            </p>
          </div>
          <div className="auth-body">
            <div className="auth-form-validation">
              <div className="input-field">
                <label htmlFor="userName" className="input-label">
                  Username
                </label>
                <input
                  type="text"
                  className="input-control"
                  id="userName"
                  placeholder="Enter your username"
                  autoComplete="off"
                  onKeyDown={onKeyDown}
                  onChange={(e) => formik.setFieldValue('userName', e.target.value)}
                  value={formik.values.userName}
                  required
                />
                <p className="tw-text-red-500">{formik.errors.userName && formik.touched.userName ? formik.errors.userName : ''}</p>
              </div>
              <div className="input-field">
                <label htmlFor="password" className="input-label" >
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  id="password"
                  className="input-control"
                  placeholder="Password"
                  autoComplete="off"
                  onChange={(e) => formik.setFieldValue('password', e.target.value)}
                  value={formik.values.password}
                  onKeyDown={onKeyDown}
                  required
                />
                <p className="tw-text-red-500"> {formik.errors.password && formik.touched.password ? formik.errors.password : ''}</p>
              </div>
              <div className="btn-submit">
                <Button type="submit" onClick={() => formik.handleSubmit()} loading={loader}>Sign in</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Signin;