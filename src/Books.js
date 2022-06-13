import React, { useContext } from 'react';

import db from './firestore';
import { collection, onSnapshot, query, orderBy, where, doc, getDoc } from "firebase/firestore";
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
		};
		this.sort = this.sort.bind(this);
		this.myAuthorsOnChange = this.myAuthorsOnChange.bind(this);
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
				console.log("Document data:", docSnap.data());
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
			);
		}
		this.state.unsubscribe && this.state.unsubscribe();
		const unsubscribe = onSnapshot(q,
			(querySnapshot) => {
				this.setState({
					books: querySnapshot.docs,
					last_refreshed: new Date().toString(),
				});
			});
		this.setState({ unsubscribe });
	}

	componentDidMount() {
		this.subscribeToBooks();
	}

	componentWillUnmount() {
		this.state.unsubscribe();
	}

	componentDidUpdate(prevProps, prevState) {
		if (prevState.sortField !== this.state.sortField || this.state.sortOrder[this.state.sortField] !== prevState.sortOrder[this.state.sortField]) {
			console.log('componentDidUpdate determined change needed.');
			this.subscribeToBooks();
		}

		if (prevState.myAuthors !== this.state.myAuthors) {
			console.log('componentDidUpdate determined change needed.');

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

	render() {
		return (
			<AuthConsumer>
				{({ user }) => (
					<>
						<h2>Books</h2>
						{user != null &&
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
								</tr>
							</thead>
							<tbody>{this.state.books.map((book) =>
								<tr key={book.id} id={book.id}>
									<td>{book.data().bookname}</td>
									<td>{book.data().author}</td>
									<td>{book.data().avg_rating}</td>
									<td>{book.data().rating_count}</td>
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