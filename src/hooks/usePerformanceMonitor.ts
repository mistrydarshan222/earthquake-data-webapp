import React, { useState, useEffect } from 'react';

interface PerformanceMetrics {
  renderTime: number;
  dataSize: number;
  memoryUsage: number;
  fps: number;
}

export function usePerformanceMonitor(dataLength: number) {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderTime: 0,
    dataSize: dataLength,
    memoryUsage: 0,
    fps: 60
  });

  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    let animationId: number;

    const measurePerformance = () => {
      const now = performance.now();
      frameCount++;

      if (now - lastTime >= 1000) {
        const fps = Math.round((frameCount * 1000) / (now - lastTime));
        
        setMetrics(prev => ({
          ...prev,
          dataSize: dataLength,
          fps,
          memoryUsage: (performance as any).memory?.usedJSHeapSize / 1024 / 1024 || 0
        }));

        frameCount = 0;
        lastTime = now;
      }

      animationId = requestAnimationFrame(measurePerformance);
    };

    if (isVisible) {
      animationId = requestAnimationFrame(measurePerformance);
    }

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [isVisible, dataLength]);

  const PerformanceDisplay = () => {
    if (!isVisible) {
      return React.createElement('button', {
        onClick: () => setIsVisible(true),
        className: 'fixed bottom-4 right-4 bg-gray-800 text-white px-3 py-2 rounded-lg text-sm opacity-50 hover:opacity-100 transition-opacity z-50'
      }, 'Performance');
    }

    return React.createElement('div', {
      className: 'fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg p-4 shadow-lg z-50 min-w-48'
    }, [
      React.createElement('div', {
        key: 'header',
        className: 'flex justify-between items-center mb-3'
      }, [
        React.createElement('h3', {
          key: 'title',
          className: 'font-semibold text-sm'
        }, 'Performance'),
        React.createElement('button', {
          key: 'close',
          onClick: () => setIsVisible(false),
          className: 'text-gray-400 hover:text-gray-600'
        }, '×')
      ]),
      React.createElement('div', {
        key: 'metrics',
        className: 'space-y-2 text-xs'
      }, [
        React.createElement('div', {
          key: 'fps',
          className: 'flex justify-between'
        }, [
          React.createElement('span', { key: 'label' }, 'FPS:'),
          React.createElement('span', {
            key: 'value',
            className: `font-mono ${metrics.fps < 30 ? 'text-red-600' : metrics.fps < 50 ? 'text-yellow-600' : 'text-green-600'}`
          }, metrics.fps.toString())
        ]),
        React.createElement('div', {
          key: 'data',
          className: 'flex justify-between'
        }, [
          React.createElement('span', { key: 'label' }, 'Data Points:'),
          React.createElement('span', {
            key: 'value',
            className: 'font-mono'
          }, metrics.dataSize.toLocaleString())
        ]),
        metrics.memoryUsage > 0 && React.createElement('div', {
          key: 'memory',
          className: 'flex justify-between'
        }, [
          React.createElement('span', { key: 'label' }, 'Memory:'),
          React.createElement('span', {
            key: 'value',
            className: 'font-mono'
          }, `${metrics.memoryUsage.toFixed(1)} MB`)
        ])
      ].filter(Boolean))
    ]);
  };

  return { metrics, PerformanceDisplay };
}