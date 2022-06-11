import React, { useState, useEffect } from 'react';

import db from './firestore';
import { collection, onSnapshot, query, where, updateDoc, setDoc, doc } from "firebase/firestore";

import { getAuth, onAuthStateChanged } from "firebase/auth"

const auth = getAuth();

function Preferences(props) {
	const [userPrefs, setUserPrefs] = useState();
	const [user, setUser] = useState(auth.currentUser);
	const [author, setAuthor] = useState();
	const [unsubscribe, setUnsubscribe] = useState();

	useEffect(() => {
		onAuthStateChanged(auth, (user) => {
			console.log('onAuthStateChanged');
			setUser(user);
		});
	}, []); // <-- run once


	useEffect(() => {
		console.log('useEffect [user]');
		if (user != null) {
			// User logged in
			console.log('subscribeToPreferences');
			const email = user.providerData[0].email;
			console.log(`User's email is ${email}`);
			const q = query(collection(db, 'reading_preferences'), where('emailaddress', '==', email));
			onSnapshot(q,
				(querySnapshot) => {
					console.log(querySnapshot.docs);
					if (querySnapshot.docs.length === 0) {
						console.log('User has no prefs, initializing it now.');
						setDoc(doc(db, "reading_preferences", email), {
							authors: [],
							emailaddress: email,
						});
					} else {
						setUserPrefs(querySnapshot.docs[0]);
					}
				});
			//setUnsubscribe(unsub);
		} else {
			// User logged out
			setUserPrefs(null);
		}
	}, [user]); // <-- run when user logs in or logs out

	function handleAuthorChange(e) {
		setAuthor(e.target.value);
	}

	function onSubmitPreferences(e) {
		console.log('onSubmitPreferences');
		console.log(userPrefs);
		e.preventDefault();
		const data = userPrefs.data();
		if (!data.authors.includes(author)) {
			data.authors.push(author);
			updateDoc(userPrefs.ref, data);
		}
	}

	function removeAuthor(e) {
		e.preventDefault();
		const author = e.target.parentElement.id;
		const data = userPrefs.data();
		data.authors = data.authors.filter(
			(value) => value !== author
		);
		updateDoc(userPrefs.ref, data);
	}

	return (
		<div className='container'>
			<h2>Preferences</h2>
			{userPrefs != null ?
				(<>
					<p><strong>Favourite authors</strong></p>
					<ul>
						{userPrefs.data().authors.map((author) =>
							<li id={author} key={author}>{author} <button className='btn btn-link' onClick={removeAuthor}>Remove</button></li>
						)}
					</ul>
				</>) :
				(<p>No preferences</p>)}
			{user != null &&
				<form onSubmit={onSubmitPreferences}>
					<label>
						Author:
						<input type="text" name="name" onChange={handleAuthorChange} />
					</label>
					<input type="submit" value="Submit" />
				</form>

			}
		</div>
	);
}

export default Preferences;