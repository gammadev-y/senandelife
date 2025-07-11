import React from 'react';

const AboutPage: React.FC = () => {
  return (
    <div className="bg-[#0A1A10] text-white flex-grow">
      <div className="container mx-auto px-6 lg:px-8 py-12 md:py-16">
        <div className="max-w-4xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-center bg-clip-text text-transparent bg-gradient-to-r from-lime-300 to-green-400 mb-6">
            Our Mission
          </h1>
          <p className="text-lg md:text-xl text-white/80 text-center mb-12 max-w-3xl mx-auto">
            At senande.life, we are dedicated to empowering sustainable living by building a connected global community and providing the tools for a greener future.
          </p>
          
          <div className="space-y-10 text-white/90 text-left bg-black/20 p-8 rounded-lg shadow-2xl shadow-lime-900/10 border border-white/10">
            <section>
              <h2 className="text-2xl font-bold text-lime-300 mb-3">Who We Are</h2>
              <p>
                We are a collective of technologists, environmentalists, and dreamers who believe that technology can be a powerful force for positive change. We are creating a digital ecosystem that provides the knowledge, tools, and connections needed to foster a greener future. Our platform is designed for sustainability enthusiasts from all walks of life—from curious beginners to seasoned experts.
              </p>
            </section>
            
            <section>
              <h2 className="text-2xl font-bold text-lime-300 mb-3">What We Do</h2>
              <p>
                senande.life is a modular platform, with each module dedicated to a specific aspect of sustainable living. Whether it's education on environmental science (Educa), insights into mindful consumption (Nutri), or guidance on navigating regulations (Polisaw), our goal is to provide comprehensive resources that are accessible, reliable, and engaging.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-lime-300 mb-3">Our Vision</h2>
              <p>
                We envision a world where sustainable choices are easy and intuitive for everyone. By connecting like-minded individuals and providing high-quality information and tools, we aim to accelerate the transition to a more sustainable and equitable world for all. Join us on this journey to make a lasting impact, one conscious decision at a time.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
