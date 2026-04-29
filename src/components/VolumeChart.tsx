'use client';

import { useEffect, useRef, useState } from 'react';
import type { VolumeDataPoint } from '@/types/nft';

interface VolumeChartProps {
  data: VolumeDataPoint[];
  loading: boolean;
}

const ChartIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="12" width="4" height="9" rx="1" />
    <rect x="10" y="7" width="4" height="14" rx="1" />
    <rect x="17" y="3" width="4" height="18" rx="1" />
  </svg>
);

export default function VolumeChart({ data, loading }: VolumeChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const chartRef = useRef<any>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || loading || !data || data.length === 0 || !containerRef.current) return;

    let cancelled = false;

    const initChart = async () => {
      const lc = await import('lightweight-charts');
      if (cancelled || !containerRef.current) return;

      // Clean up previous chart
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }

      const chart = lc.createChart(containerRef.current, {
        width: containerRef.current.clientWidth,
        height: 220,
        layout: {
          background: { type: lc.ColorType.Solid, color: 'transparent' },
          textColor: '#6B6B7B',
          fontFamily: "'Inter', sans-serif",
          fontSize: 11,
        },
        grid: {
          vertLines: { visible: false },
          horzLines: { color: '#1E1E2A', style: lc.LineStyle.Solid },
        },
        crosshair: {
          vertLine: { color: '#2A2A38', width: 1, style: lc.LineStyle.Dashed, labelVisible: false },
          horzLine: { color: '#2A2A38', width: 1, style: lc.LineStyle.Dashed, labelVisible: true },
        },
        rightPriceScale: {
          borderVisible: false,
          textColor: '#3A3A4A',
        },
        timeScale: {
          borderVisible: false,
          timeVisible: false,
          fixLeftEdge: true,
          fixRightEdge: true,
        },
        handleScroll: false,
        handleScale: false,
      });

      chartRef.current = chart;

      // Area series (v5 API: addSeries)
      const areaSeries = chart.addSeries(lc.AreaSeries, {
        lineColor: '#00D4AA',
        lineWidth: 2,
        topColor: 'rgba(0, 212, 170, 0.28)',
        bottomColor: 'rgba(0, 212, 170, 0.02)',
        crosshairMarkerVisible: true,
        crosshairMarkerRadius: 4,
        crosshairMarkerBorderColor: '#0A0A0F',
        crosshairMarkerBackgroundColor: '#00D4AA',
        crosshairMarkerBorderWidth: 2,
        priceFormat: {
          type: 'custom' as const,
          formatter: (price: number) => price.toFixed(3) + ' ETH',
        },
      });

      // Histogram series (sales volume bars)
      const volumeSeries = chart.addSeries(lc.HistogramSeries, {
        color: 'rgba(0, 212, 170, 0.15)',
        priceFormat: {
          type: 'custom' as const,
          formatter: (v: number) => v.toFixed(0),
        },
        priceScaleId: 'volume',
      });

      chart.priceScale('volume').applyOptions({
        scaleMargins: { top: 0.8, bottom: 0 },
        visible: false,
      });

      // Map data to chart format
      const areaData = data.map(d => ({
        time: d.date as string,
        value: d.volume,
      }));

      const volumeData = data.map(d => ({
        time: d.date as string,
        value: d.sales,
        color: 'rgba(0, 212, 170, 0.12)',
      }));

      areaSeries.setData(areaData);
      volumeSeries.setData(volumeData);

      chart.timeScale().fitContent();

      // Resize observer
      const ro = new ResizeObserver(entries => {
        for (const entry of entries) {
          chart.applyOptions({ width: entry.contentRect.width });
        }
      });
      ro.observe(containerRef.current);

      return () => {
        ro.disconnect();
      };
    };

    initChart();

    return () => {
      cancelled = true;
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
    };
  }, [isClient, data, loading]);

  const totalVolume = data?.reduce((s, d) => s + d.volume, 0) || 0;
  const totalSales = data?.reduce((s, d) => s + d.sales, 0) || 0;

  if (loading) {
    return (
      <div className="volume-chart">
        <div className="section-header">
          <span className="section-header__title"><ChartIcon /> Volume</span>
        </div>
        <div className="volume-chart__container">
          <div className="skeleton" style={{ height: 220, width: '100%' }} />
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) return null;

  return (
    <div className="volume-chart">
      <div className="section-header">
        <span className="section-header__title"><ChartIcon /> Volume</span>
        <span className="section-header__badge">7d</span>
      </div>
      <div className="volume-chart__container">
        <div className="volume-chart__header">
          <div>
            <span className="volume-chart__total">
              {totalVolume.toFixed(2)}
              <span className="volume-chart__total-unit">ETH</span>
            </span>
            <span className="volume-chart__total-sub">{totalSales.toLocaleString()} sales</span>
          </div>
          <span className="volume-chart__period">Last 7 days</span>
        </div>
        <div ref={containerRef} className="volume-chart__body" />
      </div>
    </div>
  );
}
