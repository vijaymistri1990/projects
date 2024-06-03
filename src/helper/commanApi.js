let apiEndpoint;
let commonApi;
let sampleFileApi;

const hostname = window.location.hostname;
if (hostname === "demo.themunim.com") {
    apiEndpoint = "https://demoapi.themunim.com/api"
    commonApi = "https://demoapi.themunim.com/"
    sampleFileApi = 'https://demoapi.themunim.com/'
} else if (hostname === "dev.themunim.com") {
    apiEndpoint = "https://devapi.themunim.com/api"
    commonApi = "https://devapi.themunim.com/"
    sampleFileApi = 'https://devapi.themunim.com/'
} else if (hostname === "www.zianai.in") {
    apiEndpoint = "https://api.zianai.in/api"
    commonApi = "https://api.zianai.in/"
    sampleFileApi = 'https://api.zianai.in/'
} else if (hostname === "localhost") {
    // // /* this for local*/
    // apiEndpoint = "http://192.168.0.113:5000/api"
    // commonApi = "http://192.168.0.113:5000/"
    apiEndpoint = 'http://localhost:4000/api'
    commonApi = 'http://localhost:4000/'
    sampleFileApi = 'http://localhost:4000/'
    // apiEndpoint = "https://devprofnode.themunim.com/api"
    // commonApi = "https://devprofnode.themunim.com/"
}

module.exports = {
    apiEndpoint,
    commonApi,
    sampleFileApi
}
