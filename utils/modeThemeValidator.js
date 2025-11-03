/**
 * Mode Theme Validator Utility
 * 
 * Provides comprehensive testing and validation for mode-specific theming
 * to ensure visual consistency and accessibility compliance across all
 * personality modes in VibeScreen.
 */

/**
 * Calculates the contrast ratio between two colors
 * @param {string} color1 - First color (hex, rgb, or rgba)
 * @param {string} color2 - Second color (hex, rgb, or rgba)
 * @returns {number} Contrast ratio (1-21)
 */
export function calculateContrastRatio(color1, color2) {
  // Convert colors to RGB values
  const rgb1 = parseColor(color1);
  const rgb2 = parseColor(color2);
  
  if (!rgb1 || !rgb2) {
    return 1; // Return minimum contrast if colors can't be parsed
  }
  
  // Calculate relative luminance for each color
  const luminance1 = getRelativeLuminance(rgb1);
  const luminance2 = getRelativeLuminance(rgb2);
  
  // Calculate contrast ratio
  const lighter = Math.max(luminance1, luminance2);
  const darker = Math.min(luminance1, luminance2);
  
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Parses a color string into RGB values
 * @param {string} color - Color string (hex, rgb, rgba)
 * @returns {Object|null} RGB object {r, g, b} or null if invalid
 */
function parseColor(color) {
  if (!color || typeof color !== 'string') {
    return null;
  }
  
  color = color.trim();
  
  // Handle hex colors
  if (color.startsWith('#')) {
    const hex = color.slice(1);
    if (hex.length === 3) {
      return {
        r: parseInt(hex[0] + hex[0], 16),
        g: parseInt(hex[1] + hex[1], 16),
        b: parseInt(hex[2] + hex[2], 16)
      };
    } else if (hex.length === 6) {
      return {
        r: parseInt(hex.slice(0, 2), 16),
        g: parseInt(hex.slice(2, 4), 16),
        b: parseInt(hex.slice(4, 6), 16)
      };
    }
  }
  
  // Handle rgb/rgba colors
  const rgbMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/);
  if (rgbMatch) {
    return {
      r: parseInt(rgbMatch[1], 10),
      g: parseInt(rgbMatch[2], 10),
      b: parseInt(rgbMatch[3], 10)
    };
  }
  
  return null;
}

/**
 * Calculates relative luminance for a color
 * @param {Object} rgb - RGB color object {r, g, b}
 * @returns {number} Relative luminance (0-1)
 */
function getRelativeLuminance(rgb) {
  // Convert RGB values to sRGB
  const rsRGB = rgb.r / 255;
  const gsRGB = rgb.g / 255;
  const bsRGB = rgb.b / 255;
  
  // Apply gamma correction
  const rLinear = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
  const gLinear = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
  const bLinear = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);
  
  // Calculate relative luminance
  return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;
}

/**
 * Validates accessibility compliance for a mode theme
 * @param {Object} theme - Theme object with color properties
 * @returns {Object} Validation result with compliance status
 */
export function validateThemeAccessibility(theme) {
  const results = {
    wcagAA: true,
    wcagAAA: true,
    issues: [],
    recommendations: []
  };
  
  // Check text on background contrast
  if (theme.textColor && theme.backgroundColor) {
    const contrast = calculateContrastRatio(theme.textColor, theme.backgroundColor);
    
    if (contrast < 4.5) {
      results.wcagAA = false;
      results.issues.push(`Text contrast ratio ${contrast.toFixed(2)}:1 is below WCAG AA minimum (4.5:1)`);
    }
    
    if (contrast < 7) {
      results.wcagAAA = false;
      results.recommendations.push(`Text contrast ratio ${contrast.toFixed(2)}:1 could be improved for WCAG AAA compliance (7:1)`);
    }
  }
  
  // Check border visibility
  if (theme.borderColor && theme.backgroundColor) {
    const borderContrast = calculateContrastRatio(theme.borderColor, theme.backgroundColor);
    
    if (borderContrast < 3) {
      results.issues.push(`Border contrast ratio ${borderContrast.toFixed(2)}:1 may not be visible enough`);
      results.recommendations.push('Consider using a more contrasting border color');
    }
  }
  
  return results;
}

/**
 * Tests all mode themes for visual consistency
 * @param {Array} modes - Array of mode configurations
 * @returns {Object} Comprehensive test results
 */
export function testModeThemeConsistency(modes) {
  const results = {
    totalModes: modes.length,
    passedModes: 0,
    failedModes: 0,
    issues: [],
    recommendations: [],
    modeResults: {}
  };
  
  modes.forEach(mode => {
    const modeResult = {
      id: mode.id,
      name: mode.name,
      passed: true,
      issues: [],
      recommendations: [],
      accessibility: null
    };
    
    // Check if mode has required theming properties
    const requiredProps = ['--mode-color', '--mode-color-light', '--mode-color-dark'];
    const modeElement = document.querySelector(`[data-mode="${mode.id}"]`);
    
    if (modeElement) {
      const computedStyle = window.getComputedStyle(modeElement);
      
      requiredProps.forEach(prop => {
        const value = computedStyle.getPropertyValue(prop).trim();
        if (!value) {
          modeResult.issues.push(`Missing CSS custom property: ${prop}`);
          modeResult.passed = false;
        }
      });
      
      // Test accessibility
      const theme = {
        textColor: computedStyle.color,
        backgroundColor: computedStyle.backgroundColor,
        borderColor: computedStyle.borderColor
      };
      
      modeResult.accessibility = validateThemeAccessibility(theme);
      
      if (!modeResult.accessibility.wcagAA) {
        modeResult.passed = false;
        modeResult.issues.push(...modeResult.accessibility.issues);
      }
      
      modeResult.recommendations.push(...modeResult.accessibility.recommendations);
    } else {
      modeResult.issues.push('Mode element not found in DOM');
      modeResult.passed = false;
    }
    
    // Update overall results
    if (modeResult.passed) {
      results.passedModes++;
    } else {
      results.failedModes++;
      results.issues.push(`Mode "${mode.name}" (${mode.id}) failed validation`);
    }
    
    results.modeResults[mode.id] = modeResult;
  });
  
  // Generate overall recommendations
  if (results.failedModes > 0) {
    results.recommendations.push('Review failed modes and update their CSS custom properties');
    results.recommendations.push('Ensure all mode colors meet WCAG AA contrast requirements');
  }
  
  if (results.passedModes === results.totalModes) {
    results.recommendations.push('All modes passed validation - consider testing with actual users');
  }
  
  return results;
}

/**
 * Generates a visual theme test report
 * @param {Array} modes - Array of mode configurations
 * @returns {string} HTML report for visual inspection
 */
export function generateThemeTestReport(modes) {
  const testResults = testModeThemeConsistency(modes);
  
  let html = `
    <div class="theme-test-report" style="
      font-family: 'Courier New', monospace;
      background: #000;
      color: #00ff00;
      padding: 20px;
      border: 2px solid #00ff00;
      margin: 20px;
    ">
      <h2>VibeScreen Mode Theme Test Report</h2>
      <p>Generated: ${new Date().toISOString()}</p>
      
      <div class="summary">
        <h3>Summary</h3>
        <p>Total Modes: ${testResults.totalModes}</p>
        <p>Passed: ${testResults.passedModes}</p>
        <p>Failed: ${testResults.failedModes}</p>
      </div>
      
      <div class="mode-grid" style="
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 16px;
        margin: 20px 0;
      ">
  `;
  
  modes.forEach(mode => {
    const result = testResults.modeResults[mode.id];
    const statusColor = result.passed ? '#00ff00' : '#ff0000';
    
    html += `
      <div class="mode-test-card" style="
        border: 2px solid ${statusColor};
        padding: 12px;
        background: rgba(0, 255, 0, 0.05);
      ">
        <h4>${mode.name}</h4>
        <p>ID: ${mode.id}</p>
        <p>Status: <span style="color: ${statusColor};">${result.passed ? 'PASS' : 'FAIL'}</span></p>
        
        ${result.issues.length > 0 ? `
          <div class="issues">
            <strong>Issues:</strong>
            <ul>
              ${result.issues.map(issue => `<li style="color: #ff6666;">${issue}</li>`).join('')}
            </ul>
          </div>
        ` : ''}
        
        ${result.recommendations.length > 0 ? `
          <div class="recommendations">
            <strong>Recommendations:</strong>
            <ul>
              ${result.recommendations.map(rec => `<li style="color: #ffff66;">${rec}</li>`).join('')}
            </ul>
          </div>
        ` : ''}
      </div>
    `;
  });
  
  html += `
      </div>
      
      <div class="overall-recommendations">
        <h3>Overall Recommendations</h3>
        <ul>
          ${testResults.recommendations.map(rec => `<li>${rec}</li>`).join('')}
        </ul>
      </div>
    </div>
  `;
  
  return html;
}

/**
 * Runs comprehensive theme testing in development mode
 * @param {Array} modes - Array of mode configurations
 */
export function runThemeTests(modes) {
  if (process.env.NODE_ENV !== 'development') {
    console.warn('Theme testing is only available in development mode');
    return;
  }
  
  console.group('🎨 VibeScreen Mode Theme Testing');
  
  const results = testModeThemeConsistency(modes);
  
  console.log(`📊 Test Summary: ${results.passedModes}/${results.totalModes} modes passed`);
  
  if (results.issues.length > 0) {
    console.group('❌ Issues Found');
    results.issues.forEach(issue => console.error(issue));
    console.groupEnd();
  }
  
  if (results.recommendations.length > 0) {
    console.group('💡 Recommendations');
    results.recommendations.forEach(rec => console.warn(rec));
    console.groupEnd();
  }
  
  // Log individual mode results
  Object.values(results.modeResults).forEach(modeResult => {
    const status = modeResult.passed ? '✅' : '❌';
    console.log(`${status} ${modeResult.name} (${modeResult.id})`);
    
    if (modeResult.issues.length > 0) {
      modeResult.issues.forEach(issue => console.error(`  - ${issue}`));
    }
  });
  
  console.groupEnd();
  
  return results;
}

export default {
  calculateContrastRatio,
  validateThemeAccessibility,
  testModeThemeConsistency,
  generateThemeTestReport,
  runThemeTests
};