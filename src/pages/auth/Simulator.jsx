import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { InputGroup } from 'reactstrap';
import QRCode from "react-qr-code";
import MultiRangeSlider, { ChangeResult } from "multi-range-slider-react";
import { ChevronRightMinor, CircleTickMinor, MobileBackArrowMajor } from '@shopify/polaris-icons';
import { RadioButton, Icon, Button, Page, TextField, Columns, Toast, Spinner } from '@shopify/polaris';
import { GetUserApiCall, UserApiCall } from '../../helper/axios';
import noContent from '../../assets/img/no-content.png'
import '../../assets/css/style.css'
import Dashboard from './Dashboard';
import UserHeader from '../../components/UserHeader';
import { commonApi } from '../../helper/commanApi';
import { getCookies } from '../../helper/commonFunctions';
import {logger} from "workbox-core/_private";

const Simulator = () => {
    let { simulator_id } = useParams();
    let history = useHistory();
    let [simulatorData, setSimulatorData] = useState([]);
    let [allSimulatorData, setAllSimulatorData] = useState([]);
    let [defaultSelected, setDefaultSelected] = useState({});
    let [userSubData, setUserSubData] = useState([]);
    let [simulatorIdData, setSimulatorIdData] = useState([]);
    let [simulatorQueryData, setSimulatorQueryData] = useState({});
    let [needsRangeData, setNeedsRangeData] = useState({});
    let [eatRangeData, setEatRangeData] = useState({});
    let [suggestionBtn, setSuggestionBtn] = useState({});
    let [isSubmitted, setIsSubmitted] = useState(false);
    let [loading, setLoading] = useState(true);
    let [isShowBar, setIsShowBar] = useState(false);
    let [nextSimulatorId, setNextSimulatorId] = useState('');
    let [isComplete, setIsComplete] = useState({});
    let [commentBar, setCommentBar] = useState('');
    const weekDays = ['N/A', '', 'FailsM', '', 'SM', '', 'MM', '', 'HM', '', 'FullyM'];
    const rightWeekDays = ['N/A', '', 'Lowest', '', 'Low', '', 'Medium', '', 'High', '', 'Highest'];
    let header = { authentication: getCookies('token') };
    const [resultButton, setResultButton] = useState("0");
    const [UserResultButton, setUserResultButton] = useState("");
    const [submitToastActive, setSubmitActiveActive] = useState(false);
    const [submitToastMessage, setSubmitActiveMessage] = useState('');
    const handleChange = (_, newValue) => {
        setResultButton(newValue)
    };

    useEffect(() => {
        let newObj = {};
        let needsobj = {};
        let eatobj = {};
        if (isSubmitted && allSimulatorData.length && userSubData.length) {
            allSimulatorData.map((item, i) => {
                if (item.slider_result_json !== '' && JSON.parse(item.slider_result_json).length) {
                    if (item.slider_type == 0) {
                        let result = JSON.parse(item.slider_result_json)[0];
                        needsobj[item.id] = { needsmin: result.left_0_rating_result_min, needsmax: result.left_0_rating_result_max }
                        eatobj[item.id] = { eatmin: result.right_0_rating_result_min, eatmax: result.right_0_rating_result_max }
                    } else {
                        let needsarr = [];
                        let eatarr = [];
                        JSON.parse(item.slider_result_json).map((data, index) => {
                            needsarr.push({ needsmin: data[`left_${index}_rating_result_min`], needsmax: data[`left_${index}_rating_result_max`] })
                            eatarr.push({ eatmin: data[`right_${index}_rating_result_min`], eatmax: data[`right_${index}_rating_result_max`] })
                        })
                        needsobj[item.id] = needsarr
                        eatobj[item.id] = eatarr
                    }
                }
            })
            setNeedsRangeData(needsobj)
            setEatRangeData(eatobj)
            let suggestObj = {};
            if (userSubData && userSubData.length && userSubData[0].simulator_topic_result && (userSubData[0].simulator_topic_result !== '') && JSON.parse(userSubData[0].simulator_topic_result)) {
                Object.values(JSON.parse(userSubData[0].simulator_topic_result)).map((item, index) => {
                    let id = Object.keys(JSON.parse(userSubData[0].simulator_topic_result))[index];
                    newObj[id] = item.rating_result
                    suggestObj[id] = { value: item.final_result }
                })
                setDefaultSelected(newObj);
                setSuggestionBtn(suggestObj);
                setCommentBar(userSubData[0].simulator_comment);
                setResultButton(userSubData[0].simulator_result);
                if (userSubData[0].simulator_result != simulatorQueryData.result) {
                    setUserResultButton(userSubData[0].simulator_result)
                } else {
                    setUserResultButton("")
                }
            }
            setIsShowBar(true)
        }
    }, [isSubmitted, allSimulatorData, userSubData])

    useEffect(() => {
        if (simulatorData.length && !(isSubmitted)) {
            let needsObj = {};
            let EatObj = {};
            let suggestObj = {};
            simulatorData.map((item) => {
                needsObj[item.id] = { needsmin: 0, needsmax: 1 }
                EatObj[item.id] = { eatmin: 0, eatmax: 1 }
                suggestObj[item.id] = { value: 5 }
            })
            setNeedsRangeData(needsObj);
            setSuggestionBtn(suggestObj);
            setEatRangeData(EatObj);
        }
    }, [simulatorData])

    const GetSimulatorData = async (arg = 0) => {
        setLoading(true)
        let res = await GetUserApiCall('GET', `/simulator-topic-data?simulator_id=${simulator_id}`, header);
        if (res?.data?.status === 'success' && res?.data?.statusCode === 200) {
            const finalData = res?.data?.data.simulator_topics_data;
            const finalSimulatorData = res?.data?.data.simulator_data;
            const user_sub_data = res?.data?.data.user_sub_data;
            const simulator_id_data = res?.data?.data.simulator_id_data;
            setSimulatorIdData(simulator_id_data)
            if (simulator_id_data.length) {
                let indexvalue = simulator_id_data.indexOf(parseInt(simulator_id));
                if (indexvalue > -1) {
                    if (simulator_id_data[indexvalue + 1]) {
                        setNextSimulatorId(simulator_id_data[indexvalue + 1])
                    } else {
                        setNextSimulatorId('')
                    }
                }
            }

            if (user_sub_data && user_sub_data.length) {
                setIsSubmitted(user_sub_data.some(obj2 => obj2.simulator_id == simulator_id));
            } else {
                setIsSubmitted(false);
            }

            setSimulatorQueryData(finalSimulatorData)
            setUserSubData(user_sub_data);
            let mergeData = [];
            finalData.map((item) => {
                mergeData.push({ ...item, needsMin: 0, needsMax: 0, eatMin: 0, eatMax: 0 })
            })
            setAllSimulatorData(mergeData);
            setSimulatorData(finalData);
            setLoading(false)
        } else {
            setSimulatorData([]);
            setAllSimulatorData([]);
            setSimulatorQueryData({});
            setSimulatorIdData([]);
            setUserSubData([]);
            setIsShowBar(false);
            setLoading(false)
        }
    }
    useEffect(() => {
        GetSimulatorData();
    }, [simulator_id]);

    useEffect(() => {
        if (!isShowBar && !(isSubmitted)) {
            let thumRight = document.getElementsByClassName('thumb-right');
            var i;
            for (i = 0; i < thumRight.length; i++) {
                thumRight[i].style.display = 'none';
                thumRight[i].style.pointerEvents = 'none';
            }
        }
    })

    const simulatorLocation = (location) => {
        let locat;
        switch (parseInt(location)) {
            case 1:
                return locat = "L1";
            case 2:
                return locat = "L2";
            case 3:
                return locat = "L3";
            case 4:
                return locat = "L4";
            case 5:
                return locat = "L5";
            case 6:
                return locat = "R1";
            case 7:
                return locat = "R2";
            case 8:
                return locat = "R3";
            case 9:
                return locat = "R4";
            case 10:
                return locat = "R5";
        }
    }

    const handleSubmit = async () => {
        let newObj = {};
        let nm_outcome = 0;
        if (allSimulatorData.length > 0) {
            allSimulatorData.map((item, index) => {
                if (item.slider_type == 0) {
                    let db_slider_result_json = (JSON.parse(item.slider_result_json))?.[0];
                    let rightsideClassName = document.getElementsByClassName(`right-side-range-${item.id}`);
                    let leftsideClassName = document.getElementsByClassName(`left-side-range-${item.id}`);
                    if (rightsideClassName.length > 0 && leftsideClassName.length > 0) {
                        let input_right_bar_range = rightsideClassName[0]?.getElementsByTagName('input')[0]?.value;
                        let input_left_bar_range = leftsideClassName[0]?.getElementsByTagName('input')[0]?.value;
                        newObj[item.id] = {
                            needs_result: input_left_bar_range,
                            eat_result: input_right_bar_range,
                            bar_width: Object.values(rightsideClassName)[0]?.querySelector('.bar').offsetWidth
                        }
                        if(parseInt(input_left_bar_range) >= parseInt(db_slider_result_json?.left_0_rating_result_min) && parseInt(input_left_bar_range) <= parseInt(db_slider_result_json?.left_0_rating_result_max)){
                            nm_outcome++;
                        }
                    }
                } else {
                    let rightsideMultiClassName = document.getElementsByClassName(`right-side-range-multi-${item.id}`);
                    let leftsideMultiClassName = document.getElementsByClassName(`left-side-range-multi-${item.id}`);
                    if (rightsideMultiClassName.length > 0 && leftsideMultiClassName.length > 0) {
                        let input_left_bar_range = [];
                        JSON.parse(item.slider_result_json).map((data, indexItem) => {
                            input_left_bar_range.push({
                                needs_result: Object.values(leftsideMultiClassName)[indexItem].getElementsByTagName('input')[0]?.value,
                                eat_result: Object.values(rightsideMultiClassName)[indexItem].getElementsByTagName('input')[0]?.value,
                                bar_width: Object.values(rightsideMultiClassName)[indexItem].querySelector('.bar').offsetWidth
                            });
                        })
                        newObj[item.id] = input_left_bar_range;
                    }
                }
            });
            setDefaultSelected(newObj);
        }
        let needsobj = {};
        let eatobj = {};
        let arr = [];
        if (allSimulatorData.length) {
            allSimulatorData.map((item, i) => {
                if (item.slider_result_json !== '' && JSON.parse(item.slider_result_json).length) {
                    if (item.slider_type == 0) {
                        let result = JSON.parse(item.slider_result_json)[0];
                        needsobj[item.id] = { needsmin: result.left_0_rating_result_min, needsmax: result.left_0_rating_result_max }
                        eatobj[item.id] = { eatmin: result.right_0_rating_result_min, eatmax: result.right_0_rating_result_max }
                    } else {
                        let needsarr = [];
                        let eatarr = [];
                        JSON.parse(item.slider_result_json).map((data, index) => {
                            needsarr.push({ needsmin: data[`left_${index}_rating_result_min`], needsmax: data[`left_${index}_rating_result_max`] })
                            eatarr.push({ eatmin: data[`right_${index}_rating_result_min`], eatmax: data[`right_${index}_rating_result_max`] })
                        })
                        needsobj[item.id] = needsarr
                        eatobj[item.id] = eatarr
                    }
                }
                // // console.log(getAverageResult(parseInt(newObj[item.id]?.needs_result), parseInt(needsobj[item.id]?.needsmin), parseInt(needsobj[item.id]?.needsmax)), 'FASdsfdsfsfsADF')
                // if (parseInt(newObj[item.id]?.needs_result) >= parseInt(needsobj[item.id]?.needsmin) && parseInt(newObj[item.id]?.needs_result) <= parseInt(needsobj[item.id]?.needsmax)) {
                //     arr.push('1')
                //     return Math.round((parseInt(needsobj[item.id]?.needsmin) + parseInt(needsobj[item.id]?.needsmax)) / 2);
                //     // return (<h1>Pass</h1>)

                // } else {
                //     arr.push('0')
                //     return null;
                // }
            })
        }
        if (resultButton != simulatorQueryData.result) {
            setUserResultButton(resultButton)
        } else {
            setUserResultButton("")
        }
        let thumRight = document.getElementsByClassName('thumb-right');
        var i;
        for (i = 0; i < thumRight.length; i++) {
            thumRight[i].style.display = 'block';
        }
        setNeedsRangeData(needsobj)
        setEatRangeData(eatobj)
        setIsShowBar(true)
        let topic_result = {};
        if (allSimulatorData && allSimulatorData.length) {
            allSimulatorData.map((item, index) => {
                topic_result[item.id] = {
                    rating_result: newObj[item.id],
                    final_result: suggestionBtn[item.id]?.value
                }
            })
        }
        let sxs_outcome = '';
        if(simulatorQueryData?.result_show == '1'){
            if(simulatorQueryData?.result === parseInt(resultButton)){
                sxs_outcome = 1;
            }else{
                sxs_outcome = 0;
            }
        }
        let data = {
            simulator_id: simulator_id,
            simulator_result: simulatorQueryData?.result_show == '1' ? resultButton : '',
            type : (simulatorQueryData?.locale == "Hindi(in)") ? 0 : 1,
            sxs_outcome : sxs_outcome,
            nm_outcome : nm_outcome,
            simulator_comment: commentBar,
            simulator_topic_result: topic_result
        }
        let res = await UserApiCall('POST', '/simulator-topic-sub-data', data, header);
        if (res.data.status === 'success' && res.data.statusCode === 200) {
            setSubmitActiveMessage(res?.data?.message)
            toggleActive();
            window.scrollTo(0, 0);
        }
    }

    const toggleActive = useCallback(() => setSubmitActiveActive((submitToastActive) => !submitToastActive), []);

    const toastMarkup = submitToastActive ? (
        <Toast content={submitToastMessage} onDismiss={toggleActive} />
    ) : null;

    function getAverageResult(selectedValue, minValue, maxValue, text) {
        if (isShowBar) {
            if (selectedValue >= minValue && selectedValue <= maxValue) {
                return (<h1 className='pass-text'>{text}: Pass</h1>);
            } else {
                return (<h1 className='fail-text'>{text}: Fail</h1>);
            }
        } else {
            return null;
        }
    }

    const handleNext = () => {
        if (nextSimulatorId && nextSimulatorId != '') {
            history.push(`/simulator/${nextSimulatorId}`)
            setIsShowBar(false);
            setCommentBar('');
            setResultButton(0);
        }
    }

    const handleColor = (value, result, flag) => {
        if (!isShowBar && value == flag) {
            return 'lime';
        } else if (isShowBar && result && (value != result) && value == flag) {
            return 'red';
        } else if (isShowBar && result && (value == result) && value == flag) {
            return 'lime';
        } else if (isShowBar && result && result == flag) {
            return 'lime';
        } else {
            return 'none';
        }
    }

    return (
        <>
            {loading ? <div className='m-auto p-1 d-flex justify-content-center align-items-center app-loader'>
                <Spinner size="large" />
            </div>
                :
                <>
                    <UserHeader />
                    <div className='header-padd'>
                        <div className='container'>
                            <div className='d-flex justify-content-between'>
                                <div className='d-flex gap-3 align-items-center'>
                                    <span className='back-button'><Button onClick={() => { history.push('/topic-list'); }}><Icon source={MobileBackArrowMajor} /></Button></span>
                                    <span className='custom-navigate-header'>Simulator</span>
                                </div>
                                <div>
                                    {isShowBar && nextSimulatorId && nextSimulatorId != '' ? <Button onClick={() => handleNext()}>
                                        Next
                                    </Button> : <></>}
                                </div>
                            </div>
                            <Dashboard simulatorQueryData={simulatorQueryData} />
                            <div className='row query-dupes'>
                                {allSimulatorData && allSimulatorData.length ?
                                    allSimulatorData.map((item, index) => {
                                        let result_data = (item && item.slider_result_json && item.slider_result_json !== '') ? JSON.parse(item.slider_result_json) : [];
                                        let meta_data = (item && item.link_meta && item.link_meta !== '') ? JSON.parse(item.link_meta) : {};
                                        let youtube_json = (item && item.youtube_json && item.youtube_json !== '') ? JSON.parse(item.youtube_json) : [];
                                        return (
                                            <div className='col-sm-6' key={index}>
                                                <div className='query-content py-3'>
                                                    <h6 className='p-2'>{simulatorLocation(item.location)} - <span className='link'>select dupes</span></h6>
                                                    <div className='content mx-2'>
                                                        {item.simulator_type != 3 && item.simulator_type != 5 && item.simulator_type != 4 ? <div className='d-flex gap-2'>
                                                            <div>
                                                                <img className='favicon-image' src={Object.keys(meta_data).length ? meta_data.favicon : noContent} />
                                                            </div>
                                                            <div>
                                                                <cite className='cite-url'>{Object.keys(meta_data).length && meta_data?.ogUrl ? (meta_data?.ogUrl?.length) ? meta_data?.ogUrl.length > 50 ? meta_data?.ogUrl.substring(0, 50) + '...' : meta_data?.ogUrl : '' : meta_data?.requestUrl}</cite>
                                                            </div>
                                                        </div> : <></>}
                                                        {item.simulator_type == 0 ?
                                                            <div className='simulagtor-type-0'>
                                                                <a className='query-title' target='_blank' href={`${Object.keys(meta_data).length && meta_data?.ogUrl ? meta_data.ogUrl : meta_data?.requestUrl}`}>{Object.keys(meta_data).length ? meta_data.ogTitle : ''}</a>
                                                                <p className='query-description'>{Object.keys(meta_data).length ? meta_data.ogDescription : ''}</p>
                                                            </div>
                                                            : item.simulator_type == 1 ?
                                                                <div className='simulator-type-1'>
                                                                    <a className='query-title' target='_blank' href={`${Object.keys(meta_data).length ? meta_data.ogUrl : ''}`}>{Object.keys(meta_data).length ? meta_data.ogTitle : ''}</a>
                                                                    <div className='d-flex py-2 align-items-center'>
                                                                        <img className='youtube-video-preview' src={`${Object.keys(meta_data).length ? meta_data?.ogImage?.url : ''}`} />
                                                                        <div className='px-2'>
                                                                            <span></span>
                                                                            <div>
                                                                                <span className='youtube-content'>{meta_data.ogDescription}</span>
                                                                                <div className='d-flex py-2 align-items-center'>
                                                                                    <h6>{meta_data.ogSiteName}  · </h6>
                                                                                    <span>&nbsp;{meta_data.ogDate}</span>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div> : item.simulator_type == 2 ?
                                                                    <div className='simulator-type-2'>
                                                                        <div>
                                                                            <a className='query-title' target='_blank' href={`${Object.keys(meta_data).length ? meta_data.ogUrl : ''}`}>{Object.keys(meta_data).length ? meta_data.ogTitle : ''}</a>
                                                                        </div>
                                                                        <p className='query-description'>{Object.keys(meta_data).length ? meta_data.ogDescription : ''}</p>
                                                                        <hr className='hr-border-bottom' />
                                                                        <div className={`horizontal-quetion-bar ${item.question_type == 1 ? 'd-flex justify-content-between gap-2' : ""}`}>
                                                                            {item.questions_json && item.questions_json !== "" ? JSON.parse(item.questions_json) ?
                                                                                JSON.parse(item.questions_json).map((data, i) => {
                                                                                    if (item.question_type == 0) {
                                                                                        return (
                                                                                            <div key={i}>
                                                                                                <div className='verticle-quetion-bar d-flex justify-content-between'>
                                                                                                    <div className='d-block'>
                                                                                                        <p>{data.questions}</p>
                                                                                                        <p>{data.date}</p>
                                                                                                    </div>
                                                                                                    <div className='d-flex align-items-center'>
                                                                                                        <Icon source={ChevronRightMinor} color="base" />
                                                                                                    </div>
                                                                                                </div>
                                                                                                <hr className='hr-border-bottom' />
                                                                                            </div>
                                                                                        )
                                                                                    } else {
                                                                                        return (
                                                                                            <div key={i}>
                                                                                                <div className='horizontal-quetions w-100'>
                                                                                                    <div className='d-flex'>
                                                                                                        {i == 0 && <div className='d-flex'>
                                                                                                            <Icon source={CircleTickMinor} color="primary" />
                                                                                                            <span style={{ color: 'rgb(0 128 96)' }}>Top answer - &nbsp;</span>
                                                                                                        </div>}
                                                                                                        <span className='votes'>{data.vote} votes</span>
                                                                                                    </div>
                                                                                                    <p className='overflow-questions'>{data.questions}</p>
                                                                                                </div>
                                                                                            </div>
                                                                                        )
                                                                                    }
                                                                                })
                                                                                : "" : ''}
                                                                        </div>
                                                                    </div>
                                                                    : item.simulator_type == 3 ?
                                                                        <div className='simulator-type-3'>
                                                                            <p className='link-with-description'>{item.link_with_description ? item.link_with_description : ''}</p>
                                                                            <div className='d-flex gap-2'>
                                                                                <div>
                                                                                    <img className='favicon-image' src={Object.keys(meta_data).length ? meta_data.favicon : noContent} />
                                                                                </div>
                                                                                <div>
                                                                                    <cite className='cite-url'>{Object.keys(meta_data).length ? meta_data.ogUrl : ''}</cite>
                                                                                </div>
                                                                            </div>
                                                                            <a className='description-query-title' target='_blank' href={`${Object.keys(meta_data).length ? meta_data.ogUrl : ''}`}>{Object.keys(meta_data).length ? meta_data.ogTitle : ''}</a>
                                                                        </div> : item.simulator_type == 5 ?
                                                                            <div className='simulator-type-5'>
                                                                                <div className='d-flex py-2'>
                                                                                    <img className='scrb-img' src={`${commonApi}${item.scrb_link}`} />
                                                                                </div>
                                                                            </div>
                                                                            : item.simulator_type == 4 ? <div className='simulator-type-4'>
                                                                                <div className='d-flex gap-2'>
                                                                                    <div>
                                                                                        <img className='favicon-image' src={youtube_json.length ? youtube_json[0].video_meta.favicon : noContent} />
                                                                                    </div>
                                                                                    <div>
                                                                                        <cite className='cite-url'>{youtube_json.length ? youtube_json[0].video_meta.ogUrl : ''}</cite>
                                                                                    </div>
                                                                                </div>
                                                                                <div className='scrb-youtube-video'>
                                                                                    <img className='scrb-youtube-video-preview scrb-img' src={`${youtube_json.length ? youtube_json[0].video_meta?.ogImage?.url : ''}`} />
                                                                                    <div className="scrb-youtube-icon">
                                                                                        <svg focusable="false" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                                                                                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"></path>
                                                                                        </svg>
                                                                                    </div>
                                                                                </div>
                                                                                {youtube_json && youtube_json.length ?
                                                                                    youtube_json.slice(1).map((meta, index) => {
                                                                                        return (
                                                                                            <div className='d-flex py-2 align-items-center' key={index}>
                                                                                                <img className='youtube-video-preview' src={`${meta ? meta.video_meta?.ogImage?.url : ''}`} />

                                                                                                <div className='px-2'>
                                                                                                    <span></span>
                                                                                                    <div>
                                                                                                        <span className='youtube-content'>{meta.video_meta.ogDescription}</span>
                                                                                                        <div className='d-flex py-2 align-items-center'>
                                                                                                            <h6>{meta.video_meta.ogSiteName}  · </h6>
                                                                                                            <span>&nbsp;{meta.video_meta.ogDate}</span>
                                                                                                        </div>
                                                                                                    </div>
                                                                                                </div>
                                                                                            </div>
                                                                                        )
                                                                                    }) : <></>}
                                                                            </div> : <div className='simulator-type-1'>
                                                                                <a className='query-title' target='_blank' href={`${Object.keys(meta_data).length ? meta_data.ogUrl : ''}`}>{Object.keys(meta_data).length ? meta_data.ogTitle : ''}</a>
                                                                                <div className='d-flex py-2'>
                                                                                    <img className='youtube-video-preview' src={`${Object.keys(meta_data).length ? meta_data?.ogImage?.url : ''}`} />
                                                                                    <div className='px-2'>
                                                                                        <span></span>
                                                                                        <div>
                                                                                            <span className='youtube-content'>{meta_data.ogDescription}</span>
                                                                                            <div className='d-flex py-2'>
                                                                                                <h6>{meta_data.ogSiteName}  · </h6>
                                                                                                <span>&nbsp;{meta_data.ogDate}</span>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </div>}
                                                        <div className='d-flex justify-content-start padd-2'>
                                                            <QRCode
                                                                size={64}
                                                                style={{ height: "64px", width: "64px" }}
                                                                value={Object.keys(meta_data).length && meta_data?.ogUrl ? meta_data?.ogUrl : ''}
                                                                viewBox={`0 0 64 64`}
                                                            />
                                                        </div>

                                                    </div>
                                                    <hr />
                                                    {item.slider_type == 0 ?
                                                        <div className='row'>
                                                            <div className='col-sm-6'>
                                                                <div className={`left-side-range-${item.id} position-relative`} style={{ pointerEvents: `${isShowBar ? 'none' : ''}`, }} attribute-id={`${item.id}`}>
                                                                    {isShowBar ? <div className='' style={{
                                                                        fontSize: '130px',
                                                                        color: 'deeppink',
                                                                        position: 'absolute',
                                                                        top: '-6px',
                                                                        userSelect: 'none',
                                                                        left: `${defaultSelected[item.id] ? ((parseInt(defaultSelected[item.id]?.needs_result) * (parseInt(defaultSelected[item.id].bar_width) / 10)) - 5) : 0}px`,
                                                                        zIndex: '999999',
                                                                    }}><span>.</span></div> : ""}
                                                                    <p className='range-caption'>Needs Met Rating</p>
                                                                    <MultiRangeSlider
                                                                        labels={weekDays}
                                                                        min='0'
                                                                        max='10'
                                                                        barInnerColor={isShowBar ? 'yellow' : '#f0f0f0'}
                                                                        thumbLeftColor={'yellow'}
                                                                        thumbRightColor={'yellow'}
                                                                        barLeftColor={isShowBar ? '#f0f0f0' : 'yellow'}
                                                                        barRightColor={isShowBar ? '#f0f0f0' : 'yellow'}
                                                                        // className={`left-bar-range needs id_${item.id}`}
                                                                        minValue={parseInt(needsRangeData[item.id]?.needsmin) || 0}
                                                                        maxValue={isShowBar ? parseInt(needsRangeData[item.id]?.needsmax) : null}
                                                                        step='0'
                                                                    // onChange={((e) => { handleMinMaxValue(e.minValue, e.maxValue, item.id, 'eat'); })}
                                                                    />
                                                                    {getAverageResult(parseInt(defaultSelected[item.id]?.needs_result), parseInt(needsRangeData[item.id]?.needsmin), parseInt(needsRangeData[item.id]?.needsmax), 'Needs Met Score')}
                                                                </div>
                                                            </div>
                                                            <div className='col-sm-6'>
                                                                <div className={`right-side-range-${item.id} position-relative`} style={{ pointerEvents: `${isShowBar ? 'none' : ''}` }} attribute-id={`${item.id}`}>
                                                                    {isShowBar ? <div style={{
                                                                        fontSize: '130px',
                                                                        color: 'deeppink',
                                                                        position: 'absolute',
                                                                        userSelect: 'none',
                                                                        top: '-6px',
                                                                        left: `${defaultSelected[item.id] ? ((parseInt(defaultSelected[item.id]?.eat_result) * parseInt(parseInt(defaultSelected[item.id].bar_width) / 10)) - 5) : 0}px`,
                                                                        zIndex: '999999',
                                                                    }}><span>.</span></div> : ""}
                                                                    <p className='range-caption'>{item.slider_name == '1' ? 'EAT' : 'PQ'} Rating</p>
                                                                    <MultiRangeSlider
                                                                        labels={rightWeekDays}
                                                                        min='0'
                                                                        max='10'
                                                                        barInnerColor={isShowBar ? 'yellow' : '#f0f0f0'}
                                                                        thumbLeftColor={'yellow'}
                                                                        thumbRightColor={'yellow'}
                                                                        barLeftColor={isShowBar ? '#f0f0f0' : 'yellow'}
                                                                        barRightColor={isShowBar ? '#f0f0f0' : 'yellow'}
                                                                        // className={`right-side-range${item.id} eat`}
                                                                        minValue={parseInt(eatRangeData[item.id]?.eatmin) || 0}
                                                                        maxValue={isShowBar ? parseInt(eatRangeData[item.id]?.eatmax) : null}
                                                                        step='0'
                                                                    // onInput={(e) => { handleMinMaxValue(e.minValue, e.maxValue, index, 'eat'); }}
                                                                    // onChange={((e) => { handleMinMaxValue(e.minValue, e.maxValue, item.id, 'eat'); })}
                                                                    />
                                                                    {getAverageResult(parseInt(defaultSelected[item.id]?.eat_result), parseInt(eatRangeData[item.id]?.eatmin), parseInt(eatRangeData[item.id]?.eatmax), item.slider_name == '1' ? 'EAT Rating Score' : 'PQ Rating Score')}
                                                                </div>
                                                            </div>
                                                        </div> : <>
                                                            {result_data && result_data.length ?
                                                                result_data.map((result, indexItem) => {
                                                                    return (
                                                                        <div className='row' key={indexItem}>
                                                                            <div className='col-sm-6'>
                                                                                <div className={`left-side-range-multi-${item.id} position-relative`} style={{ pointerEvents: `${isShowBar ? 'none' : ''}`, }} attribute-id={`${item.id}`}>
                                                                                    {isShowBar ? <div className='' style={{
                                                                                        fontSize: '130px',
                                                                                        color: 'deeppink',
                                                                                        position: 'absolute',
                                                                                        top: '-6px',
                                                                                        userSelect: 'none',
                                                                                        left: `${defaultSelected[item.id] && defaultSelected[item.id][indexItem] ? (parseInt(defaultSelected[item.id][indexItem].needs_result) * (parseInt(defaultSelected[item.id][indexItem].bar_width) / 10)) : 0}px`,
                                                                                        zIndex: '999999',
                                                                                    }}><span>.</span></div> : ""}
                                                                                    <p className='range-caption'>Needs Met Rating</p>
                                                                                    <MultiRangeSlider
                                                                                        labels={weekDays}
                                                                                        min='0'
                                                                                        max='10'
                                                                                        barInnerColor={isShowBar ? 'yellow' : '#f0f0f0'}
                                                                                        thumbLeftColor={'yellow'}
                                                                                        thumbRightColor={'yellow'}
                                                                                        barLeftColor={isShowBar ? '#f0f0f0' : 'yellow'}
                                                                                        barRightColor={isShowBar ? '#f0f0f0' : 'yellow'}
                                                                                        // className={`left-bar-range needs id_${item.id}`}
                                                                                        minValue={needsRangeData[item.id] && needsRangeData[item.id][indexItem] ? parseInt(needsRangeData[item.id][indexItem]?.needsmin) : 0}
                                                                                        maxValue={isShowBar && needsRangeData[item.id] && needsRangeData[item.id][indexItem] ? parseInt(needsRangeData[item.id][indexItem]?.needsmax) : null}
                                                                                        step='0'
                                                                                    // onChange={((e) => { handleMinMaxValue(e.minValue, e.maxValue, item.id, 'eat'); })}
                                                                                    />
                                                                                    {getAverageResult(defaultSelected[item.id] && defaultSelected[item.id][indexItem] ? (parseInt(defaultSelected[item.id][indexItem].needs_result)) : 0, needsRangeData[item.id] && needsRangeData[item.id][indexItem] ? parseInt(needsRangeData[item.id][indexItem]?.needsmin) : 0, needsRangeData[item.id] && needsRangeData[item.id][indexItem] ? parseInt(needsRangeData[item.id][indexItem]?.needsmax) : 0, 'Needs Met Score')}
                                                                                </div>
                                                                            </div>
                                                                            <div className='col-sm-6'>
                                                                                <div className={`right-side-range-multi-${item.id} position-relative`} style={{ pointerEvents: `${isShowBar ? 'none' : ''}` }} attribute-id={`${item.id}`}>
                                                                                    {isShowBar ? <div style={{
                                                                                        fontSize: '130px',
                                                                                        color: 'deeppink',
                                                                                        position: 'absolute',
                                                                                        userSelect: 'none',
                                                                                        top: '-6px',
                                                                                        left: `${defaultSelected[item.id] && defaultSelected[item.id][indexItem] ? (parseInt(defaultSelected[item.id][indexItem].eat_result) * parseInt(parseInt(defaultSelected[item.id][indexItem].bar_width) / 10)) : 0}px`,
                                                                                        zIndex: '999999',
                                                                                    }}><span>.</span></div> : ""}
                                                                                    <p className='range-caption'>{item.slider_name == '1' ? 'EAT' : 'PQ'} Rating</p>
                                                                                    <MultiRangeSlider
                                                                                        labels={rightWeekDays}
                                                                                        min='0'
                                                                                        max='10'
                                                                                        barInnerColor={isShowBar ? 'yellow' : '#f0f0f0'}
                                                                                        thumbLeftColor={'yellow'}
                                                                                        thumbRightColor={'yellow'}
                                                                                        barLeftColor={isShowBar ? '#f0f0f0' : 'yellow'}
                                                                                        barRightColor={isShowBar ? '#f0f0f0' : 'yellow'}
                                                                                        // className={`right-side-range${item.id} eat`}
                                                                                        minValue={eatRangeData[item.id] && eatRangeData[item.id][indexItem] ? parseInt(eatRangeData[item.id][indexItem]?.eatmin) : 0}
                                                                                        QmaxValue={isShowBar && eatRangeData[item.id] && eatRangeData[item.id][indexItem] ? parseInt(eatRangeData[item.id][indexItem]?.eatmax) : null}
                                                                                        step='0'
                                                                                    />
                                                                                    {getAverageResult(defaultSelected[item.id] && defaultSelected[item.id][indexItem] ? (parseInt(defaultSelected[item.id][indexItem].eat_result)) : 0, eatRangeData[item.id] && eatRangeData[item.id][indexItem] ? parseInt(eatRangeData[item.id][indexItem]?.eatmin) : 0, eatRangeData[item.id] && eatRangeData[item.id][indexItem] ? parseInt(eatRangeData[item.id][indexItem]?.eatmax) : 0, item.slider_name == '1' ? 'EAT Rating Score' : 'PQ Rating Score')}
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    )
                                                                })
                                                                : <></>}
                                                        </>}
                                                    {item.final_result_show == '1' && <div className='d-flex py-2 gap-2 flex-wrap row-gp-10 suggest'>
                                                        <input name="name" className='suggest-btn' type="button" value='Porn: No' style={{ backgroundColor: `${handleColor(suggestionBtn[item.id]?.value, item.final_result, 1)}` }} disabled={(isShowBar || suggestionBtn[item.id]?.value == 2 || suggestionBtn[item.id]?.value == 3 || suggestionBtn[item.id]?.value == 4)} onClick={() => {
                                                            let arr = { ...suggestionBtn };
                                                            arr[item.id].value = 1;
                                                            setSuggestionBtn(arr);
                                                        }} />
                                                        <input name="name" className='suggest-btn' type="button" value='Foreign Language: No' style={{ backgroundColor: `${handleColor(suggestionBtn[item.id]?.value, item.final_result, 2)}` }} disabled={(isShowBar || suggestionBtn[item.id]?.value == 1 || suggestionBtn[item.id]?.value == 3 || suggestionBtn[item.id]?.value == 4)} onClick={() => {
                                                            let arr = { ...suggestionBtn };
                                                            arr[item.id].value = 2;
                                                            setSuggestionBtn(arr);
                                                        }} />
                                                        <input name="name" className='suggest-btn' type="button" value='Did Not Lead: No' style={{ backgroundColor: `${handleColor(suggestionBtn[item.id]?.value, item.final_result, 3)}` }} disabled={(isShowBar || suggestionBtn[item.id]?.value == 1 || suggestionBtn[item.id]?.value == 2 || suggestionBtn[item.id]?.value == 4)} onClick={() => {
                                                            let arr = { ...suggestionBtn };
                                                            arr[item.id].value = 3;
                                                            setSuggestionBtn(arr);
                                                        }} />
                                                        <input name="name" className='suggest-btn' type="button" value='Hard To Use: No' style={{ backgroundColor: `${handleColor(suggestionBtn[item.id]?.value, item.final_result, 4)}` }} disabled={(isShowBar || suggestionBtn[item.id]?.value == 1 || suggestionBtn[item.id]?.value == 2 || suggestionBtn[item.id]?.value == 3)} onClick={() => {
                                                            let arr = { ...suggestionBtn };
                                                            arr[item.id].value = 4;
                                                            setSuggestionBtn(arr);
                                                        }} />
                                                    </div>}

                                                    <div>
                                                        {/* <RangeCheck selectedValue={parseInt(defaultSelected[item.id]?.eat_result)} minValue={parseInt(needsRangeData[item.id]?.needsmin)} maxValue={parseInt(needsRangeData[item.id]?.needsmax)} /> */}

                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    }) : ''}
                                {
                                    simulatorQueryData?.result_show == '1' &&
                                    <div>
                                        <div className="row seven-cols">
                                            <div className="col-md-1" style={{ backgroundColor: '#bfffc0', border: `${isShowBar && UserResultButton != '' && UserResultButton == 0 ? '3px solid red' : isShowBar && simulatorQueryData.result == 0 ? '3px solid #009f07' : 'none'}` }}>
                                                <p>much better</p>
                                                <RadioButton
                                                    checked={resultButton == 0}
                                                    id={"0"}
                                                    name="radio"
                                                    onChange={handleChange}
                                                />
                                            </div>
                                            <div className="col-md-1" style={{ backgroundColor: '#d5ffd5', border: `${isShowBar && UserResultButton != '' && UserResultButton == 1 ? '3px solid red' : isShowBar && simulatorQueryData.result == 1 ? '3px solid #009f07' : 'none'}` }}>
                                                <p>better</p>
                                                <RadioButton
                                                    checked={resultButton == 1}
                                                    id={"1"}
                                                    name="radio"
                                                    onChange={handleChange}
                                                />
                                            </div>
                                            <div className="col-md-1" style={{ backgroundColor: '#e9ffea', border: `${isShowBar && UserResultButton != '' && UserResultButton == 2 ? '3px solid red' : isShowBar && simulatorQueryData.result == 2 ? '3px solid #009f07' : 'none'}` }}>
                                                <p>slightly better</p>
                                                <RadioButton
                                                    checked={resultButton == 2}
                                                    id={"2"}
                                                    name="radio"
                                                    onChange={handleChange}
                                                />
                                            </div>
                                            <div className="col-md-1" style={{ backgroundColor: '#fffdfd', border: `${isShowBar && UserResultButton != '' && UserResultButton == 3 ? '3px solid red' : isShowBar && simulatorQueryData.result == 3 ? '3px solid #009f07' : 'none'}` }}>
                                                <p>about the same</p>
                                                <RadioButton
                                                    checked={resultButton == 3}
                                                    id={"3"}
                                                    name="radio"
                                                    onChange={handleChange}
                                                />
                                            </div>
                                            <div className="col-md-1" style={{ backgroundColor: '#e9ffea', border: `${isShowBar && UserResultButton != '' && UserResultButton == 4 ? '3px solid red' : isShowBar && simulatorQueryData.result == 4 ? '3px solid #009f07' : 'none'}` }}>
                                                <p>slightly better</p>
                                                <RadioButton
                                                    checked={resultButton == 4}
                                                    id={"4"}
                                                    name="radio"
                                                    onChange={handleChange}
                                                />
                                            </div>
                                            <div className="col-md-1" style={{ backgroundColor: '#d5ffd5', border: `${isShowBar && UserResultButton != '' && UserResultButton == 5 ? '3px solid red' : isShowBar && simulatorQueryData.result == 5 ? '3px solid #009f07' : 'none'}` }}>
                                                <p>better</p>
                                                <RadioButton
                                                    checked={resultButton == 5}
                                                    id={"5"}
                                                    name="radio"
                                                    onChange={handleChange}
                                                />
                                            </div>
                                            <div className="col-md-1" style={{ backgroundColor: '#bfffc0', border: `${isShowBar && UserResultButton != '' && UserResultButton == 6 ? '3px solid red' : isShowBar && simulatorQueryData.result == 6 ? '3px solid #009f07' : 'none'}` }}>
                                                <p>much better</p>
                                                <RadioButton
                                                    checked={resultButton == 6}
                                                    id={"6"}
                                                    name="radio"
                                                    onChange={handleChange}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                }
                                <div className='py-2'>
                                    <Columns gap="2" columns={['twoThirds', 'oneThird']}>
                                        <TextField
                                            label="What makes your prefered side better ?"
                                            value={commentBar}
                                            onChange={(value) => { setCommentBar(value); }}
                                            multiline={2}
                                            autoComplete="off"
                                        />
                                    </Columns>

                                </div>

                                <div className='d-flex justify-content-end py-2'>
                                    <Button primary disabled={isShowBar} onClick={handleSubmit}>
                                        Submit
                                    </Button>
                                </div>
                                {/*{toastMarkup}*/}
                            </div>
                        </div>
                    </div>
                </>
            }
        </>
    )
}

export default Simulator