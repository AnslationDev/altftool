import Navigation from '../components/Navigation';
import { Card } from '../components/ui/card';
const Privacy = () => {
  return <div className="min-h-screen bg-(--background)">
            <Navigation />

            <div className="container mx-auto px-4 py-12 max-w-4xl">
                <h1 className="text-4xl font-bold mb-8 text-(--foreground)">Privacy Policy</h1>

                <Card className="p-8 space-y-6">
                    <section className="space-y-3">
                        <h2 className="text-2xl font-semibold text-(--foreground)">Information We Collect</h2>
                        <p className="text-(--muted-foreground) leading-relaxed">
                            We do not collect the product or service descriptions you type into this tool. Nothing you enter
                            is sent to a server or stored anywhere.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-2xl font-semibold text-(--foreground)">How We Use Your Information</h2>
                        <p className="text-(--muted-foreground) leading-relaxed">
                            Your input is used solely to generate ad descriptions, and that generation happens entirely in
                            your own browser by slotting your text into pre-written templates. It is never transmitted
                            anywhere and is discarded the moment you close or refresh the page.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-2xl font-semibold text-(--foreground)">Data Security</h2>
                        <p className="text-(--muted-foreground) leading-relaxed">
                            Because your input never leaves your device, there is no transmission to secure. The page itself
                            is served over HTTPS like the rest of the site.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-2xl font-semibold text-(--foreground)">Third-Party Services</h2>
                        <p className="text-(--muted-foreground) leading-relaxed">
                            This tool does not call any third-party AI or generation service. No third party ever receives
                            the text you type in.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-2xl font-semibold text-(--foreground)">Cookies</h2>
                        <p className="text-(--muted-foreground) leading-relaxed">
                            We do not use cookies to track your activity. Our service functions without any persistent data storage.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-2xl font-semibold text-(--foreground)">Contact Us</h2>
                        <p className="text-(--muted-foreground) leading-relaxed">
                            If you have any questions about this Privacy Policy, please contact us through our support channels.
                        </p>
                    </section>
                </Card>
            </div>
        </div>;
};
export default Privacy;
