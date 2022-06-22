import React, { useState } from 'react';

import './firestore';
import {
	getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged
} from "firebase/auth"

import { AuthProvider } from './AuthContext';

const auth = getAuth();
const provider = new GoogleAuthProvider();

class Auth extends React.Component {

	constructor(props) {
		super(props);
		this.state = { user: auth.currentUser };
		this.loginWithGoogle = this.loginWithGoogle.bind(this);
		this.logoutWithGoogle = this.logoutWithGoogle.bind(this);
	}

	componentDidMount() {
		onAuthStateChanged(auth, (user) => {
			this.setState({
				user: user
			});
		});
	}

	async loginWithGoogle(e) {
		signInWithPopup(auth, provider);
		console.log('Logged in');
	}

	async logoutWithGoogle(e) {
		signOut(auth).then(() => {
			console.log('Logged out');
		}).catch((error) => {
			console.error(error);
		});
	}

	render() {
		return <AuthProvider value={{ user: this.state.user }}>
			<div className='auth'>
				{
					this.state.user == null ?
						(<button className='btn btn-secondary' type='button' onClick={this.loginWithGoogle}>Login</button>) :
						(<ul className="navbar-nav">
							<li className='nav-item mx-3'>
								<button className='btn btn-secondary align-middle h-100' type='button' onClick={this.logoutWithGoogle}>Logout</button>
							</li>
							<li className='nav-item'>
								<img width={50} src={this.state.user.providerData[0].photoURL} alt='profile'></img>
							</li>
						</ul>)
				}
			</div >
		</AuthProvider>;
	}
}

export default Auth;