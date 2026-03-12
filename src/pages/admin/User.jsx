import { useState, useEffect, useCallback } from "react";
import { IndexTable, LegacyCard, Pagination, Text, Icon, Button, Toast } from '@shopify/polaris';
import { ApiCall, GetApiCall } from "../../helper/axios";
import { EditMinor, DeleteMinor } from '@shopify/polaris-icons';
import DeleteModal from "../../components/DeleteModel";
import { useNavigate } from "react-router-dom";
import { getCookies } from "../../helper/commonFunctions";
import Skeleton from "../../components/Skeleton";

const User = () => {
  const navigate = useNavigate()
  const [userDataList, setUserDataList] = useState([])
  const [deletePopUpActive, setDeletePopUpActive] = useState(false)
  const [deleteId, setDeleteId] = useState('');
  const [saveLoader, setSaveLoader] = useState(false);
  const [page, setpage] = useState(1)
  const [totalData, setTotalData] = useState(0)
  const [active, setActive] = useState(false);
  const [totalPages, setTotalPages] = useState(0)
  const [rowPerPage] = useState(10)
  const [loader, setLoader] = useState(true);
  useEffect(() => {
    UserDataget()
  }, [page])

  useEffect(() => {
    let data = getCookies('userData');
    if (data == null) {
      navigate("/login");
    } else {
      let user = JSON.parse(data)?.user
      if (user == "0") {
        navigate("/topic-list");
      }
    }
  }, [])

  const UserDataget = async () => {
    const res = await GetApiCall(`/user-list?limit=10&page=${page}`)
    let response = res?.data
    if (response?.statusCode === 200 && response?.status == "success") {
      setUserDataList(response?.data?.user_data)
      setTotalData(response?.data?.total_data)
      const pages = Math.ceil(res.data.data.total_data / rowPerPage)
      setTotalPages(pages)
    } else if (response?.statusCode === 200 && response?.status == "error") {
      setUserDataList([])
      setTotalData(0)
    } else {
      setUserDataList([])
      setTotalData(0)
    }
    setLoader(false)
  }

  const handleEdit = (data) => {
    navigate('/admin/user/edit', { state: data })
  }


  const resourceName = {
    singular: 'Users',
    plural: 'Users',
  };

  const rowMarkup = userDataList?.map(({ id, username, name, password, type }, index) => (
    <IndexTable.Row
      id={id}
      position={index}
      key={index}
    >
      <IndexTable.Cell >{page * 10 - 10 + index + 1} </IndexTable.Cell>
      <IndexTable.Cell>{username}</IndexTable.Cell>
      <IndexTable.Cell>{name}</IndexTable.Cell>
      <IndexTable.Cell>{password}</IndexTable.Cell>
      <IndexTable.Cell>{type == "0" ? "User" : "Admin"}</IndexTable.Cell>
      <IndexTable.Cell>
        <div className="tw-flex tw-items-center tw-gap-4 tw-py-2 tw-px-3">
          <div className="tw-cursor-pointer tw-p-1 hover:tw-bg-gray-100 tw-rounded" onClick={() => handleEdit({
            user_name: username,
            name: name,
            id: id
          })}><Icon source={EditMinor} color="base" /></div>
          <div className="tw-cursor-pointer tw-p-1 hover:tw-bg-gray-100 tw-rounded" onClick={() => handleDeletePopUp(id)}> <Icon source={DeleteMinor} color="critical" /></div>
        </div>
      </IndexTable.Cell>
    </IndexTable.Row>
  ),
  );

  const deleteUser = async (id) => {
    setSaveLoader(true)
    const response = await ApiCall('DELETE', `/delete-user`, { id: id })
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
      <div className="mt-2 sl-add-button">
        <Button onClick={() => navigate("/admin/user/create")}>
          Add user
        </Button>
      </div>
      {loader ? <Skeleton /> : <>
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
