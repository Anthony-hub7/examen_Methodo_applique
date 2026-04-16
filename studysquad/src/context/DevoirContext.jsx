import React, { createContext, useContext } from 'react'
import { useDevoirs } from '../hooks/useDevoirs'

const DevoirContext = createContext(null)

export function DevoirProvider({ children }) {
	const devoirsHook = useDevoirs()

	return (
		<DevoirContext.Provider value={devoirsHook}>
			{children}
		</DevoirContext.Provider>
	)
}

export function useDevoirContext() {
	const ctx = useContext(DevoirContext)
	if (!ctx) {
		throw new Error('useDevoirContext must be used within a DevoirProvider')
	}
	return ctx
}

export default DevoirContext
