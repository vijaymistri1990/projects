import { Button, Icon, LegacyCard, TextField } from '@shopify/polaris'
import React, { useEffect, useState } from 'react'
import { useFormik } from 'formik'
import { useHistory, useLocation } from 'react-router-dom';
import * as Yup from "yup";
import { ApiCall } from '../../helper/axios';
import { MobileBackArrowMajor } from '@shopify/polaris-icons';
import { getCookies } from '../../helper/commonFunctions';

const UpdatePassword = () => {
    const history = useHistory();
    const { state } = useLocation();
    const [initialValues, setInitialValues] = useState({
        passWord: '',
        confirmPassWord: ''
    })

    let validationSchema = Yup.object().shape({
        passWord: Yup.string().required('required'),
        confirmPassWord: Yup.string().required('required'),
    })

    const formik = useFormik({
        initialValues: initialValues,
        validationSchema: validationSchema,
        enableReinitialize: true,
        onSubmit: (values) => {
            handleSave(values)
        }
    });

    const handleSave = async (values) => {
        let data = {
            password: values.passWord,
            confirm_password: values.confirmPassWord,
            id: state.id
        }
        let res = await ApiCall('PUT', '/update-password', data)
        let response = res?.data
        if (response?.statusCode === 200 && response?.status == "success") {
            history.push('/admin/user')
        }
    }

    useEffect(() => {
        let data = getCookies('userData');;
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
                        <Button onClick={() => history.push({ pathname: "/admin/user/edit", state: state })}><Icon source={MobileBackArrowMajor} /></Button>
                    </span>
                </div>
                <div className='p-2 mx-2'>
                    <div className='py-2 fs-3 text-center'><h1>Update password</h1></div>
                    <div className='row justify-content-center'>
                        <div className='col-sm-6 mt-2'>
                            <TextField
                                label="Password"
                                value={formik.values.passWord}
                                onChange={(value) => formik.setFieldValue('passWord', value)}
                                placeholder="Please enter name"
                                autoComplete="off"
                                error={formik.errors.passWord && formik.touched.passWord ? formik.errors.passWord : ''}
                            />
                        </div>
                    </div>
                    <div className='row justify-content-center'>
                        <div className='col-sm-6 mt-2'>
                            <TextField
                                label="confirm password"
                                value={formik.values.confirmPassWord}
                                onChange={(value) => formik.setFieldValue('confirmPassWord', value)}
                                placeholder="Please enter name"
                                autoComplete="off"
                                error={formik.errors.confirmPassWord && formik.touched.confirmPassWord ? formik.errors.confirmPassWord : ''}
                            />
                        </div>
                    </div>
                    <div className='row justify-content-center'>
                        <div className='col-sm-6 mt-3 text-end'>
                            <div className='sl-add-button pb-5'>
                                <span ><Button onClick={() => formik.handleSubmit()}>Update Password</Button></span>
                            </div>
                        </div>
                    </div>
                </div>
            </LegacyCard>
        </div>
    )
}

export default UpdatePassword