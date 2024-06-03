import { Button, LegacyCard, IndexTable, Text, Pagination, Icon, Toast } from '@shopify/polaris'
import React, { useCallback, useEffect, useState } from 'react'
import { useHistory } from 'react-router-dom';
import ToggleSwitch from '../../../components/ToggleSwitch';
import { ApiCall, GetApiCall } from '../../../helper/axios';
import { EditMinor, DeleteMinor } from '@shopify/polaris-icons';
import DeleteModal from '../../../components/DeleteModel';
import { getCookies } from '../../../helper/commonFunctions';
import Skeleton from "../../../components/Skeleton";

const Simulator = () => {
    const history = useHistory();
    const [allSimulator, setAllSimulators] = useState([])
    const [page, setpage] = useState(1)
    const [totalData, setTotalData] = useState(0)
    const [togglestate, setToggleState] = useState([])
    const [deletePopUpActive, setDeletePopUpActive] = useState(false)
    const [deleteId, setDeleteId] = useState('');
    const [saveLoader, setSaveLoader] = useState(false);
    const [active, setActive] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const [loader, setLoader] = useState(true);

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
        SimulatorList()
    }, [page])

    const SimulatorList = async () => {

        let res = await GetApiCall('GET', `/simulator-list?limit=30&page=${page}`)
        let response = res?.data
        if (response?.statusCode === 200 && response?.status == "success") {
            setAllSimulators(response?.data?.user_data)
            setTotalData(response?.data?.total_data)
        } else if (response?.statusCode === 200 && response?.status == "error") {
            setAllSimulators([])
        }
        setLoader(false)
    }

    useEffect(() => {
        if (allSimulator) {
            let arr = {}
            allSimulator.map((item) => {
                arr[item.id] = item.status == "0" ? false : true;
            })
            setToggleState(arr)
        }
    }, [allSimulator])

    const simulatorEdit = async (id) => {
        history.push({
            pathname: '/admin/simulator/topic',
            state: id
        })
    }

    const handleToggleChange = async (id) => {
        togglestate[id] = !togglestate[id];
        setToggleState({ ...togglestate })
        let res = await ApiCall('PUT', `/simulator-status-update`, {
            id: id,
            status: togglestate[id] ? "1" : "0"
        })
        if (res?.data?.statusCode === 200 && res?.data?.status == "success") {
            setActive(true)
            setToastMessage("updated successfully")
        }
    }

    const deleteSimulator = async (id) => {
        setSaveLoader(true)
        const response = await ApiCall('DELETE', `/simulator-delete`, { simulator_id: id }, [])
        // console.log(response.data, 'response');
        if (response?.data.statusCode === 200 && response?.data.status == "success") {
            SimulatorList()
            setDeletePopUpActive(!deletePopUpActive)
            setToastMessage("Deleted successfully")
            setActive(true)
            setSaveLoader(false)
        } else {
            setDeletePopUpActive(!deletePopUpActive)
            setSaveLoader(false)
        }
    }


    const handleDeletePopUp = (id, flag = false) => {
        setDeleteId(id)
        if (flag) {
            deleteSimulator(deleteId)
        } else {
            setDeletePopUpActive(!deletePopUpActive)
        }
    }

    const handleEdit = (item) => {
        history.push({
            pathname: '/admin/add-simulator',
            state: { isEdit: true, query: item.query, locale: item.locale, user_location: item.location, longtitude: item.longtitude, latitude: item.latitude, result: item.result, id: item.id, result_show : item.result_show }
        })
    }

    const rowMarkup = allSimulator?.map((item, index) => (
        <IndexTable.Row
            id={item.id}
            key={item.id}
            position={index}
        >
            <IndexTable.Cell>{page * 30 - 30 + index + 1} </IndexTable.Cell>
            <IndexTable.Cell ><spna onClick={() => simulatorEdit(item.id)} className="cursor-pointer">{item.query}</spna> </IndexTable.Cell>
            <IndexTable.Cell><ToggleSwitch width={30} height={15} handleDiameter={12} checked={togglestate[item.id]} handleChange={() => { handleToggleChange(item.id) }} /> </IndexTable.Cell>
            <IndexTable.Cell>
                <div className="d-inline-flex p-2   ">
                    <div className=" cursor-pointer px-2" onClick={() => handleEdit(item)}><Icon source={EditMinor} color="base" /></div>
                    <div className="pl-2 cursor-pointer" onClick={() => handleDeletePopUp(item.id)}> <Icon source={DeleteMinor} color="critical" /></div>
                </div></IndexTable.Cell>
        </IndexTable.Row>
    ))

    const resourceName = {
        singular: 'Simulator',
        plural: 'Simulator',
    };

    const toggleActive = useCallback(() => setActive((active) => !active), []);

    const toastMarkup = active ? (
        <Toast content={toastMessage} onDismiss={toggleActive} />
    ) : null;

    return (
        <div className="mt-2 ">
            {
                loader ? <Skeleton /> : <>
                    <div className="sl-add-button">
                        <Button onClick={() => history.push("/admin/add-simulator")}>
                            Add Simulator
                        </Button>
                    </div>
                    <LegacyCard>
                        <div className="mt-2">
                            <IndexTable
                                resourceName={resourceName}
                                itemCount={allSimulator?.length}
                                selectable={false}
                                headings={[
                                    {
                                        id: '1',
                                        title: (
                                            <Text fontWeight="bold" as="span">
                                                Sr No
                                            </Text>
                                        ),
                                    },
                                    {
                                        id: '2',
                                        title: (
                                            <Text fontWeight="bold" as="span">
                                                Query
                                            </Text>
                                        ),
                                    },
                                    {
                                        id: '3',
                                        title: (
                                            <Text fontWeight="bold" as="span">
                                                Status
                                            </Text>
                                        ),
                                    },
                                    {
                                        id: '4',
                                        title: (
                                            <Text fontWeight="bold" as="span">
                                                <span className='px-3'>Action</span>
                                            </Text>
                                        ),
                                    }
                                ]}
                            >
                                {rowMarkup}
                            </IndexTable>
                            <div className="pagination py-2">
                                {totalData ? <Pagination
                                    hasPrevious={page != 1}
                                    onPrevious={() => setpage(page == 1 ? page : page - 1)}
                                    hasNext={totalData / 30 > page}
                                    onNext={() => setpage(totalData / 30 > page ? page + 1 : page)}
                                /> : null}
                            </div>
                        </div>
                        {toastMarkup}
                        <DeleteModal deletePopUpActive={deletePopUpActive} popUpTitle='Delete simulator' loader={saveLoader} secondaryLabel='Cancel' primaryLabel={'Delete'} popUpContent={'Are you sure, you want to delete this simulator?'} handleDeletePopUp={handleDeletePopUp} />
                    </LegacyCard >
                </>
            }
        </div >
    )
}

export default Simulator