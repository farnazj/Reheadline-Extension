import Api from './api'

export default {
    logUserInteraction(reqBody) {
        return Api().post('/headline-study-log', reqBody, {
            withCredentials: true
        })
    }
}