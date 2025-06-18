interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl"
  className?: string
  text?: string
  variant?: "default" | "dots" | "pulse" | "bounce"
}

export default function LoadingSpinner({
  size = "md",
  className = "",
  text,
  variant = "default",
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-3 h-3 sm:w-4 sm:h-4",
    md: "w-5 h-5 sm:w-6 sm:h-6",
    lg: "w-6 h-6 sm:w-8 sm:h-8",
    xl: "w-10 h-10 sm:w-12 sm:h-12",
  }

  const textSizes = {
    sm: "text-2xs sm:text-xs",
    md: "text-xs sm:text-sm",
    lg: "text-sm sm:text-base",
    xl: "text-base sm:text-lg",
  }

  if (variant === "dots") {
    return (
      <div className={`flex items-center space-x-1 ${className}`}>
        <div className={`${sizeClasses[size]} bg-blue-600 rounded-full animate-bounce`}></div>
        <div
          className={`${sizeClasses[size]} bg-blue-600 rounded-full animate-bounce`}
          style={{ animationDelay: "0.1s" }}
        ></div>
        <div
          className={`${sizeClasses[size]} bg-blue-600 rounded-full animate-bounce`}
          style={{ animationDelay: "0.2s" }}
        ></div>
        {text && <span className={`ml-2 sm:ml-3 text-gray-600 font-medium ${textSizes[size]}`}>{text}</span>}
      </div>
    )
  }

  if (variant === "pulse") {
    return (
      <div className={`flex flex-col items-center space-y-2 sm:space-y-3 ${className}`}>
        <div className={`${sizeClasses[size]} bg-blue-600 rounded-full animate-pulse`}></div>
        {text && <span className={`text-gray-600 font-medium ${textSizes[size]} animate-pulse`}>{text}</span>}
      </div>
    )
  }

  if (variant === "bounce") {
    return (
      <div className={`flex flex-col items-center space-y-2 sm:space-y-3 ${className}`}>
        <div
          className={`${sizeClasses[size]} bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-bounce`}
        ></div>
        {text && <span className={`text-gray-600 font-medium ${textSizes[size]}`}>{text}</span>}
      </div>
    )
  }

  return (
    <div className={`flex flex-col items-center space-y-2 sm:space-y-3 ${className}`}>
      <div className={`${sizeClasses[size]} relative`}>
        <div className="w-full h-full border-2 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
        <div
          className="absolute inset-0 w-full h-full border-2 border-transparent border-t-blue-400 rounded-full animate-spin"
          style={{ animationDelay: "150ms" }}
        ></div>
        <div
          className="absolute inset-0 w-full h-full border-2 border-transparent border-t-blue-300 rounded-full animate-spin"
          style={{ animationDelay: "300ms" }}
        ></div>
      </div>
      {text && <span className={`text-gray-600 font-medium ${textSizes[size]} text-center`}>{text}</span>}
    </div>
  )
}
