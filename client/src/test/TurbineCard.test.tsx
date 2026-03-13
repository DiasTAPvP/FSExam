import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { TurbineCard } from '../app/components/TurbineCard';
import type { TelemetryData } from '../app/types';

describe('TurbineCard', () => {
  const mockData: TelemetryData = {
    turbineId: 'turbine-1',
    turbineName: 'Test Turbine',
    farmId: 'farm-1',
    timestamp: new Date().toISOString(),
    windSpeed: 12,
    windDirection: 180,
    ambientTemperature: 20,
    rotorSpeed: 15,
    powerOutput: 1500,
    nacelleDirection: 180,
    bladePitch: 10,
    generatorTemp: 50,
    gearboxTemp: 60,
    vibration: 2,
    status: 'running'
  };

  it('renders turbine information correctly', () => {
    render(<TurbineCard data={mockData} onClick={() => {}} selected={false} />);
    
    expect(screen.getByText('Test Turbine')).toBeInTheDocument();
    expect(screen.getByText('turbine-1')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByText('1500')).toBeInTheDocument();
  });

  it('shows background highlight when selected', () => {
    const { container } = render(<TurbineCard data={mockData} onClick={() => {}} selected={true} />);
    
    const card = container.firstChild as HTMLElement;
    // Note: React 19 might normalize rgba or use hex/rgb
    expect(card.style.background).toContain('rgba(56, 189, 248, 0.07)');
  });
});
