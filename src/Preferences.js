import React, { useState, useEffect, useContext } from 'react';

import db from './firestore';
import { onSnapshot, updateDoc, setDoc, doc } from "firebase/firestore";

import { AuthConsumer, AuthContext } from './AuthContext';

function initializePreferences(useremail) {
	setDoc(doc(db, "reading_preferences", useremail), {
		authors: [],
		want_to_read: [],
		read: [],
	});
}

function Preferences(props) {
	const [userPrefs, setUserPrefs] = useState();
	const [author, setAuthor] = useState();
	const userContext = useContext(AuthContext);

	useEffect(() => {
		if (userContext.user != null) {
			const email = userContext.user.providerData[0].email;
			const prefsRef = doc(db, "reading_preferences", email);
			onSnapshot(prefsRef,
				(querySnapshot) => {
					if (!querySnapshot.exists()) {
						console.log('User has no prefs, initializing it now.');
						initializePreferences(email);
					} else {
						setUserPrefs(querySnapshot);
					}
				});
		} else {
			// User logged out
			setUserPrefs(null);
		}
	}, [userContext]); // <-- run when user logs in or logs out

	function handleAuthorChange(e) {
		setAuthor(e.target.value.trim());
	}

	function onSubmitPreferences(e) {
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
		<AuthConsumer>
			{({ user }) => (
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
					{user != null ?
						(<form onSubmit={onSubmitPreferences}>
							<label>
								Author:
								<input type="text" name="name" onChange={handleAuthorChange} />
							</label>
							<input type="submit" value="Submit" />
						</form>) :
						<p>Login to see preferences</p>
					}
				</div>
			)}
		</AuthConsumer>
	);
}

export default Preferences;