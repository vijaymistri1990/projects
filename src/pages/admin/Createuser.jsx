import { Button, Icon, LegacyCard, TextField } from '@shopify/polaris'
import React, { useCallback, useEffect, useState } from 'react'
import { useFormik } from 'formik'
import * as Yup from "yup";
import { ApiCall, GetApiCall } from '../../helper/axios';
import { useHistory, useLocation } from 'react-router-dom';
import { MobileBackArrowMajor } from '@shopify/polaris-icons';
import { getCookies } from '../../helper/commonFunctions';

const Createuser = () => {
    const history = useHistory();
    const { state } = useLocation();
    const [loader, setLoader] = useState(false)

    const [initialValues, setInitialValues] = useState({
        name: '',
        userName: '',
        passWord: '',
    })

    let validationSchema = Yup.object().shape({
        name: Yup.string().required('required'),
        userName: Yup.string().required('required'),
        // passWord: Yup.string().required('required'),
    })

    const formik = useFormik({
        initialValues: initialValues,
        validationSchema: validationSchema,
        enableReinitialize: true,
        onSubmit: (values) => {
            if (state) {
                handleEdit(values)
            } else {
                handleSave(values)
            }

        }
    });

    const handleEdit = async (values) => {
        setLoader(true)
        let data = {
            user_name: values.userName,
            name: values.name,
            id: state.id,
        }
        const res = await ApiCall('PUT', '/update-user', data)
        let response = res?.data
        if (response?.statusCode === 200 && response?.status == "success") {
            history.push('/admin/user')
        }
        setLoader(false)
    }

    const handleSave = async (values) => {
        setLoader(true)
        let data = {
            user_name: values.userName,
            password: values.passWord,
            name: values.name
        }
        const res = await ApiCall('POST', `/new-user`, data, [])
        let response = res?.data
        if (response?.statusCode === 200 && response?.status == "success") {
            history.push('/admin/user')
        }
        setLoader(false)
    }

    function randomString() {
        if (formik.values.userName && formik.values.name) {
            var result = '';
            let length = 16;
            let chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
            for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
            formik.setFieldValue('passWord', result)
        }
    }

    useEffect(() => {
        if (state) {
            setInitialValues({
                name: state.name,
                userName: state.user_name,
            })

        }
    }, [state])

    const handleEditPassword = (state) => {
        history.push({
            pathname: '/admin/user/password',
            state: state
        })
    }

    useEffect(() => {
        let data = getCookies('userData');
        if (data == null) {
            history.push("/login");
        } else {
            let user = JSON.parse(data)?.user
            if (user == "0") {
                history.push("/topic-list");
            }
        }
    }, [])


    return (
        <div className='mt-2'>
            <LegacyCard>
                <div>
                    <span className='back-button p-2 mt-2'>
                        <Button onClick={() => history.push("/admin/user")}><Icon source={MobileBackArrowMajor} /></Button>
                    </span>
                </div>
                <div className='p-2 mx-2'>
                    <div className='py-2 fs-3 text-center'><h1> {state ? "Edit" : "Create"} User</h1></div>
                    <div className='row justify-content-center'>
                        <div className='col-sm-6 mt-2'>
                            <TextField
                                label="Name"
                                value={formik.values.name}
                                onChange={(value) => formik.setFieldValue('name', value)}
                                placeholder="Please enter name"
                                autoComplete="off"
                                error={formik.errors.name && formik.touched.name ? formik.errors.name : ''}
                            />
                        </div>
                    </div>
                    <div className='row justify-content-center'>
                        <div className='col-sm-6 mt-2'>
                            <TextField
                                label="User Name"
                                value={formik.values.userName}
                                placeholder="Please enter username"
                                onChange={(value) => formik.setFieldValue('userName', value)}
                                autoComplete="off"
                                error={formik.errors.userName && formik.touched.userName ? formik.errors.userName : ''}
                            />
                        </div>
                    </div>
                    {!state &&
                        <div className='row justify-content-center'>
                            <div className='col-sm-6 mt-2'>
                                <TextField
                                    label="Password"
                                    value={formik.values.passWord}
                                    onChange={(value) => formik.setFieldValue('passWord', value)}
                                    placeholder="Please enter Password"
                                    autoComplete="off"
                                    suffix={<div className='cursor-pointer' onClick={() => randomString()}>Autogenerate password</div>}
                                    type="password"
                                    error={formik.errors.passWord && formik.touched.passWord ? formik.errors.passWord : ''}
                                />
                            </div>
                        </div>}
                    <div className='row justify-content-center'>
                        <div className='col-sm-6 mt-3 text-end'>
                            <div className='sl-add-button pb-5'>
                                {state && <span className='px-2'><Button onClick={() => handleEditPassword(state)}>Update Password</Button></span>}
                                <Button onClick={formik.handleSubmit} loading={loader}>{state ? 'Edit' : 'Save'}</Button>
                            </div>
                        </div>
                    </div>
                </div>
            </LegacyCard>
        </div>
    )
}

export default Createuser