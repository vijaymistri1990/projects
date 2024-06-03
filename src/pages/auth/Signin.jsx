import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import SCLOGO from "../../assets/img/sl-logo.jpeg";
import { useHistory } from 'react-router-dom'
import { ApiCall } from "../../helper/axios"
import { Button, TextField } from "@shopify/polaris";
import { getCookies, setCookie } from "../../helper/commonFunctions";
import { useFormik } from "formik";
import * as Yup from "yup";

const Signin = () => {
  const history = useHistory();
  // const [userName, setUserName] = useState('')
  // const [password, setPassWord] = useState('')
  const [loader, setLoader] = useState(false)

  const [initialValues, setInitialValues] = useState({
    userName: "",
    password: ""
  })

  let validationSchema = Yup.object().shape({
    userName: Yup.string().required('required'),
    password: Yup.string().required('required'),
  })

  const formik = useFormik({
    initialValues: initialValues,
    validationSchema: validationSchema,
    // enableReinitialize: true,
    onSubmit: (values) => {
      handleSave(values)
    }
  });

  useEffect(() => {
    // const userData = localStorage.getItem("userData");
    let userData = getCookies('userData');
    let token = getCookies('token');
    if (userData && token) {
      let user = JSON.parse(userData)?.user
      if (user == "1") {
        history.push("/admin/dashboard");
      } else {
        history.push("/topic-list");
      }
    }

  }, [])

  const handleSave = async (values) => {
    setLoader(true)
    let data = {
      user_name: values.userName,
      password: values.password
    }
    const res = await ApiCall('POST', `/sign-in`, data, [])
    let response = res?.data
    if (response?.statusCode === 200 && response?.status == "success") {
      localStorage.setItem("userData", JSON.stringify(response.data.user_data));
      localStorage.setItem("token", JSON.stringify(response.data.token));
      setCookie('userData', JSON.stringify(response.data.user_data))
      setCookie('token', JSON.stringify(response.data.token))
      if ((response?.data?.user_data).user == 1) {
        history.push('/admin/dashboard')
      } else {
        history.push('/topic-list')
      }
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
                <label htmlFor="email" className="input-label">
                  Email address
                </label>
                <input
                  type="text"
                  className="input-control"
                  // style={{ borderColor: (formik.errors.password && formik.touched.password) && '1px solid red' }}
                  id="email"
                  placeholder="example@gmail.com"
                  autoComplete="off"
                  onKeyDown={onKeyDown}
                  onChange={(e) => formik.setFieldValue('userName', e.target.value)} value={formik.values.userName}
                  required
                />
                <p style={{ color: 'red' }}>{formik.errors.userName && formik.touched.userName ? formik.errors.userName : ''}</p>
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
                  onChange={(e) => formik.setFieldValue('password', e.target.value)} value={formik.values.password}
                  onKeyDown={onKeyDown}
                  required
                />
                <p style={{ color: 'red' }}> {formik.errors.password && formik.touched.password ? formik.errors.password : ''}</p>
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
