import React, { useState, useEffect, useCallback } from 'react';
import { Spinner } from 'reactstrap';
import { Link, useHistory } from "react-router-dom";
import { IndexTable, LegacyCard, Pagination, Text, Icon, Button, Tabs, Toast, Page,Badge } from '@shopify/polaris';
import { ChevronDown, Eye, Edit, Link2, CheckCircle, XCircle } from 'react-feather'
import { GetUserApiCall, UserApiCall } from '../../helper/axios';
import { EditMinor, DeleteMinor, StatusActiveMajor, CancelMajor } from '@shopify/polaris-icons';
import Header from '../../components/Header';
import UserHeader from '../../components/UserHeader';
import '../../assets/css/style.css'
import { getCookies } from '../../helper/commonFunctions';
import {logger} from "workbox-core/_private";
// import '../assets/css/react-dataTable-component.css'
// import '@styles/react/libs/tables/react-dataTable-component.scss'   

const TopicList = () => {
    let history = useHistory();
    let [topicList, setTopicList] = useState([]);
    let [userSubData, setUserSubData] = useState([]);
    let [isComplete, setIsComplete] = useState({});
    const [selected, setSelected] = useState(0);
    let [isResultAvailable, setIsResultAvailable] = useState(false);
    let [totalData, setTotalData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pageList, setPageList] = useState();
    const [rowsPerPage, setRowsPerPage] = useState(30);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [resetToastActive, setRestActiveActive] = useState(false);
    const [resetToastMessage, setRestActiveMessage] = useState('');
    const [startSimultorId, setStartSimultorId] = useState(0);
    let header = { authentication: getCookies('token') };
    // console.log('userSubData', userSubData);
    const GetTopicData = async (page = 0,language='Hindi(in)') => {
        setLoading(true)
        let res = await GetUserApiCall('GET', `/simulator-topic-list?limit=30&page=${page}&language=${language}`, header);
        if (res.data.status === 'success' && res.data.statusCode === 200) {
            const finalData = res?.data?.data?.user_data.map((item, i) => { return { ...item, srno: (page * Number(rowsPerPage)) + i + 1 } });
            const user_sub_data = res?.data?.data?.user_sub_data;
            setTopicList(finalData);
            const isAvailable = finalData.some(obj1 => user_sub_data.some(obj2 => obj1.id === obj2.simulator_id));
            setIsResultAvailable(isAvailable);
            setUserSubData(user_sub_data)
            setStartSimultorId(res?.data?.data?.start_simulator_id)
            setTotalData(res.data.data.total_data);
            const pages = Math.ceil(res.data.data.total_data / rowsPerPage)
            setTotalPages(pages)
            setLoading(false)
        } else {
            setTopicList([])
            setLoading(false)
        }
    }
    useEffect(() => {
        GetTopicData(0);
    }, []);

    const handlePageChange = useCallback((page) => {
        GetTopicData(page);
        setCurrentPage(page);
    }, [GetTopicData]);

    const resourceName = {
        singular: 'Topic',
        plural: 'Topics',
    };

    useEffect(() => {
        if (topicList.length) {
            let obj = {};
            topicList.map((topic, index) => {
                if (userSubData && userSubData.length && userSubData.some(obj2 => obj2.simulator_id === topic.id)) {
                    let user_sub_data = userSubData.filter((item) => {return item.simulator_id == topic.id});
                    let nm_outcome = user_sub_data?.[0]?.nm_outcome;
                    let sxs_outcome = user_sub_data?.[0]?.sxs_outcome;
                    obj[topic.id] = {
                      nm_outcome: nm_outcome,
                      sxs_outcome : sxs_outcome
                    };
                } else {
                    obj[topic.id] = false;
                }
            })
            setIsComplete(obj);
        }
    }, [topicList, userSubData])



    const rowMarkup = topicList?.map(
        ({ id, query, name, password,result_show }, index) => (
            <IndexTable.Row
                id={id}
                key={id}
                position={index}
            >
                <IndexTable.Cell>
                    {(currentPage * 30 - 30) + index + 1}
                </IndexTable.Cell>
                <IndexTable.Cell>
                    <span className="dropdown-link" onClick={() => history.push(`/simulator/${id}`, Object.keys(isComplete).length && isComplete[id] ? isComplete[id] : false)}>{query}</span>
                </IndexTable.Cell>
                <IndexTable.Cell>
                    {Object.keys(isComplete).length && isComplete[id] ?
                        (parseInt(isComplete[id].nm_outcome) >= 10 ) ?  <Badge status="success">{parseInt(isComplete[id].nm_outcome)} Correct</Badge> : <Badge status="critical">{(10 - parseInt(isComplete[id].nm_outcome))} Incorrect</Badge>
                        : <Badge>Incomplete</Badge>}
                </IndexTable.Cell>
                <IndexTable.Cell>
                    {Object.keys(isComplete).length && isComplete[id] ?
                        (result_show == '1') ?  (isComplete[id].sxs_outcome) ?
                            <Badge status="success">Correct</Badge> : <Badge status="critical">Incorrect</Badge>
                            :  'N/A'
                        : <Badge>Incomplete</Badge>}
                </IndexTable.Cell>
                <IndexTable.Cell className='d-flex justify-content-start'>
                    <div className='px-3'>
                        {Object.keys(isComplete).length && isComplete[id] ? <Icon source={StatusActiveMajor} color="primary" />
                            : <Icon source={CancelMajor} color="critical" />}
                    </div>
                </IndexTable.Cell>
            </IndexTable.Row>
        ),
    );

    let resetData = async () => {
        let data = {
            'type' : selected
        }
        let res = await UserApiCall('DELETE', '/simulator-reset', data, header);
        if (res.data.status === 'success' && res.data.statusCode === 200) {
            setRestActiveMessage(res.data.message)
            toggleActive();
            GetTopicData(0);
            window.scrollTo(0, 0);
        } else {
            history.push('/login')
        }
    };

    const toggleActive = useCallback(() => setRestActiveActive((resetToastActive) => !resetToastActive), []);

    const toastMarkup = resetToastActive ? (
        <Toast content={resetToastMessage} onDismiss={toggleActive} />
    ) : null;

    const handleTabChange = async (selectedTabIndex) => {
        setSelected(selectedTabIndex)
        let language = selectedTabIndex == 0 ? 'Hindi(in)' : 'English(in)';
        GetTopicData(0,language);
    }

    const tabs = [
        {
            id: 'hindi',
            content: 'Hindi',
            accessibilityLabel: 'All languages',
            panelID: 'language-1',
        },
        {
            id: 'english',
            content: 'English',
            panelID: 'language-2',
        }
    ];

    return (
        <>
            <UserHeader />
            <div className='header-padd'>
                <Page title='Simulator List' primaryAction={
                    <div className='d-flex justify-content-end gap-2'>
                        <Button default onClick={() => history.push(`/simulator/${startSimultorId}`)}>start</Button>
                        {userSubData?.length && isResultAvailable ? <Button default onClick={() => resetData()}>Reset</Button> : <></>}
                    </div>
                }>

                    <LegacyCard>
                        <Tabs tabs={tabs} selected={selected} onSelect={handleTabChange} fitted>
                            <div className="mt-2">
                                <IndexTable
                                    loading={loading}
                                    resourceName={resourceName}
                                    itemCount={topicList?.length}
                                    selectable={false}
                                    headings={[
                                        {
                                            title: (
                                                <Text fontWeight="bold" as="span">
                                                    SR NO
                                                </Text>
                                            ),
                                            alignment: 'start'
                                        },
                                        {
                                            title: (
                                                <Text fontWeight="bold" as="span">
                                                    Query
                                                </Text>
                                            ),
                                            alignment: 'center'
                                        },
                                        {
                                            title: (
                                                <Text fontWeight="bold" as="span">
                                                    NM Outcome
                                                </Text>
                                            ),
                                            alignment: 'center'
                                        },
                                        {
                                            title: (
                                                <Text fontWeight="bold" as="span">
                                                    SXS Outcome
                                                </Text>
                                            ),
                                            alignment: 'center'
                                        },
                                        {
                                            id: 'order-count',
                                            title: (
                                                <Text fontWeight="bold" as="span">
                                                    Completed
                                                </Text>
                                            ),
                                        }
                                    ]}
                                >
                                    {rowMarkup}
                                </IndexTable>
                                {totalPages > 1 ? <div className="pagination py-2">
                                    <Pagination
                                        hasPrevious={currentPage > 1}
                                        onPrevious={() => handlePageChange(currentPage - 1)}
                                        hasNext={currentPage < totalPages}
                                        onNext={() => handlePageChange(currentPage + 1)}
                                    />
                                </div> : <></>}
                            </div>
                        </Tabs>
                        {/* <DeleteModal deletePopUpActive={deletePopUpActive} popUpTitle='Delete User' loader={saveLoader} secondaryLabel='Cancel' primaryLabel={'Delete'} popUpContent={'Are you sure, you want to delete this user?'} handleDeletePopUp={handleDeletePopUp} /> */}
                    </LegacyCard>
                    {/*{toastMarkup}*/}
                </Page>
            </div>
        </>
    )
}

export default TopicList