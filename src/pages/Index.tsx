
import React from 'react';
import { Link } from 'react-router-dom';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { Card, CardContent } from '../components/ui/card';

const Index = () => {
  const hero = useScrollAnimation();
  const story = useScrollAnimation();
  const vision = useScrollAnimation();
  const cta = useScrollAnimation();

  return (
    <div className="min-h-screen page-enter">
      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center px-6">
        <div
          ref={hero.ref}
          className={`text-center max-w-4xl scroll-fade ${hero.isVisible ? 'visible' : ''}`}
        >
          <h1 className="text-6xl md:text-8xl font-light tracking-tighter mb-8 leading-none">
            The <span className="text-green-400">Resurrection</span>
            <br />
            Has Begun
          </h1>
          <p className="text-xl md:text-2xl font-light opacity-70 max-w-2xl mx-auto leading-relaxed">
            From the ashes of fallen protocols rises Reapurr—
            a force of renewal in the desolate tomb fork landscape.
          </p>
        </div>
      </section>

      {/* The Story Section */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div
            ref={story.ref}
            className={`scroll-fade ${story.isVisible ? 'visible' : ''}`}
          >
            <h2 className="text-4xl md:text-5xl font-light tracking-tighter mb-12 text-center">
              The Story of <span className="text-green-400">Reapurr</span>
            </h2>
            
            <div className="space-y-8 text-lg font-light leading-relaxed opacity-80">
              <p>
                In the beginning, there was promise. Tomb Finance and its forks 
                offered a revolutionary approach to DeFi—algorithmic tokens pegged 
                to stable assets, powered by innovative mechanics that promised 
                sustainable yields and economic growth.
              </p>
              
              <p>
                But promises were broken. One by one, the tomb forks fell into 
                decay. Their ecosystems withered, their communities scattered, 
                and their innovative mechanisms lay dormant—forgotten relics 
                of what could have been.
              </p>
              
              <p>
                Yet from this desolation, a new force emerges. Reapurr is not 
                merely another fork—it is the resurrection itself. We have studied 
                the failures, learned from the mistakes, and forged a protocol 
                that transcends the limitations of its predecessors.
              </p>
              
              <p>
                Through careful design, community governance, and unwavering 
                commitment to sustainability, Reapurr breathes life back into 
                the tomb fork concept. We are the bridge between the old world's 
                promise and the new world's potential.
              </p>
              
              <p className="text-green-400 font-normal">
                The resurrection has begun. Will you join us in rewriting 
                the future of algorithmic finance?
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Vision Cards */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div
            ref={vision.ref}
            className={`scroll-fade ${vision.isVisible ? 'visible' : ''}`}
          >
            <h2 className="text-4xl md:text-5xl font-light tracking-tighter mb-16 text-center">
              Our <span className="text-green-400">Vision</span>
            </h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="glass p-8 text-center">
                <h3 className="text-2xl font-light mb-4 text-green-400">Sustainability</h3>
                <p className="opacity-80 leading-relaxed">
                  Built on proven economic models with safeguards against 
                  the death spirals that claimed our predecessors.
                </p>
              </div>
              
              <div className="glass p-8 text-center">
                <h3 className="text-2xl font-light mb-4 text-green-400">Innovation</h3>
                <p className="opacity-80 leading-relaxed">
                  Introducing novel mechanisms that enhance stability 
                  while preserving the ambitious vision of algorithmic finance.
                </p>
              </div>
              
              <div className="glass p-8 text-center">
                <h3 className="text-2xl font-light mb-4 text-green-400">Community</h3>
                <p className="opacity-80 leading-relaxed">
                  Governed by those who believe in the resurrection—
                  a community united in bringing the dead back to life.
                </p>
              </div>
            </div>
          </div>
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
                <h2 className="text-4xl md:text-5xl font-light tracking-tighter mb-8">
                  Attend the <span className="text-green-400">Awakening</span>
                </h2>
                <p className="text-xl font-light opacity-70 mb-12 leading-relaxed">
                  The resurrection awaits. Step into the future of tomb finance 
                  and witness the rebirth of what was once thought impossible.
                </p>
                <Link
                  to="/awakening"
                  className="neo-button inline-block text-lg"
                >
                  Begin the Awakening
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
