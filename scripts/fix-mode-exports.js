/**
 * Fix Mode Component Exports
 * Converts named exports to default exports for all mode components
 */

import fs from 'fs/promises';
import path from 'path';

async function fixModeExports() {
  console.log('🔧 Fixing mode component exports...');
  
  try {
    const modesDir = await fs.readdir('modes', { withFileTypes: true });
    const modeDirectories = modesDir.filter(entry => entry.isDirectory());
    
    for (const mode of modeDirectories) {
      const modeId = mode.name;
      console.log(`\n📁 Processing mode: ${modeId}`);
      
      // Fix scene.js
      const scenePath = path.join('modes', modeId, 'scene.js');
      try {
        let sceneCode = await fs.readFile(scenePath, 'utf8');
        
        // Convert named export to function declaration + default export
        const sceneRegex = /export function (\w+Scene)/;
        const match = sceneCode.match(sceneRegex);
        
        if (match) {
          const functionName = match[1];
          sceneCode = sceneCode.replace(sceneRegex, `function ${functionName}`);
          
          // Add default export if not present
          if (!sceneCode.includes('export default')) {
            sceneCode += `\nexport default ${functionName};`;
          }
          
          await fs.writeFile(scenePath, sceneCode);
          console.log(`  ✅ Fixed scene.js export`);
        } else {
          console.log(`  ⚠️  Scene.js already has correct export or needs manual fix`);
        }
        
      } catch (error) {
        console.log(`  ❌ Error fixing scene.js: ${error.message}`);
      }
      
      // Fix character.js
      const characterPath = path.join('modes', modeId, 'character.js');
      try {
        let characterCode = await fs.readFile(characterPath, 'utf8');
        
        // Convert named export to function declaration + default export
        const characterRegex = /export function (\w+Character)/;
        const match = characterCode.match(characterRegex);
        
        if (match) {
          const functionName = match[1];
          characterCode = characterCode.replace(characterRegex, `function ${functionName}`);
          
          // Add default export if not present
          if (!characterCode.includes('export default')) {
            characterCode += `\nexport default ${functionName};`;
          }
          
          await fs.writeFile(characterPath, characterCode);
          console.log(`  ✅ Fixed character.js export`);
        } else {
          console.log(`  ⚠️  Character.js already has correct export or needs manual fix`);
        }
        
      } catch (error) {
        console.log(`  ❌ Error fixing character.js: ${error.message}`);
      }
    }
    
    console.log('\n🎉 Mode export fixes completed!');
    
  } catch (error) {
    console.error('❌ Error fixing mode exports:', error);
  }
}

fixModeExports();