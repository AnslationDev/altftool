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
                            We collect only the information necessary to provide our Google Ads description generation service.
                            This includes the product or service descriptions you input into our tool.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-2xl font-semibold text-(--foreground)">How We Use Your Information</h2>
                        <p className="text-(--muted-foreground) leading-relaxed">
                            Your input data is used solely to generate ad descriptions using AI technology.
                            We do not store your input data permanently, and it is only processed temporarily to deliver results.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-2xl font-semibold text-(--foreground)">Data Security</h2>
                        <p className="text-(--muted-foreground) leading-relaxed">
                            We implement industry-standard security measures to protect your data during transmission and processing.
                            All connections are encrypted using HTTPS.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-2xl font-semibold text-(--foreground)">Third-Party Services</h2>
                        <p className="text-(--muted-foreground) leading-relaxed">
                            We use third-party AI services (HuggingFace/Cohere) to generate descriptions.
                            These services process your input according to their respective privacy policies.
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
