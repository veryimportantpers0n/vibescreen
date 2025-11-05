/**
 * Test runner for dynamic theming system
 * Run with: node tests/validation/runThemingTests.js
 */

// Mock DOM environment for Node.js testing
if (typeof document === 'undefined') {
  global.document = {
    documentElement: {
      style: {
        setProperty: (prop, value) => {
          console.log(`Setting CSS property: ${prop} = ${value}`);
        },
        getPropertyValue: (prop) => {
          // Mock return values for testing
          const mockValues = {
            '--active-mode-color': '#007acc',
            '--active-mode-color-light': '#4da6d9',
            '--active-mode-color-dark': '#005a99'
          };
          return mockValues[prop] || '';
        }
      },
      setAttribute: (attr, value) => {
        console.log(`Setting attribute: ${attr} = ${value}`);
      },
      classList: {
        add: (className) => console.log(`Adding class: ${className}`),
        remove: (className) => console.log(`Removing class: ${className}`)
      }
    },
    body: {
      setAttribute: (attr, value) => {
        console.log(`Setting body attribute: ${attr} = ${value}`);
      },
      classList: {
        add: (className) => {
          console.log(`Adding body class: ${className}`);
          return true;
        },
        remove: (className) => {
          console.log(`Removing body class: ${className}`);
          return true;
        },
        contains: (className) => {
          return className === 'theme-transitioning';
        }
      }
    }
  };

  global.getComputedStyle = () => ({
    getPropertyValue: (prop) => {
      const mockValues = {
        '--active-mode-color': '#007acc',
        'background-color': 'rgb(0, 0, 0)',
        'color': 'rgb(0, 255, 0)'
      };
      return mockValues[prop] || '';
    }
  });
}

// Import and run validation
async function runTests() {
  try {
    console.log('🎨 Dynamic Theming System Test Suite');
    console.log('=====================================\n');

    const { runDynamicThemingValidation } = await import('./dynamicThemingValidation.js');
    const results = await runDynamicThemingValidation();

    // Output detailed results
    console.log('\n📊 Detailed Results:');
    console.log('====================');
    
    Object.entries(results.tests).forEach(([testName, testResults]) => {
      console.log(`\n${testName.toUpperCase()}:`);
      Object.entries(testResults).forEach(([key, value]) => {
        if (key === 'errors' && Array.isArray(value)) {
          if (value.length > 0) {
            console.log(`  ❌ Errors: ${value.join(', ')}`);
          }
        } else if (key === 'themeDetails') {
          console.log(`  📋 Theme Details: ${Object.keys(value).length} themes validated`);
        } else if (typeof value === 'boolean') {
          console.log(`  ${value ? '✅' : '❌'} ${key}: ${value}`);
        }
      });
    });

    // Exit with appropriate code
    process.exit(results.overall ? 0 : 1);

  } catch (error) {
    console.error('❌ Test suite failed to run:', error);
    process.exit(1);
  }
}

runTests();