import {
  ClipboardDocumentListIcon,
  BuildingOffice2Icon,
  BriefcaseIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline'
import LandingHeader from '../components/LandingHeader'
import Footer from '../components/Footer'
import Button from '../components/Button'
import Card from '../components/Card'

const features = [
  {
    icon: ClipboardDocumentListIcon,
    title: 'Bewerbungen im Blick',
    description: 'Status, Datum und Notizen zu jeder Bewerbung an einem Ort statt verteilt über Excel-Tabs und E-Mails.',
  },
  {
    icon: BuildingOffice2Icon,
    title: 'Unternehmen zentral verwalten',
    description: 'Lege Unternehmen einmal an und verknüpfe beliebig viele Stellenausschreibungen und Bewerbungen damit.',
  },
  {
    icon: BriefcaseIcon,
    title: 'Stellenausschreibungen',
    description: 'Behalte den Überblick, auf welche Position du dich beworben hast und wann sie veröffentlicht wurde.',
  },
  {
    icon: ChartBarIcon,
    title: 'Dashboard mit Statistiken',
    description: 'Auf einen Blick: wie viele offene Bewerbungen, Einladungen und Zusagen du gerade hast.',
  },
  {
    icon: ShieldCheckIcon,
    title: 'Deine Daten, deine Kontrolle',
    description: 'Läuft lokal oder auf deiner eigenen Infrastruktur – keine Werbung, kein Datenverkauf.',
  },
  {
    icon: SparklesIcon,
    title: 'Modern & schnell',
    description: 'Gebaut mit FastAPI und React – reagiert sofort, ganz ohne aufgeblähtes Software-Gefühl.',
  },
]

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      <LandingHeader />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-violet-950 via-purple-900 to-fuchsia-900">
        <div className="absolute -top-24 -right-16 w-96 h-96 rounded-full bg-fuchsia-500/30 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 left-1/4 w-96 h-96 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />
        <div className="absolute top-16 right-1/4 w-24 h-24 rounded-full border border-white/10 pointer-events-none hidden sm:block" />
        <div className="absolute bottom-16 right-16 w-3 h-3 rounded-full bg-white/30 pointer-events-none hidden sm:block" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-28 sm:py-36 text-center">
          <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-violet-100 text-sm font-medium mb-6">
            Kostenlos & Open Source
          </span>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white mb-6">
            Bewerbungen verwalten,<br /> ohne den Überblick zu verlieren
          </h1>
          <p className="text-lg sm:text-xl text-violet-200 max-w-2xl mx-auto mb-10">
            Der Bewerbungssammler bündelt Unternehmen, Stellenausschreibungen und Bewerbungen an einem Ort –
            übersichtlich, schnell und ohne Excel-Chaos.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button to="/signup" size="lg">Jetzt starten</Button>
            <Button to="/dashboard" variant="outline" size="lg">Demo ansehen</Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-gray-900 mb-4">
            Alles, was du für deine Jobsuche brauchst
          </h2>
          <p className="text-gray-600 text-lg">
            Kein Feature-Overkill – nur das, was den Bewerbungsprozess wirklich einfacher macht.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => (
            <Card key={idx} className="hover:-translate-y-1">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-violet-100 to-fuchsia-100 mb-4">
                <feature.icon className="w-6 h-6 text-violet-700" aria-hidden="true" />
              </div>
              <h3 className="font-semibold text-gray-900 text-lg mb-2">{feature.title}</h3>
              <p className="text-gray-600 text-sm">{feature.description}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* "Pricing" / Kostenlos */}
      <section id="pricing" className="bg-gray-50 py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-gray-900 mb-4">Ein Preis: kostenlos</h2>
          <p className="text-gray-600 text-lg mb-10">
            Der Bewerbungssammler ist ein privates Open-Source-Projekt – keine Abos, keine versteckten Kosten,
            keine Limits.
          </p>
          <Card className="max-w-sm mx-auto text-left">
            <p className="text-sm font-medium text-violet-700 mb-1">Für alle</p>
            <p className="text-4xl font-black text-gray-900 mb-4">0&nbsp;€</p>
            <ul className="space-y-2 text-sm text-gray-600 mb-6">
              <li>✓ Unbegrenzt Bewerbungen, Unternehmen & Stellenausschreibungen</li>
              <li>✓ Eigenes Hosting (Docker oder AWS)</li>
              <li>✓ Voller Zugriff auf den Quellcode</li>
            </ul>
            <Button to="/signup" className="w-full">Jetzt starten</Button>
          </Card>
        </div>
      </section>

      {/* About */}
      <section id="about" className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-gray-900 mb-4">Über das Projekt</h2>
        <p className="text-gray-600 text-lg">
          Entstanden aus dem immer gleichen Problem: eine Excel-Tabelle, die irgendwann niemand mehr versteht.
          Der Bewerbungssammler ist bewusst schlank gehalten – FastAPI im Backend, React im Frontend,
          PostgreSQL als Datenbank.
        </p>
      </section>

      {/* CTA Footer */}
      <section className="relative overflow-hidden bg-gradient-to-br from-violet-950 via-purple-900 to-fuchsia-900">
        <div className="absolute -top-16 left-1/4 w-72 h-72 rounded-full bg-fuchsia-500/20 blur-3xl pointer-events-none" />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white mb-4">
            Bereit, den Überblick zurückzugewinnen?
          </h2>
          <p className="text-violet-200 text-lg mb-8">
            Leg direkt los – die Einrichtung dauert keine zwei Minuten.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button to="/signup" size="lg">Registrieren</Button>
            <Button to="/login" variant="outline" size="lg">Login</Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
