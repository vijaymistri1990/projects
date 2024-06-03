import React, {useState, useEffect, useCallback} from 'react';
import axios from 'axios';
import {
    Page,
    Layout,
    LegacyCard,
    IndexTable,
    Button,
    useIndexResourceState,
    Badge,
    Text,
    Modal, Select, TextField
} from '@shopify/polaris';
import UserHeader from '../../components/UserHeader';
import {getCookies} from "../../helper/commonFunctions";
import {GetUserApiCall, UserApiCall} from "../../helper/axios";
import {useFormik} from "formik";
import * as Yup from "yup";
import {EditMinor} from "@shopify/polaris-icons";

function WorkHourList() {
    const [performanceData, setPerformanceData] = useState([]);
    const [loading, setLoading] = useState(false);
    let header = { authentication: getCookies('token') };
    const [active, setActive] = useState(false);
    const [selectMonth , setSelectMonth] = useState('');
    const [resultId, setResultId] = useState(0);
    const [modalLoder, setModalLoader] = useState(false);

    const GetPerformanceData = async () => {
        setLoading(true)
        let res = await GetUserApiCall('GET', `/work-sheet`, header);
        if (res.data.status === 'success' && res.data.statusCode === 200) {
            const finalData = res?.data?.data;
            if(finalData.length){
                finalData.map((item)=>{
                    switch(item.month) {case 1:item.month_name = 'January';break;case 2:item.month_name = 'February';break;case 3:item.month_name = 'March';break;case 4:item.month_name = 'April';break;case 5:item.month_name = 'May';break;case 6:item.month_name = 'June';break;case 7:item.month_name = 'July';break;case 8:item.month_name = 'August';break;case 9:item.month_name = 'September';break;case 10:item.month_name = 'October';break;case 11:item.month_name = 'November';break;case 12:item.month_name = 'December';break;default:break;}
                    return item;
                });
                setPerformanceData(finalData);
            }
            setLoading(false)
        } else {
            setPerformanceData([])
            setLoading(false)
        }
    };

    const handleChange = useCallback(() => {
        formik.setFieldValue('result','');
        setActive(!active)
    }, [active]);

    useEffect(()=>{
        GetPerformanceData();
    },[])

    const saveResult = async (value) => {
        setModalLoader(true);
        if(resultId){
            let data = {
                id : resultId,
                result : formik.values.result
            };
            let res = await UserApiCall('PUT', '/work-sheet', data, header);
            if (res.data.status === 'success' && res.data.statusCode === 200) {
                setResultId(0)
                setActive(!active);
                GetPerformanceData();
            }
        }
        setModalLoader(false);
    }

    const formik = useFormik({
        initialValues: {result : ''},
        validationSchema: Yup.object().shape({result: Yup.string().required('Result is required.')}),
        enableReinitialize: true,
        validateOnChange: false,
        validateOnBlur: false,
        onSubmit: (values) => {
            saveResult(values);
        }
    });


    const rowMarkup = performanceData?.map(
        (
            { id, month_name, result, month },
            index,
        ) => (
            <IndexTable.Row
                id={id}
                key={id}
                position={index}
            >
                <IndexTable.Cell>
                    {index + 1}
                </IndexTable.Cell>
                <IndexTable.Cell>{month_name}</IndexTable.Cell>
                <IndexTable.Cell>{(result) ? result : '-'}</IndexTable.Cell>
                <IndexTable.Cell>{<EditMinor id={`editReult${index}`} className='cursor-pointer' fill='#5C5F62' height={15} width={15} onClick={() => {
                    setSelectMonth(month_name)
                    setActive(true)
                    formik.setFieldValue('result',result)
                    setResultId(id)
                }} />}</IndexTable.Cell>
            </IndexTable.Row>
        ),
    );

    return (
        <>
            <UserHeader />
            <div className='header-padd'>
                <Page title='Work Hour List'>
                    <Layout>
                        <Layout.Section>
                            <LegacyCard>
                                <IndexTable
                                    loading={loading}
                                    itemCount={performanceData.length}
                                    selectable={false}
                                    headings={[
                                        { title: 'SR NO' },
                                        { title: 'Month' },
                                        { title: 'Result' },
                                        { title: 'Action' }
                                    ]}
                                >
                                    {rowMarkup}
                                </IndexTable>
                            </LegacyCard>
                        </Layout.Section>
                    </Layout>
                </Page>
            </div>
            <Modal
                open={active}
                onClose={handleChange}
                title="Update Work Sheet"
                primaryAction={{
                    content: 'Save',
                    loading : modalLoder,
                    onAction: formik.handleSubmit
                }}
            >
                <Modal.Section>
                    <div className="perfomance_data">
                        <Select
                            label="Month"
                            options={[
                                {label: selectMonth, value: 1},
                            ]}
                            className="month_sheets"
                        />
                        <TextField
                            label='Result'
                            value={formik.values.result}
                            onBlur={() => formik.setFieldTouched('result')}
                            onChange={(val) => {
                                formik.setFieldValue('result', val)}
                            }
                            autoComplete="off"
                            error={formik.errors?.result && formik.touched?.result ? formik.errors.result : ""}
                        />
                    </div>
                </Modal.Section>
            </Modal>
        </>
    );
}

export default WorkHourList;
