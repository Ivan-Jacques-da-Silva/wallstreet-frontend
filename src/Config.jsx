const api_url = 'http://localhost:8000'
// const api_url = 'https://api.wallstreetcorporate.com.br'

if (!sessionStorage.getItem('csrfToken')) {
    fetch(`${api_url}/api/csrf-token/`, {
        credentials: 'include',
    }).then(async response => {
        const data = await response.json()
        sessionStorage.setItem('csrfToken', data.csrfToken)
    })
}

export default class {

    static get api_url() {
        return api_url
    }

    static get csrf_Token() {
        return sessionStorage.getItem('csrfToken')
    }
}