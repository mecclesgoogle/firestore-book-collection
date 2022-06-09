import React from 'react';

import './firestore';
import {
	getAuth, signInWithPopup, GoogleAuthProvider, signOut
} from "firebase/auth"

const auth = getAuth();
const provider = new GoogleAuthProvider();

class Auth extends React.Component {

	constructor(props) {
		super(props);
		// https://firebase.google.com/docs/reference/js/auth.user.md#user_interface
		this.state = { user: auth.currentUser };
		this.loginWithGoogle = this.loginWithGoogle.bind(this);
		this.logoutWithGoogle = this.logoutWithGoogle.bind(this);
	}

	async loginWithGoogle(e) {
		const result = await signInWithPopup(auth, provider);
		console.log(result);
		this.setState({
			user: result.user
		});
	}

	async logoutWithGoogle(e) {
		signOut(auth).then(() => {
			console.log('Logged out');
			this.setState({
				user: null
			});
		}).catch((error) => {
			console.error(error);
		});
	}

	render() {
		return <div className='auth'>
			{this.state.user != null &&
				<ul className="navbar-nav">
					<li className='nav-item'>
						<button className='btn btn-secondary' type='button' onClick={this.logoutWithGoogle}>Logout</button>
					</li>
					<li className='nav-item'>
						<img width={50} src={this.state.user.providerData[0].photoURL}></img>
					</li>
				</ul>
			}

			{
				this.state.user == null &&
				<button className='btn btn-secondary' type='button' onClick={this.loginWithGoogle}>Login</button>
			}
		</div >;
	}
}

export default Auth;