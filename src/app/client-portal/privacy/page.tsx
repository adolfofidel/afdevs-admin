'use client'

import Link from 'next/link'

export default function PrivacyPage() {
    return (
          <div className="min-h-screen bg-gray-950 py-12 px-4">
                <div className="max-w-4xl mx-auto">
                        <div className="bg-gray-900 rounded-2xl p-8 shadow-xl border border-gray-800">
                                  <h1 className="text-3xl font-bold text-white mb-2">Política de Privacidad</h1>h1>
                                  <p className="text-gray-400 mb-8">Última actualización: Enero 2026</p>p>
                        
                                  <div className="prose prose-invert max-w-none space-y-6">
                                              <section>
                                                            <h2 className="text-xl font-semibold text-white mb-3">1. Información que Recopilamos</h2>h2>
                                                            <p className="text-gray-300">Recopilamos nombre, email, teléfono, información de facturación y datos de uso. NO almacenamos números de tarjeta completos ni CVV - los pagos son tokenizados por AZUL.</p>p>
                                              </section>section>
                                  
                                              <section>
                                                            <h2 className="text-xl font-semibold text-white mb-3">2. Uso de la Información</h2>h2>
                                                            <p className="text-gray-300">Usamos su información para proporcionar servicios, procesar pagos, enviar notificaciones, responder consultas y prevenir fraudes.</p>p>
                                              </section>section>
                                  
                                              <section>
                                                            <h2 className="text-xl font-semibold text-white mb-3">3. Compartir Información</h2>h2>
                                                            <p className="text-gray-300">No vendemos ni alquilamos su información. Solo compartimos datos con AZUL (pagos), Supabase (almacenamiento) y autoridades cuando lo requiera la ley.</p>p>
                                              </section>section>
                                  
                                              <section>
                                                            <h2 className="text-xl font-semibold text-white mb-3">4. Seguridad</h2>h2>
                                                            <p className="text-gray-300">Implementamos encriptación TLS 1.3, certificados SSL, base de datos encriptada y acceso restringido.</p>p>
                                              </section>section>
                                  
                                              <section>
                                                            <h2 className="text-xl font-semibold text-white mb-3">5. Sus Derechos</h2>h2>
                                                            <p className="text-gray-300">Puede acceder, rectificar, eliminar y exportar sus datos. Contacte support@afdevs.com para ejercer estos derechos.</p>p>
                                              </section>section>
                                  
                                              <section>
                                                            <h2 className="text-xl font-semibold text-white mb-3">6. Contacto</h2>h2>
                                                            <div className="p-4 bg-gray-800 rounded-lg">
                                                                            <p className="text-gray-300"><strong>Email:</strong>strong> support@afdevs.com</p>p>
                                                                            <p className="text-gray-300"><strong>Web:</strong>strong> www.afdevs.com</p>p>
                                                            </div>div>
                                              </section>section>
                                  </div>div>
                        
                                  <div className="mt-8 pt-6 border-t border-gray-700 flex flex-wrap gap-4">
                                              <Link href="/client-portal/terms" className="text-red-400 hover:text-red-300 text-sm">Términos</Link>Link>
                                              <Link href="/client-portal/refunds" className="text-red-400 hover:text-red-300 text-sm">Reembolsos</Link>Link>
                                              <Link href="/client-portal/security" className="text-red-400 hover:text-red-300 text-sm">Seguridad</Link>Link>
                                  </div>div>
                        </div>div>
                </div>div>
          </div>div>
        )
}</div>
