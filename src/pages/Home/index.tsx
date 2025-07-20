import React from 'react';
import { MainLayout } from '../../components/layout';
import { FeatureWrapper } from '../../components/features';
import HeroSection from './components/HeroSection';
import AboutSection from './components/AboutSection';
import ServicesSection from './components/ServicesSection';
import TrialSection from './components/TrialSection';
import FAQSection from './components/FAQSection';
import TeamSection from './components/TeamSection';

interface HomePageProps { }

const HomePage: React.FC<HomePageProps> = () => {
    return (
        <MainLayout>
            <HeroSection />
            <AboutSection />
            <ServicesSection />
            <TrialSection />
            <FAQSection />
            <TeamSection />
        </MainLayout>
    );
};

export default HomePage; 