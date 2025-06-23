
import React from 'react';
import { Link } from 'react-router-dom';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { Card, CardContent } from '../components/ui/card';
import { ExternalLink } from 'lucide-react';

const Index = () => {
  const hero = useScrollAnimation();
  const cta = useScrollAnimation();
  const links = useScrollAnimation();

  return (
    <div className="min-h-screen page-enter">
      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center px-6">
        <div
          ref={hero.ref}
          className={`text-center max-w-4xl scroll-fade ${hero.isVisible ? 'visible' : ''}`}
        >
          <h1 className="text-6xl md:text-8xl font-hero tracking-tighter mb-8 leading-none">
            The <span className="text-green-400">Resurrection</span>
            <br />
            Has Begun
          </h1>
          <p className="text-xl md:text-2xl font-nav opacity-70 max-w-2xl mx-auto leading-relaxed">
            From the ashes of fallen protocols rises Reapurr—
            a force of renewal in the desolate Algorithmic Stablecoin Protocol landscape.
          </p>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-24 px-6">
        <div className="max-w-2xl mx-auto">
          <div
            ref={cta.ref}
            className={`scroll-fade ${cta.isVisible ? 'visible' : ''}`}
          >
            <Card className="glass border-white/10">
              <CardContent className="p-12 text-center">
                <h2 className="text-4xl md:text-5xl font-hero tracking-tighter mb-8">
                  Join the <span className="text-green-400">Awakening</span>
                </h2>
                <p className="text-xl font-nav opacity-70 mb-12 leading-relaxed">
                  The resurrection awaits. Step into the future of algorithmic stablecoin protocols 
                  and witness the rebirth of what was once thought impossible.
                </p>
                <Link
                  to="/awakening"
                  className="neo-button inline-block text-lg font-nav"
                >
                  Join the Awakening
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Links Section */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div
            ref={links.ref}
            className={`scroll-fade ${links.isVisible ? 'visible' : ''}`}
          >
            <h2 className="text-4xl md:text-5xl font-hero tracking-tighter mb-16 text-center">
              <span className="text-green-400">Links</span>
            </h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              <a
                href="https://x.com/reapurr"
                target="_blank"
                rel="noopener noreferrer"
                className="glass p-8 text-center hover:bg-white/10 transition-all duration-300 block"
              >
                <ExternalLink className="w-8 h-8 mx-auto mb-4 text-green-400" />
                <h3 className="text-2xl font-nav mb-4 text-green-400">X</h3>
                <p className="opacity-80 leading-relaxed">
                  Follow us on X for the latest updates and announcements.
                </p>
              </a>
              
              <a
                href="https://t.me/reapurr"
                target="_blank"
                rel="noopener noreferrer"
                className="glass p-8 text-center hover:bg-white/10 transition-all duration-300 block"
              >
                <ExternalLink className="w-8 h-8 mx-auto mb-4 text-green-400" />
                <h3 className="text-2xl font-nav mb-4 text-green-400">Telegram</h3>
                <p className="opacity-80 leading-relaxed">
                  Join our Telegram community for discussions and support.
                </p>
              </a>
              
              <a
                href="https://docs.reapurr.com"
                target="_blank"
                rel="noopener noreferrer"
                className="glass p-8 text-center hover:bg-white/10 transition-all duration-300 block"
              >
                <ExternalLink className="w-8 h-8 mx-auto mb-4 text-green-400" />
                <h3 className="text-2xl font-nav mb-4 text-green-400">Docs</h3>
                <p className="opacity-80 leading-relaxed">
                  Read our documentation to understand the protocol better.
                </p>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
