import React from 'react'

export const CustomHeader = ({ children }: { children?: React.ReactNode }) => {
  return <h2 className="text-2xl font-bold text-blue-500 mt-8 mb-4">{children}</h2>
}
