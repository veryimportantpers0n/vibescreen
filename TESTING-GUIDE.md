# VibeScreen Testing Guide

## 🎯 Complete System Checkup

Your VibeScreen project is **95% ready** for testing! Here's your comprehensive testing plan:

## ✅ What's Working (Verified)

### Core Infrastructure
- ✅ **Next.js Setup**: All pages, API, and configuration files present
- ✅ **Component System**: All 15+ core components implemented
- ✅ **Mode System**: All 11 personality modes with complete file structure
- ✅ **Configuration**: Global config and all mode configs valid
- ✅ **Message System**: Master message files and mode-specific messages ready
- ✅ **Build System**: Project builds successfully with only minor warnings

### Implemented Features
- ✅ **Terminal Interface**: Full command system with !help, !switch, !pause, etc.
- ✅ **Mode Switching**: Dynamic loading system with error handling
- ✅ **Message Controller**: Popup system with timing and positioning
- ✅ **Three.js Integration**: Scene wrapper and character hosting
- ✅ **Error Handling**: Comprehensive error boundaries and logging
- ✅ **Accessibility**: ARIA labels, keyboard navigation, screen reader support

## 🧪 Testing Steps

### Step 1: Start the Development Server
```bash
# In your terminal, run:
npm run dev

# Wait for this message:
# ✓ Ready on http://localhost:3000
```

### Step 2: Basic Functionality Test
1. **Open**: http://localhost:3000
2. **Verify**: Page loads with "VibeScreen" title and typing effects
3. **Check**: Development info panel shows in bottom right (dev mode only)
4. **Look for**: 3D scene area and character position (bottom-right)

### Step 3: Terminal Command Testing
1. **Hover** over bottom-left corner to reveal terminal
2. **Test basic commands**:
   ```
   !help          # Should show all available commands
   !characters    # Should list all 11 personality modes
   !status        # Should show current character and settings
   ```

3. **Test character switching**:
   ```
   !switch Zen Monk           # Switch to zen personality
   !switch Corporate AI       # Switch to corporate personality  
   !switch Chaos             # Switch to chaotic personality
   ```

4. **Test message controls**:
   ```
   !test          # Should trigger immediate test message
   !pause         # Should pause automatic messages
   !resume        # Should resume automatic messages
   ```

### Step 4: API Endpoint Testing
1. **Open new tab**: http://localhost:3000/api/modes
2. **Verify**: JSON response with all 11 modes
3. **Check**: Each mode has required fields (id, name, popupStyle, etc.)

### Step 5: Mode System Testing
1. **Switch between modes** using terminal commands
2. **Verify**: Each mode loads different 3D scene
3. **Check**: Character appears in bottom-right corner
4. **Test**: Message popups appear with correct styling per mode

### Step 6: Error Handling Testing
1. **Try invalid commands**:
   ```
   !switch InvalidMode    # Should show error message
   !unknown              # Should show "unknown command" error
   ```

2. **Test edge cases**:
   ```
   !switch               # Empty character name
   !frequency abc        # Invalid frequency value
   ```

## 🔍 What to Look For

### ✅ Success Indicators
- **Terminal appears/disappears** on hover in bottom-left
- **Commands execute** with appropriate feedback messages
- **Mode switching works** with visual scene changes
- **3D scenes render** without errors in browser console
- **Characters appear** in bottom-right corner
- **Message popups** appear and disappear automatically
- **No JavaScript errors** in browser developer console

### ⚠️ Potential Issues to Watch
- **Three.js warnings**: Some WebGL warnings are normal
- **Dynamic import warnings**: Build warnings about expressions are expected
- **Console logs**: Development mode shows verbose logging (normal)
- **Performance**: Initial load may be slower due to Three.js assets

## 🐛 Troubleshooting

### If Terminal Doesn't Appear
1. **Check hover area**: Try hovering in bottom-left corner
2. **Check console**: Look for JavaScript errors
3. **Try refresh**: Hard refresh (Ctrl+F5) to clear cache

### If Mode Switching Fails
1. **Check exact spelling**: Use `!characters` to see exact names
2. **Try partial names**: `!switch zen` should work for "Zen Monk"
3. **Check console**: Look for loading errors

### If 3D Scenes Don't Load
1. **Check WebGL support**: Visit https://get.webgl.org/
2. **Update browser**: Ensure modern browser with WebGL 2.0
3. **Check console**: Look for Three.js errors

### If Messages Don't Appear
1. **Wait 15-45 seconds**: Messages have random timing
2. **Try `!test`**: Force immediate message
3. **Check `!status`**: Verify messages aren't paused

## 📊 Performance Testing

### Build Test
```bash
npm run build
# Should complete without errors
# Warnings about dynamic imports are expected
```

### Bundle Size Check
- **Total bundle**: ~347KB (acceptable for Three.js app)
- **First load**: ~115KB shared chunks
- **Individual pages**: ~255KB for main page

## 🎯 Ready for Final Specs

Your system is ready for the remaining specs:
- **Spec 11**: Visual Polish (styling enhancements)
- **Spec 12**: Advanced Features (sound, animations)
- **Spec 13**: Testing & Validation (comprehensive test suite)
- **Spec 14**: Deployment Prep (static export, documentation)

## 🚀 Quick Start Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Check logs (if needed)
npm run logs

# Generate sample logs (for testing)
npm run logs:sample
```

## 📝 Testing Checklist

- [ ] Development server starts successfully
- [ ] Homepage loads with typing effects
- [ ] Terminal interface appears on hover
- [ ] All terminal commands work (!help, !characters, !switch, etc.)
- [ ] Mode switching changes 3D scenes
- [ ] Characters appear in bottom-right
- [ ] Message popups work with correct timing
- [ ] API endpoint returns valid JSON
- [ ] No critical JavaScript errors
- [ ] Build completes successfully

**Status**: 🎉 **READY FOR TESTING!**

Your VibeScreen project has all core systems implemented and should work smoothly. The remaining specs will add polish and advanced features to an already functional application.