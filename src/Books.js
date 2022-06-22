import React, { useContext } from 'react';

import db from './firestore';
import { collection, onSnapshot, query, orderBy, where, doc, getDoc, updateDoc, limit } from "firebase/firestore";
import BookTableHeader from './BookTableHeader';

import { AuthConsumer, AuthContext } from './AuthContext';

class Books extends React.Component {

	static contextType = AuthContext;

	constructor(props) {
		super(props);
		this.state = {
			books: [],
			last_refreshed: '',
			myAuthors: false,
			sortField: 'avg_rating',
			sortOrder: { 'avg_rating': 'desc' },
			unsubscribe: null,
			unsubscribePrefs: null,
			preferences: null,
			wantToRead: [],
			read: [],
		};
		this.sort = this.sort.bind(this);
		this.myAuthorsOnChange = this.myAuthorsOnChange.bind(this);
		this.wantToReadOnChange = this.wantToReadOnChange.bind(this);
		this.readOnChange = this.readOnChange.bind(this);

		this.userFromContext = null;
	}

	/**
	 * Mutates state with current values from Firestore.
	 * - preferences
	 */
	async subscribeToPrefs() {
		const { user } = this.context;
		if (user != null && this.state.preferences == null) {
			const prefsRef = doc(db, "reading_preferences", user.email);
			console.log(`[subscribeToPrefs] Creating sub to prefs.`);
			const unsubscribe = onSnapshot(prefsRef, (prefsSnap) => {
				console.log(`[subscribeToPrefs] Retrieved prefs`);
				if (prefsSnap.exists()) {
					this.setState({
						preferences: prefsSnap.data(),
					});
				}
			});
			this.setState({ unsubscribePrefs: unsubscribe });
		}
	}

	/**
	 * Create a Firestore Watch subscription to the books collection.
	 * If there is already a subscription, cancels and replaces it.
	 */
	async subscribeToBooks() {
		let q = null;
		if (this.state.myAuthors) {
			const { user } = this.context;
			const docRef = doc(db, "reading_preferences", user.email);
			const docSnap = await getDoc(docRef);
			if (docSnap.exists()) {
				q = query(
					collection(db, 'cantwaitbooks2022'),
					orderBy(
						this.state.sortField,
						this.state.sortOrder[this.state.sortField]
					),
					where('author', 'in', docSnap.data().authors)
				);
			} else {
				console.log("No such document!");
			}

		}
		if (q == null) {
			q = query(
				collection(db, 'cantwaitbooks2022'),
				orderBy(
					this.state.sortField,
					this.state.sortOrder[this.state.sortField]
				),
				limit(30),
			);
		}
		this.state.unsubscribe && this.state.unsubscribe();
		const unsubscribe = onSnapshot(q,
			(querySnapshot) => {
				console.log(`[subscribeToBooks] Retrieved snapshot`);
				this.setState({
					books: querySnapshot.docs,
					last_refreshed: new Date().toString(),
				});
			});
		this.setState({ unsubscribe });
	}

	/**
	 * Run once. Setup Firestore Watch listeners.
	 */
	async componentDidMount() {
		this.subscribeToBooks();
	}

	componentWillUnmount() {
		this.state.unsubscribe();
		this.state.unsubscribePrefs != null && this.state.unsubscribePrefs();
	}

	// Runs on state change.
	async componentDidUpdate(prevProps, prevState) {
		if (this.context['user'] != null && this.context['user'] !== this.userFromContext) {
			const { user } = this.context;
			this.userFromContext = user;
			this.subscribeToPrefs();
		}

		if (prevState.sortField !== this.state.sortField || this.state.sortOrder[this.state.sortField] !== prevState.sortOrder[this.state.sortField]) {
			this.subscribeToBooks();
		}

		if (prevState.myAuthors !== this.state.myAuthors) {
			this.subscribeToBooks();
		}
	}

	sort(e) {
		e.preventDefault();
		const sortField = e.target.parentElement.id;
		if (this.state.sortOrder.hasOwnProperty(sortField)) {
			const prevDirection = this.state.sortOrder[sortField];
			const newDirection = prevDirection === 'asc' ? 'desc' : 'asc';
			this.setState({ sortOrder: { [sortField]: newDirection }, sortField })
		} else {
			this.setState({ sortOrder: { [sortField]: 'asc' }, sortField })
		}
	}

	myAuthorsOnChange(e) {
		this.setState({
			myAuthors: !this.state.myAuthors
		});
	}

	async wantToReadOnChange(e) {
		const checked = e.target.checked;
		const bookId = e.target.parentElement.parentElement.id;
		const { user } = this.context;
		const prefsRef = doc(db, "reading_preferences", user.email);
		const prefsSnap = await getDoc(prefsRef);
		const prefs = prefsSnap.data();
		if (checked) {
			prefs.want_to_read = [...prefs.want_to_read, bookId];
			updateDoc(prefsSnap.ref, prefs);
		} else {
			prefs.want_to_read = prefs.want_to_read.filter(item => item !== bookId);
			updateDoc(prefsSnap.ref, prefs);
		}
	}

	async readOnChange(e) {
		const checked = e.target.checked;
		const bookId = e.target.parentElement.parentElement.id;
		const { user } = this.context;
		const prefsRef = doc(db, "reading_preferences", user.email);
		const prefsSnap = await getDoc(prefsRef);
		const prefs = prefsSnap.data();
		if (checked) {
			prefs.read = [...prefs.read, bookId];
			updateDoc(prefsSnap.ref, prefs);
		} else {
			prefs.read = prefs.read.filter(item => item !== bookId);
			updateDoc(prefsSnap.ref, prefs);
		}
	}

	render() {
		return (
			<AuthConsumer>
				{({ user }) => (
					<>
						<h2>Books</h2>
						{user != null && this.state.preferences && this.state.preferences.authors.length > 0 &&
							<label >
								<input type='checkbox' checked={this.state.myAuthors} onChange={this.myAuthorsOnChange}></input>
								Show my authors only
							</label>
						}
						<table className='table table-success table-striped table-bordered' >
							<thead>
								<tr className='table-primary'>
									<BookTableHeader text='Book name' id='bookname' onClick={this.sort} />
									<BookTableHeader text='Author' id='author' onClick={this.sort} />
									<BookTableHeader text='Average rating' id='avg_rating' onClick={this.sort} />
									<BookTableHeader text='Rating count' id='rating_count' onClick={this.sort} />
									{user != null &&
										<>
											<th>Want to read</th>
											<th>Read</th>
										</>
									}
								</tr>
							</thead>
							<tbody>{this.state.books.map((book) =>
								<tr key={book.id} id={book.id}>
									<td>{book.data().bookname}</td>
									<td>{book.data().author}</td>
									<td>{book.data().avg_rating}</td>
									<td>{book.data().rating_count}</td>
									{user != null && this.state.preferences != null &&
										<>
											<td><input type='checkbox' checked={this.state.preferences.want_to_read != null && this.state.preferences.want_to_read.includes(book.id)} onChange={this.wantToReadOnChange} /></td>
											<td><input type='checkbox' checked={this.state.preferences.read != null && this.state.preferences.read.includes(book.id)} onChange={this.readOnChange} /></td>
										</>
									}
								</tr>)}</tbody>
						</table>
						<p>Last refreshed: {this.state.last_refreshed}</p>
					</>
				)}
			</AuthConsumer>
		);
	}
}

export default Books;