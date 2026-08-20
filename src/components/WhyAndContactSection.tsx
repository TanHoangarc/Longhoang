import React from 'react';
import { WhyChooseUs } from './WhyChooseUs';
import { QuoteForm } from './QuoteForm';

interface WhyAndContactSectionProps {
  prefilledService?: string;
}

export const WhyAndContactSection: React.FC<WhyAndContactSectionProps> = ({
  prefilledService,
}) => {
  return (
    <section className="py-16 sm:py-24 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          {/* Left Column (5 cols): VÌ SAO CHỌN CHÚNG TÔI */}
          <div className="lg:col-span-5 pt-2">
            <WhyChooseUs />
          </div>

          {/* Right Column (7 cols): LIÊN HỆ VỚI CHÚNG TÔI */}
          <div className="lg:col-span-7">
            <QuoteForm prefilledService={prefilledService} />
          </div>
        </div>
      </div>
    </section>
  );
};
