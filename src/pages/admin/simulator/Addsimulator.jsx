import { LegacyCard, TextField, Select, Button, Icon } from '@shopify/polaris'
import { useFormik } from 'formik';
import React, { useState, useCallback } from 'react'
import { useHistory, useLocation } from 'react-router-dom';
import * as Yup from "yup";
import { ApiCall } from '../../../helper/axios';
import { useEffect } from 'react';
import { MobileBackArrowMajor } from '@shopify/polaris-icons';
import { getCookies } from '../../../helper/commonFunctions';
import ToggleSwitch from "../../../components/ToggleSwitch";

const Addsimulator = () => {
    const history = useHistory();
    const { state } = useLocation();
    const [loader, setLoader] = useState(false)
    const [resultEnable, setResultEnable] = useState(false)
    const [initialValues, setInitialValues] = useState({
        query_Name: '',
        language: '',
        user_Location: '',
        longtitude: '',
        latitide: '',
        query_result_show : false,
        query_Result: '',
    })

    const options = [
        { label: 'Hindi', value: 'Hindi(in)' },
        { label: 'English', value: 'English(in)' },
    ];

    const query_Result_options = [
        { label: 'Much Better - 1', value: '0' },
        { label: 'Better - 2', value: '1' },
        { label: 'Slightly Better - 3', value: '2' },
        { label: 'About the Same  - 4', value: '3' },
        { label: 'Slightly Better - 5', value: '4' },
        { label: 'Better - 6', value: '5' },
        { label: 'Much Better - 7', value: '6' },
    ];

    let validationSchema = Yup.object().shape({
        query_Name: Yup.string().required('required'),
        language: Yup.string().required('required'),
        user_Location: Yup.string().required('required'),
        longtitude: Yup.string().required('required'),
        latitide: Yup.string().required('required'),
        query_Result: resultEnable && Yup.string().required('required'),
    })

    const formik = useFormik({
        initialValues: initialValues,
        validationSchema: validationSchema,
        // enableReinitialize: true,
        onSubmit: (values) => {
            AddTopic(values)
        }
    });

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

    useEffect(() => {
        if (state?.isEdit) {
            formik.setFieldValue('query_Name', state?.query)
            formik.setFieldValue('language', state?.locale)
            formik.setFieldValue('user_Location', state?.user_location)
            formik.setFieldValue('longtitude', state?.longtitude)
            formik.setFieldValue('latitide', state?.latitude)
            formik.setFieldValue('query_result_show', state?.result_show == 1 ? true : false)
            formik.setFieldValue('query_Result', (state?.result)?.toString())
        }
    }, [state])

    const AddTopic = async (values) => {
        setLoader(true)
        let data = {
            query: values.query_Name,
            locale: values.language,
            user_location: values.user_Location,
            longtitude: values.longtitude,
            latitude: values.latitide,
            result_show: values.query_result_show ? "1" : "0",
            result : values.query_result_show ? values.query_Result : ''
        }
        let res = '';
        if (state?.isEdit) {
            data.id = state.id
            res = await ApiCall('PUT', '/simulator-update', data)
            let response = res?.data
            if (response?.statusCode === 200 && response?.status == "success") {
                history.push('/admin/simulator')
            }
        } else {
            res = await ApiCall('POST', '/add-simulator', data)
            let response = res?.data
            if (response?.statusCode === 200 && response?.status == "success") {
                history.push({
                    pathname: '/admin/simulator/topic',
                    state: response?.data.id
                })
            }
        }
        setLoader(false)
    }

    return (
        <div className='mt-2'>
            <LegacyCard>  <div>
                <span className='back-button p-2 mt-2'>
                    <Button onClick={() => history.push('/admin/simulator')}><Icon source={MobileBackArrowMajor} /></Button>
                </span>
            </div>
                <div className='p-2 mx-2'>
                    <div className='py-2 fs-3 text-center'><h1>{state?.isEdit ? 'Edit ' : "Add "}simulator</h1></div>
                    <div className='row justify-content-center'>
                        <div className='col-sm-6 mt-2'>
                            <TextField
                                label="Query name"
                                value={formik.values.query_Name}
                                onChange={(value) => formik.setFieldValue('query_Name', value)}
                                placeholder="Please query name"
                                autoComplete="off"
                                error={formik.errors.query_Name && formik.touched.query_Name ? formik.errors.query_Name : ''}
                            />
                        </div>
                    </div>
                    <div className='row justify-content-center'>
                        <div className='col-sm-6 mt-2'>
                            <Select
                                label="Language"
                                options={options}
                                placeholder="Please select language"
                                onChange={(value) => formik.setFieldValue('language', value)}
                                value={formik.values.language}
                                error={formik.errors.language && formik.touched.language ? formik.errors.language : ''}
                            />
                        </div>
                    </div>
                    <div className='row justify-content-center'>
                        <div className='col-sm-6 mt-2'>
                            <TextField
                                label="User location "
                                value={formik.values.user_Location}
                                onChange={(value) => formik.setFieldValue('user_Location', value)}
                                placeholder="Please user location "
                                autoComplete="off"
                                error={formik.errors.user_Location && formik.touched.user_Location ? formik.errors.user_Location : ''}
                            />
                        </div>
                    </div>
                    <div className='row justify-content-center'>
                        <div className='col-sm-6 mt-2'>
                            <TextField
                                label="Longtitude"
                                value={formik.values.longtitude}
                                onChange={(value) => formik.setFieldValue('longtitude', value)}
                                placeholder="Please enter name"
                                autoComplete="off"
                                error={formik.errors.longtitude && formik.touched.longtitude ? formik.errors.longtitude : ''}
                            />
                        </div>
                    </div>
                    <div className='row justify-content-center'>
                        <div className='col-sm-6 mt-2'>
                            <TextField
                                label="Latitide"
                                value={formik.values.latitide}
                                onChange={(value) => formik.setFieldValue('latitide', value)}
                                placeholder="Please enter name"
                                autoComplete="off"
                                error={formik.errors.latitide && formik.touched.latitide ? formik.errors.latitide : ''}
                            />
                        </div>
                    </div>
                    <div className='row justify-content-center'>
                        <div className='col-sm-6 mt-2'>
                            <div className='d-flex'>
                                <div><label>Query result Show</label></div>
                                <div className='px-2 pt-1'> <ToggleSwitch width={30} height={15} handleDiameter={12} checked={formik.values.query_result_show} handleChange={(value) => {formik.setFieldValue('query_result_show', value);setResultEnable(value);}} /></div>
                            </div>

                        </div>
                    </div>
                    {formik.values.query_result_show &&
                        <div className='row justify-content-center'>
                            <div className='col-sm-6 mt-2'>
                                <Select
                                    label="Query result"
                                    options={query_Result_options}
                                    placeholder="Please select query result"
                                    onChange={(value) => formik.setFieldValue('query_Result', value)}
                                    value={formik.values.query_Result}
                                    error={formik.errors.query_Result && formik.touched.query_Result ? formik.errors.query_Result : ''}
                                />
                            </div>
                        </div>}
                    <div className='row justify-content-center'>
                        <div className='col-sm-6 mt-3 text-end'>
                            <div className='sl-add-button pb-5'>
                                <Button loading={loader} onClick={() => formik.handleSubmit()}>{state?.isEdit ? 'Edit Topics' : "Add Topics"}</Button>
                            </div>
                        </div>
                    </div>
                </div>

            </LegacyCard >
        </div >
    )
}

export default Addsimulator