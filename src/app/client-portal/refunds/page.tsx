'use client'

import Link from 'next/link'

export default function RefundsPage() {
  return (
    <div className="min-h-screen bg-gray-950 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-gray-900 rounded-2xl p-8 shadow-xl border border-gray-800">
          <h1 className="text-3xl font-bold text-white mb-2">Política de Reembolsos</h1>
          <p className="text-gray-400 mb-8">Última actualización: Enero 2026</p>

          <div className="bg-green-900/20 border border-green-700 rounded-lg p-4 mb-8">
            <p className="text-green-400 font-medium">✓ Garantía de satisfacción de 30 días</p>
          </div>

          <div className="prose prose-invert max-w-none space-y-6">
            <section>
              <h2 className="text-xl font-semibold text-white mb-3">1. Período de Reembolso</h2>
              <p className="text-gray-300">Puede solicitar un reembolso completo dentro de los primeros 30 días desde la activación de su suscripción. No se requiere justificación.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">2. Cómo Solicitar</h2>
              <ul className="text-gray-300 list-disc list-inside space-y-2">
                <li>Envíe un email a support@afdevs.com</li>
                <li>Incluya su nombre y email registrado</li>
                <li>Procesaremos su solicitud en 3-5 días hábiles</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">3. Método de Reembolso</h2>
              <p className="text-gray-300">El reembolso se realiza al mismo método de pago utilizado. Para tarjetas de crédito, puede tomar 5-10 días hábiles en reflejarse.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">4. Exclusiones</h2>
              <p className="text-gray-300">No aplican reembolsos después de 30 días, ni para servicios de desarrollo personalizado ya entregados.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">5. Contacto</h2>
              <div className="p-4 bg-gray-800 rounded-lg">
                <p className="text-gray-300"><strong>Email:</strong> support@afdevs.com</p>
                <p className="text-gray-300"><strong>Web:</strong> www.afdevs.com</p>
              </div>
            </section>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-700 flex flex-wrap gap-4">
            <Link href="/client-portal/terms" className="text-red-400 hover:text-red-300 text-sm">Términos</Link>
            <Link href="/client-portal/privacy" className="text-red-400 hover:text-red-300 text-sm">Privacidad</Link>
            <Link href="/client-portal/security" className="text-red-400 hover:text-red-300 text-sm">Seguridad</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
