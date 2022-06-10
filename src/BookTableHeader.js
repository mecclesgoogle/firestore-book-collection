const BookTableHeader = ({ id, onClick, text }) => <th>
	<button className='btn btn-link' onClick={onClick} id={id}>
		<strong>{text}</strong>
	</button>
</th>

export default BookTableHeader;