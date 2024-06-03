import React, { useState, useRef, useEffect } from "react";
import { IndexTable, LegacyCard, Pagination, Text, Icon, Button, Toast } from '@shopify/polaris';
import { ApiCall, GetApiCall } from "../../helper/axios";
import { EditMinor, DeleteMinor } from '@shopify/polaris-icons';
import DeleteModal from "../../components/DeleteModel";
import { useHistory } from "react-router-dom";
import { useCallback } from "react";
import { getCookies } from "../../helper/commonFunctions";
import Skeleton from "../../components/Skeleton";

const User = () => {
  const history = useHistory()
  const [userDataList, setUserDataList] = useState([])
  const [allUserData, setAllUserData] = useState('')
  const [deletePopUpActive, setDeletePopUpActive] = useState(false)
  const [deleteId, setDeleteId] = useState('');
  const [saveLoader, setSaveLoader] = useState(false);
  const [page, setpage] = useState(1)
  const [totalData, setTotalData] = useState(0)
  const [active, setActive] = useState(false);
  const [totalPages, setTotalPages] = useState(0)
  const [rowPerPage, setRowPerPage] = useState(10)
  const [loader, setLoader] = useState(true);
  useEffect(() => {
    UserDataget()
  }, [page])

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

  const UserDataget = async () => {
    const res = await GetApiCall('GET', `/user-list?limit=10&page=${page}`, [])
    let response = res?.data
    if (response?.statusCode === 200 && response?.status == "success") {
      setUserDataList(response?.data?.user_data)
      setAllUserData(response?.data?.user_data)
      setTotalData(response?.data?.total_data)
      const pages = Math.ceil(res.data.data.total_data / rowPerPage)
      setTotalPages(pages)
    } else if (response?.statusCode === 200 && response?.status == "error") {
      // setpage(page - 1)
      setUserDataList([])
      setAllUserData([])
      setTotalData(0)
    } else {
      setUserDataList([])
      setAllUserData([])
      setTotalData(0)
    }
    setLoader(false)
  }

  const handleEdit = (data) => {
    history.push({
      pathname: '/admin/user/edit',
      state: data
    })
  }


  const resourceName = {
    singular: 'Users',
    plural: 'Users',
  };

  const rowMarkup = userDataList?.map(({ id, user_name, name, password, type }, index) => (
    <IndexTable.Row
      id={id}
      position={index}
      key={index}
    >
      <IndexTable.Cell >{page * 10 - 10 + index + 1} </IndexTable.Cell>
      <IndexTable.Cell>{user_name}</IndexTable.Cell>
      <IndexTable.Cell>{name}</IndexTable.Cell>
      <IndexTable.Cell>{password}</IndexTable.Cell>
      <IndexTable.Cell>{type == "0" ? "User" : "Admin"}</IndexTable.Cell>
      <IndexTable.Cell>
        <div className="d-inline-flex p-2">
          <div className="px-2 cursor-pointer" onClick={() => handleEdit({
            user_name: user_name,
            name: name,
            id: id
          })}><Icon source={EditMinor} color="base" /></div>
          <div className="cursor-pointer" onClick={() => handleDeletePopUp(id)}> <Icon source={DeleteMinor} color="critical" /></div>
        </div>
      </IndexTable.Cell>
    </IndexTable.Row>
  ),
  );

  const deleteUser = async (id) => {
    setSaveLoader(true)
    const response = await ApiCall('DELETE', `/delete-user`, { id: id }, [])
    // console.log(response.data, 'response');
    if (response?.data.statusCode === 200 && response?.data.status == "success") {
      UserDataget()
      setDeletePopUpActive(!deletePopUpActive)
      setSaveLoader(false)
      setActive(true)
    } else {
      setDeletePopUpActive(!deletePopUpActive)
      setSaveLoader(false)
    }
  }

  const handleDeletePopUp = (id, flag = false) => {
    setDeleteId(id)
    if (flag) {
      deleteUser(deleteId)
    } else {
      setDeletePopUpActive(!deletePopUpActive)
    }
  }

  const toggleActive = useCallback(() => setActive((active) => !active), []);

  const toastMarkup = active ? (
    <Toast content="Delete successfully" onDismiss={toggleActive} />
  ) : null;


  return (
    <>
      {loader ? <Skeleton /> : <>   <div className="mt-2 sl-add-button">
        <Button onClick={() => history.push("/admin/user/create")}>
          Add user
        </Button>
      </div>
        <LegacyCard>
          <div className="mt-2">
            <IndexTable
              resourceName={resourceName}
              itemCount={userDataList?.length}
              selectable={false}
              headings={[
                {
                  id: '1',
                  title: (
                    <Text fontWeight="bold" as="span">
                      SR NO
                    </Text>
                  ),
                },
                {
                  id: '2',
                  title: (
                    <Text fontWeight="bold" as="span">
                      USERNAME
                    </Text>
                  ),
                },
                {
                  id: '3',
                  title: (
                    <Text fontWeight="bold" as="span">
                      NAME
                    </Text>
                  ),
                },
                {
                  id: '4',
                  title: (
                    <Text fontWeight="bold" as="span">
                      PASSWORD
                    </Text>
                  ),
                },
                {
                  id: '5',
                  title: (
                    <Text fontWeight="bold" as="span">
                      USERTYPE
                    </Text>
                  ),
                },
                {
                  id: '6',
                  title: (
                    <Text fontWeight="bold" as="span" >
                      ACTION
                    </Text>
                  ),
                },
              ]}
            >
              {rowMarkup}
            </IndexTable>
            {toastMarkup}
            <div className="pagination py-2">
              {totalData ? <Pagination
                hasPrevious={page > 1}
                onPrevious={() => setpage(page == 1 ? page : page - 1)}
                hasNext={page < totalPages}
                onNext={() => setpage(totalData / 10 > page ? page + 1 : page)}
              /> : null}
            </div>
          </div>
          <DeleteModal deletePopUpActive={deletePopUpActive} popUpTitle='Delete User' loader={saveLoader} secondaryLabel='Cancel' primaryLabel={'Delete'} popUpContent={'Are you sure, you want to delete this user?'} handleDeletePopUp={handleDeletePopUp} />
        </LegacyCard></>
      }
    </>
  );
};

export default User;
