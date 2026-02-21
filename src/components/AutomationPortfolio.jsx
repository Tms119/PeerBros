import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { BrainCircuit, CalendarClock, Mail, MessageCircle, UserPlus, FileText } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const products = [
    {
        name: 'OpenClaw.ai Setup',
        subtitle: 'The Core Infrastructure',
        description: 'We deploy and configure the powerful OpenClaw.ai agent framework customized entirely for your operational needs.',
        icon: <BrainCircuit size={60} strokeWidth={1} className="text-accent/50" />,
        stats: ['24/7 Autonomy', 'Custom Workflows'],
        bg: 'bg-black',
        roi: 'Full operational control.'
    },
    {
        name: 'Appointment Agent',
        subtitle: 'Inbound Conversion',
        description: 'Answers calls/chats 24/7, checks the calendar, books the slot, and sends confirmation automatically.',
        icon: <CalendarClock size={60} strokeWidth={1} className="text-accent/50" />,
        stats: ['Zero Lags', 'Instant Booking'],
        bg: 'bg-black',
        roi: 'Never miss a lead after hours. $48K/yr saved on receptionist costs.'
    },
    {
        name: 'Cold Outreach Agent',
        subtitle: 'Outbound Scale',
        description: 'Scrapes prospect info, writes a personalized email for each one, and sends them automatically at scale.',
        icon: <Mail size={60} strokeWidth={1} className="text-accent/50" />,
        stats: ['Hyper-Personalized', '100 emails / hr'],
        bg: 'bg-black',
        roi: '79.5% open rates vs 21% industry average. Zero manual work.'
    },
    {
        name: 'DM / Chat Agent',
        subtitle: 'Social Conversion',
        description: 'Replies to Instagram DMs and WhatsApp comments automatically, qualifies the lead, and books a call.',
        icon: <MessageCircle size={60} strokeWidth={1} className="text-accent/50" />,
        stats: ['Instant Replies', 'Lead Qualification'],
        bg: 'bg-black',
        roi: 'No lead goes cold because nobody replied fast enough.'
    },
    {
        name: 'Onboarding Agent',
        subtitle: 'Client Experience',
        description: 'New client signs → contract sent, welcome email delivered, first tasks created, and intro call booked.',
        icon: <UserPlus size={60} strokeWidth={1} className="text-accent/50" />,
        stats: ['Instant Setup', 'Zero Errors'],
        bg: 'bg-black',
        roi: 'Zero admin time per new client. Professional experience from day one.'
    },
    {
        name: 'Invoice Agent',
        subtitle: 'Cashflow Protection',
        description: 'Sends invoices automatically and chases unpaid ones with polite, automated follow-up messages.',
        icon: <FileText size={60} strokeWidth={1} className="text-accent/50" />,
        stats: ['Auto-Followups', 'Payment Links'],
        bg: 'bg-black',
        roi: 'Get paid faster. Stop chasing clients manually.'
    }
];

const AutomationPortfolio = () => {
    return (
        <section id="automation" className="relative w-full bg-obsidian border-t border-white/5 pb-[10vh]">

            {/* The Intro Bridge - Normal Scroll */}
            <div className="w-full min-h-[50vh] flex flex-col items-center justify-center bg-obsidian py-24 z-10 relative px-4">
                <div className="w-px h-24 bg-gradient-to-b from-transparent to-accent/50 mb-8" />
                <h2 className="text-4xl md:text-6xl lg:text-7xl font-display font-light text-white uppercase tracking-[0.2em] text-center leading-[1.1]">
                    Automation <br /><span className="text-accent italic">Engines</span>
                </h2>
                <div className="mt-12 text-white/40 font-mono text-sm tracking-widest uppercase animate-pulse text-center">
                    [ Scroll to Initialize ]
                </div>
            </div>

            {/* Native CSS Sticky Stacking - 100% Smooth, Zero Scroll Bumps */}
            <div className="relative w-full max-w-7xl mx-auto px-6">
                {products.map((product, index) => (
                    <div
                        key={index}
                        className={`sticky flex items-center justify-center p-6 lg:p-16 rounded-[2rem] shadow-2xl mb-12 ${product.bg} border border-white/10 overflow-hidden min-h-[80vh] w-full`}
                        style={{
                            top: `${10 + (index * 2)}vh`, // Slight stair-step effect when stacked
                            zIndex: index + 10
                        }}
                    >
                        {/* Background Number */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[30vw] md:text-[40vw] font-display font-medium text-white/5 pointer-events-none z-0 tracking-tighter mix-blend-screen leading-none">
                            0{index + 1}
                        </div>

                        <div className="relative z-10 w-full grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 lg:gap-24 items-start md:items-center">
                            {/* Left side: Icon & Headline */}
                            <div className="flex flex-col gap-6 md:gap-8">
                                <div className="glass-panel w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center pointer-events-none">
                                    {product.icon}
                                </div>
                                <div>
                                    <span className="text-accent font-mono uppercase tracking-[0.3em] text-xs md:text-sm mb-4 block">
                                        {product.subtitle}
                                    </span>
                                    <h3 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold text-white tracking-tighter leading-[0.9]">
                                        {product.name}
                                    </h3>
                                </div>
                            </div>

                            {/* Right side: Description & Metrics */}
                            <div className="flex flex-col gap-8 md:gap-10">
                                <p className="text-lg md:text-2xl lg:text-4xl text-white/80 font-light leading-relaxed">
                                    {product.description}
                                </p>

                                <div className="p-6 md:p-8 rounded-2xl bg-accent/5 border border-accent/20">
                                    <div className="text-accent font-mono text-sm uppercase tracking-widest mb-2 font-bold">
                                        The Result:
                                    </div>
                                    <p className="text-lg md:text-xl text-accent/90 italic">
                                        "{product.roi}"
                                    </p>
                                </div>

                                <div className="flex flex-wrap gap-4 pt-6 border-t border-white/10">
                                    {product.stats.map((stat, sIdx) => (
                                        <div key={sIdx} className="px-5 py-2.5 rounded-full bg-white/5 text-white/70 font-mono text-xs md:text-sm tracking-wider border border-white/10 flex items-center gap-3">
                                            <div className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse" />
                                            {stat}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default AutomationPortfolio;
