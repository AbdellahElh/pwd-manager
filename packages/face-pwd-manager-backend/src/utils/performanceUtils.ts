// src/utils/performanceUtils.ts
/**
 * Performance optimization utilities for face authentication
 */

interface PerformanceMetrics {
  operation: string;
  duration: number;
  timestamp: number;
}

export class PerformanceTracker {
  private metrics: PerformanceMetrics[] = [];
  private startTimes: Map<string, number> = new Map();

  startTimer(operation: string): void {
    this.startTimes.set(operation, Date.now());
  }

  endTimer(operation: string): number {
    const startTime = this.startTimes.get(operation);
    if (!startTime) {
      console.warn(`⚠️ No start time found for operation: ${operation}`);
      return 0;
    }

    const duration = Date.now() - startTime;
    this.metrics.push({
      operation,
      duration,
      timestamp: Date.now(),
    });

    this.startTimes.delete(operation);
    return duration;
  }

  logMetrics(): void {
    console.log('📊 Performance Metrics:');
    this.metrics.forEach(metric => {
      console.log(`  ${metric.operation}: ${metric.duration}ms`);
    });

    const totalTime = this.metrics.reduce((sum, metric) => sum + metric.duration, 0);
    console.log(`  Total: ${totalTime}ms`);
  }

  getMetrics(): PerformanceMetrics[] {
    return [...this.metrics];
  }

  clear(): void {
    this.metrics = [];
    this.startTimes.clear();
  }
}

// Singleton instance for tracking performance across the application
export const performanceTracker = new PerformanceTracker();

/**
 * Decorator to measure function execution time
 */
export function measurePerformance(operation: string) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      performanceTracker.startTimer(operation);
      try {
        const result = await method.apply(this, args);
        const duration = performanceTracker.endTimer(operation);
        console.log(`⏱️ ${operation}: ${duration}ms`);
        return result;
      } catch (error) {
        performanceTracker.endTimer(operation);
        throw error;
      }
    };
  };
}
