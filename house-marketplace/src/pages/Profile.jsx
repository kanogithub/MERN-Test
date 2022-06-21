import { useEffect, useState } from 'react'
import { getAuth, updateProfile, sendSignInLinkToEmail } from 'firebase/auth'
import {
	doc,
	updateDoc,
	collection,
	getDoc,
	getDocs,
	query,
	where,
	orderBy,
	deleteDoc,
} from 'firebase/firestore'
import { db } from '../firebase.config'
import { toast } from 'react-toastify'
import { useNavigate, Link } from 'react-router-dom'
import ListingItem from '../components/ListingItem'
import { ReactComponent as ArrowRight } from '../assets/svg/keyboardArrowRightIcon.svg'
import { ReactComponent as HomeIcon } from '../assets/svg/homeIcon.svg'
import ProfileDetailsSet from '../components/ProfileDetailsSet'
import ProfileContactSet from '../components/ProfileContactSet'

function Profile() {
	const auth = getAuth()
	const [listings, setListings] = useState(null)
	const [changeDetails, setChangeDetails] = useState(false)
	const [formData, setFormData] = useState({
		name: auth.currentUser.displayName,
		email: auth.currentUser.email,
	})

	const { name, email } = formData

	const navigate = useNavigate()

	const onSubmit = async () => {
		try {
			if (auth.currentUser.displayName !== name) {
				// update for auth
				await updateProfile(auth.currentUser, {
					displayName: name,
				})

				// update for firestore
				const userRef = doc(db, 'users', auth.currentUser.uid)
				await updateDoc(userRef, {
					name,
				})

				toast.success('Profile has been updated')
			}
		} catch (error) {
			console.log(error)
			toast.error('Could not update profile details')
		}

		setChangeDetails(false)
	}

	const handleChangeDetails = () => {
		setChangeDetails(true)
	}

	const handleChange = (e) => {
		setFormData((preValue) => ({ ...preValue, [e.target.id]: e.target.value }))
	}

	const onDelete = async (listingId) => {
		if (window.confirm('Are you sure you want to delete?')) {
			const docRef = doc(db, 'listings', listingId)
			await deleteDoc(docRef)

			const updatedListings = listings.filter((listing) => listing.id != listingId)
			setListings(updatedListings)

			toast.success('Delete listing successfully')
		}
	}

	const onEdit = (listingId) => navigate(`/edit-listing/${listingId}`)

	const actionCodeSettings = {
		// URL you want to redirect back to. The domain (www.example.com) for this
		// URL must be in the authorized domains list in the Firebase Console.
		url: 'https://house-market-teal.vercel.app/profile',
		// This must be true.
		handleCodeInApp: true,
		iOS: {
			bundleId: 'com.example.ios',
		},
		android: {
			packageName: 'com.example.android',
			installApp: true,
			minimumVersion: '12',
		},
		dynamicLinkDomain: 'house-market-teal.vercel.app',
	}

	const onVerifyEmail = () => {
		sendSignInLinkToEmail(auth, email, actionCodeSettings)
			.then(() => {
				toast.success('Verification Email is sent, please confirm.')
			})
			.catch((error) => {
				console.error(error.message)
			})
	}

	useEffect(() => {
		const fetchListings = async () => {
			const listingRef = collection(db, 'listings')
			const _query = query(
				listingRef,
				where('userRef', '==', auth.currentUser.uid),
				orderBy('timestamp', 'desc')
			)
			const querySnap = await getDocs(_query)

			const listings = []
			querySnap.forEach((doc) => {
				listings.push({ id: doc.id, data: doc.data() })
			})

			setListings(listings)
		}

		fetchListings()
		;(async function getUserData() {
			const querySnap = await getDoc(doc(db, 'users', auth.currentUser.uid))
			const { byEmail } = querySnap.data()
			setFormData((preV) => ({ ...preV, byEmail }))
		})()
	}, [auth.currentUser.uid])

	return (
		<div className='profile'>
			<header className='profileHeader'>
				<p className='pageHeader'>My Profile</p>
			</header>

			<main>
				<div className='profileDetailsHeader'>
					<p className='profileDetailsText'>Personal Details</p>
					<p
						className='changePersonalDetails'
						onClick={changeDetails ? onSubmit : handleChangeDetails}>
						{changeDetails ? 'done' : 'change'}
					</p>
				</div>

				<div className='profileDetailSettings'>
					<ProfileDetailsSet
						auth={auth}
						formData={formData}
						changeDetails={changeDetails}
						onChange={handleChange}
						onVerifyEmail={onVerifyEmail}
					/>
					<ProfileContactSet {...formData} />
				</div>

				<Link to='/create-listing' className='createListing'>
					<HomeIcon className='homeIcon' alt='homeIcon' />
					<p>Sell or rent your home</p>
					<ArrowRight className='arrowRight' alt='arrorRight' />
				</Link>
				{listings?.length > 0 && (
					<>
						<p className='listingText'>Your Listings</p>
						<ul className='listingsList'>
							{listings.map((listing) => (
								<ListingItem
									key={listing.id}
									listing={listing.data}
									id={listing.id}
									onDelete={() => onDelete(listing.id)}
									onEdit={() => onEdit(listing.id)}
								/>
							))}
						</ul>
					</>
				)}
			</main>
		</div>
	)
}

export default Profile
