import Api from './api'

export default {
    isUrlWhiteListed(headers) {
        return Api().get(`/headline-origins`, {
          withCredentials: true,
          headers: headers
        })
    },
    addUrlToWhiteLists(reqBody) {
        return Api().post(`/headline-origins`,
          reqBody, {
            withCredentials: true
        })
    }
}