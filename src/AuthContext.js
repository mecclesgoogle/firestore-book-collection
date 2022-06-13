import React from "react";

export const AuthContext = React.createContext({
	user: null,
});

export const AuthProvider = AuthContext.Provider;
export const AuthConsumer = AuthContext.Consumer;
