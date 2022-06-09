import React, { useState, setState, useEffect } from 'react';

import db from './firestore';
import { collection, onSnapshot, query, where } from "firebase/firestore";

import { getAuth } from "firebase/auth"

const auth = getAuth();

function Preferences(props) {
	const [preferences, setPreferences] = useState("Preferences will be shown here");
	const user = auth.currentUser;

	useEffect(() => {
		if (user != null)
			subscribeToPreferences(user.email);
	}, []);

	function subscribeToPreferences(emailaddress) {
		const email = user.providerData[0].email;
		const q = query(collection(db, 'reading_preferences'), where('emailaddress', '==', email));
		onSnapshot(q,
			(querySnapshot) => {
				console.log('Received preferences snapshot');
				querySnapshot.docs.map((preferences) => {
					const authors = preferences.data().authors.map(
						(author) => <li key={author}>{author}</li>);
					setPreferences(authors);
				}
				);
			});
	}

	function onSubmitPreferences(e) {
		e.preventDefault();

	}

	return (
		<div className='container'>
			<h2>Preferences</h2>
			<p>Favourite authors</p>
			<ul>{preferences}</ul>

			<form>
				<label>
					Author:
					<input type="text" name="name" />
				</label>
				<input type="submit" value="Submit" onSubmit={onSubmitPreferences} />
			</form>
		</div>
	);
}

export default Preferences;