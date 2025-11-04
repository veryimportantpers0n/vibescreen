/**
 * Cache and Performance Validation Test
 * Validates the caching system and performance optimizations in ModeLoader
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class CachePerformanceValidator {
  constructor() {
    this.results = {
      cacheImplementation: false,
      lruEviction: false,
      preloadingSystem: false,
      performanceMonitoring: false,
      memoryManagement: false,
      cacheStats: false,
      errors: []
    };
  }

  validateCacheImplementation() {
    console.log('🔍 Validating cache implementation...');
    
    try {
      const modeLoaderPath = path.join(path.dirname(__dirname), '..', 'components', 'ModeLoader.jsx');
      const content = fs.readFileSync(modeLoaderPath, 'utf8');

      // Check for ComponentCache class
      if (content.includes('class ComponentCache')) {
        console.log('✅ ComponentCache class found');
        this.results.cacheImplementation = true;
      } else {
        this.results.errors.push('ComponentCache class not found');
      }

      // Check for LRU eviction logic
      if (content.includes('evictLRU') && content.includes('accessOrder')) {
        console.log('✅ LRU eviction logic found');
        this.results.lruEviction = true;
      } else {
        this.results.errors.push('LRU eviction logic not implemented');
      }

      // Check for preloading system
      if (content.includes('class ModePreloader') && content.includes('preloadPopularModes')) {
        console.log('✅ Preloading system found');
        this.results.preloadingSystem = true;
      } else {
        this.results.errors.push('Preloading system not implemented');
      }

      // Check for performance monitoring
      if (content.includes('class PerformanceMonitor') && content.includes('startSwitchTimer')) {
        console.log('✅ Performance monitoring found');
        this.results.performanceMonitoring = true;
      } else {
        this.results.errors.push('Performance monitoring not implemented');
      }

      // Check for memory management
      if (content.includes('estimateComponentSize') && content.includes('checkMemoryUsage')) {
        console.log('✅ Memory management found');
        this.results.memoryManagement = true;
      } else {
        this.results.errors.push('Memory management not implemented');
      }

      // Check for cache statistics
      if (content.includes('getCacheStats') && content.includes('getPerformanceStats')) {
        console.log('✅ Cache statistics methods found');
        this.results.cacheStats = true;
      } else {
        this.results.errors.push('Cache statistics methods not found');
      }

    } catch (error) {
      this.results.errors.push(`Failed to read ModeLoader.jsx: ${error.message}`);
    }
  }

  validateCacheFeatures() {
    console.log('🔍 Validating cache features...');
    
    try {
      const modeLoaderPath = path.join(path.dirname(__dirname), '..', 'components', 'ModeLoader.jsx');
      const content = fs.readFileSync(modeLoaderPath, 'utf8');

      const requiredFeatures = [
        'componentCacheRef.current.get',
        'componentCacheRef.current.set',
        'performanceMonitorRef.current.startSwitchTimer',
        'performanceMonitorRef.current.endSwitchTimer',
        'preloaderRef.current.preloadPopularModes',
        'clearCache',
        'preloadMode'
      ];

      const missingFeatures = requiredFeatures.filter(feature => !content.includes(feature));
      
      if (missingFeatures.length === 0) {
        console.log('✅ All cache features implemented');
      } else {
        console.log(`⚠️ Missing cache features: ${missingFeatures.join(', ')}`);
        this.results.errors.push(`Missing cache features: ${missingFeatures.join(', ')}`);
      }

    } catch (error) {
      this.results.errors.push(`Failed to validate cache features: ${error.message}`);
    }
  }

  validatePerformanceTargets() {
    console.log('🔍 Validating performance targets...');
    
    try {
      const modeLoaderPath = path.join(path.dirname(__dirname), '..', 'components', 'ModeLoader.jsx');
      const content = fs.readFileSync(modeLoaderPath, 'utf8');

      // Check for 500ms target
      if (content.includes('targetSwitchTime = 500') || content.includes('500ms')) {
        console.log('✅ 500ms performance target found');
      } else {
        this.results.errors.push('500ms performance target not found');
      }

      // Check for popular modes preloading
      const popularModes = ['corporate-ai', 'zen-monk', 'chaos'];
      const hasPopularModes = popularModes.every(mode => content.includes(mode));
      
      if (hasPopularModes) {
        console.log('✅ Popular modes configuration found');
      } else {
        this.results.errors.push('Popular modes not properly configured for preloading');
      }

    } catch (error) {
      this.results.errors.push(`Failed to validate performance targets: ${error.message}`);
    }
  }

  generateReport() {
    console.log('\n📊 Cache and Performance Validation Report');
    console.log('=' .repeat(50));
    
    const totalChecks = Object.keys(this.results).length - 1; // Exclude errors array
    const passedChecks = Object.values(this.results).filter(v => v === true).length;
    const successRate = ((passedChecks / totalChecks) * 100).toFixed(1);
    
    console.log(`Overall Success Rate: ${successRate}% (${passedChecks}/${totalChecks})`);
    console.log('');
    
    // Individual results
    Object.entries(this.results).forEach(([key, value]) => {
      if (key !== 'errors') {
        const status = value ? '✅ PASS' : '❌ FAIL';
        const description = key.replace(/([A-Z])/g, ' $1').toLowerCase();
        console.log(`${status} - ${description}`);
      }
    });
    
    // Errors
    if (this.results.errors.length > 0) {
      console.log('\n❌ Errors Found:');
      this.results.errors.forEach(error => {
        console.log(`   • ${error}`);
      });
    }
    
    console.log('');
    
    // Recommendations
    if (passedChecks < totalChecks) {
      console.log('🔧 Recommendations:');
      if (!this.results.cacheImplementation) {
        console.log('   • Implement ComponentCache class with LRU eviction');
      }
      if (!this.results.preloadingSystem) {
        console.log('   • Add ModePreloader for background loading');
      }
      if (!this.results.performanceMonitoring) {
        console.log('   • Implement PerformanceMonitor for timing tracking');
      }
      if (!this.results.memoryManagement) {
        console.log('   • Add memory usage estimation and cleanup');
      }
    } else {
      console.log('🎉 All cache and performance optimizations implemented successfully!');
    }
    
    return {
      success: passedChecks === totalChecks,
      successRate,
      passedChecks,
      totalChecks,
      errors: this.results.errors
    };
  }

  async runValidation() {
    console.log('🚀 Starting Cache and Performance Validation...\n');
    
    this.validateCacheImplementation();
    this.validateCacheFeatures();
    this.validatePerformanceTargets();
    
    return this.generateReport();
  }
}

// Run validation if called directly
const validator = new CachePerformanceValidator();
validator.runValidation()
  .then(result => {
    process.exit(result.success ? 0 : 1);
  })
  .catch(error => {
    console.error('❌ Validation failed:', error);
    process.exit(1);
  });

export default CachePerformanceValidator;