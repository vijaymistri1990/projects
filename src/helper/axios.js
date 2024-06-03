import axios from 'axios'

const { apiEndpoint } = require('./commanApi')
// console.log("apiEndpoint==>", apiEndpoint);
let userData = localStorage.getItem('userData') ? JSON.parse(localStorage.getItem('userData')) : {};
const service = axios.create({
    headers: {

    }
})
const handleSuccess = (response) => {
    return response
}

const handleError = (error) => {
    return Promise.reject(error)
}
service.interceptors.response.use(handleSuccess, handleError)

/**
 * IW0079
 * When someone changes in localstorage detail at that time that person account will logout for security perpose
 */
const renewToken = () => {
    // window.removeEventListener("beforeunload", handlePageRefresh)
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_tokens')
    localStorage.removeItem('userData')
    window.location.href = '/sign-in'
}
export const ApiCall = async (method, path, payload, header = null) => {
    // if (header && !header['access-token']) {
    //     renewToken()
    // } else {
    try {
        const responce = await service.request({
            method,
            url: apiEndpoint + path,
            responseType: 'json',
            data: payload,
            // headers: header
        })
        // console.log(responce, 'responceresponce');
        return responce
    } catch (error) {
        console.log(error, 'errorerrorerror');
        if (error.message === 'Network Error') {
            console.log(`${error}, Server is not responding, please try again after some time`)
        }
        if (error.response?.data?.statusCode === 401 && header && !header['access-token']) {
            if (error.response.data.access_expire) {
                renewToken()
            } else if (error.response.data.refresh_expire) {
                return error.response
            }
        } else {
            return error.response
        }
    }
    // }
}
/**
 * IW0079
 * here flag is true when api call occure and user is not login
 */
export const GetApiCall = async (method, path, header = [], flag = false) => {
    // console.log(header, 'headerheader');
    //   if (!header['access-token'] && !flag) {
    //     renewToken()
    //   } else {
    try {
        const responce = await service.request({
            method,
            url: apiEndpoint + path,
            responseType: 'json',
            // headers: header
        })
        return responce
    } catch (error) {
        if (error.message === 'Network Error') {
            console.log(`${error}, Server is not responding, please try again after some time`)
        }
        if (error.response?.data?.statusCode === 401) {
            if (error.response.data.access_expire) {
                renewToken()
            } else if (error.response.data.refresh_expire) {
                return error.response
            }
        } else {
            return error.response
        }
    }
    //   }
}

export const GetUserApiCall = async (method, path, header = [], flag = false) => {
    if (!header['authentication'] && userData?.user == 0) {
        renewToken()
    } else {
        try {
            const responce = await service.request({
                method,
                url: apiEndpoint + path,
                responseType: 'json',
                headers: header
            })
            return responce
        } catch (error) {
            if (error.message === 'Network Error') {
                console.log(`${error}, Server is not responding, please try again after some time`)
            }
            if (error.response?.data?.statusCode === 401) {
                if (error.response.data.access_expire) {
                    renewToken()
                } else if (error.response.data.refresh_expire) {
                    return error.response
                }
            } else {
                return error.response
            }
        }
    }
}


export const UserApiCall = async (method, path, payload, header = null) => {
    if (!header['authentication'] && userData?.user == 0) {
        renewToken()
    } else {
        try {
            const responce = await service.request({
                method,
                url: apiEndpoint + path,
                responseType: 'json',
                data: payload,
                headers: header
            })
            return responce
        } catch (error) {
            if (error.message === 'Network Error') {
                console.log(`${error}, Server is not responding, please try again after some time`)
            }
            if (error.response?.data?.statusCode === 401 && header && !header['access-token']) {
                if (error.response.data.access_expire) {
                    renewToken()
                } else if (error.response.data.refresh_expire) {
                    return error.response
                }
            } else {
                return error.response
            }
        }
    }
}


