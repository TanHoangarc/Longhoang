import React, { useState } from 'react';
import {
  Clock,
  ClipboardCheck,
  LayoutGrid,
  Send,
  Ship,
  Compass,
} from 'lucide-react';
import { SERVICES_LIST } from '../data/mockData';
import { ServiceItem } from '../types';

interface ServicesSectionProps {
  onSelectService: (service: ServiceItem) => void;
  onRequestQuoteWithService?: (serviceTitle: string) => void;
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({
  onSelectService,
}) => {
  // Card 2 (cross-border) is highlighted by default as shown in the user's reference screenshot 1
  const [activeCardId, setActiveCardId] = useState<string>('cross-border');

  // Custom Icon renderer matching screenshot 1
  const renderCardIcon = (id: string, iconName: string, isHighlighted: boolean) => {
    const iconColor = '#1544a0'; // Deep brand blue matching screenshot

    switch (id) {
      case 'multimodal':
        // Signpost with direction arrows on a pole
        return (
          <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2v20" />
            <path d="M18 6H8a2 2 0 0 0-2 2v0a2 2 0 0 0 2 2h10l3-2-3-2z" />
            <path d="M6 13h10a2 2 0 0 1 2 2v0a2 2 0 0 1-2 2H6l-3-2 3-2z" />
          </svg>
        );

      case 'cross-border':
        // Clock icon
        return <Clock className="w-8 h-8" style={{ color: iconColor }} strokeWidth={2.2} />;

      case 'air-freight':
        // Clipboard with checkmark
        return (
          <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="18" height="18" x="3" y="3" rx="3" />
            <path d="m9 12 2 2 4-4" />
          </svg>
        );

      case 'sea-freight':
        // Container / Book / Vessel Marine Icon
        return (
          <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="18" height="15" x="3" y="5" rx="3" />
            <path d="M3 10h18" />
            <circle cx="8" cy="15" r="1" fill={iconColor} />
            <circle cx="16" cy="15" r="1" fill={iconColor} />
          </svg>
        );

      case 'inland-trucking':
        // 4 square grid icon
        return (
          <svg className="w-8 h-8" viewBox="0 0 24 24" fill={iconColor} stroke="none">
            <rect width="8.5" height="8.5" x="2.5" y="2.5" rx="1.5" />
            <rect width="8.5" height="8.5" x="13" y="2.5" rx="1.5" />
            <rect width="8.5" height="8.5" x="2.5" y="13" rx="1.5" />
            <rect width="8.5" height="8.5" x="13" y="13" rx="1.5" />
          </svg>
        );

      case 'value-added':
        // Paper plane / Send navigation icon
        return (
          <svg className="w-8 h-8" viewBox="0 0 24 24" fill={iconColor} stroke="none">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
          </svg>
        );

      default:
        return <Compass className="w-8 h-8" style={{ color: iconColor }} />;
    }
  };

  // Only take the first 6 core services matching screenshot 1
  const displayServices = SERVICES_LIST.slice(0, 6);

  return (
    <section id="services" className="relative py-16 sm:py-24 bg-[#f8fafc] overflow-hidden">
      {/* BACKGROUND DOTTED WORLD MAP (Bản đồ thế giới chấm bi) matching user screenshot 2 */}
      <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none select-none opacity-20 md:opacity-25">
        <svg
          viewBox="0 0 1200 640"
          className="w-full h-full max-w-7xl object-contain"
          fill="#1544a0"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* North America */}
          <g>
            <circle cx="80" cy="180" r="3.5" /><circle cx="95" cy="180" r="3.5" /><circle cx="110" cy="180" r="3.5" />
            <circle cx="95" cy="195" r="3.5" /><circle cx="110" cy="195" r="3.5" /><circle cx="125" cy="195" r="3.5" /><circle cx="140" cy="195" r="3.5" />
            <circle cx="110" cy="210" r="3.5" /><circle cx="125" cy="210" r="3.5" /><circle cx="140" cy="210" r="3.5" /><circle cx="155" cy="210" r="3.5" /><circle cx="170" cy="210" r="3.5" /><circle cx="185" cy="210" r="3.5" />
            <circle cx="125" cy="225" r="3.5" /><circle cx="140" cy="225" r="3.5" /><circle cx="155" cy="225" r="3.5" /><circle cx="170" cy="225" r="3.5" /><circle cx="185" cy="225" r="3.5" /><circle cx="200" cy="225" r="3.5" /><circle cx="215" cy="225" r="3.5" /><circle cx="230" cy="225" r="3.5" />
            <circle cx="140" cy="240" r="3.5" /><circle cx="155" cy="240" r="3.5" /><circle cx="170" cy="240" r="3.5" /><circle cx="185" cy="240" r="3.5" /><circle cx="200" cy="240" r="3.5" /><circle cx="215" cy="240" r="3.5" /><circle cx="230" cy="240" r="3.5" /><circle cx="245" cy="240" r="3.5" /><circle cx="260" cy="240" r="3.5" />
            <circle cx="155" cy="255" r="3.5" /><circle cx="170" cy="255" r="3.5" /><circle cx="185" cy="255" r="3.5" /><circle cx="200" cy="255" r="3.5" /><circle cx="215" cy="255" r="3.5" /><circle cx="230" cy="255" r="3.5" /><circle cx="245" cy="255" r="3.5" /><circle cx="260" cy="255" r="3.5" /><circle cx="275" cy="255" r="3.5" />
            <circle cx="170" cy="270" r="3.5" /><circle cx="185" cy="270" r="3.5" /><circle cx="200" cy="270" r="3.5" /><circle cx="215" cy="270" r="3.5" /><circle cx="230" cy="270" r="3.5" /><circle cx="245" cy="270" r="3.5" /><circle cx="260" cy="270" r="3.5" /><circle cx="275" cy="270" r="3.5" />
            <circle cx="185" cy="285" r="3.5" /><circle cx="200" cy="285" r="3.5" /><circle cx="215" cy="285" r="3.5" /><circle cx="230" cy="285" r="3.5" /><circle cx="245" cy="285" r="3.5" /><circle cx="260" cy="285" r="3.5" />
            <circle cx="200" cy="300" r="3.5" /><circle cx="215" cy="300" r="3.5" /><circle cx="230" cy="300" r="3.5" /><circle cx="245" cy="300" r="3.5" />
            <circle cx="215" cy="315" r="3.5" /><circle cx="230" cy="315" r="3.5" />
            <circle cx="230" cy="330" r="3.5" />
            <circle cx="245" cy="345" r="3.5" />
          </g>

          {/* South America */}
          <g>
            <circle cx="260" cy="375" r="3.5" /><circle cx="275" cy="375" r="3.5" /><circle cx="290" cy="375" r="3.5" />
            <circle cx="260" cy="390" r="3.5" /><circle cx="275" cy="390" r="3.5" /><circle cx="290" cy="390" r="3.5" /><circle cx="305" cy="390" r="3.5" /><circle cx="320" cy="390" r="3.5" />
            <circle cx="275" cy="405" r="3.5" /><circle cx="290" cy="405" r="3.5" /><circle cx="305" cy="405" r="3.5" /><circle cx="320" cy="405" r="3.5" /><circle cx="335" cy="405" r="3.5" /><circle cx="350" cy="405" r="3.5" />
            <circle cx="275" cy="420" r="3.5" /><circle cx="290" cy="420" r="3.5" /><circle cx="305" cy="420" r="3.5" /><circle cx="320" cy="420" r="3.5" /><circle cx="335" cy="420" r="3.5" /><circle cx="350" cy="420" r="3.5" /><circle cx="365" cy="420" r="3.5" />
            <circle cx="290" cy="435" r="3.5" /><circle cx="305" cy="435" r="3.5" /><circle cx="320" cy="435" r="3.5" /><circle cx="335" cy="435" r="3.5" /><circle cx="350" cy="435" r="3.5" />
            <circle cx="290" cy="450" r="3.5" /><circle cx="305" cy="450" r="3.5" /><circle cx="320" cy="450" r="3.5" /><circle cx="335" cy="450" r="3.5" />
            <circle cx="290" cy="465" r="3.5" /><circle cx="305" cy="465" r="3.5" /><circle cx="320" cy="465" r="3.5" />
            <circle cx="290" cy="480" r="3.5" /><circle cx="305" cy="480" r="3.5" />
            <circle cx="290" cy="495" r="3.5" /><circle cx="305" cy="495" r="3.5" />
            <circle cx="290" cy="510" r="3.5" />
          </g>

          {/* Europe */}
          <g>
            <circle cx="530" cy="150" r="3.5" /><circle cx="545" cy="150" r="3.5" />
            <circle cx="530" cy="165" r="3.5" /><circle cx="545" cy="165" r="3.5" /><circle cx="560" cy="165" r="3.5" /><circle cx="575" cy="165" r="3.5" /><circle cx="590" cy="165" r="3.5" />
            <circle cx="515" cy="180" r="3.5" /><circle cx="530" cy="180" r="3.5" /><circle cx="545" cy="180" r="3.5" /><circle cx="560" cy="180" r="3.5" /><circle cx="575" cy="180" r="3.5" /><circle cx="590" cy="180" r="3.5" /><circle cx="605" cy="180" r="3.5" /><circle cx="620" cy="180" r="3.5" />
            <circle cx="500" cy="195" r="3.5" /><circle cx="515" cy="195" r="3.5" /><circle cx="530" cy="195" r="3.5" /><circle cx="545" cy="195" r="3.5" /><circle cx="560" cy="195" r="3.5" /><circle cx="575" cy="195" r="3.5" /><circle cx="590" cy="195" r="3.5" /><circle cx="605" cy="195" r="3.5" /><circle cx="620" cy="195" r="3.5" /><circle cx="635" cy="195" r="3.5" />
            <circle cx="500" cy="210" r="3.5" /><circle cx="515" cy="210" r="3.5" /><circle cx="530" cy="210" r="3.5" /><circle cx="545" cy="210" r="3.5" /><circle cx="560" cy="210" r="3.5" /><circle cx="575" cy="210" r="3.5" /><circle cx="590" cy="210" r="3.5" /><circle cx="605" cy="210" r="3.5" />
            <circle cx="485" cy="225" r="3.5" /><circle cx="500" cy="225" r="3.5" /><circle cx="515" cy="225" r="3.5" /><circle cx="545" cy="225" r="3.5" /><circle cx="560" cy="225" r="3.5" /><circle cx="575" cy="225" r="3.5" />
          </g>

          {/* Africa */}
          <g>
            <circle cx="500" cy="255" r="3.5" /><circle cx="515" cy="255" r="3.5" /><circle cx="530" cy="255" r="3.5" /><circle cx="545" cy="255" r="3.5" /><circle cx="560" cy="255" r="3.5" /><circle cx="575" cy="255" r="3.5" /><circle cx="590" cy="255" r="3.5" /><circle cx="605" cy="255" r="3.5" />
            <circle cx="485" cy="270" r="3.5" /><circle cx="500" cy="270" r="3.5" /><circle cx="515" cy="270" r="3.5" /><circle cx="530" cy="270" r="3.5" /><circle cx="545" cy="270" r="3.5" /><circle cx="560" cy="270" r="3.5" /><circle cx="575" cy="270" r="3.5" /><circle cx="590" cy="270" r="3.5" /><circle cx="605" cy="270" r="3.5" /><circle cx="620" cy="270" r="3.5" />
            <circle cx="485" cy="285" r="3.5" /><circle cx="500" cy="285" r="3.5" /><circle cx="515" cy="285" r="3.5" /><circle cx="530" cy="285" r="3.5" /><circle cx="545" cy="285" r="3.5" /><circle cx="560" cy="285" r="3.5" /><circle cx="575" cy="285" r="3.5" /><circle cx="590" cy="285" r="3.5" /><circle cx="605" cy="285" r="3.5" />
            <circle cx="515" cy="300" r="3.5" /><circle cx="530" cy="300" r="3.5" /><circle cx="545" cy="300" r="3.5" /><circle cx="560" cy="300" r="3.5" /><circle cx="575" cy="300" r="3.5" /><circle cx="590" cy="300" r="3.5" /><circle cx="605" cy="300" r="3.5" />
            <circle cx="530" cy="315" r="3.5" /><circle cx="545" cy="315" r="3.5" /><circle cx="560" cy="315" r="3.5" /><circle cx="575" cy="315" r="3.5" /><circle cx="590" cy="315" r="3.5" /><circle cx="605" cy="315" r="3.5" />
            <circle cx="545" cy="330" r="3.5" /><circle cx="560" cy="330" r="3.5" /><circle cx="575" cy="330" r="3.5" /><circle cx="590" cy="330" r="3.5" />
            <circle cx="545" cy="345" r="3.5" /><circle cx="560" cy="345" r="3.5" /><circle cx="575" cy="345" r="3.5" /><circle cx="590" cy="345" r="3.5" />
            <circle cx="545" cy="360" r="3.5" /><circle cx="560" cy="360" r="3.5" /><circle cx="575" cy="360" r="3.5" />
            <circle cx="560" cy="375" r="3.5" /><circle cx="575" cy="375" r="3.5" />
            <circle cx="560" cy="390" r="3.5" />
          </g>

          {/* Asia & Russia */}
          <g>
            <circle cx="650" cy="135" r="3.5" /><circle cx="665" cy="135" r="3.5" /><circle cx="680" cy="135" r="3.5" /><circle cx="695" cy="135" r="3.5" /><circle cx="710" cy="135" r="3.5" /><circle cx="725" cy="135" r="3.5" /><circle cx="740" cy="135" r="3.5" /><circle cx="755" cy="135" r="3.5" /><circle cx="770" cy="135" r="3.5" /><circle cx="785" cy="135" r="3.5" /><circle cx="800" cy="135" r="3.5" /><circle cx="815" cy="135" r="3.5" /><circle cx="830" cy="135" r="3.5" /><circle cx="845" cy="135" r="3.5" /><circle cx="860" cy="135" r="3.5" /><circle cx="875" cy="135" r="3.5" /><circle cx="890" cy="135" r="3.5" /><circle cx="905" cy="135" r="3.5" /><circle cx="920" cy="135" r="3.5" /><circle cx="935" cy="135" r="3.5" /><circle cx="950" cy="135" r="3.5" /><circle cx="965" cy="135" r="3.5" /><circle cx="980" cy="135" r="3.5" />
            <circle cx="650" cy="150" r="3.5" /><circle cx="665" cy="150" r="3.5" /><circle cx="680" cy="150" r="3.5" /><circle cx="695" cy="150" r="3.5" /><circle cx="710" cy="150" r="3.5" /><circle cx="725" cy="150" r="3.5" /><circle cx="740" cy="150" r="3.5" /><circle cx="755" cy="150" r="3.5" /><circle cx="770" cy="150" r="3.5" /><circle cx="785" cy="150" r="3.5" /><circle cx="800" cy="150" r="3.5" /><circle cx="815" cy="150" r="3.5" /><circle cx="830" cy="150" r="3.5" /><circle cx="845" cy="150" r="3.5" /><circle cx="860" cy="150" r="3.5" /><circle cx="875" cy="150" r="3.5" /><circle cx="890" cy="150" r="3.5" /><circle cx="905" cy="150" r="3.5" /><circle cx="920" cy="150" r="3.5" /><circle cx="935" cy="150" r="3.5" /><circle cx="950" cy="150" r="3.5" /><circle cx="965" cy="150" r="3.5" /><circle cx="980" cy="150" r="3.5" /><circle cx="995" cy="150" r="3.5" /><circle cx="1010" cy="150" r="3.5" />
            <circle cx="650" cy="165" r="3.5" /><circle cx="665" cy="165" r="3.5" /><circle cx="680" cy="165" r="3.5" /><circle cx="695" cy="165" r="3.5" /><circle cx="710" cy="165" r="3.5" /><circle cx="725" cy="165" r="3.5" /><circle cx="740" cy="165" r="3.5" /><circle cx="755" cy="165" r="3.5" /><circle cx="770" cy="165" r="3.5" /><circle cx="785" cy="165" r="3.5" /><circle cx="800" cy="165" r="3.5" /><circle cx="815" cy="165" r="3.5" /><circle cx="830" cy="165" r="3.5" /><circle cx="845" cy="165" r="3.5" /><circle cx="860" cy="165" r="3.5" /><circle cx="875" cy="165" r="3.5" /><circle cx="890" cy="165" r="3.5" /><circle cx="905" cy="165" r="3.5" /><circle cx="920" cy="165" r="3.5" /><circle cx="935" cy="165" r="3.5" /><circle cx="950" cy="165" r="3.5" /><circle cx="965" cy="165" r="3.5" /><circle cx="980" cy="165" r="3.5" /><circle cx="995" cy="165" r="3.5" /><circle cx="1010" cy="165" r="3.5" />
            <circle cx="650" cy="180" r="3.5" /><circle cx="665" cy="180" r="3.5" /><circle cx="680" cy="180" r="3.5" /><circle cx="695" cy="180" r="3.5" /><circle cx="710" cy="180" r="3.5" /><circle cx="725" cy="180" r="3.5" /><circle cx="740" cy="180" r="3.5" /><circle cx="755" cy="180" r="3.5" /><circle cx="770" cy="180" r="3.5" /><circle cx="785" cy="180" r="3.5" /><circle cx="800" cy="180" r="3.5" /><circle cx="815" cy="180" r="3.5" /><circle cx="830" cy="180" r="3.5" /><circle cx="845" cy="180" r="3.5" /><circle cx="860" cy="180" r="3.5" /><circle cx="875" cy="180" r="3.5" /><circle cx="890" cy="180" r="3.5" /><circle cx="905" cy="180" r="3.5" /><circle cx="920" cy="180" r="3.5" /><circle cx="935" cy="180" r="3.5" /><circle cx="950" cy="180" r="3.5" /><circle cx="965" cy="180" r="3.5" />
            <circle cx="665" cy="195" r="3.5" /><circle cx="680" cy="195" r="3.5" /><circle cx="695" cy="195" r="3.5" /><circle cx="710" cy="195" r="3.5" /><circle cx="725" cy="195" r="3.5" /><circle cx="740" cy="195" r="3.5" /><circle cx="755" cy="195" r="3.5" /><circle cx="770" cy="195" r="3.5" /><circle cx="785" cy="195" r="3.5" /><circle cx="800" cy="195" r="3.5" /><circle cx="815" cy="195" r="3.5" /><circle cx="830" cy="195" r="3.5" /><circle cx="845" cy="195" r="3.5" /><circle cx="860" cy="195" r="3.5" /><circle cx="875" cy="195" r="3.5" /><circle cx="890" cy="195" r="3.5" /><circle cx="905" cy="195" r="3.5" /><circle cx="920" cy="195" r="3.5" /><circle cx="935" cy="195" r="3.5" /><circle cx="950" cy="195" r="3.5" />
            <circle cx="680" cy="210" r="3.5" /><circle cx="695" cy="210" r="3.5" /><circle cx="710" cy="210" r="3.5" /><circle cx="725" cy="210" r="3.5" /><circle cx="740" cy="210" r="3.5" /><circle cx="755" cy="210" r="3.5" /><circle cx="770" cy="210" r="3.5" /><circle cx="785" cy="210" r="3.5" /><circle cx="800" cy="210" r="3.5" /><circle cx="815" cy="210" r="3.5" /><circle cx="830" cy="210" r="3.5" /><circle cx="845" cy="210" r="3.5" /><circle cx="860" cy="210" r="3.5" /><circle cx="875" cy="210" r="3.5" /><circle cx="890" cy="210" r="3.5" /><circle cx="905" cy="210" r="3.5" /><circle cx="920" cy="210" r="3.5" /><circle cx="935" cy="210" r="3.5" />
            {/* India & SE Asia */}
            <circle cx="740" cy="240" r="3.5" /><circle cx="755" cy="240" r="3.5" /><circle cx="770" cy="240" r="3.5" /><circle cx="785" cy="240" r="3.5" /><circle cx="800" cy="240" r="3.5" /><circle cx="815" cy="240" r="3.5" /><circle cx="830" cy="240" r="3.5" /><circle cx="845" cy="240" r="3.5" /><circle cx="860" cy="240" r="3.5" /><circle cx="875" cy="240" r="3.5" /><circle cx="890" cy="240" r="3.5" />
            <circle cx="755" cy="255" r="3.5" /><circle cx="770" cy="255" r="3.5" /><circle cx="785" cy="255" r="3.5" /><circle cx="800" cy="255" r="3.5" /><circle cx="815" cy="255" r="3.5" /><circle cx="830" cy="255" r="3.5" /><circle cx="845" cy="255" r="3.5" /><circle cx="860" cy="255" r="3.5" />
            <circle cx="770" cy="270" r="3.5" /><circle cx="785" cy="270" r="3.5" /><circle cx="800" cy="270" r="3.5" /><circle cx="830" cy="270" r="3.5" /><circle cx="845" cy="270" r="3.5" /><circle cx="860" cy="270" r="3.5" />
            <circle cx="785" cy="285" r="3.5" /><circle cx="830" cy="285" r="3.5" /><circle cx="845" cy="285" r="3.5" />
            <circle cx="845" cy="300" r="3.5" /><circle cx="860" cy="300" r="3.5" /><circle cx="875" cy="300" r="3.5" />
            <circle cx="860" cy="315" r="3.5" /><circle cx="875" cy="315" r="3.5" /><circle cx="890" cy="315" r="3.5" />
          </g>

          {/* Australia */}
          <g>
            <circle cx="920" cy="420" r="3.5" /><circle cx="935" cy="420" r="3.5" /><circle cx="950" cy="420" r="3.5" /><circle cx="965" cy="420" r="3.5" />
            <circle cx="905" cy="435" r="3.5" /><circle cx="920" cy="435" r="3.5" /><circle cx="935" cy="435" r="3.5" /><circle cx="950" cy="435" r="3.5" /><circle cx="965" cy="435" r="3.5" /><circle cx="980" cy="435" r="3.5" /><circle cx="995" cy="435" r="3.5" />
            <circle cx="905" cy="450" r="3.5" /><circle cx="920" cy="450" r="3.5" /><circle cx="935" cy="450" r="3.5" /><circle cx="950" cy="450" r="3.5" /><circle cx="965" cy="450" r="3.5" /><circle cx="980" cy="450" r="3.5" /><circle cx="995" cy="450" r="3.5" />
            <circle cx="920" cy="465" r="3.5" /><circle cx="935" cy="465" r="3.5" /><circle cx="950" cy="465" r="3.5" /><circle cx="965" cy="465" r="3.5" /><circle cx="980" cy="465" r="3.5" />
            <circle cx="935" cy="480" r="3.5" /><circle cx="950" cy="480" r="3.5" /><circle cx="965" cy="480" r="3.5" />
            <circle cx="965" cy="510" r="3.5" />
          </g>
        </svg>
      </div>

      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* 6 SERVICES GRID (3 columns x 2 rows on desktop) matching Screenshot 1 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 items-stretch">
          {displayServices.map((service) => {
            const isHighlighted = activeCardId === service.id;

            return (
              <div
                key={service.id}
                id={`service-card-${service.id}`}
                onMouseEnter={() => setActiveCardId(service.id)}
                onClick={() => onSelectService(service)}
                className={`group relative rounded-2xl p-8 sm:p-10 transition-all duration-300 cursor-pointer flex flex-col items-center text-center ${
                  isHighlighted
                    ? 'bg-[#dce5f8] text-white shadow-xl translate-y-[-2px] border border-[#cbd8f3]'
                    : 'bg-white text-slate-700 shadow-md hover:shadow-lg border border-slate-100/90'
                }`}
                style={{
                  minHeight: '340px',
                }}
              >
                {/* Circular Icon Container */}
                <div
                  className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 transition-all duration-300 shadow-sm ${
                    isHighlighted ? 'bg-white/80' : 'bg-[#eef3fb]'
                  }`}
                >
                  {renderCardIcon(service.id, service.iconName, isHighlighted)}
                </div>

                {/* Service Title */}
                <h3
                  className={`text-base sm:text-lg font-black uppercase tracking-wider mb-4 leading-tight ${
                    isHighlighted ? 'text-white drop-shadow-sm' : 'text-[#f59e0b]'
                  }`}
                >
                  {service.title}
                </h3>

                {/* Service Short Description */}
                <p
                  className={`text-xs sm:text-sm leading-relaxed font-medium max-w-xs mx-auto ${
                    isHighlighted ? 'text-white/95' : 'text-slate-600'
                  }`}
                >
                  {service.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
