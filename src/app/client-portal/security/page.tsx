'use client'

import Link from 'next/link'

export default function SecurityPage() {
  return (
    <div className="min-h-screen bg-gray-950 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-gray-900 rounded-2xl p-8 shadow-xl border border-gray-800">
          <h1 className="text-3xl font-bold text-white mb-2">Seguridad de Pagos</h1>
          <p className="text-gray-400 mb-8">Última actualización: Enero 2026</p>

          <div className="flex flex-wrap justify-center gap-6 mb-10 p-6 bg-gray-800/50 rounded-xl">
            <div className="flex flex-col items-center">
              <div className="w-16 h-10 bg-white rounded flex items-center justify-center">
                <span className="text-blue-800 font-bold text-sm">VISA</span>
              </div>
              <span className="text-xs text-gray-400 mt-2">Aceptamos Visa</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-10 bg-white rounded flex items-center justify-center">
                <div className="flex">
                  <div className="w-4 h-4 bg-red-500 rounded-full -mr-1"></div>
                  <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                </div>
              </div>
              <span className="text-xs text-gray-400 mt-2">MasterCard</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-10 bg-white rounded flex items-center justify-center p-1">
                <div className="text-center">
                  <div className="text-[6px] font-bold text-blue-900">VERIFIED BY</div>
                  <div className="text-[8px] font-bold text-blue-700">VISA</div>
                </div>
              </div>
              <span className="text-xs text-gray-400 mt-2">3D Secure</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-10 bg-blue-600 rounded flex items-center justify-center">
                <span className="text-white font-bold text-sm">AZUL</span>
              </div>
              <span className="text-xs text-gray-400 mt-2">Procesador</span>
            </div>
          </div>

          <div className="prose prose-invert max-w-none space-y-6">
            <section>
              <h2 className="text-xl font-semibold text-white mb-3">Autenticación 3D Secure</h2>
              <p className="text-gray-300">Implementamos 3D Secure 2.0 con Verified by Visa y MasterCard ID Check para protección adicional contra uso no autorizado de tarjetas.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">Cumplimiento PCI DSS</h2>
              <p className="text-gray-300">No almacenamos números de tarjeta completos ni CVV. Los datos de pago son tokenizados mediante DataVault de AZUL. Toda transmisión usa HTTPS/TLS 1.3.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">Encriptación</h2>
              <p className="text-gray-300">TLS 1.3 para comunicaciones, certificados SSL, encriptación AES-256 para datos en reposo.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">Contacto</h2>
              <div className="p-4 bg-gray-800 rounded-lg">
                <p className="text-gray-300"><strong>Email:</strong> support@afdevs.com</p>
                <p className="text-gray-300"><strong>Web:</strong> www.afdevs.com</p>
              </div>
            </section>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-700 flex flex-wrap gap-4">
            <Link href="/client-portal/terms" className="text-red-400 hover:text-red-300 text-sm">Términos</Link>
            <Link href="/client-portal/privacy" className="text-red-400 hover:text-red-300 text-sm">Privacidad</Link>
            <Link href="/client-portal/refunds" className="text-red-400 hover:text-red-300 text-sm">Reembolsos</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
