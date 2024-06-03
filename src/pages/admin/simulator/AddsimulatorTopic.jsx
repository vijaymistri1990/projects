import { LegacyCard, TextField, Select, Button, Icon, DropZone, Thumbnail, LegacyStack } from '@shopify/polaris'
import { useFormik } from 'formik';
import React, { useCallback, useEffect, useState } from 'react'
import * as Yup from "yup";
import { CirclePlusMajor, DeleteMajor } from '@shopify/polaris-icons';
import { useHistory, useLocation } from 'react-router-dom';
import { ApiCall, GetApiCall } from '../../../helper/axios';
// import { ToggleSwitch } from '../../../components/ToggleSwitch'
import ToggleSwitch from '../../../components/ToggleSwitch';
import { MobileBackArrowMajor, NoteMinor } from '@shopify/polaris-icons';
import { sampleFileApi } from '../../../helper/commanApi';
import { getCookies } from '../../../helper/commonFunctions';
const AddsimulatorTopic = () => {
    const history = useHistory()
    const { state } = useLocation();
    const [simulatorType, setSimulatorType] = useState("0")
    const [loader, setLoader] = useState(false)
    const [resultEnable, setResultEnable] = useState(false)
    const [image, setImage] = useState()
    const [initialValues, setInitialValues] = useState({
        simulator_Type: '0',
        location: '',
        link: '',
        slider_type: '0',
        sccond_slider_type: '',
        final_Result_enabled: false,
        query_Result: '',
        left_min: [""],
        left_max: [""],
        Right_min: [""],
        Right_max: [""],

        // link with discription 
        question_type: '0',
        questions: [""],
        date: [""],

        // Link with description
        link_description: '',

        //SCRB
        scrb: [""],
        image: '',
        base64Image: '',
    })

    let validationSchema = Yup.object().shape({
        simulator_Type: Yup.string().required('required'),
        location: Yup.string().required('required'),
        link: (simulatorType != '5' && simulatorType != '4') && Yup.string().required('required'),
        slider_type: Yup.string().required('required'),
        sccond_slider_type: Yup.string().required('required'),
        query_Result: resultEnable && Yup.string().required('required'),
        left_min: Yup.array().of(Yup.number().positive('Must be Positive').required('required')),
        left_max: Yup.array().of(Yup.number().positive('Must be Positive').required('required')),

        // left_max: Yup.array().of(Yup.number().test('superior', 'Not Vaild', function (f) { const ref = Yup.ref('left_min'); return f > this.resolve(ref); }).required('required')),
        Right_min: Yup.array().of(Yup.number().positive('Must be Positive').required('required')),
        Right_max: Yup.array().of(Yup.number().positive('Must be Positive').required('required')),

        // Right_max: Yup.array().of(Yup.number().test('superior', 'Not Vaild', function (f) { const ref = Yup.ref('Right_min'); return f > this.resolve(ref); }).required('required')),

        // link with discription 
        question_type: Yup.string().required('required'),
        questions: simulatorType == '2' && Yup.array().of(Yup.string().required('required')),
        date: simulatorType == '2' && Yup.array().of(Yup.string().required('required')),

        // Link with description
        link_description: simulatorType == '3' && Yup.string().required('required'),

        //SCRB
        scrb: simulatorType == '4' && Yup.array().of(Yup.string().required('required')),

    })

    const formik = useFormik({
        initialValues: initialValues,
        validationSchema: validationSchema,
        enableReinitialize: true,
        onSubmit: (values) => {
            simulatorSave(values)
        }
    });

    const options = [
        { label: 'Normal Link', value: '0' },
        { label: 'Normal Youtube', value: '1' },
        { label: 'Link With Questions', value: '2' },
        { label: 'Link with description', value: '3' },
        { label: 'SCRB', value: '5' },
        { label: 'SCRB With Youtube ', value: '4' },
    ];

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

    const locationOptions = [
        { label: 'L1', value: '1', disabled: (state?.slot)?.includes(1) },
        { label: 'L2', value: '2', disabled: (state?.slot)?.includes(2) },
        { label: 'L3', value: '3', disabled: (state?.slot)?.includes(3) },
        { label: 'L4', value: '4', disabled: (state?.slot)?.includes(4) },
        { label: 'L5 ', value: '5', disabled: (state?.slot)?.includes(5) },
        { label: 'R1', value: '6', disabled: (state?.slot)?.includes(6) },
        { label: 'R2', value: '7', disabled: (state?.slot)?.includes(7) },
        { label: 'R3', value: '8', disabled: (state?.slot)?.includes(8) },
        { label: 'R4', value: '9', disabled: (state?.slot)?.includes(9) },
        { label: 'R5', value: '10', disabled: (state?.slot)?.includes(10) },
    ]

    const sliderTypeOptions = [
        { label: 'Single', value: '0' },
        { label: 'Multiple', value: '1' },
    ]

    const secondSliderNameOption = [
        { label: 'Pq', value: '0' },
        { label: 'Eat', value: '1' },
    ]

    const query_Result_options = [
        { label: 'Porn', value: '1' },
        { label: 'Foreign Language', value: '2' },
        { label: 'Did Not Load - 3', value: '3' },
        { label: 'Hard To use  - 4', value: '4' }
    ];

    const question_typeOption = [
        { label: 'Vertical', value: '0' },
        { label: 'Horizontal', value: '1' },
    ];

    const handleChange = () => {
        if (formik.values.slider_type == 1) {
            formik.setFieldValue('left_min', [""])
            formik.setFieldValue('left_max', [""])
            formik.setFieldValue('Right_min', [""])
            formik.setFieldValue('Right_max', [""])
        }
    }

    const AddRow = (flag) => {
        let item = ''
        if (flag == 1) {
            formik.setFieldValue('questions', [...formik.values.questions, item])
            formik.setFieldValue('date', [...formik.values.date, item])
        } else if (flag == 2) {
            formik.setFieldValue('scrb', [...formik.values.scrb, item])
        } else {
            formik.setFieldValue('left_min', [...formik.values.left_min, item])
            formik.setFieldValue('left_max', [...formik.values.left_max, item])
            formik.setFieldValue('Right_min', [...formik.values.Right_min, item])
            formik.setFieldValue('Right_max', [...formik.values.Right_max, item])
        }
    }

    const deleteRow = (index, flag) => {
        if (flag == 1) {
            if ((formik.values.questions)?.length > 1) {
                let questions = [...formik.values.questions]
                questions.splice(index, 1)
                formik.setFieldValue('questions', questions)

                let date = [...formik.values.date]
                date.splice(index, 1)
                formik.setFieldValue('date', date)
            }
        } else if ((formik.values.scrb)?.length > 1) {
            let scrb = [...formik.values.scrb]
            scrb.splice(index, 1)
            formik.setFieldValue('scrb', scrb)
        } else {
            if ((formik.values.left_min)?.length > 1) {
                let left_min = [...formik.values.left_min]
                left_min.splice(index, 1)
                formik.setFieldValue('left_min', left_min)

                let left_max = [...formik.values.left_max]
                left_max.splice(index, 1)
                formik.setFieldValue('left_max', left_max)

                let Right_min = [...formik.values.Right_min]
                Right_min.splice(index, 1)
                formik.setFieldValue('Right_min', Right_min)

                let Right_max = [...formik.values.Right_max]
                Right_max.splice(index, 1)
                formik.setFieldValue('Right_max', Right_max)
            }
        }
    }

    const simulatorSave = async (values) => {
        setLoader(true)
        let resultArr = []
        values?.Right_max.map((item, index) => {
            resultArr.push({
                [`left_${index}_rating_result_max`]: formik.values.left_max[index],
                [`left_${index}_rating_result_min`]: formik.values.left_min[index],
                [`right_${index}_rating_result_max`]: formik.values.Right_max[index],
                [`right_${index}_rating_result_min`]: formik.values.Right_min[index]
            })
        })

        let questionArr = []
        values?.questions?.map((item, index) => {
            if (values.question_type == "0") {
                questionArr.push({
                    questions: formik.values.questions[index],
                    date: formik.values.date[index]
                })
            } else {
                questionArr.push({
                    questions: formik.values.questions[index],
                    vote: formik.values.date[index]
                })
            }
        })

        let scrbArr = []
        values?.scrb?.map((item, index) => {
            scrbArr.push(formik.values.scrb[index])
        })

        let data = {
            simulator_id: state.isEdit ? state.simulator_id : state?.state ? state.state : state,
            simulator_type: values.simulator_Type,
            location: values.location,
            link: values.link,
            slider_type: values.slider_type,
            slider_name: values.sccond_slider_type,
            final_result_show: values.final_Result_enabled ? "1" : "0",
            final_result: values.final_Result_enabled ? values.query_Result : '',
            slider_result_json: resultArr,
            question_type: values.simulator_Type == '2' && values.question_type,
            questions: values.simulator_Type == '2' && questionArr,
            link_with_description: values.simulator_Type == '3' && values.link_description,
            more_videos: values.simulator_Type == '4' && scrbArr,
            scrb_link: values.simulator_Type == '5' && values.base64Image
        }
        let res = ''
        if (state?.isEdit) {
            data.id = state.id
            res = await ApiCall('PUT', '/simulator-topics-update', data)
        } else {

            res = await ApiCall('POST', '/add-simulator-topics', data)
        }
        let response = res?.data
        if (response?.statusCode === 200 && response?.status == "success") {
            history.push({
                pathname: '/admin/simulator/topic',
                state: state.isEdit ? state.simulator_id : state?.state ? state.state : state,
            })
            setLoader(false)
        }
    }

    useEffect(() => {
        setSimulatorType(formik.values.simulator_Type)
    }, [formik.values.simulator_Type])

    const getEditData = async () => {
        let res = await GetApiCall('GET', `/simulator-topics-list-data?simulator_id=${state.id}`)
        let response = res?.data
        if (response?.statusCode === 200 && response?.status == "success") {
            let data = response?.data
            setImage(data.scrb_link)
            formik.setFieldValue('scrb', JSON.parse(data.youtube_link_arr))
            formik.setFieldValue('base64Image', data.scrb_link)
            formik.setFieldValue('image', data.scrb_link)
            formik.setFieldValue('simulator_Type', data.simulator_type.toString())
            formik.setFieldValue('location', data.location.toString())
            formik.setFieldValue('link', data.link)
            formik.setFieldValue('slider_type', data.slider_type.toString())
            formik.setFieldValue('sccond_slider_type', data.slider_name.toString())
            formik.setFieldValue('query_Result', (data?.final_result)?.toString())
            formik.setFieldValue('question_type', data.question_type)
            formik.setFieldValue('final_Result_enabled', data?.final_result_show == 1 ? true : false)
            formik.setFieldValue('questions', data.questions)
            formik.setFieldValue('link_description', data.link_with_description)
            // formik.setFieldValue('scrb', data.more_videos)
            let left_min = []
            let left_max = []
            let right_min = []
            let right_max = []
            JSON.parse(data.slider_result_json)?.map((item, index) => {
                left_min.push(item[`left_${index}_rating_result_min`])
                left_max.push(item[`left_${index}_rating_result_max`])
                right_min.push(item[`right_${index}_rating_result_min`])
                right_max.push(item[`right_${index}_rating_result_max`])
            })
            formik.setFieldValue('left_min', left_min)
            formik.setFieldValue('left_max', left_max)
            formik.setFieldValue('Right_min', right_min)
            formik.setFieldValue('Right_max', right_max)

            let questionarr = []
            let datearr = []
            JSON.parse(data.questions_json)?.map((item, index) => {
                questionarr.push(item.questions)
                datearr.push(item.date ? item.date : item.vote)
            })
            formik.setFieldValue('questions', questionarr)
            formik.setFieldValue('date', datearr)
            // questions: [""],
            // date: [""],
        }

    }

    useEffect(() => {
        if (state?.isEdit) {
            getEditData()
        }
    }, [state])

    const handleDropZoneDrop = useCallback((_dropFiles, acceptedFiles, _rejectedFiles) => {
            if (_rejectedFiles.length == 0) {
                const reader = new FileReader();
                reader.readAsDataURL(acceptedFiles[0]);
                reader.onload = () => {
                    formik.setFieldValue('base64Image', reader.result)
                }
                formik.setFieldValue('image', acceptedFiles[0])
            }
        }
    );

    const validImageTypes = ['image/jpeg', 'image/png'];

    return (
        <div className='mt-2'>
            <LegacyCard>
                <span className='back-button p-2 mt-2'>
                    <Button onClick={() => history.push({ pathname: '/admin/simulator/topic', state: state.isEdit ? state.simulator_id : state.state })}><Icon source={MobileBackArrowMajor} /></Button>
                </span>
                <div className='p-2 mx-2'>
                    <div className='py-2 fs-3 text-center'><h1>{state?.isEdit ? "Edit" : "Add"} simulator topic</h1></div>
                    <div className='row justify-content-center'>
                        <div className='col-sm-6 mt-2'>
                            <Select
                                label="Simulator type"
                                options={options}
                                placeholder="Please select simulator type"
                                onChange={(value) => formik.setFieldValue('simulator_Type', value)}
                                value={formik.values.simulator_Type}
                                error={formik.errors.simulator_Type && formik.touched.simulator_Type ? formik.errors.simulator_Type : ''}
                            />
                        </div>
                    </div>
                    {formik.values.simulator_Type == '6' ? <div></div> : <>
                        <div className='row justify-content-center'>
                            <div className='col-sm-6 mt-2'>
                                <Select
                                    label="Location"
                                    options={locationOptions}
                                    placeholder="Please select location"
                                    onChange={(value) => formik.setFieldValue('location', value)}
                                    value={formik.values.location}
                                    error={formik.errors.location && formik.touched.location ? formik.errors.location : ''}
                                />
                            </div>
                        </div>
                        {(formik.values.simulator_Type != "5" && formik.values.simulator_Type != "4") && <div className='row justify-content-center'>
                            <div className='col-sm-6 mt-2'>
                                <TextField
                                    label={"Link"}
                                    value={formik.values.link}
                                    onChange={(value) => formik.setFieldValue('link', value)}
                                    placeholder="Please enter link "
                                    autoComplete="off"
                                    error={formik.errors.link && formik.touched.link ? formik.errors.link : ''}
                                />
                            </div>
                        </div>}
                        {formik.values.simulator_Type == "5" && <div className='row justify-content-center'>
                            <div className='col-sm-6 mt-2'>
                                <DropZone onDrop={handleDropZoneDrop} allowMultiple={false} label="SCRB Image">
                                    {formik.values.image != '' ?
                                        (typeof formik.values.image != 'object') ?
                                            <Thumbnail
                                                size="large"
                                                alt={image}
                                                source={sampleFileApi + image}
                                            /> :
                                            <Thumbnail
                                                size="large"
                                                alt={formik.values.image?.name}
                                                source={validImageTypes.includes(formik.values.image?.type) ? window.URL.createObjectURL(formik.values.image) : NoteMinor}
                                            /> :
                                        <DropZone.FileUpload actionHint="Accepts .jpg, and .png" />}
                                </DropZone>  </div></div>}

                        {formik.values.simulator_Type == '4' &&
                        <div className='row justify-content-center'>
                            <div className='col-sm-6 mt-2'>
                                <label>Add Video Link</label>
                                {formik.values.scrb?.map((item, index) => {
                                    return (
                                        <>
                                            <div class="row d-flex justify-content-center mt-2">
                                                <div className='col-sm-10 mt-2'>
                                                    <TextField
                                                        value={formik.values.scrb[index]}
                                                        onChange={(value) => formik.setFieldValue(`scrb.${index}`, value)}
                                                        error={formik.errors.scrb && formik.errors.scrb[index] && formik.touched.scrb && formik.touched.scrb[index] ? formik.errors.scrb[index] : ''} />
                                                </div>
                                                <div className='col-sm-2 mt-2'>
                                                    <div className='sl-add-delete-icon cursor-pointer'>
                                                        <div className='cursor-pointer' onClick={() => AddRow(2)} style={{ pointerEvents: (formik.values.scrb).length >= '3' && 'none' }}>
                                                            <Icon
                                                                source={CirclePlusMajor}
                                                                color="base"
                                                            /></div>
                                                        <div className='cursor-pointer' aria-disabled={true} onClick={() => deleteRow(index, 2)}>
                                                            <Icon
                                                                source={DeleteMajor}
                                                                color="critical"
                                                            /></div>
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    )
                                })}
                            </div>
                        </div>}
                        {formik.values.simulator_Type == '3' && <div className='row justify-content-center'>
                            <div className='col-sm-6 mt-2'>
                                <TextField
                                    label="Link with description"
                                    value={formik.values.link_description}
                                    onChange={(value) => formik.setFieldValue('link_description', value)}
                                    placeholder="Please enter link "
                                    autoComplete="off"
                                    error={formik.errors.link_description && formik.touched.link_description ? formik.errors.link_description : ''}
                                />
                            </div>
                        </div>}
                        <div className='row justify-content-center'>
                            <div className='col-sm-6 mt-2'>
                                <Select
                                    label="Slider type"
                                    options={sliderTypeOptions}
                                    placeholder="Please select sliderType"
                                    onChange={(value) => { formik.setFieldValue('slider_type', value); handleChange() }}
                                    value={formik.values.slider_type}
                                    error={formik.errors.slider_type && formik.touched.slider_type ? formik.errors.slider_type : ''}
                                />
                            </div>
                        </div>
                        <div className='row justify-content-center'>
                            <div className='col-sm-6 mt-2'>
                                {formik.values.left_min?.map((item, index) => {
                                    return (
                                        <>
                                            <div class="row d-flex justify-content-center mt-2">
                                                <div class="col-lg-2 col-md-6">
                                                    <TextField
                                                        value={formik.values.left_min[index]}
                                                        onChange={(value) => { formik.setFieldValue(`left_min.${index}`, value); }}
                                                        placeholder="L-min"
                                                        error={formik.errors?.left_min && formik.errors?.left_min[index] && formik.touched?.left_min && formik.touched?.left_min[index] ? formik.errors?.left_min[index] : ''}
                                                        type='text'
                                                        max={10}
                                                        min={1}
                                                    />
                                                </div>

                                                <div class="col-lg-2 col-md-6">
                                                    <TextField
                                                        value={formik.values.left_max[index]}
                                                        onChange={(value) => formik.setFieldValue(`left_max.${index}`, value)}
                                                        placeholder="L-max"
                                                        error={formik.errors.left_max && formik.errors.left_max[index] && formik.touched.left_max && formik.touched.left_max[index] ? formik.errors.left_max[index] : ''}
                                                        type='text'
                                                        max={10}
                                                        min={1}
                                                    />
                                                </div>

                                                <div class="col-lg-2 col-md-6">
                                                    <TextField
                                                        value={formik.values.Right_min[index]}
                                                        onChange={(value) => formik.setFieldValue(`Right_min.${[index]}`, value)}
                                                        placeholder="R-min"
                                                        error={formik.errors.Right_min && formik.errors.Right_min[index] && formik.touched.Right_min && formik.touched.Right_min[index] ? formik.errors.Right_min[index] : ''}
                                                        type='text'
                                                        max={10}
                                                        min={1}
                                                    />
                                                </div>

                                                <div class="col-lg-2 col-md-6">
                                                    <TextField
                                                        value={formik.values.Right_max[index]}
                                                        onChange={(value) => formik.setFieldValue(`Right_max.${[index]}`, value)}
                                                        placeholder='R-max'
                                                        error={formik.errors?.Right_max && formik.errors?.Right_max[index] && formik.touched?.Right_max && formik.touched?.Right_max[index] ? formik.errors?.Right_max[index] : ''}
                                                        type='text'
                                                        max={10}
                                                        min={1}
                                                    />
                                                </div>

                                                <div class="col-lg-2 col-md-6">
                                                    {formik.values.slider_type == '1' &&
                                                    <div className='sl-add-delete-icon cursor-pointer'>
                                                        <div className='cursor-pointer' onClick={() => AddRow()} style={{ pointerEvents: (formik.values.left_min).length >= '3' && 'none' }}>
                                                            <Icon
                                                                source={CirclePlusMajor}
                                                                color="base"
                                                            /></div>
                                                        <div className='cursor-pointer' aria-disabled={true} onClick={() => deleteRow(index)}>
                                                            <Icon
                                                                source={DeleteMajor}
                                                                color="critical"
                                                            /></div>
                                                    </div>}</div>
                                            </div>
                                        </>
                                    )
                                })}

                            </div>
                        </div>
                        <div className='row justify-content-center'>
                            <div className='col-sm-6 mt-2'>
                                <Select
                                    label="slider name"
                                    options={secondSliderNameOption}
                                    placeholder="Please select slider name"
                                    onChange={(value) => formik.setFieldValue('sccond_slider_type', value)}
                                    value={formik.values.sccond_slider_type}
                                    error={formik.errors.sccond_slider_type && formik.touched.sccond_slider_type ? formik.errors.sccond_slider_type : ''}
                                />
                            </div>
                        </div>
                        <div className='row justify-content-center'>
                            <div className='col-sm-6 mt-2'>
                                <div className='d-flex'>
                                    <div><label>Final Result Show</label></div>
                                    <div className='px-2 pt-1'> <ToggleSwitch width={30} height={15} handleDiameter={12} checked={formik.values.final_Result_enabled} handleChange={(value) => { formik.setFieldValue('final_Result_enabled', value); setResultEnable(value) }} /></div>
                                </div>

                            </div>
                        </div>
                        {formik.values.final_Result_enabled &&
                        <div className='row justify-content-center'>
                            <div className='col-sm-6 mt-2'>
                                <Select
                                    label="Final result"
                                    options={query_Result_options}
                                    placeholder="Please select query result"
                                    onChange={(value) => formik.setFieldValue('query_Result', value)}
                                    value={formik.values.query_Result}
                                    error={formik.errors.query_Result && formik.touched.query_Result ? formik.errors.query_Result : ''}
                                />
                            </div>
                        </div>}
                        {
                            formik.values.simulator_Type == "2" && <>
                                <div className='row justify-content-center'>
                                    <div className='col-sm-6 mt-2'>
                                        <Select
                                            label="Question type"
                                            options={question_typeOption}
                                            placeholder="Please select query result"
                                            onChange={(value) => { formik.setFieldValue('question_type', value); formik.setFieldValue('questions', [""]); formik.setFieldValue('date', [""]) }}
                                            value={formik.values.question_type}
                                            error={formik.errors.question_type && formik.touched.question_type ? formik.errors.question_type : ''}
                                        />
                                    </div>
                                </div>
                                <div className='row justify-content-center'>
                                    <div className='col-sm-6 mt-2'>
                                        {formik.values.questions?.map((item, index) => {
                                            return (
                                                <>
                                                    <div class="row d-flex justify-content-center mt-2">
                                                        <div className='col-sm-7 mt-2'>
                                                            <TextField
                                                                placeholder="Question"
                                                                value={formik.values.questions[index]}
                                                                onChange={(value) => formik.setFieldValue(`questions.${index}`, value)}
                                                                error={formik.errors.questions && formik.errors.questions[index] && formik.touched.questions && formik.touched.questions[index] ? formik.errors.questions[index] : ''}
                                                            />
                                                        </div>
                                                        <div className='col-sm-3 mt-2'>
                                                            <TextField
                                                                value={formik.values.date[index]}
                                                                onChange={(value) => formik.setFieldValue(`date.${index}`, value)}
                                                                error={formik.errors.date && formik.errors.date[index] && formik.touched.date && formik.touched.date[index] ? formik.errors.date[index] : ''}
                                                                type={formik.values.question_type == "0" && 'date'}
                                                            />
                                                        </div>
                                                        <div className='col-sm-2 mt-2'>
                                                            <div className='sl-add-delete-icon px-2 cursor-pointer'>
                                                                <div className='cursor-pointer' onClick={() => AddRow(1)} style={{ pointerEvents: (formik.values.questions).length >= '4' && 'none' }}>
                                                                    <Icon
                                                                        source={CirclePlusMajor}
                                                                        color="base"
                                                                    /></div>
                                                                <div className='cursor-pointer' aria-disabled={true} onClick={() => deleteRow(index, 1)}>
                                                                    <Icon
                                                                        source={DeleteMajor}
                                                                        color="critical"
                                                                    /></div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </>)
                                        })
                                        }
                                    </div>
                                </div>
                            </>
                        }

                        <div className='row justify-content-center'>
                            <div className='col-sm-6 mt-3 text-end'>
                                <div className='sl-add-button pb-5'>
                                    <Button loading={loader} onClick={() => formik.handleSubmit()}>Save</Button>
                                </div>
                            </div>
                        </div></>}
                </div>
            </LegacyCard >
        </div >
    )
}

export default AddsimulatorTopic