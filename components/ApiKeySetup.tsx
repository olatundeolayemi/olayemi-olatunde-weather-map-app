"use client"

import { useState } from "react"
import { Key, ExternalLink, Copy, CheckCircle, X } from "lucide-react"
import { useToast } from "../hooks/useToast"

interface ApiKeySetupProps {
  isOpen: boolean
  onClose: () => void
}

export default function ApiKeySetup({ isOpen, onClose }: ApiKeySetupProps) {
  const [step, setStep] = useState(1)
  const [apiKey, setApiKey] = useState("ff08a0bd2104c6f1f0e68750d5fcacac")
  const { addToast } = useToast()

  const steps = [
    {
      title: "Sign up for OpenWeatherMap",
      description: "Create a free account to get your API key",
      action: "Visit OpenWeatherMap",
      url: "https://openweathermap.org/api",
    },
    {
      title: "Get your API key",
      description: "Navigate to the API Keys section in your dashboard",
      action: "Copy API Key",
    },
    {
      title: "Add to environment",
      description: "Add your API key to your environment variables",
      action: "Configure Environment",
    },
  ]

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    addToast({
      type: "success",
      title: "Copied to clipboard",
      message: "Environment variable copied",
      duration: 2000,
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Key className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">API Key Setup</h2>
              <p className="text-sm text-gray-600">Get real-time weather data</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Close setup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Progress */}
          <div className="flex items-center justify-between mb-8">
            {steps.map((_, index) => (
              <div key={index} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step > index + 1
                      ? "bg-green-500 text-white"
                      : step === index + 1
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {step > index + 1 ? <CheckCircle className="w-4 h-4" /> : index + 1}
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-1 mx-2 ${step > index + 1 ? "bg-green-500" : "bg-gray-200"}`} />
                )}
              </div>
            ))}
          </div>

          {/* Step Content */}
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Step {step}: {steps[step - 1].title}
              </h3>
              <p className="text-gray-600">{steps[step - 1].description}</p>
            </div>

            {step === 1 && (
              <div className="space-y-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">Why OpenWeatherMap?</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Free tier with 1,000 calls/day</li>
                    <li>• No credit card required</li>
                    <li>• Reliable and accurate data</li>
                    <li>• Used by millions of developers</li>
                  </ul>
                </div>
                <div className="flex justify-center">
                  <a
                    href={steps[0].url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    {steps[0].action}
                  </a>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div className="bg-yellow-50 rounded-lg p-4">
                  <h4 className="font-semibold text-yellow-900 mb-2">Finding Your API Key</h4>
                  <ol className="text-sm text-yellow-800 space-y-1 list-decimal list-inside">
                    <li>Log in to your OpenWeatherMap account</li>
                    <li>Click on your username in the top right</li>
                    <li>Select "My API keys" from the dropdown</li>
                    <li>Copy the default API key or create a new one</li>
                  </ol>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Paste your API key here (optional):
                  </label>
                  <input
                    type="text"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Enter your OpenWeatherMap API key"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <div className="bg-green-50 rounded-lg p-4">
                  <h4 className="font-semibold text-green-900 mb-2">Environment Configuration</h4>
                  <p className="text-sm text-green-800 mb-3">Add your API key to your environment variables:</p>

                  <div className="space-y-3">
                    <div>
                      <h5 className="text-sm font-medium text-green-900 mb-1">For Local Development:</h5>
                      <div className="bg-gray-900 text-green-400 p-3 rounded font-mono text-sm relative">
                        <code>NEXT_PUBLIC_OPENWEATHER_API_KEY={apiKey || "ff08a0bd2104c6f1f0e68750d5fcacac"}</code>
                        <button
                          onClick={() =>
                            copyToClipboard(
                              `NEXT_PUBLIC_OPENWEATHER_API_KEY=${apiKey || "ff08a0bd2104c6f1f0e68750d5fcacac"}`,
                            )
                          }
                          className="absolute top-2 right-2 p-1 hover:bg-gray-700 rounded"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-xs text-green-700 mt-1">Add this to your .env.local file</p>
                    </div>

                    <div>
                      <h5 className="text-sm font-medium text-green-900 mb-1">For Vercel Deployment:</h5>
                      <div className="bg-gray-900 text-green-400 p-3 rounded font-mono text-sm relative">
                        <code>vercel env add NEXT_PUBLIC_OPENWEATHER_API_KEY</code>
                        <button
                          onClick={() => copyToClipboard("vercel env add NEXT_PUBLIC_OPENWEATHER_API_KEY")}
                          className="absolute top-2 right-2 p-1 hover:bg-gray-700 rounded"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">After Adding Your API Key:</h4>
                  <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                    <li>Restart your development server</li>
                    <li>Refresh this page</li>
                    <li>You should see "Live Weather Data Active" status</li>
                    <li>Click on city markers to see real weather data</li>
                  </ol>
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <button
              onClick={() => setStep(Math.max(1, step - 1))}
              disabled={step === 1}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <div className="flex space-x-3">
              {step < 3 ? (
                <button
                  onClick={() => setStep(step + 1)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={onClose}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Complete Setup
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
