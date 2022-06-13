import React, { useState, useEffect, useContext } from 'react';

import db from './firestore';
import { collection, onSnapshot, query, where, updateDoc, setDoc, doc } from "firebase/firestore";

import { AuthConsumer, AuthContext } from './AuthContext';


function Preferences(props) {
	const [userPrefs, setUserPrefs] = useState();
	const [author, setAuthor] = useState();
	const userContext = useContext(AuthContext);

	useEffect(() => {
		if (userContext.user != null) {
			const email = userContext.user.providerData[0].email;
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
		} else {
			// User logged out
			setUserPrefs(null);
		}
	}, [userContext]); // <-- run when user logs in or logs out

	function handleAuthorChange(e) {
		setAuthor(e.target.value);
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