import Link from "next/link";

export function Footer() {
  return (
    <footer className="flex flex-col gap-10 bg-forest pb-8">
      {/* Newsletter — UI shell only, no capture backend yet. */}
      <div className="bg-cream px-6 py-8">
        <p className="text-lg font-bold uppercase tracking-wide text-ink">Join our newsletter</p>
        <p className="mt-4 text-ink-muted">Sign up to hear about our offers and latest workshop dates.</p>
        <div className="mt-4 rounded-lg border border-tan bg-soft-white px-4 py-2.5 text-muted-warm">
          email@email.co.uk
        </div>
      </div>

      <div className="flex flex-col gap-10 px-6">
        <div className="flex size-[42px] items-center justify-center rounded-full bg-cream text-forest">f</div>

        <div className="flex flex-col gap-4">
          <Link href="#" className="font-bold tracking-wide text-cream">
            About Us
          </Link>
          <Link href="#" className="font-bold tracking-wide text-cream">
            Contact Us
          </Link>
          <Link href="#" className="font-bold tracking-wide text-cream">
            Delivery Information
          </Link>
        </div>

        <div className="flex flex-col gap-2 text-cream">
          <p>01603 927034</p>
          <p className="underline">11 Pottergate, Norwich NR2 1DS</p>
          <p>Opening times: Monday-Saturday 10am-5pm</p>
        </div>

        <div className="flex flex-col gap-6">
          <p className="text-cream">© 2026 Norfolk Yarn</p>
          <div className="flex gap-6">
            <Link href="#" className="text-sm text-cream underline">
              Privacy Policy
            </Link>
            <Link href="#" className="text-sm text-cream underline">
              Sitemap
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
