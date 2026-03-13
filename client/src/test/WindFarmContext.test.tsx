import { render, waitFor, act, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WindFarmProvider, useWindFarm } from '../app/context/WindFarmContext';
import { AuthProvider } from '../app/context/AuthContext';

// Mock Component to consume context
const TestConsumer = () => {
  const { telemetry, alerts } = useWindFarm();
  return (
    <div>
      <div data-testid="telemetry-count">{Object.keys(telemetry).length}</div>
      <div data-testid="alerts-count">{alerts.length}</div>
      {Object.entries(telemetry).map(([id, data]) => (
        <div key={id} data-testid={`telemetry-${id}`}>{data.powerOutput}</div>
      ))}
    </div>
  );
};

describe('WindFarmContext SSE', () => {
  let mockEventSource: any;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock global EventSource as a class
    mockEventSource = {
      close: vi.fn(),
      onmessage: null as any,
      onerror: null as any,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    };
    
    vi.stubGlobal('EventSource', vi.fn().mockImplementation(function() {
      return mockEventSource;
    }));
    
    // Mock fetch to avoid errors during initial load
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => []
    }));

    // Mock localStorage
    const localStorageMock = (function() {
      let store: any = {};
      return {
        getItem: function(key: string) { return store[key] || null; },
        setItem: function(key: string, value: string) { store[key] = value.toString(); },
        removeItem: function(key: string) { delete store[key]; },
        clear: function() { store = {}; }
      };
    })();
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });
    // Valid JWT with 1 hour expiration
    const payload = JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600 });
    const encodedPayload = btoa(payload).replace(/=/g, "");
    const validToken = `header.${encodedPayload}.signature`;
    
    window.localStorage.setItem('token', validToken);
    window.localStorage.setItem('username', 'test-operator');
  });

  it('updates telemetry when SSE message is received', async () => {
    render(
      <AuthProvider>
        <WindFarmProvider>
          <TestConsumer />
        </WindFarmProvider>
      </AuthProvider>
    );

    // Initial state
    expect(screen.queryByTestId('telemetry-count')).toHaveTextContent('0');

    // Simulate SSE message
    const telemetryMsg = {
      turbineId: 'turbine-alpha',
      powerOutput: 1200,
      windSpeed: 10,
      status: 'running',
      timestamp: new Date().toISOString()
    };

    await act(async () => {
      mockEventSource.onmessage({
        data: JSON.stringify(telemetryMsg)
      });
    });

    await waitFor(() => {
      expect(screen.getByTestId('telemetry-count')).toHaveTextContent('1');
      expect(screen.getByTestId('telemetry-turbine-alpha')).toHaveTextContent('1200');
    });
  });

  it('updates alerts when SSE message is received', async () => {
    render(
      <AuthProvider>
        <WindFarmProvider>
          <TestConsumer />
        </WindFarmProvider>
      </AuthProvider>
    );

    // Initial state
    expect(screen.queryByTestId('alerts-count')).toHaveTextContent('0');

    const alertMsg = {
      id: 'alert-1',
      turbineId: 'turbine-alpha',
      severity: 'critical',
      message: 'Emergency Stop Triggered',
      timestamp: new Date().toISOString()
    };

    await act(async () => {
      mockEventSource.onmessage({
        data: JSON.stringify(alertMsg)
      });
    });

    await waitFor(() => {
      expect(screen.getByTestId('alerts-count')).toHaveTextContent('1');
    });
  });
});
