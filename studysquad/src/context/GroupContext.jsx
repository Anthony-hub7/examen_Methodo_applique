import React, { createContext, useContext } from 'react'
import { useGroups } from '../hooks/useGroups'

const GroupContext = createContext(null)

export function GroupProvider({ children }) {
	const groupsHook = useGroups()

	return (
		<GroupContext.Provider value={groupsHook}>
			{children}
		</GroupContext.Provider>
	)
}

export function useGroupContext() {
	const ctx = useContext(GroupContext)
	if (!ctx) {
		throw new Error('useGroupContext must be used within a GroupProvider')
	}
	return ctx
}

export default GroupContext
