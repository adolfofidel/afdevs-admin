'use client'

import React from 'react'

interface LogoProps {
    size?: 'sm' | 'md' | 'lg' | 'xl'
    variant?: 'full' | 'icon'
    className?: string
}

const sizeMap = {
    sm: { width: 32, height: 32, fontSize: 10 },
    md: { width: 48, height: 48, fontSize: 14 },
    lg: { width: 64, height: 64, fontSize: 18 },
    xl: { width: 96, height: 96, fontSize: 26 }
}

export function Logo({ size = 'md', variant = 'full', className = '' }: LogoProps) {
    const { width, height, fontSize } = sizeMap[size]

  return (
        <div className={`flex items-center gap-2 ${className}`}>
                <svg
                          width={width}
                          height={height}
                          viewBox="0 0 100 100"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                        <circle cx="50" cy="50" r="48" fill="#1a1a2e" stroke="#e94560" strokeWidth="2"/>
                        <text
                                    x="50"
                                    y="58"
                                    textAnchor="middle"
                                    fill="white"
                                    fontFamily="Arial Black, sans-serif"
                                    fontSize="36"
                                    fontWeight="900"
                                  >
                                  AF
                        </text>text>
                        <rect x="20" y="70" width="60" height="4" rx="2" fill="#e94560"/>
                        <text
                                    x="50"
                                    y="88"
                                    textAnchor="middle"
                                    fill="#e94560"
                                    fontFamily="Arial, sans-serif"
                                    fontSize="14"
                                    fontWeight="700"
                                    letterSpacing="4"
                                  >
                                  DEVS
                        </text>text>
                </svg>svg>
        
          {variant === 'full' && (
                  <div className="flex flex-col">
                            <span
                                          className="font-black text-white leading-none"
                                          style={{ fontSize: `${fontSize}px` }}
                                        >
                                        AF DEVS
                            </span>span>
                            <span
                                          className="text-gray-400 leading-none"
                                          style={{ fontSize: `${fontSize * 0.6}px` }}
                                        >
                                        Operations Platform
                            </span>span>
                  </div>div>
              )}
        </div>div>
      )
}

export function AnimatedLogo({ size = 'lg', className = '' }: Omit<LogoProps, 'variant'>) {
    const { width, height } = sizeMap[size]
      
        return (
              <div className={`relative ${className}`}>
                    <svg
                              width={width}
                              height={height}
                              viewBox="0 0 100 100"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                              className="animate-pulse"
                            >
                            <circle
                                        cx="50"
                                        cy="50"
                                        r="46"
                                        stroke="#e94560"
                                        strokeWidth="2"
                                        fill="none"
                                        strokeDasharray="289"
                                        className="animate-spin"
                                        style={{
                                                      transformOrigin: 'center',
                                                      animation: 'spin 3s linear infinite'
                                        }}
                                      />
                            <circle cx="50" cy="50" r="42" fill="#1a1a2e"/>
                            <text
                                        x="50"
                                        y="58"
                                        textAnchor="middle"
                                        fill="white"
                                        fontFamily="Arial Black, sans-serif"
                                        fontSize="32"
                                        fontWeight="900"
                                      >
                                      AF
                            </text>text>
                            <circle cx="50" cy="75" r="4" fill="#e94560" className="animate-ping"/>
                    </svg>svg>
              </div>div>
            )
}

export default Logo</svg>
