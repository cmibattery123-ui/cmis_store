import React from 'react';
import { Users, Monitor, TrendingUp } from 'lucide-react';

export default function Mission() {
  const blocks = [
    {
      type: 'text',
      icon: <Users className="w-8 h-8 text-primary mb-4 drop-shadow-[0_0_10px_rgba(250,255,0,0.5)]" />,
      title: 'CLIENT CONTENTMENT',
      text: 'At CMI, we are dedicated to delivering exceptional customer satisfaction by providing high-quality, reliable battery solutions tailored to meet the unique needs of each client. Our goal is to comprehend and surpass the expectations of our customers.'
    },
    {
      type: 'image',
      src: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=800&auto=format&fit=crop', // laptop graph
    },
    {
      type: 'text',
      icon: <Monitor className="w-8 h-8 text-primary mb-4 drop-shadow-[0_0_10px_rgba(250,255,0,0.5)]" />,
      title: 'CONSTANT IMPROVEMENT',
      text: 'At CMI, we embrace a culture of continuous improvement, relentlessly pursuing innovation and efficiency in every aspect of our business. We are committed to refining our processes, enhancing product quality, and adopting the latest technologies.'
    },
    {
      type: 'image',
      src: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=800&auto=format&fit=crop', // mountain star / team
    },
    {
      type: 'text',
      icon: <TrendingUp className="w-8 h-8 text-primary mb-4 drop-shadow-[0_0_10px_rgba(250,255,0,0.5)]" />,
      title: 'DRIVEN BY INNOVATION',
      text: 'At CMI, we are driven by innovation, constantly exploring new technologies and solutions to push the boundaries of energy storage. Our commitment to research and development fuels the creation of cutting-edge, sustainable battery products.'
    },
    {
      type: 'image',
      src: 'https://images.unsplash.com/photo-1529699211952-734e80c4d42b?q=80&w=800&auto=format&fit=crop', // chess
    }
  ];

  return (
    <section className="py-24 bg-[#0A0A0A] text-white">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-3xl md:text-5xl font-heading font-bold text-white">
            The CMI Mission
          </h2>
          <p className="text-gray-400 text-sm md:text-base leading-relaxed max-w-2xl mx-auto">
            At Chinna Mayil Industries, our top priorities are to establish new benchmarks in the battery manufacturing sector.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto border border-white/10 rounded-xl overflow-hidden shadow-2xl">
          {blocks.map((block, index) => (
            <div key={index} className="aspect-square relative flex flex-col items-center justify-center text-center p-8 bg-[#111] overflow-hidden group border border-white/5">
              {block.type === 'text' ? (
                <>
                  <div className="relative z-10 flex flex-col items-center">
                    {block.icon}
                    <h3 className="font-bold text-sm mb-4 text-white uppercase tracking-widest">{block.title}</h3>
                    <p className="text-[13px] text-gray-400 leading-loose max-w-[280px]">
                      {block.text}
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="absolute inset-0 bg-black/40 z-10" />
                  <img src={block.src} alt="Mission Showcase" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  
                  {/* Decorative Primary Curve overlay */}
                  <div 
                    className="absolute z-20 bg-primary/20 backdrop-blur-sm rounded-full w-[150%] h-[150%] border border-primary/30 shadow-[0_0_50px_rgba(250,255,0,0.2)]"
                    style={{
                      bottom: '-120%',
                      right: index % 2 === 0 ? '-50%' : 'auto',
                      left: index % 2 !== 0 ? '-50%' : 'auto',
                    }}
                  />
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
