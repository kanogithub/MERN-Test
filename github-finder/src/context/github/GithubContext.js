import { createContext, useReducer } from 'react'
import githubReducer from './GithubReducer'

const GithubContext = createContext()

const GITHUB_URL = process.env.REACT_APP_GITHUB_URL
const GUTHUB_TOKEN = process.env.REACT_APP_GITHUB_TOKEN

export const GithubProvider = ({ children }) => {
	const initialState = {
		users: [],
		loading: false,
	}

	const [state, dispatch] = useReducer(githubReducer, initialState)

	// Get initial users (testing purpose)
	const fetchUsers = async (query) => {
		setLoading()

		let respone = await fetch(`${GITHUB_URL}/search/users?q=${query}`, {
			headers: {
				Authorization: `token ${GUTHUB_TOKEN}`,
			},
		})

		respone = respone.ok ? respone : await fetch(`${GITHUB_URL}/search/users?q=${query}`)
		const { items: data } = await respone.json()
		console.log(data)
		dispatch({
			type: 'GET_USERS',
			payload: data,
		})
	}

	const clearUsers = () => {
		dispatch({
			type: 'GET_USERS',
			payload: [],
		})
	}

	const setLoading = () => dispatch({ type: 'SET_LOADING' })

	return (
		<GithubContext.Provider
			value={{ users: state.users, loading: state.loading, fetchUsers, clearUsers }}>
			{children}
		</GithubContext.Provider>
	)
}

export default GithubContext
