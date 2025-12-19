'use client';

import React from 'react';
import { HeroSection } from '@/components/landing/HeroSection';
import { CategoriesSection } from '@/components/landing/CategoriesSection';
import { IntroSection } from '@/components/landing/IntroSection';
import { HowItWorksSection } from '@/components/landing/HowItWorksSection';
import { SafetySection } from '@/components/landing/SafetySection';
import { DonationSection } from '@/components/landing/DonationSection';
import { FinalCTASection } from '@/components/landing/FinalCTASection';

export default function LandingPage() {
	return (
		<div className='flex flex-col min-h-screen bg-background text-slate-900'>
			<HeroSection />
			<IntroSection />
			<CategoriesSection />
			<HowItWorksSection />
			<SafetySection />
			<DonationSection />
			<FinalCTASection />
		</div>
	);
}
