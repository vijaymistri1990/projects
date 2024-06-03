import { Button, LegacyCard, EmptyState } from '@shopify/polaris'
import React, { useEffect, useState } from 'react'
import { useHistory, useLocation } from 'react-router-dom'
import { ApiCall, GetApiCall } from '../../../helper/axios';
import { Spinner, InputGroup } from 'reactstrap';
import QRCode from "react-qr-code";
import MultiRangeSlider, { ChangeResult } from "multi-range-slider-react";
import { ChevronRightMinor, CircleTickMinor } from '@shopify/polaris-icons';
import { RadioButton, Icon } from '@shopify/polaris';
import Nike1 from '../../../assets/img/nike-3.jpg'
import "../../../assets/css/style.css"
import { MobileBackArrowMajor } from '@shopify/polaris-icons';
import { commonApi } from '../../../helper/commanApi';
import noContent from '../../../assets/img/no-content.png'
import DeleteModal from '../../../components/DeleteModel';
import { getCookies } from '../../../helper/commonFunctions';
import Skeleton from '../../../components/Skeleton';

const Topiclist = () => {
    const history = useHistory();
    const { state } = useLocation();
    let [simulatorData, setSimulatorData] = useState([]);
    let [allSimulatorData, setAllSimulatorData] = useState([]);
    let [dummyVar, setDummyVar] = useState([]);
    let [needsRangeData, setNeedsRangeData] = useState({});
    let [eatRangeData, setEatRangeData] = useState({});
    let [loading, setLoading] = useState(true);
    let [barcodeValue, setBarcodeValue] = useState('demo');
    const weekDays = ['N/A', '', 'FailsM', '', 'SM', '', 'MM', '', 'HM', '', 'FullyM'];
    const rightWeekDays = ['N/A', '', 'Lowest', '', 'Low', '', 'Medium', '', 'High', '', 'Highest'];
    const [resultButton, setResultButton] = useState("0");
    const [value, setValue] = useState(30)
    const [loader, setLoader] = useState(false)
    const [deleteLoader, setDeleteLoader] = useState(false)
    const [locaton, setLocation] = useState([])
    let [isShowBar, setIsShowBar] = useState(false);
    const [deletePopUpActive, setDeletePopUpActive] = useState(false)
    const [saveLoader, setSaveLoader] = useState(false);
    const [deleteId, setDeleteId] = useState('');
    const [defautloading, setDefautLoading] = useState(true);

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

    const GetSimulatorData = async () => {
        setLoading(true)
        let res = await GetApiCall("GET", `/simulator-topics-list?simulator_id=${state?.state ? state.state : state}`)
        if (res.data.status === 'success' && res.data.statusCode === 200) {
            const finalData = res?.data?.data;
            // let mergeData = [];
            // finalData.map((item) => {
            //     mergeData.push({ ...item, needsMin: 0, needsMax: 0, eatMin: 0, eatMax: 0 })
            // })
            setAllSimulatorData(finalData);
            setSimulatorData(finalData);
            setLoading(false)
        } else {
            setAllSimulatorData([]);
            setSimulatorData([])
            setLoading(false)
        }
        setDefautLoading(false)
    }

    useEffect(() => {
        GetSimulatorData();
    }, [state])


    useEffect(() => {
        let thumRight = document.getElementsByClassName('thumb-right');
        var i;
        for (i = 0; i < thumRight.length; i++) {
            thumRight[i].style.display = 'none';
        }
        let barLeft = document.getElementsByClassName('bar-left');
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

    const handleSubmit = () => {
        let rightsideClassName = document.getElementsByClassName('left-bar-range');
        let newObj = {}
        if (rightsideClassName.length > 0) {
            Object.values(rightsideClassName).map((item) => {
            });
        }
    }

    const simulatorTopicDelete = async (id) => {
        setDeleteLoader(true)
        let res = await ApiCall('DELETE', '/simulator-topic-delete', { simulator_topic_id: id })
        if (res.data.status === 'success' && res.data.statusCode === 200) {
            GetSimulatorData()
            setDeletePopUpActive(!deletePopUpActive)
        } else {
            setDeletePopUpActive(!deletePopUpActive)
        }
        setDeleteLoader(false)
    }

    const handleDeletePopUp = (id, flag = false) => {
        setDeleteId(id)
        if (flag) {
            simulatorTopicDelete(deleteId)
        } else {
            setDeletePopUpActive(!deletePopUpActive)
        }
    }

    const simulatorTopicEdit = async (id, simulator_id) => {
        setLoader(true)
        history.push({
            pathname: '/admin/simulator/add-topic',
            state: { id: id, simulator_id: simulator_id, isEdit: true }
        })
        setLoader(false)
    }

    useEffect(() => {
        let arr = []
        if (allSimulatorData?.length) {
            allSimulatorData?.map((item) => {
                arr.push(item.location);
            })
        }
        setLocation(arr)
    }, [allSimulatorData])

    // console.log(locaton, 'locaton');
    return (
        <>
            <div className='d-flex mt-2 align-items-baseline'>
                <div>
                    <span className='back-button'>
                        <Button onClick={() => history.push('/admin/simulator')}><Icon source={MobileBackArrowMajor} /></Button>
                    </span>
                </div>
                <div className="mt-2 sl-add-button my-3 mx-2 ">
                    <Button onClick={() => history.push({
                        pathname: '/admin/simulator/add-topic',
                        state: { state: state, slot: locaton }
                    })} disabled={allSimulatorData?.length >= 10 ? true : false}>
                        Add simulator topic
                    </Button>
                </div>
            </div>
            {defautloading ? <Skeleton /> :
                <LegacyCard>
                    <div className='container'>
                        <div className='row query-dupes'>
                            {allSimulatorData && allSimulatorData.length ?
                                allSimulatorData.map((item, index) => {
                                    let result_data = (item && item.slider_result_json && item.slider_result_json !== '') ? JSON.parse(item.slider_result_json) : [];
                                    let meta_data = (item && item.link_meta && item.link_meta !== '') ? JSON.parse(item.link_meta) : {};
                                    let youtube_json = (item && item.youtube_json && item.youtube_json !== '') ? JSON.parse(item.youtube_json) : [];
                                    return (
                                        <div className='col-sm-6' key={index} >
                                            <div className='query-content py-3'>
                                                <h6 className='p-2'>{simulatorLocation(item.location)} - <span className='link'>select dupes</span></h6>
                                                <div className='content mx-2' style={{ pointerEvents: 'none' }}>
                                                    {item.simulator_type != 3 && item.simulator_type != 5 && item.simulator_type != 4 ? <div className='d-flex gap-2'>
                                                        <div>
                                                            <img className='favicon-image' src={Object.keys(meta_data).length ? meta_data.favicon : noContent} />
                                                        </div>
                                                        <div>
                                                            <cite className='cite-url'>{Object.keys(meta_data).length ? meta_data.ogUrl : ''}</cite>
                                                        </div>
                                                    </div> : <></>}
                                                    {item.simulator_type == 0 ?
                                                        <div className='simulagtor-type-0'>
                                                            <a className='query-title' target='_blank' href={`${Object.keys(meta_data).length ? meta_data.ogUrl : ''}`}>{Object.keys(meta_data).length ? meta_data.ogTitle : ''}</a>
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
                                                                        <a className='query-title' target='_blank' href={`${Object.keys(meta_data).length ? meta_data.ogUrl : ''}`}>{Object.keys(meta_data).length ? meta_data.ogTitle : ''}</a>
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
                                                                                        <div className='d-flex py-2 align-items-center'>
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
                                                    <div className='row' style={{ pointerEvents: 'none' }}>
                                                        <div className='col-sm-6'>
                                                            <div className={`left-side-range-${item.id} position-relative`} style={{ pointerEvents: `${isShowBar ? 'none' : ''}`, }} attribute-id={`${item.id}`}>
                                                                {isShowBar ? <div className='' style={{
                                                                    fontSize: '130px',
                                                                    color: 'deeppink',
                                                                    position: 'absolute',
                                                                    top: '-6px',
                                                                    userSelect: 'none',
                                                                    left: `1px`,
                                                                    zIndex: '999999',
                                                                }}><span>.</span></div> : ""}
                                                                <p className='range-caption'>Needs Met Rating</p>
                                                                <MultiRangeSlider
                                                                    labels={weekDays}
                                                                    min='0'
                                                                    max='10'
                                                                    barInnerColor={'yellow'}
                                                                    thumbLeftColor={'yellow'}
                                                                    thumbRightColor={'yellow'}
                                                                    // barLeftColor={isShowBar ? '#f0f0f0' : 'lime'}
                                                                    // barRightColor={isShowBar ? '#f0f0f0' : 'lime'}
                                                                    className={`left-bar-range needs id_${item.id}`}
                                                                    minValue={0}
                                                                    maxValue={0}
                                                                    step='0'
                                                                />
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
                                                                    left: `1px`,
                                                                    zIndex: '999999',
                                                                }}><span>.</span></div> : ""}
                                                                <p className='range-caption'>{item.slider_name == '1' ? 'EAT' : 'PQ'} Rating</p>
                                                                <MultiRangeSlider
                                                                    labels={rightWeekDays}
                                                                    min='0'
                                                                    max='10'
                                                                    barInnerColor={'yellow'}
                                                                    thumbLeftColor={'yellow'}
                                                                    thumbRightColor={'yellow'}
                                                                    // barLeftColor={isShowBar ? '#f0f0f0' : '#e757f7'}
                                                                    // barRightColor={isShowBar ? '#f0f0f0' : '#e757f7'}
                                                                    className={`right-side-range${item.id} eat`}
                                                                    minValue={0}
                                                                    maxValue={0}
                                                                    step='0'
                                                                />
                                                            </div>
                                                        </div>
                                                    </div> : <>
                                                        {result_data && result_data.length ?
                                                            result_data.map((result, indexItem) => {
                                                                return (
                                                                    <div className='row' key={indexItem} style={{ pointerEvents: 'none' }}>
                                                                        <div className='col-sm-6'>
                                                                            <div className={`left-side-range-multi-${item.id} position-relative`} style={{ pointerEvents: `${isShowBar ? 'none' : ''}`, }} attribute-id={`${item.id}`}>
                                                                                {isShowBar ? <div className='' style={{
                                                                                    fontSize: '130px',
                                                                                    color: 'deeppink',
                                                                                    position: 'absolute',
                                                                                    top: '-6px',
                                                                                    userSelect: 'none',
                                                                                    left: `1px`,
                                                                                    zIndex: '999999',
                                                                                }}><span>.</span></div> : ""}
                                                                                <p className='range-caption'>Needs Met Rating</p>
                                                                                <MultiRangeSlider
                                                                                    labels={weekDays}
                                                                                    min='0'
                                                                                    max='10'
                                                                                    barInnerColor={'yellow'}
                                                                                    thumbLeftColor={'yellow'}
                                                                                    thumbRightColor={'yellow'}
                                                                                    // barLeftColor={isShowBar ? '#f0f0f0' : 'lime'}
                                                                                    // barRightColor={isShowBar ? '#f0f0f0' : 'lime'}
                                                                                    className={`left-bar-range needs id_${item.id}`}
                                                                                    minValue={0}
                                                                                    maxValue={0}
                                                                                    step='0'
                                                                                // onChange={((e) => { handleMinMaxValue(e.minValue, e.maxValue, item.id, 'eat'); })}
                                                                                />
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
                                                                                    left: '1px',
                                                                                    zIndex: '999999',
                                                                                }}><span>.</span></div> : ""}
                                                                                <p className='range-caption'>{item.slider_name == '1' ? 'EAT' : 'PQ'} Rating</p>
                                                                                <MultiRangeSlider
                                                                                    labels={rightWeekDays}
                                                                                    min='0'
                                                                                    max='10'
                                                                                    barInnerColor={'yellow'}
                                                                                    thumbLeftColor={'yellow'}
                                                                                    thumbRightColor={'yellow'}
                                                                                    // barLeftColor={isShowBar ? '#f0f0f0' : '#e757f7'}
                                                                                    // barRightColor={isShowBar ? '#f0f0f0' : '#e757f7'}
                                                                                    className={`right-side-range${item.id} eat`}
                                                                                    minValue={0}
                                                                                    maxValue={0}
                                                                                    step='0'
                                                                                />
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                )
                                                            })
                                                            : <></>}
                                                    </>}
                                                {item.final_result_show == '1' && <div className='d-flex py-2 gap-2 flex-wrap row-gp-10 suggest'>
                                                    <input name="name" className='suggest-btn' type="button" value='Porn: No' />
                                                    <input name="name" className='suggest-btn' type="button" value='Foreign Language: No' />
                                                    <input name="name" className='suggest-btn' type="button" value='Did Not Lead: No' />
                                                    <input name="name" className='suggest-btn' type="button" value='Hard To Use: No' />
                                                </div>}
                                                <div className='text-end pt-3'>
                                                    {/* {console.log(item, 'item')} */}
                                                    <span className='sl-add-button px-2'><Button onClick={() => simulatorTopicEdit(item.id, item.simulator_id)} loading={loader}>Edit</Button></span>
                                                    <span><Button loading={deleteLoader} onClick={() => handleDeletePopUp(item.id)} destructive>Delete</Button></span>
                                                </div>
                                                {/* <div>
                                                <RangeCheck selectedValue={parseInt(defaultSelected[item.id]?.eat_result)} minValue={parseInt(needsRangeData[item.id]?.needsmin)} maxValue={parseInt(needsRangeData[item.id]?.needsmax)} />
                                            </div> */}
                                            </div>
                                        </div>
                                    )
                                }) :
                                <div className='justify-content-center'>
                                    <EmptyState
                                        heading="No Data Found"
                                        // action={{ content: 'Add simulator topic' }}
                                        image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
                                    >
                                        <div className="mt-2 sl-add-button my-3">
                                            <Button onClick={() => history.push({
                                                pathname: '/admin/simulator/add-topic',
                                                state: state
                                            })} disabled={allSimulatorData?.length >= 10 ? true : false}>
                                                Add simulator topic
                                            </Button>
                                        </div>
                                    </EmptyState>

                                </div>
                            }
                        </div>
                    </div>
                    <DeleteModal deletePopUpActive={deletePopUpActive} popUpTitle='Delete Topic' loader={saveLoader} secondaryLabel='Cancel' primaryLabel={'Delete'} popUpContent={'Are you sure, you want to delete this Topic?'} handleDeletePopUp={handleDeletePopUp} />
                </LegacyCard >}
        </>
    )
}

export default Topiclist