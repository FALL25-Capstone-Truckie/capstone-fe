import React from 'react';
import HeroSection from './components/HeroSection';
import AboutSection from './components/AboutSection';
import ServicesSection from './components/ServicesSection';

interface HomePageProps { }

const HomePage: React.FC<HomePageProps> = () => {
    return (
        <>
            <HeroSection />
            <AboutSection />
            <ServicesSection />
        </>
    );
};

export default HomePage; 