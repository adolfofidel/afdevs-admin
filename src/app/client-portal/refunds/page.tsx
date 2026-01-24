'use client'

import Link from 'next/link'

export default function RefundsPage() {
    return (
          <div className="min-h-screen bg-gray-950 py-12 px-4">
                <div className="max-w-4xl mx-auto">
                        <div className="bg-gray-900 rounded-2xl p-8 shadow-xl border border-gray-800">
                                  <h1 className="text-3xl font-bold text-white mb-2">Política de Reembolsos</h1>h1>
                                  <p className="text-gray-400 mb-8">Última actualización: Enero 2026</p>p>
                        
                                  <div className="bg-green-900/30 border border-green-700 rounded-lg p-4 mb-8">
                                              <p className="text-green-300 font-medium">Garantía de satisfacción de 7 días para nuevos suscriptores</p>p>
                                  </div>div>
                        
                                  <div className="prose prose-invert max-w-none space-y-6">
                                              <section>
                                                            <h2 className="text-xl font-semibold text-white mb-3">1. Cancelación</h2>h2>
                                                            <p className="text-gray-300">Puede cancelar en cualquier momento desde su portal o enviando email a support@afdevs.com. Mantendrá acceso hasta el fin del período pagado.</p>p>
                                              </section>section>
                                  
                                              <section>
                                                            <h2 className="text-xl font-semibold text-white mb-3">2. Elegibilidad para Reembolso</h2>h2>
                                                            <ul className="text-gray-300 list-disc list-inside space-y-2">
                                                                            <li>Dentro de 7 días (primera suscripción): 100% reembolso</li>li>
                                                                            <li>Cargo duplicado: 100% del cargo duplicado</li>li>
                                                                            <li>Error en monto: Diferencia del monto</li>li>
                                                                            <li>Después de 7 días: Sin reembolso (uso hasta fin de período)</li>li>
                                                            </ul>ul>
                                              </section>section>
                                  
                                              <section>
                                                            <h2 className="text-xl font-semibold text-white mb-3">3. Proceso de Reembolso</h2>h2>
                                                            <p className="text-gray-300">Envíe solicitud a support@afdevs.com con nombre, email y motivo. Confirmación en 2 días hábiles. Reembolso aparece en 5-10 días hábiles.</p>p>
                                              </section>section>
                                  
                                              <section>
                                                            <h2 className="text-xl font-semibold text-white mb-3">4. Contacto</h2>h2>
                                                            <div className="p-4 bg-gray-800 rounded-lg">
                                                                            <p className="text-gray-300"><strong>Email:</strong>strong> support@afdevs.com</p>p>
                                                                            <p className="text-gray-300"><strong>Web:</strong>strong> www.afdevs.com</p>p>
                                                            </div>div>
                                              </section>section>
                                  </div>div>
                        
                                  <div className="mt-8 pt-6 border-t border-gray-700 flex flex-wrap gap-4">
                                              <Link href="/client-portal/terms" className="text-red-400 hover:text-red-300 text-sm">Términos</Link>Link>
                                              <Link href="/client-portal/privacy" className="text-red-400 hover:text-red-300 text-sm">Privacidad</Link>Link>
                                              <Link href="/client-portal/security" className="text-red-400 hover:text-red-300 text-sm">Seguridad</Link>Link>
                                  </div>div>
                        </div>div>
                </div>div>
          </div>div>
        )
}</div>
