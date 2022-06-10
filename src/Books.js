import React from 'react';

import db from './firestore';
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";

class Books extends React.Component {

	async getBooks(sortField) {
		const q = query(collection(db, 'cantwaitbooks2022'), orderBy(sortField, this.sortOrder[sortField]))
		if (this.unsubscribe != null) {
			this.unsubscribe();
			this.unsubscribe = null;
		}
		this.unsubscribe = onSnapshot(q,
			(querySnapshot) => {
				this.setState({ books: querySnapshot.docs, last_refreshed: new Date().toString() });
			});
	}

	sort(e) {
		e.preventDefault();
		const field = e.target.id;
		this.reverseSortOrder(field);
		this.getBooks(field);
	}

	reverseSortOrder(field) {
		if (this.sortOrder.hasOwnProperty(field)) {
			const direction = this.sortOrder[field];
			const new_direction = direction === 'asc' ? 'desc' : 'asc';
			this.sortOrder[field] = new_direction;
		} else {
			this.sortOrder[field] = 'asc';
		}
		console.log(`Sort order for ${field} is ${this.sortOrder[field]}`);
	}

	constructor(props) {
		super(props);
		this.state = { last_refreshed: '' };
		this.sortOrder = { 'avg_rating': 'desc' }
		this.getBooks('avg_rating');
		this.subscription = null;
		this.sort = this.sort.bind(this);
	}

	render() {
		let tbody = '';
		if (this.state.books != null) {
			tbody = <tbody>{this.state.books.map((book) =>
				<tr key={book.id} id={book.id}>
					<td>{book.data().bookname}</td>
					<td>{book.data().author}</td>
					<td>{book.data().avg_rating}</td>
					<td>{book.data().rating_count}</td>
				</tr>)}</tbody>;
		}
		return <div>
			<h2>Books</h2>
			<table className='table table-success table-striped table-bordered' >
				<thead>
					<tr className='table-primary'>
						<th><button className='btn btn-link' onClick={this.sort} id='bookname'><strong>Book name</strong></button></th>
						<th><button className='btn btn-link' onClick={this.sort} id='author'><strong>Author</strong></button></th>
						<th><button className='btn btn-link' onClick={this.sort} id='avg_rating'><strong>Average rating</strong></button></th>
						<th><button className='btn btn-link' onClick={this.sort} id='rating_count'><strong>Rating count</strong></button></th>
					</tr>
				</thead>
				{tbody}
			</table>
			<p>Last refreshed: {this.state.last_refreshed}</p>
		</div>;
	}
}

export default Books;