import { useUIStore } from '../store';
import type { NumericEarthquakeField } from '../types';

export function useChartConfig() {
    const {
        chartConfig,
        setChartConfig,
        setXAxis,
        setYAxis,
    } = useUIStore();

    const updateAxis = (axis: 'x' | 'y', field: NumericEarthquakeField) => {
        if (axis === 'x') {
            setXAxis(field);
        } else {
            setYAxis(field);
        }
    };

    const resetConfig = () => {
        setChartConfig({
            xAxis: 'longitude',
            yAxis: 'latitude',
            showTooltip: true,
            showLegend: true,
            width: 0,
            height: 400,
        });
    };

    return {
        config: chartConfig,
        setConfig: setChartConfig,
        setXAxis,
        setYAxis,
        updateAxis,
        resetConfig,
    };
}