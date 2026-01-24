'use client'

import React from 'react'
import { AnimatedLogo } from './Logo'

interface PaymentAnimationProps {
    status: 'processing' | 'success' | 'error'
    message?: string
}

export function PaymentAnimation({ status, message }: PaymentAnimationProps) {
    return (
          <div className="flex flex-col items-center justify-center p-8">
            {status === 'processing' && (
                    <>
                              <AnimatedLogo size="xl" className="mb-6" />
                              <div className="flex items-center gap-2 text-white">
                                          <div className="flex gap-1">
                                                        <span className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>span>
                                                        <span className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>span>
                                                        <span className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>span>
                                          </div>div>
                                          <span className="text-lg">{message || 'Processing payment...'}</span>span>
                              </div>div>
                    </>>
                  )}
          
            {status === 'success' && (
                    <>
                              <div className="w-24 h-24 rounded-full bg-green-500/20 flex items-center justify-center mb-6 animate-scale-in">
                                          <svg className="w-12 h-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                          </svg>svg>
                              </div>div>
                              <span className="text-xl text-green-500 font-semibold">{message || 'Payment successful!'}</span>span>
                    </>>
                  )}
          
            {status === 'error' && (
                    <>
                              <div className="w-24 h-24 rounded-full bg-red-500/20 flex items-center justify-center mb-6">
                                          <svg className="w-12 h-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                                          </svg>svg>
                              </div>div>
                              <span className="text-xl text-red-500 font-semibold">{message || 'Payment failed'}</span>span>
                    </>>
                  )}
          </div>div>
        )
}

interface PaymentOverlayProps {
    isVisible: boolean
    status: 'processing' | 'success' | 'error'
    message?: string
    onClose?: () => void
}

export function PaymentOverlay({ isVisible, status, message, onClose }: PaymentOverlayProps) {
    if (!isVisible) return null
      
        return (
              <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
                    <div className="relative bg-gray-900 rounded-2xl p-8 shadow-2xl border border-gray-700 min-w-[320px]">
                            <PaymentAnimation status={status} message={message} />
                      {(status === 'success' || status === 'error') && onClose && (
                          <button
                                        onClick={onClose}
                                        className="mt-6 w-full py-3 px-4 rounded-lg bg-gray-700 hover:bg-gray-600 text-white transition-colors"
                                      >
                            {status === 'success' ? 'Continue' : 'Try Again'}
                          </button>button>
                            )}
                    </div>div>
              </div>div>
            )
}

export default PaymentAnimation</></></></div>
