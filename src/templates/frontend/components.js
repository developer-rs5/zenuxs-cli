// Common components for frontend templates
export const buttonComponent = `import React from 'react'

export const Button = ({ children, variant = 'primary', ...props }) => {
  const baseClasses = 'px-4 py-2 rounded-lg font-medium transition'
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700',
    outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50'
  }
  
  return (
    <button className={\`\${baseClasses} \${variants[variant]}\`} {...props}>
      {children}
    </button>
  )
}
`;

export const cardComponent = `import React from 'react'

export const Card = ({ children, title, className = '' }) => {
  return (
    <div className={\`bg-white rounded-xl shadow-lg p-6 \${className}\`}>
      {title && <h3 className="text-xl font-bold mb-4">{title}</h3>}
      {children}
    </div>
  )
}
`;

export const inputComponent = `import React from 'react'

export const Input = ({ label, error, ...props }) => {
  return (
    <div className="mb-4">
      {label && <label className="block text-sm font-medium mb-2">{label}</label>}
      <input
        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        {...props}
      />
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  )
}
`;